import { BigNumber, ethers } from "ethers";
import { cloneDeep } from "lodash";

import { RawTransaction, ReadableTransaction } from "common/types";
import { formatTransaction } from "common/utils";

export class ERC20Approval {
  static readonly ABI = JSON.stringify(["function approve(address spender, uint256 amount)"]);

  #transaction: RawTransaction;

  #transactionDetails: ReadableTransaction | null = null;

  #contractInterface = new ethers.utils.Interface(ERC20Approval.ABI);

  constructor(transaction: RawTransaction) {
    this.#transaction = cloneDeep(transaction);
  }

  get transaction() {
    return this.#transaction;
  }

  get transactionDetails() {
    this.#transactionDetails = formatTransaction(this.#contractInterface, this.transaction.data);

    return this.#transactionDetails;
  }

  get tokenAddress(): string {
    return ethers.utils.getAddress(this.transaction.to);
  }

  get senderAddress(): string {
    return ethers.utils.getAddress(this.transaction.from);
  }

  get spender(): string {
    const [spender] = this.transactionDetails.arguments;

    return spender.value;
  }

  get amount(): BigNumber {
    const [, amount] = this.transactionDetails.arguments;

    return amount.value;
  }

  get isInfinite(): boolean {
    return this.amount.eq(ethers.constants.MaxUint256);
  }

  updateAmount(newAmount: BigNumber): void {
    const newData = this.#contractInterface.encodeFunctionData("approve", [this.spender, newAmount]);

    if (newData === this.#transaction.data) return;

    this.#transaction = { ...this.#transaction, data: newData };
  }
}
