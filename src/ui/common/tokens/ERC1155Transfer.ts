import { ethers } from "ethers";

import { RawTransaction, ReadableTransaction } from "common/types";
import { formatTransaction } from "common/utils";

const HEX_ZERO = ethers.constants.Zero.toHexString();

export class ERC1155Transfer {
  static readonly ABI = JSON.stringify([
    "function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data)",
  ]);

  #transaction: RawTransaction | null = null;
  #tokenId: string;
  #from: string;
  #contractAddress: string;
  #amount: string;

  #transactionDetails: ReadableTransaction | null = null;

  #contractInterface = new ethers.utils.Interface(ERC1155Transfer.ABI);

  constructor(from: string, contractAddress: string, tokenId: string, amount: string) {
    this.#tokenId = tokenId;
    this.#contractAddress = contractAddress;
    this.#from = from;
    this.#tokenId = tokenId;
    this.#amount = amount;
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
    const newData = this.#contractInterface.encodeFunctionData("safeTransferFrom", [
      this.#from,
      recipientAddress,
      this.#tokenId,
      this.#amount,
      HEX_ZERO,
    ]);

    this.#transaction = { from: this.#from, to: this.#contractAddress, data: newData, value: HEX_ZERO };
  }
}
