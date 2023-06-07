import axios from "axios";
import { TransactionRequest } from "@ethersproject/abstract-provider";

import { alchemySimulationSupportedChains, ETHEREUM_MAINNET_CHAIN_ID, ETH_ADDRESS } from "common/config";
import { Alchemy, Simulation } from "common/types";

import { isAddressEqual } from "../utils";

function createHTTPClient(chainId = ETHEREUM_MAINNET_CHAIN_ID) {
  const url = alchemySimulationSupportedChains[chainId];

  if (!url) {
    throw new Error(`Unsupported chainId "${chainId}"`);
  }

  return axios.create({
    baseURL: url,
    headers: { "Content-Type": "application/json" },
  });
}

export function prepareRequest(transactions: TransactionRequest[]) {
  if (transactions.length > 3) {
    throw new Error("Alchemy can not simulate more than 3 transactions");
  }

  const request = { jsonrpc: "2.0", id: 73 };

  const params = transactions.map(tx => {
    return {
      to: tx.to,
      from: tx.from,
      data: tx.data && tx.data.length > 40 ? tx.data : undefined,
      value: tx.value ?? "0x",
    };
  });

  if (transactions.length === 1) {
    return { ...request, method: "alchemy_simulateAssetChanges", params };
  }

  return { ...request, method: "alchemy_simulateAssetChangesBundle", params: [params] };
}

export function normalizeResponse(
  address: string,
  response: Alchemy.SimulationResponse & { result: Alchemy.Result[] | Alchemy.Result },
): Simulation.Result {
  const results = Array.isArray(response.result) ? response.result : [response.result];

  const errors = results
    .map(result => result.error?.message)
    .filter(Boolean)
    .join("\n");

  if (errors) {
    throw new Error(errors);
  }

  const normalizeBalanceChange = (direction: "in" | "out") => {
    return (change: Alchemy.Change) => {
      return {
        direction,
        contractAddress: change.contractAddress ?? ETH_ADDRESS,
        amount: change.rawAmount,
        decimalAmount: Number(change.amount),
        contractType: change.assetType.toLowerCase() as any,
        contractName: change.name,
        contractMethod: change.changeType,
        contractSymbol: change.symbol,
        contractDecimals: change.decimals,
        tokenId: change.tokenId ?? undefined,
        tokenLogoURL: change.logo,
      };
    };
  };

  const balanceChanges = results.map(result => {
    const negativeChanges = result.changes.filter(change => isAddressEqual(change.from, address)).map(normalizeBalanceChange("out"));
    const positiveChanges = result.changes.filter(change => isAddressEqual(change.to, address)).map(normalizeBalanceChange("in"));

    const changes = [...negativeChanges, ...positiveChanges];

    const allTransfers = changes.every(change => change.contractMethod === "TRANSFER");
    const allApprovals = changes.every(change => change.contractMethod === "APPROVE");

    if (allTransfers || allApprovals) {
      return changes;
    }

    return changes.filter(change => change.contractMethod === "TRANSFER");
  });

  const gasUsed = results.map(({ gasUsed }) => Number(gasUsed));

  return { simulator: "alchemy", balanceChanges, gasUsed, success: true };
}

export async function simulate(transactions: TransactionRequest[], chainId?: number): Promise<Simulation.Result> {
  try {
    const request = prepareRequest(transactions);

    const [address] = transactions.map(tx => tx.from)!;

    const client = createHTTPClient(chainId);

    const { data } = await client.post<Alchemy.SimulationResponse>("", request);

    if ("error" in data) {
      return { simulator: "alchemy", success: false, error: data.error.message };
    }

    return normalizeResponse(address!, data);
  } catch (error) {
    console.error("Failed to simulate transactions with Alchemy", error);

    return { simulator: "alchemy", success: false, error: error.message };
  }
}
