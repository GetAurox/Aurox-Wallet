import { ethers, Signer } from "ethers";

import { Wallet } from "common/operations";
import { AccountInfo, TransactionRequest } from "common/types";
import { EVMProvider, JsonRPCProviderWithRetry } from "common/wallet";

/**
 * This class exists as a compatible ethers signer, to heavily simplify integrating the active EVM account with anything ethers related.
 */
export class EVMSignerPopup extends Signer {
  public readonly chainType = "evm" as const;

  public readonly accountInfo: AccountInfo;
  public readonly networkIdentifier: string;
  public readonly providerClass: EVMProvider;
  public readonly provider: JsonRPCProviderWithRetry;

  constructor(accountInfo: AccountInfo, networkIdentifier: string, providerClass: EVMProvider) {
    super();

    this.networkIdentifier = networkIdentifier;
    this.accountInfo = accountInfo;
    this.providerClass = providerClass;
    this.provider = providerClass.provider;
  }

  // Disabling the connect functionality from the abstract signer class to prevent the network and the provider from being out of sync
  connect(): EVMSignerPopup {
    throw new Error("Connecting not supported");
  }

  async getAddress(): Promise<string> {
    if (this.accountInfo.type === "mnemonic") return this.accountInfo.addresses["evm"];

    return this.accountInfo.address;
  }

  /**
   * This method signs a given message
   * @param message The message to sign
   * @param unsafeWithoutPrefix This boolean indicates whether to prefix the message with \x19" "Ethereum Signed Message. It is a greater risk to the user to sign a message without the prefix because the message could potentially be a transaction which the user is signing unknowingly but some DApps still support it.
   * @returns Returns the signature
   */
  async signMessage(message: string | ethers.utils.Bytes, unsafeWithoutPrefix?: boolean): Promise<string> {
    return await Wallet.SignMessageV2.perform({
      uuid: this.accountInfo.uuid,
      chainType: "evm",
      message: message.toString(),
      unsafeWithoutPrefix,
    });
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    return Wallet.SignTransactionV2.perform({
      accountUUID: this.accountInfo.uuid,
      networkIdentifier: this.networkIdentifier,
      transaction,
    });
  }
}
