import "common/bootstrap";

import "./umbrella";

import { EIP1193EthereumProvider, UmbrellaEIP1193EthereumProvider } from "common/types";
import { DOMActions, DOMEvents, setMessageSender } from "common/dom";

import { AuroxProvider } from "./provider";

setMessageSender("inject-script", document.currentScript?.getAttribute("data-aurox-id") ?? null);

declare global {
  interface Window {
    readonly ethereum: EIP1193EthereumProvider;
    readonly web3: { readonly currentProvider: EIP1193EthereumProvider };
    __aurox_wallet_umbrella_provider_ref: UmbrellaEIP1193EthereumProvider;
    __aurox_wallet_other_providers: EIP1193EthereumProvider[];
    __aurox_wallet_injected: boolean;
    __aurox_wallet_dev_target_other_provider: () => void;
    __aurox_wallet_dev_target_aurox_provider: () => void;
  }
}

function getHasOtherProviders() {
  return !!window.__aurox_wallet_other_providers && window.__aurox_wallet_other_providers.length > 0;
}

function getLastInjectedOtherProvider() {
  const otherProviders = window.__aurox_wallet_other_providers ?? [];

  return otherProviders[otherProviders.length - 1] ?? null;
}

function injectProvider(provider: EIP1193EthereumProvider) {
  try {
    window.__aurox_wallet_umbrella_provider_ref.setTargetStandardProvider(provider);
  } catch (error) {
    console.error("Failed to inject web3 provider: ", error);
  }
}

async function setup() {
  const auroxProvider = new AuroxProvider({
    handleProviderSwitchOnRequest: async request => {
      injectProvider(getLastInjectedOtherProvider());

      return await window.__aurox_wallet_umbrella_provider_ref.request(request);
    },
  });

  await DOMActions.ContentScriptReady.wait();

  const swapProviderHandler = (data: any) => {
    if (data.type !== "providerChanged" || data.data.preferAurox) return;

    injectProvider(getLastInjectedOtherProvider());
  };

  DOMEvents.ProviderUpdate.addListener(swapProviderHandler);

  if (getHasOtherProviders()) {
    try {
      await auroxProvider.request({ method: "aurox_notifyOtherProvidersExist" });
    } catch (error) {
      console.error("Failed to notify the wallet of the existence of other providers: ", error);
    }
  }

  injectProvider(auroxProvider);

  if (process.env.NODE_ENV === "development") {
    window.__aurox_wallet_dev_target_other_provider = () => {
      injectProvider(getLastInjectedOtherProvider());
    };

    window.__aurox_wallet_dev_target_aurox_provider = () => {
      injectProvider(auroxProvider);
    };
  }
}

setup();
