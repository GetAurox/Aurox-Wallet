import { APP_ZOOM, DEFAULT_POPUP_HEIGHT, DEFAULT_POPUP_WIDTH } from "common/manifest";
import { CONNECT_FILENAME } from "common/entities";
import { getCurrentTab } from "common/chrome";

export class WindowManager {
  #popupWindow: chrome.windows.Window | null = null;

  async getOrCreatePopup(): Promise<chrome.windows.Window> {
    if (this.#popupWindow && this.#popupWindow.id) {
      this.#popupWindow = await chrome.windows.update(this.#popupWindow.id, {
        focused: true,
        drawAttention: true,
      });

      return this.#popupWindow;
    }

    const tab = await getCurrentTab();

    const [BROWSER_HEADER_SIZE, POPUP_RIGHT_MARGIN] = [80, 10];
    const { top = 0, left = 0, width = DEFAULT_POPUP_WIDTH } = await chrome.windows.getCurrent();

    const popupTop = top + BROWSER_HEADER_SIZE;
    const popupLeft = left + width - DEFAULT_POPUP_WIDTH - POPUP_RIGHT_MARGIN;

    const popupWindow = await chrome.windows.create({
      url: CONNECT_FILENAME,
      tabId: tab?.id,
      type: "popup",
      focused: true,
      top: popupTop,
      left: Math.round(popupLeft),
      width: Math.round(DEFAULT_POPUP_WIDTH * APP_ZOOM + 16),
      height: Math.round(DEFAULT_POPUP_HEIGHT * APP_ZOOM + 40),
    });

    const handleWindowClose = (windowId: number) => {
      if (windowId === popupWindow.id) {
        this.#popupWindow = null;

        chrome.windows.onRemoved.removeListener(handleWindowClose);
      }
    };

    chrome.windows.onRemoved.addListener(handleWindowClose);

    this.#popupWindow = popupWindow;

    return this.#popupWindow;
  }

  async removePopup() {
    if (typeof this.#popupWindow?.id === "number") {
      await chrome.windows.remove(this.#popupWindow?.id);

      this.#popupWindow = null;
    }
  }
}
