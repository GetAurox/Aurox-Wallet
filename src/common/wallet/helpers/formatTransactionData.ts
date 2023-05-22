import { ChainType, RawTransaction, ReadableTransaction } from "common/types";
import { ETH_ADDRESS } from "common/config";

import { ERC20__factory } from "common/wallet/typechain";

import { OmitAuxillaryTransactionProps, EthereumAccountTransaction, EthereumContractMethod } from "ui/types";
import { upscaleAmountWithDecimals } from "ui/common/utils";
import { TransactionType } from "ui/common/fee";

const erc20Interface = ERC20__factory.createInterface();
const erc721Interface = ERC20__factory.createInterface();

export type FormattedTransactionData = { type: "evm"; params: TransactionData };

export interface TransactionData {
  transactionData: { data: string; value: string; from: string; to: string; type: TransactionType.EIP1559 };
  method: EthereumContractMethod;
}

export function isAddressETH(address: string) {
  return address.toLowerCase() === ETH_ADDRESS.toLowerCase();
}

function formatEVMTransactionData(transaction: OmitAuxillaryTransactionProps<EthereumAccountTransaction>, from: string): TransactionData {
  if (transaction.__typename === "EthereumAccountTokenTransfer") {
    if (transaction.tokenContractType === "ERC20") {
      const formattedValue = upscaleAmountWithDecimals(parseFloat(transaction.value), transaction.token.decimals);

      if (isAddressETH(transaction.token.address))
        return {
          transactionData: { data: "0x", value: formattedValue, to: transaction.txTo, from, type: TransactionType.EIP1559 },
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
        transactionData: { data, value: "0", to: transaction.token.address, from, type: TransactionType.EIP1559 },
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
        transactionData: { data, value: "0", to: transaction.token.address, from, type: TransactionType.EIP1559 },
        method: {
          name: erc721Interface.functions["transferFrom(address,address,uint256)"].name,
          signature: "transferFrom(address,address,uint256)",
          shortName: "transferFrom",
          id: data.slice(0, 10),
        },
      };
    }

    throw new Error(`Missing logic for tokenContractType ${transaction.tokenContractType}`);
  } else if (transaction.__typename === "EthereumAccountTokenApproval") {
    if (transaction.token.contractType === "ERC20") {
      if (isAddressETH(transaction.token.address)) {
        throw new Error("Cannot format approval tx data for ETH transaction");
      }

      const formattedValue = upscaleAmountWithDecimals(transaction.value, transaction.token.decimals);

      const data = erc20Interface.encodeFunctionData("approve", [transaction.spender, formattedValue]);

      return {
        transactionData: { data, value: "0", to: transaction.token.address, from, type: TransactionType.EIP1559 },
        method: {
          name: erc20Interface.functions["approve(address,uint256)"].name,
          signature: "approve(address,uint256)",
          shortName: "approve",
          id: data.slice(0, 10),
        },
      };
    }
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
        type: TransactionType.EIP1559,
      },
    },
  };
}
