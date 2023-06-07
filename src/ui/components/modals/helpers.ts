import Decimal from "decimal.js";

import { BigNumber } from "@ethersproject/bignumber";
import { formatUnits } from "@ethersproject/units";
import { TransactionRequest as EthersTransactionRequest } from "@ethersproject/abstract-provider";

import { TransactionRequest } from "common/types";
import { EVMFeeConfiguration, TransactionType } from "ui/common/fee";
import { restoreBigNumberFields } from "common/utils";

export function getCancelTransaction(transaction: TransactionRequest) {
  return {
    from: transaction.from,
    to: transaction.from,
    type: transaction.type,
    data: "0x",
    value: "0x0",
  };
}

export function getSpeedUpTransaction(transaction: TransactionRequest) {
  if (!transaction.to) {
    throw new Error("`to` parameter is missing while preparing speedUp transaction. Please report this issue");
  }

  return {
    from: transaction.from,
    to: transaction.to,
    data: transaction.data,
    value: transaction.value,
    type: transaction.type,
  };
}

export function getTransactionReplacementGasSettings({
  originalTransaction,
  currentFeeSettings,
}: {
  originalTransaction: TransactionRequest;
  currentFeeSettings: EVMFeeConfiguration;
}) {
  const transaction = restoreBigNumberFields<EthersTransactionRequest>(originalTransaction);

  if (currentFeeSettings.type === TransactionType.EIP1559) {
    const originalMaxPriorityFeePerGas = new Decimal(transaction.maxPriorityFeePerGas?.toString() ?? 0);
    const originalMaxFeePerGas = new Decimal(transaction.maxFeePerGas?.toString() ?? 0);
    const originalBaseFee = originalMaxFeePerGas.minus(originalMaxPriorityFeePerGas);

    const { maxPriorityFeePerGas, baseFee } = currentFeeSettings;

    const currentMaxPriorityFeePerGas = new Decimal(maxPriorityFeePerGas.toString());
    const currentBaseFee = new Decimal(baseFee.toString());

    const biggerMaxPriorityFeePerGas = currentMaxPriorityFeePerGas.lessThan(originalMaxPriorityFeePerGas)
      ? originalMaxPriorityFeePerGas
      : currentMaxPriorityFeePerGas;

    const biggerBaseFee = currentBaseFee.lessThan(originalBaseFee) ? originalBaseFee : currentBaseFee;

    // Increase by 10%
    const increasedMaxPriorityFeePerGas = formatUnits(BigNumber.from(biggerMaxPriorityFeePerGas.times(1.1).toFixed(0)), "gwei");
    // Increase by 20%
    const increasedBaseFee = formatUnits(BigNumber.from(biggerBaseFee.times(1.2).toFixed(0)), "gwei");

    return { maxPriorityFeePerGas: increasedMaxPriorityFeePerGas, baseFee: increasedBaseFee };
  }

  const { gasPrice } = currentFeeSettings;

  const originalGasPrice = new Decimal(transaction.gasPrice?.toString() ?? 0);
  const currentGasPrice = new Decimal(gasPrice.toString());

  const biggerGasPrice = currentGasPrice.lessThan(originalGasPrice) ? originalGasPrice : currentGasPrice;

  // Increase by 30%
  const increasedGasPrice = biggerGasPrice.times(1.3).toFixed(0);

  return { gasPrice: formatUnits(BigNumber.from(increasedGasPrice), "gwei") };
}
