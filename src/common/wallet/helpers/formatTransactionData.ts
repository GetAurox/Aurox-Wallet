import { ethers } from "ethers";

import { ChainType, RawTransaction, ReadableTransaction } from "common/types";
import { ERC20__factory } from "common/wallet/typechain";
import { ETH_ADDRESS } from "common/config";

import { OmitAuxillaryTransactionProps, EthereumAccountTransaction, EthereumContractMethod } from "ui/types";

const erc20Interface = ERC20__factory.createInterface();
const erc721Interface = ERC20__factory.createInterface();

export type FormattedTransactionData = { type: "evm"; params: TransactionData };

export interface TransactionData {
  transactionData: { data: string; value: string; from: string; to: string };
  method: EthereumContractMethod;
}

function formatEVMTransactionData(transaction: OmitAuxillaryTransactionProps<EthereumAccountTransaction>, from: string): TransactionData {
  if (transaction.__typename === "EthereumAccountTokenTransfer") {
    if (transaction.tokenContractType === "ERC20") {
      const valueWithReducedDecimals = parseFloat(transaction.value).toFixed(transaction.token.decimals);
      const formattedValue = ethers.utils.parseUnits(valueWithReducedDecimals, transaction.token.decimals).toString();

      if (transaction.token.address.toLowerCase() === ETH_ADDRESS.toLowerCase())
        return {
          transactionData: { data: "0x", value: formattedValue, to: transaction.txTo, from },
          // No method for ETH transfer
          method: {
            id: "",
            name: "",
            shortName: "",
            signature: "",
          },
        };

      // If the token address isn't ETH it is a normal ERC20 transfer, so generate the method from this
      const data = erc20Interface.encodeFunctionData("transfer", [transaction.txTo, formattedValue]);

      return {
        transactionData: { data, value: "0", to: transaction.token.address, from },
        method: {
          name: erc20Interface.functions["transfer(address,uint256)"].name,
          signature: "transfer(address,uint256)",
          shortName: "transfer",
          id: data.slice(0, 10),
        },
      };
    } else if (transaction.tokenContractType === "ERC721") {
      const data = erc721Interface.encodeFunctionData("transferFrom", [from, transaction.txTo, transaction.value]);

      return {
        transactionData: { data, value: "0", to: transaction.token.address, from },
        method: {
          name: erc721Interface.functions["transferFrom(address,address,uint256)"].name,
          signature: "transferFrom(address,address,uint256)",
          shortName: "transferFrom",
          id: data.slice(0, 10),
        },
      };
    }

    throw new Error(`Missing logic for tokenContractType ${transaction.tokenContractType}`);
  }

  throw new Error("Missing logic for formatting this transaction data");
}

export function formatTransactionData<T extends ChainType>(
  transaction: OmitAuxillaryTransactionProps<EthereumAccountTransaction>,
  chainType: T,
  from: string,
): FormattedTransactionData {
  if (chainType === "evm") return { type: "evm", params: formatEVMTransactionData(transaction, from) };

  throw new Error("Missing format transaction data implementation");
}

export function formatDappTransactionToTransactionData(
  transaction: RawTransaction,
  parsedTransaction?: ReadableTransaction,
): FormattedTransactionData {
  return {
    type: "evm",
    params: {
      method: {
        id: parsedTransaction?.sighash ?? "",
        name: parsedTransaction?.name ?? "",
        signature: parsedTransaction?.sighash ?? "",
        shortName: parsedTransaction?.name ?? "",
      },
      transactionData: {
        data: transaction.data,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value ?? "0",
      },
    },
  };
}
