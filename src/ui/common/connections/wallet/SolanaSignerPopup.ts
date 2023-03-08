import { Bytes, ethers } from "ethers";

import { AccountInfo, BlockchainNetwork, ProviderClass, SolanaTransactionPayload } from "common/types";
import { Wallet } from "common/operations";

export class SolanaSignerPopup {
  public readonly chainType: "solana" = "solana";
  public accountInfo: AccountInfo;
  public network: BlockchainNetwork;
  public provider?: ProviderClass<"solana">;

  constructor(accountInfo: AccountInfo, network: BlockchainNetwork) {
    this.accountInfo = accountInfo;
    this.network = network;
  }

  async signTransaction(tx: Omit<SolanaTransactionPayload, "type">) {
    // If Mnemonic or Private Key type send to service-worker for signing
    if (this.accountInfo.type === "mnemonic" || this.accountInfo.type === "private-key") {
      return Wallet.SignTransaction.perform("solana", this.accountInfo.uuid, tx);
    }

    throw new Error(`signTransaction not implemented for ${this.accountInfo.type} and Solana`);
  }

  async signMessage(message: string | Bytes) {
    if (ethers.utils.isBytes(message)) message = ethers.utils.parseBytes32String(message);

    if (this.accountInfo.type === "mnemonic" || this.accountInfo.type === "private-key") {
      return Wallet.SignMessage.perform({
        chainType: "solana",
        message,
        uuid: this.accountInfo.uuid,
      });
    }

    throw new Error(`signTransaction not implemented for ${this.accountInfo.type} and Solana`);
  }

  async sendTransactionWithDetails(tx: Omit<SolanaTransactionPayload, "type">): Promise<{ hash: string }> {
    throw new Error("No implementation");
  }

  async populateTransaction(tx: Omit<SolanaTransactionPayload, "type">): Promise<SolanaTransactionPayload["params"]> {
    throw new Error("No implementation");
  }
}
