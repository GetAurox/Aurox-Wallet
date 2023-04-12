import { ProviderManager } from "common/wallet";
import { AccountInfo, BlockchainNetwork, ChainType } from "common/types";

import { EVMSignerPopup } from "./EVMSignerPopup";
import { SolanaSignerPopup } from "./SolanaSignerPopup";

export type SupportedSigners = EVMSignerPopup | SolanaSignerPopup;
export type SignerForChainType<T extends ChainType> = Extract<SupportedSigners, { chainType: T }>;

function getSignerKey(accountInfo: AccountInfo, network: BlockchainNetwork) {
  return `${accountInfo.uuid}::${network.identifier}`;
}

/**
 * This class handles the creation of signers and providers. It also caches the objects in a mapping in-case of re-use
 */
export class PopupSignerManager {
  static #signers = new Map<string, SupportedSigners>();

  static getSigner(accountInfo: AccountInfo, network: BlockchainNetwork) {
    // If the signer already exists, grab it from the singleton mapping
    const existingSigner = PopupSignerManager.#signers.get(getSignerKey(accountInfo, network));

    if (existingSigner) return existingSigner;

    const provider = ProviderManager.getProvider(network);

    if (accountInfo.type !== "mnemonic" && accountInfo.chainType !== network.chainType)
      throw new Error("Trying to create a signer with a different chainType than the network details");

    let signer: SupportedSigners;

    if (provider.chainType === "evm") {
      signer = new EVMSignerPopup(accountInfo, network.identifier, provider);
    } else if (provider.chainType === "solana") {
      signer = new SolanaSignerPopup(accountInfo, network);
    } else {
      throw new Error("Cannot get pop-up signer for unsupported chainType");
    }

    this.#signers.set(getSignerKey(accountInfo, network), signer);

    return signer;
  }

  private constructor() {
    //
  }
}
