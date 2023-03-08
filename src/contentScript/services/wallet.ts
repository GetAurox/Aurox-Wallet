import isEqual from "lodash/isEqual";

import { SecureWalletState } from "common/states";
import { DOMEvents, DOMSharedStates } from "common/dom";

export class WalletService {
  #isInitialized = false;

  async initialize() {
    if (this.#isInitialized) throw new Error("Wallet service is already initialized");

    const consumer = await SecureWalletState.buildConsumer().initialize();

    const fragment = consumer.createAndAttachFragment(this.handler, isEqual);

    await DOMSharedStates.Addresses.buildProviderFromFragment(fragment);

    fragment.on("changed", isWalletUnlocked => {
      if (!isWalletUnlocked) {
        DOMEvents.ProviderUpdate.broadcast("disconnect");
        DOMEvents.ProviderUpdate.broadcast("accountsChanged", []);
      }
    });

    this.#isInitialized = true;

    return this;
  }

  private handler(wallet: SecureWalletState.Data): boolean {
    return wallet.isWalletUnlocked;
  }
}
