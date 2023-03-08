import { ethers } from "ethers";

import { SignTypedDataVersion, TypedDataUtils } from "@metamask/eth-sig-util";

import type Transport from "@ledgerhq/hw-transport-webhid";
import type Eth from "@ledgerhq/hw-app-eth";

import { HardwareSignerAccountInfo, SignTypedDataPayload, TransactionRequest } from "common/types";

import { TransactionType } from "ui/common/fee";

import { HardwareServiceBase } from "./base";

/** Doc reference https://github.com/LedgerHQ/ledgerjs/blob/master/packages/hw-app-eth/README.md */
export class LedgerService implements HardwareServiceBase {
  #eth: Eth;

  static #initialized = false;

  private constructor(eth: Eth) {
    this.#eth = eth;
  }

  static async initialize(): Promise<LedgerService> {
    if (this.#initialized) {
      throw new Error("Can not create more than one Ledger instance");
    }

    const { default: HWTransportWebHID } = await import(/* webpackChunkName: "vendors/ledger" */ "@ledgerhq/hw-transport-webhid");
    const { default: HWAppEth } = await import(/* webpackChunkName: "vendors/ledger" */ "@ledgerhq/hw-app-eth");

    const transport = (await HWTransportWebHID.create()) as Transport;
    const eth = new HWAppEth(transport);

    this.#initialized = true;

    return new this(eth);
  }

  async close() {
    await this.#eth.transport.close();
  }

  async signTransaction(account: HardwareSignerAccountInfo, transaction: TransactionRequest) {
    const { address } = await this.#eth.getAddress(account.path);

    if (address !== account.address) {
      throw new Error("Sender address and Ledger address do not match");
    }

    const ledgerTransaction = this.#formatLedgerTransaction(transaction);

    const unsignedTx = ethers.utils.serializeTransaction(ledgerTransaction).substring(2);

    const signature = await this.#eth.signTransaction(account.path, unsignedTx, null);

    return ethers.utils.serializeTransaction(ledgerTransaction, {
      v: ethers.BigNumber.from("0x" + signature.v).toNumber(),
      r: "0x" + signature.r,
      s: "0x" + signature.s,
    });
  }

  async signMessage(account: HardwareSignerAccountInfo, message: string) {
    const messageArray = ethers.utils.toUtf8Bytes(message);

    const hexMessage = ethers.utils.hexlify(messageArray).substring(2);

    const signature = await this.#eth.signPersonalMessage(account.path, hexMessage);

    return ethers.utils.joinSignature({
      v: ethers.BigNumber.from("0x" + (signature.v - 27)).toNumber(),
      r: "0x" + signature.r,
      s: "0x" + signature.s,
    });
  }

  async signTypedData(account: HardwareSignerAccountInfo, typedData: SignTypedDataPayload) {
    const { domain, types, primaryType, message } = TypedDataUtils.sanitizeData(typedData);

    const domainSeparatorHex = TypedDataUtils.hashStruct("EIP712Domain", domain, types, SignTypedDataVersion.V4).toString("hex");

    const hashStructMessageHex = TypedDataUtils.hashStruct(String(primaryType), message, types, SignTypedDataVersion.V4).toString("hex");

    const signature = await this.#eth.signEIP712HashedMessage(account.path, domainSeparatorHex, hashStructMessageHex);

    return ethers.utils.joinSignature({
      v: ethers.BigNumber.from("0x" + signature.v).toNumber(),
      r: "0x" + signature.r,
      s: "0x" + signature.s,
    });
  }

  #formatLedgerTransaction(transaction: TransactionRequest) {
    const ledgerTransaction: ethers.utils.UnsignedTransaction = {
      chainId: transaction.chainId || undefined,
      data: transaction.data || undefined,
      gasLimit: transaction.gasLimit || undefined,
      nonce: transaction.nonce ? ethers.BigNumber.from(transaction.nonce).toNumber() : undefined,
      to: transaction.to || undefined,
      value: transaction.value || undefined,
    };

    if (transaction.type == TransactionType.Legacy) {
      ledgerTransaction.gasPrice = transaction.gasPrice || undefined;
    } else if (transaction.type === TransactionType.EIP1559) {
      ledgerTransaction.maxPriorityFeePerGas = transaction.maxPriorityFeePerGas || undefined;
      ledgerTransaction.maxFeePerGas = transaction.maxFeePerGas || undefined;
      ledgerTransaction.type = 2;
    }

    return ledgerTransaction;
  }
}
