import { sendQuery } from "common/messaging";
import { PhishingRequest, PhishingResponse } from "common/types";
import {
  savePhishingWarningOverlayDataToLocalArea,
  loadPhishingWarningOverlayDataFromLocalArea,
  loadUserPreferencesFromLocalArea,
} from "common/storage";

import { InitOptions } from "./types";
import { getOverlay } from "./helpers";

const topic = "wallet/user-input-has-private-info";
const timeout = 60 * 1000; // 60 seconds to re-show overlay for the host;

export default class PhishingWarningOverlay {
  /** overlay `div` element on the webpage reference */
  element: HTMLDivElement | null;
  /** async operation processing flag */
  busy: boolean;
  /** registry for storing input data mapping: inputElement -> inputValue */
  inputValueRegistry: Map<EventTarget, string>;

  constructor() {
    this.element = null;
    this.busy = false;
    this.inputValueRegistry = new Map();

    this.setup();
  }

  /**
   * This function renders the warning overlay
   * @param {string} options.action - The type of the action that triggered overlay. Values are `"input"` or `"paste"`
   * @param {function} options.onBack - The function that gets called if user decides to click on "Back to safety" button
   * @param {function} options.onContinue - The function that gets called if user decides to click on "I understand the risk" button
   */
  show({ onBack, onContinue }: InitOptions) {
    const onBackFn = () => {
      this.element = null;

      onBack();
    };

    const onContinueFn = () => {
      this.element = null;

      onContinue();
    };

    this.element = getOverlay({ onBack: onBackFn, onContinue: onContinueFn });
  }

  /**
   * This function initializes the warning overlay in case of meeting one of the condition:
   * * it wasn't showed at all
   * * host for which the warning overlay shown last time changed
   * * timeout of 60 seconds after last showing of the warning overlay is expired
   * Initializing is skipped when the warning overlay is being currently shown already
   * @param {string} options.action - The type of the action that triggered overlay. Values are `"input"` or `"paste"`
   * @param {function} options.onBack - The function that gets called if user decides to click on "back to safety" button
   */
  async init(options: InitOptions) {
    const el = this.element;

    // No need to re-initialize overlay since its already shown
    if (el) {
      return;
    }

    try {
      if (!this.busy) {
        this.busy = true;

        // Getting host/timestap data for the overlay from `chrome.storage.local`
        const data = await loadPhishingWarningOverlayDataFromLocalArea();

        // If there is no saved data for the overlay or the `host` is different or timestamp expired then show overlay
        if (!data || data.host !== window.location.host || Date.now() - data.timestamp > timeout) {
          this.show(options);
        }

        this.busy = false;
      }
    } catch (error) {
      console.error(error);

      this.busy = false;
    }
  }

  /**
   * This function is document's "input" event listener
   */
  async onInput(event: Event) {
    event.stopPropagation();
    event.cancelBubble;

    try {
      if (!chrome.runtime?.id) {
        throw new Error("Chrome runtime is not found");
      }

      const inputValue = (event.target as (EventTarget & { value: string }) | null)?.value ?? "";

      if (event.target) {
        this.inputValueRegistry.set(event.target, inputValue);
      }

      const accumulatedValue = Array.from(this.inputValueRegistry.values())
        .join(" ")
        .trim()
        .replace(/\s{2,}/g, " ");

      const response = await sendQuery<PhishingRequest, PhishingResponse>(topic, "internal", {
        current: inputValue,
        accumulated: accumulatedValue,
      });

      const inputValueRegistry = this.inputValueRegistry;

      const onContinue = async function () {
        // Saving overlay data in `chrome.storage.local`
        await savePhishingWarningOverlayDataToLocalArea({
          host: window.location.host,
          timestamp: Date.now(),
        });
      };

      if (response.current.hasMnemonic || response.current.hasPrivateKey) {
        this.init({
          onBack: async function () {
            (event.target as (Event & { value: string }) | null)!.value = "";

            if (event.target && inputValueRegistry.has(event.target)) {
              inputValueRegistry.delete(event.target);
            }
          },
          onContinue,
        });

        return;
      }

      if (response.accumulated.hasMnemonic || response.accumulated.hasPrivateKey) {
        this.init({
          onBack: async function () {
            for (const input of inputValueRegistry.keys()) {
              (input as (EventTarget & { value: string }) | null)!.value = "";
            }

            inputValueRegistry.clear();
          },
          onContinue,
        });

        return;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async setup() {
    const isEnabledFromUserPreferences = await this.isEnabledFromUserPreferences();

    if (isEnabledFromUserPreferences) {
      const allContentWindows = await this.#getContentWindows(window);

      for (const contentWindow of allContentWindows) {
        contentWindow.document.addEventListener("input", this.onInput.bind(this));
      }
    }
  }

  async isEnabledFromUserPreferences() {
    const userPreferences = await loadUserPreferencesFromLocalArea();

    return userPreferences.security.antiPhishingEnabled;
  }

  /**
   * Collects all content windows on the page (including iframes)
   * @param contentWindow window to lookup for other windows
   * @returns Promise with windows array
   */
  async #getContentWindows(contentWindow: Window): Promise<Window[]> {
    let contentWindows: Window[] = [];

    while (true) {
      contentWindows = [...contentWindows, contentWindow];

      // Await for iframe to fully load
      await new Promise<void>(resolve => {
        contentWindow.addEventListener("DOMContentLoaded", () => {
          resolve();
        });
      });

      for (const iframe of Array.from(contentWindow.document.getElementsByTagName("iframe"))) {
        if (iframe.contentWindow) {
          return [...contentWindows, ...(await this.#getContentWindows(iframe.contentWindow))];
        }
      }

      break;
    }

    return contentWindows;
  }
}
