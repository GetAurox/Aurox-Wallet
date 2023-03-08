import { ethers } from "ethers";
import { ParamType } from "ethers/lib/utils";

import { ArgumentDetails, OperationTransact, ReadableTransaction } from "common/types";
import {
  ETHEREUM_MAINNET_CHAIN_ID,
  BINANCE_SMART_CHAIN_CHAIN_ID,
  POLYGON_CHAIN_ID,
  AVALANCHE_CHAIN_ID,
  ETHERSCAN_API_KEY,
  BSCSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  SNOWTRACE_API_KEY,
} from "common/config";

const APPROVAL_SIGNATURES = [
  // approve(address,uint256)
  "0x095ea7b3",
];

async function getContractABISourcify(address: string, chainId: number) {
  const url = `https://repo.sourcify.dev/contracts/full_match/${chainId}/${address}/metadata.json`;

  const response = await fetch(url);

  const contractInformation = await response.json();

  return contractInformation.output.abi;
}

async function getContractABIBlockchainExplorer(address: string, chainId: number) {
  const EXPLORER_API_MAP = new Map<number, { apiBaseUrl: string; apiKey: string }>([
    [ETHEREUM_MAINNET_CHAIN_ID, { apiBaseUrl: "https://api.etherscan.io", apiKey: ETHERSCAN_API_KEY }],
    [5, { apiBaseUrl: "https://api-goerli.etherscan.io", apiKey: ETHERSCAN_API_KEY }],
    [BINANCE_SMART_CHAIN_CHAIN_ID, { apiBaseUrl: "https://api.bscscan.com", apiKey: BSCSCAN_API_KEY }],
    [POLYGON_CHAIN_ID, { apiBaseUrl: "https://api.polygonscan.com", apiKey: POLYGONSCAN_API_KEY }],
    [AVALANCHE_CHAIN_ID, { apiBaseUrl: "https://api.snowtrace.io", apiKey: SNOWTRACE_API_KEY }],
  ]);

  const apiInformation = EXPLORER_API_MAP.get(chainId);

  if (!apiInformation) {
    throw new Error("Failed to fetch with explorer API");
  }

  const url = `${apiInformation.apiBaseUrl}/api?module=contract&action=getabi&apikey=${apiInformation.apiKey}&address=${address}`;

  const response = await fetch(url);
  const responseBody = await response.json();

  if (responseBody.status === "0") {
    throw new Error(responseBody.result);
  }

  return JSON.parse(responseBody.result);
}

/**
 * @todo Use backend service for this once available!
 * @param address
 * @param chainId
 */
export async function getContractABI(address: string, chainId: number) {
  try {
    return await getContractABISourcify(address, chainId);
  } catch (error) {
    console.error("Failed to fetch with Sourcify");

    try {
      return await getContractABIBlockchainExplorer(address, chainId);
    } catch (error) {
      console.error("Failed to fetch with explorer API");
    }
  }

  return null;
}

/**
 * Formats transaction into a human readable form
 * Contains recursive call
 * */
export function formatTransaction(contractInterface: ethers.utils.Interface, data: string, value?: string): ReadableTransaction {
  const { args, functionFragment, name, sighash, signature } = contractInterface.parseTransaction({ data, value });

  const transactionArguments: ArgumentDetails[] = functionFragment.inputs.map((argument: ParamType) => {
    const result = {
      name: argument.name,
      type: argument.type,
      value: args[argument.name] as any,
    };

    if (argument.type === "bytes[]") {
      // Recursive call to resolve nested method call
      result.value = formatTransaction(contractInterface, args[argument.name][0], value);
    } else if (argument.type === "tuple") {
      result.value = argument.components.map((component: ParamType) => {
        return {
          name: component.name,
          type: component.type,
          value: args[argument.name][component.name],
        };
      });
    }

    return result;
  });

  return { name, sighash, signature, arguments: transactionArguments };
}

/**
 * Checks if contract call is approval
 */
export function isApproval(data: string) {
  if (!data) return false;

  let sighash = "";

  if (data.length >= 10 && data.startsWith("0x")) {
    sighash = data.slice(0, 10);
  }

  if (data.length >= 8 && !data.startsWith("0x")) {
    sighash = `0x${data.slice(0, 8)}`;
  }

  return APPROVAL_SIGNATURES.includes(sighash);
}

export function decodeTransaction(operation: OperationTransact): ReadableTransaction {
  const { data, to, value } = operation.transactionPayload;

  const output = {
    name: "Transaction",
    sighash: null,
    signature: null,
    arguments: [],
  };

  if (operation.contractABI) {
    try {
      const readableInterface = new ethers.utils.Interface(operation.contractABI);

      return formatTransaction(readableInterface, data, value);
    } catch (error) {
      output.name = "Contract Interaction";
    }
  }

  // Regular transaction
  if (!data) {
    output.name = "Regular Transaction";
  }

  // Contract creation/deployment
  if (!to) {
    output.name = "Contract Deployment";
  }

  return output;
}
