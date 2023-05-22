import axios from "axios";
import { TransactionRequest } from "@ethersproject/abstract-provider";

import { AddressZero } from "@ethersproject/constants";
import { formatEther } from "ethers/lib/utils";

import { BlockNative, Simulation } from "common/types";
import { BLOCKNATIVE_API_KEY, BLOCKNATIVE_SECRET_KEY, BLOCKNATIVE_URL, DEFAULT_DECIMALS, ETH_ADDRESS } from "common/config";

import { isAddressEqual } from "../utils";

export interface BlocknativeSimulationRequest {
  system: string;
  network: string;
  transactions: TransactionRequest[];
}

const client = axios.create({
  baseURL: BLOCKNATIVE_URL,
  headers: {
    "credentials": `${BLOCKNATIVE_API_KEY}:${BLOCKNATIVE_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

function createTopUpTransaction(transaction: TransactionRequest): BlockNative.Transaction {
  if (!transaction.from) {
    throw new Error("Field `from` is mandatory for creating top up transaction");
  }

  const ethTransferGasLimit = 21000;
  const simulationETHAmount = 10 ** 18; // 1 ETH

  return {
    to: transaction.from!,
    from: AddressZero,
    gas: ethTransferGasLimit,
    maxPriorityFeePerGas: Number(transaction.maxPriorityFeePerGas),
    maxFeePerGas: Number(transaction.maxFeePerGas),
    input: "0x",
    value: simulationETHAmount,
  };
}

function prepareRequest(transaction: TransactionRequest): BlockNative.Transaction {
  if (!transaction.to) {
    throw new Error("Missing required 'to' field from transaction payload");
  }

  if (!transaction.from) {
    throw new Error("Missing required 'from' field from transaction payload");
  }

  return {
    to: transaction.to,
    from: transaction.from!,
    gas: Number(transaction.gasLimit),
    maxPriorityFeePerGas: Number(transaction.maxPriorityFeePerGas),
    maxFeePerGas: Number(transaction.maxFeePerGas) * 2,
    input: String(transaction.data),
    value: Number(transaction.value),
  };
}

export function normalizeResponse(address: string | undefined, result: BlockNative.SimulationResponse): Simulation.Result {
  if (result.error.length > 0) {
    throw new Error(result.error.join("\n"));
  }

  // Ignore top-up transaction
  const netBalanceChanges = result.netBalanceChanges.slice(1);
  const internalTransactions = result.internalTransactions.slice(1);
  const gasUsed = result.gasUsed.slice(1);

  const normalizeContractCall = (_contractCall: BlockNative.ContractCall) => {
    return {
      contractMethod: _contractCall.methodName,
      contractAddress: _contractCall.contractAddress,
      contractDecimals: _contractCall.contractDecimals,
      contractName: _contractCall.contractName,
      decimalAmount: Number(_contractCall.decimalValue),
    };
  };

  // Get information on contracts involved
  const contracts = internalTransactions
    .flatMap(transaction => transaction.filter(tx => tx.contractCall))
    .map(call => normalizeContractCall(call.contractCall!));

  const balanceChanges = netBalanceChanges.map(balanceChanges => {
    const accountBalanceChange = balanceChanges.find(change => isAddressEqual(change.address, address));

    if (!accountBalanceChange) {
      return [];
    }

    return accountBalanceChange.balanceChanges.map<Simulation.BalanceChange>(balanceChange => {
      const balanceChangeMetadata = {
        amount: balanceChange.delta.replace("-", ""),
        contractSymbol: balanceChange.asset.symbol,
        contractType: balanceChange.asset.type as any,
      };

      const direction = balanceChange.delta.startsWith("-") ? "out" : "in";

      const contract = contracts.find(({ contractAddress }) => isAddressEqual(contractAddress, balanceChange.asset.contractAddress));

      if (contract) {
        return { ...balanceChangeMetadata, ...contract, direction };
      }

      const native = balanceChange.asset.type === "ether";

      return {
        ...balanceChangeMetadata,
        direction,
        contractMethod: native ? "NATIVE_TRANSFER" : "Unknown",
        type: native ? "native" : (balanceChange.asset.type as any),
        contractAddress: native ? ETH_ADDRESS : balanceChange.asset.contractAddress!,
        contractSymbol: balanceChange.asset.symbol,
        contractDecimals: DEFAULT_DECIMALS,
        decimalAmount: Number(formatEther(balanceChange.delta)),
      };
    });
  });

  return { simulator: "blocknative", balanceChanges, gasUsed, success: true };
}

export async function simulate(transactions: TransactionRequest[]): Promise<Simulation.Result> {
  try {
    const [transaction] = transactions;

    const topUpTransaction = createTopUpTransaction(transaction);

    const request: BlockNative.SimulationRequest = {
      system: "ethereum",
      network: "main",
      transactions: [topUpTransaction, ...transactions.map(prepareRequest)],
    };

    const { data } = await client.post<BlockNative.SimulationResponse>("/simulate", request);

    return normalizeResponse(transaction.from!, data);
  } catch (error) {
    console.error("Failed to simulate with blocknative", error);

    return { simulator: "blocknative", success: false, error: error.message };
  }
}
