import { serializeError } from "@ledgerhq/errors";

import { BigNumberish, ethers, Signer } from "ethers";

import { Wallet } from "common/operations";
import { AccountInfo, TransactionRequest } from "common/types";
import { EVMProvider, JsonRPCProviderWithRetry } from "common/wallet";
import { getAccountAddressForChainType } from "common/utils";
import { EthereumAccountTransaction, OmitAuxillaryTransactionProps } from "ui/types";

/**
 * This class exists as a compatible ethers signer, to heavily simplify integrating the active EVM account with anything ethers related.
 */
export class EVMSignerPopup extends Signer {
  public readonly chainType: "evm" = "evm";

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
    try {
      if (ethers.utils.isBytes(message)) message = ethers.utils.parseBytes32String(message);

      // If the account is a mnemonic or private-key account, send the request to the service-worker for signing
      if (this.accountInfo.type === "mnemonic" || this.accountInfo.type === "private-key") {
        return Wallet.SignMessage.perform({ chainType: "evm", message, uuid: this.accountInfo.uuid, unsafeWithoutPrefix });
      }

      throw new Error(`signMesage not implemented for ${this.accountInfo.type}`);
    } catch (error) {
      const details = serializeError(error);

      if (typeof details !== "string" && typeof details !== "undefined") {
        throw details.message || "Unknown signing error";
      }

      throw error;
    }
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    const resolvedTransaction = await ethers.utils.resolveProperties(transaction);
    // If Mnemonic or Private-Key types get the Service Worker to sign
    if (this.accountInfo.type === "mnemonic" || this.accountInfo.type === "private-key") {
      return Wallet.SignTransaction.perform("evm", this.accountInfo.uuid, { params: resolvedTransaction });
    }

    throw new Error(`signTransaction not implemented for ${this.accountInfo.type} and EVM`);
  }

  async populateTransaction(transaction: ethers.utils.Deferrable<ethers.providers.TransactionRequest>): Promise<TransactionRequest> {
    const populatedTx = (await super.populateTransaction(transaction)) as Required<ethers.providers.TransactionRequest>;

    return {
      ...populatedTx,
      from: populatedTx.from ?? getAccountAddressForChainType(this.accountInfo, "evm"),
      nonce: parseInt((populatedTx.nonce as BigNumberish).toString()),
      gasLimit: populatedTx.gasLimit.toString(),
      gasPrice: populatedTx.gasPrice?.toString(),
      data: populatedTx.data?.toString(),
      value: populatedTx.value?.toString(),
      maxFeePerGas: populatedTx.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: populatedTx.maxPriorityFeePerGas?.toString(),
    };
  }

  /**
   * This method sends the transaction request as normal via ethers, it then saves the nonce and transaction hash to the service worker for intermittent polling. This method will be used for sending all transactions
   * @param transaction The transaction to send to the network
   * @param details The details of the transaction
   * @returns Returns the transaction response
   */
  async sendTransactionWithDetails(
    transaction: ethers.utils.Deferrable<TransactionRequest>,
    details: OmitAuxillaryTransactionProps<EthereumAccountTransaction>,
  ): Promise<ethers.providers.TransactionResponse> {
    this._checkProvider("sendTransaction");
    const tx = (await this.populateTransaction(transaction)) as TransactionRequest;
    const signedTx = await this.signTransaction(tx);

    const sentTransaction = await this.provider.sendTransaction(signedTx);

    return sentTransaction;
  }

  /**
   * Because of how the transaction page was built, we must provide associated details for the transaction. So the method above allows this. Unfortunately we now cannot use this class with typechain, because typechain will use this method for sending transactions
   */
  async sendTransaction(transaction: ethers.utils.Deferrable<TransactionRequest>): Promise<ethers.providers.TransactionResponse> {
    // TODO: in future we could generate the details based on the provided transaction, but this would take a bit of work
    throw new Error("Must use sendTransactionWithDetails");
  }
}
