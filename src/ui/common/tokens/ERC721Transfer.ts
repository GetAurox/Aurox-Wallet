import { ethers } from "ethers";

import { RawTransaction, ReadableTransaction } from "common/types";
import { formatTransaction } from "common/utils";

const HEX_ZERO = ethers.constants.Zero.toHexString();

export class ERC721Transfer {
  static readonly ABI = JSON.stringify(["function transferFrom(address from, address to, uint256 tokenId)"]);

  #transaction: RawTransaction | null = null;
  #tokenId: string;
  #from: string;
  #contractAddress: string;

  #transactionDetails: ReadableTransaction | null = null;

  #contractInterface = new ethers.utils.Interface(ERC721Transfer.ABI);

  constructor(from: string, contractAddress: string, tokenId: string) {
    this.#tokenId = tokenId;
    this.#contractAddress = contractAddress;
    this.#from = from;
    this.#tokenId = tokenId;
  }

  get transaction() {
    return this.#transaction;
  }

  get transactionDetails() {
    if (!this.#transaction) return null;

    this.#transactionDetails = formatTransaction(this.#contractInterface, this.#transaction.data);

    return this.#transactionDetails;
  }

  updateRecipient(recipientAddress: string): void {
    const newData = this.#contractInterface.encodeFunctionData("transferFrom", [this.#from, recipientAddress, this.#tokenId]);

    this.#transaction = { from: this.#from, to: this.#contractAddress, data: newData, value: HEX_ZERO };
  }
}
