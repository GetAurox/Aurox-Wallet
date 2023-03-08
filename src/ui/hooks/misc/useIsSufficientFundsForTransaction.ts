import { useMemo } from "react";
import { BigNumber, BigNumberish, utils } from "ethers";
import Decimal from "decimal.js";

import { TokenDisplay } from "ui/types";
import { SupportedFeeConfigurationViews, TransactionType } from "ui/common/fee";

import { useActiveAccountFlatTokenBalances } from "../states";

/**
 * Returns `true` if `groupOfValuesA` is greater or equal than `groupOfValuesB`
 */
function gte(groupOfValuesA: (BigNumberish | null | undefined)[], groupOfValuesB: (BigNumberish | null | undefined)[]) {
  let sumA: BigNumber = BigNumber.from(0);
  let sumB: BigNumber = BigNumber.from(0);

  for (const valueA of groupOfValuesA) {
    if (!valueA) {
      return false;
    }

    sumA = sumA.add(BigNumber.from(valueA));
  }

  for (const valueB of groupOfValuesB) {
    if (!valueB) {
      return false;
    }

    sumB = sumB.add(BigNumber.from(valueB));
  }

  return sumA.gte(sumB);
}

function getIsSufficientFundsForTransaction(props: {
  nativeTokenBalanceETH?: string | null;
  transactedTokenBalanceETH?: string | null;
  transactedTokenAmountETH?: string | null;
  gasFeeETH?: string | null;
  transactedNative?: boolean;
}) {
  const { nativeTokenBalanceETH, transactedTokenBalanceETH, transactedTokenAmountETH, gasFeeETH, transactedNative } = props;

  if (transactedNative) {
    return (
      gte([nativeTokenBalanceETH], [gasFeeETH]) &&
      gte([nativeTokenBalanceETH], [transactedTokenAmountETH]) &&
      gte([nativeTokenBalanceETH], [gasFeeETH, transactedTokenAmountETH])
    );
  }

  return gte([nativeTokenBalanceETH], [gasFeeETH]) && gte([transactedTokenBalanceETH], [transactedTokenAmountETH]);
}

/**
 * Evaluates whether current active user's account has enough funds (ETH)
 * to pay for the transaction in case of sending non native token or sending native token (ETH + gas)
 */
export function useIsSufficientFundsForTransaction(props: {
  token?: TokenDisplay | null;
  amount: string;
  feeSettings: SupportedFeeConfigurationViews | null;
}) {
  const { token, amount, feeSettings } = props;

  const amountDecimal = new Decimal(amount);

  const flatTokenBalances = useActiveAccountFlatTokenBalances();

  const nativeTokenFlatBalance = flatTokenBalances.find(
    flatTokenBalance => flatTokenBalance.type === "native" && flatTokenBalance.networkIdentifier === token?.networkIdentifier,
  );

  let nativeTokenBalanceETH: string | null | undefined = null;

  if (nativeTokenFlatBalance) {
    nativeTokenBalanceETH = utils.parseUnits(nativeTokenFlatBalance.balance, nativeTokenFlatBalance.decimals).toString();
  }

  let transactedTokenBalanceETH: string | null | undefined = null;
  let transactedTokenAmountETH: string | null | undefined = null;

  if (token) {
    transactedTokenBalanceETH = utils.parseUnits(token.balance, token.decimals).toString();
    transactedTokenAmountETH = utils.parseUnits(amountDecimal.toDP(token.decimals).toFixed(), token.decimals).toString();
  }

  let gasFeeETH: string | null | undefined = null;

  if (feeSettings) {
    if (feeSettings.type === TransactionType.Legacy) {
      gasFeeETH = BigNumber.from(feeSettings.gasPrice).mul(BigNumber.from(feeSettings.gasLimit)).toString();
    } else {
      gasFeeETH = BigNumber.from(feeSettings.baseFee)
        .add(BigNumber.from(feeSettings.maxPriorityFeePerGas))
        .mul(BigNumber.from(feeSettings.gasLimit))
        .toString();
    }
  }

  let transactedNative = false;

  if (nativeTokenFlatBalance && token) {
    transactedNative = nativeTokenFlatBalance.assetIdentifier === token.assetIdentifier;
  }

  return useMemo(
    () =>
      getIsSufficientFundsForTransaction({
        nativeTokenBalanceETH,
        transactedTokenBalanceETH,
        transactedTokenAmountETH,
        gasFeeETH,
        transactedNative,
      }),
    [nativeTokenBalanceETH, transactedTokenBalanceETH, transactedTokenAmountETH, gasFeeETH, transactedNative],
  );
}
