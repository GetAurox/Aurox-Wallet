import axios from "axios";

import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";

import { BlockNative, TransactionRequest } from "common/types";
import { BLOCKNATIVE_API_KEY, BLOCKNATIVE_SECRET_KEY, BLOCKNATIVE_URL, ethereumMainnetNetworkIdentifier } from "common/config";

import { NetworkManager } from "../NetworkManager";

export interface BlocknativeSimulationRequest {
  system: string;
  network: string;
  transactions: TransactionRequest[];
}

export class EVMTransactionSimulationManager {
  #networkManager: NetworkManager;

  #blockNativeClient = axios.create({
    baseURL: BLOCKNATIVE_URL,
    headers: {
      "credentials": `${BLOCKNATIVE_API_KEY}:${BLOCKNATIVE_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  });

  constructor(networkManager: NetworkManager) {
    this.#networkManager = networkManager;
  }

  #createTopUpTransaction(transaction: TransactionRequest): BlockNative.Transaction {
    const ethTransferGasLimit = 21000;
    const simulationETHAmount = 10 ** 18; // 1 ETH

    return {
      to: transaction.from,
      from: AddressZero,
      gas: ethTransferGasLimit,
      maxPriorityFeePerGas: BigNumber.from(transaction.maxPriorityFeePerGas).toNumber(),
      maxFeePerGas: BigNumber.from(transaction.maxFeePerGas).toNumber(),
      input: "0x",
      value: simulationETHAmount,
    };
  }

  #mapTransaction(transaction: TransactionRequest): BlockNative.Transaction {
    if (!transaction.to) {
      throw new Error("Missing required 'to' field from transaction payload");
    }

    return {
      to: transaction.to,
      from: transaction.from,
      gas: BigNumber.from(transaction.gasLimit).toNumber(),
      maxPriorityFeePerGas: BigNumber.from(transaction.maxPriorityFeePerGas).toNumber(),
      maxFeePerGas: BigNumber.from(transaction.maxFeePerGas).mul(2).toNumber(),
      input: transaction.data,
      value: BigNumber.from(transaction.value).toNumber(),
    };
  }

  async simulateWithBlockNative(transactions: TransactionRequest[]) {
    const network = this.#networkManager.getNetworkByIdentifier(ethereumMainnetNetworkIdentifier);

    if (!network) {
      throw new Error("There is no network with given identifier");
    }

    const [transaction] = transactions;

    const topUpTransaction = this.#createTopUpTransaction(transaction);

    const request: BlockNative.SimulationRequest = {
      system: network.name.toLowerCase(),
      network: network.testnet ? "test" : "main",
      transactions: [topUpTransaction, ...transactions.map(this.#mapTransaction)],
    };

    try {
      const { data: result } = await this.#blockNativeClient.post<BlockNative.SimulationResponse>("/simulate", request);

      return { result };
    } catch (error) {
      return { error: error.response.data.msg };
    }
  }
}
