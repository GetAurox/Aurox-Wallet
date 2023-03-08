import { DOMEvents } from "common/dom";
import { PublicDappState } from "common/states";

export class PermissionService {
  #isInitialized = false;

  #handler = (connection: PublicDappState.Data) => {
    switch (connection.eventName) {
      case "providerChanged":
        DOMEvents.ProviderUpdate.broadcast("providerChanged", { preferAurox: connection.preferAurox });
        break;
      case "accountsChanged":
        DOMEvents.ProviderUpdate.broadcast("accountsChanged", connection.accounts);
        break;
      case "chainChanged":
        DOMEvents.ProviderUpdate.broadcast("chainChanged", connection.chainId);
        break;
      case "connect":
        DOMEvents.ProviderUpdate.broadcast("connect", { chainId: connection.chainId });
        DOMEvents.ProviderUpdate.broadcast("accountsChanged", connection.accounts);
        break;
      case "disconnect":
        DOMEvents.ProviderUpdate.broadcast("disconnect");
        DOMEvents.ProviderUpdate.broadcast("accountsChanged", []);
        break;
    }
  };

  async initialize() {
    if (this.#isInitialized) throw new Error("Wallet service is already initialized");

    const consumer = await PublicDappState.buildConsumer().initialize();

    consumer.on("changed", this.#handler);

    this.#isInitialized = true;

    return this;
  }
}
