import { BigNumber, ethers } from "ethers";

import { RawTransaction, ReadableTransaction } from "common/types";
import { formatTransaction } from "common/utils";

const HEX_ZERO = ethers.constants.Zero.toHexString();

export class ERC20Transfer {
  static readonly ABI = JSON.stringify(["function transfer(address recipient, uint256 amount)"]);

  #transaction: RawTransaction;

  #transactionDetails: ReadableTransaction | null = null;

  #contractInterface = new ethers.utils.Interface(ERC20Transfer.ABI);

  constructor(from: string, contractAddress: string, data = HEX_ZERO) {
    this.#transaction = { from, to: contractAddress, value: HEX_ZERO, data };
  }

  get transaction() {
    return this.#transaction;
  }

  get transactionDetails() {
    if (this.#transaction.data === HEX_ZERO) return null;

    this.#transactionDetails = formatTransaction(this.#contractInterface, this.transaction.data);

    return this.#transactionDetails;
  }

  get tokenAddress(): string {
    return ethers.utils.getAddress(this.transaction.to);
  }

  get recipientAddress(): string {
    if (!this.transactionDetails) return "";

    const [recipient] = this.transactionDetails.arguments;

    return recipient.value;
  }

  get amount(): BigNumber {
    if (!this.transactionDetails) {
      return ethers.constants.Zero;
    }

    const [, amount] = this.transactionDetails.arguments;

    return amount.value;
  }

  updateAmountAndRecipient(newAmount: BigNumber, recipientAddress: string): void {
    const newData = this.#contractInterface.encodeFunctionData("transfer", [recipientAddress, newAmount]);

    if (newData === this.#transaction.data) return;

    this.#transaction = { ...this.#transaction, data: newData };
  }
}
