import Decimal from "decimal.js";

import { Pair } from "common/wallet";
import { SecureGaslessTransactionState } from "common/states";
import { EVMTransactionEntry, EVMTransactionStatus } from "common/types";

import { formatAmount, unformat } from "ui/common/utils";
import { USD_DECIMALS } from "ui/common/constants";

import { TokenDisplayWithTicker, TokenSwapDetails } from "ui/types";

import { DEFAULT_DECIMALS } from "common/config";

import { Amount } from "./InitialView";

export function bothTransactionsNeedSigning(gaslessTransactionInfo: SecureGaslessTransactionState.Data | null) {
  return !gaslessTransactionInfo?.approvalTransactionSigned && !gaslessTransactionInfo?.swapTransactionSigned;
}

export function oneTransactionSigned(gaslessTransactionInfo: SecureGaslessTransactionState.Data | null) {
  return (gaslessTransactionInfo?.approvalTransactionSigned ?? false) !== (gaslessTransactionInfo?.swapTransactionSigned ?? false);
}

export function isSomeTransactionPending(transactions: (EVMTransactionEntry | undefined)[]) {
  return transactions.some(transaction => transaction?.status === EVMTransactionStatus.Pending);
}

export function calculatePricesAndAmounts(
  tokens: Pair<TokenDisplayWithTicker>,
  tokenAmounts: Pair<string>,
  networkFeeUSD: number,
  gasless: boolean,
): [Pair<string | null>, Pair<string> & { fee: string }] {
  const prices: Pair<string | null> = {
    from: null,
    to: null,
  };

  const amounts: Pair<string> & { fee: string } = {
    from: "",
    to: "",
    fee: "",
  };

  if (!tokens.from.priceUSD || !tokens.to.priceUSD || !tokens.from.priceUSD || !tokens.to.priceUSD) {
    return [prices, amounts];
  }

  const decimalFromPriceUSD = new Decimal(unformat(tokens.from.priceUSD));
  const decimalFromAmount = new Decimal(unformat(tokenAmounts.from));
  const decimalNetworkFeeUSD = new Decimal(typeof networkFeeUSD === "number" ? networkFeeUSD : unformat(networkFeeUSD));

  const decimalToPriceUSD = new Decimal(unformat(tokens.to.priceUSD));
  const decimalToAmount = new Decimal(unformat(tokenAmounts.to));

  if (gasless) {
    const fromPrices = decimalFromAmount.times(decimalFromPriceUSD).minus(decimalNetworkFeeUSD).toDP(USD_DECIMALS);
    const toPrices = decimalToAmount.times(decimalToPriceUSD).toDP(USD_DECIMALS);

    const amountsFrom = fromPrices.div(decimalFromPriceUSD).toDP(tokens.from.decimals);
    const amountsTo = toPrices.div(decimalToPriceUSD).toDP(tokens.to.decimals);

    const fee = decimalFromAmount.minus(amountsFrom);

    prices.from = fromPrices.toFixed();
    prices.to = toPrices.toFixed();

    amounts.from = formatAmount(amountsFrom.toString());
    amounts.to = formatAmount(amountsTo.toString());
    amounts.fee = formatAmount(fee.toString());
  } else {
    prices.from = decimalFromAmount.times(decimalFromPriceUSD).toDP(USD_DECIMALS).toFixed();
    prices.to = decimalToAmount.times(decimalToPriceUSD).toDP(USD_DECIMALS).toFixed();

    amounts.from = formatAmount(decimalFromAmount.toDP(tokens.from.decimals).toNumber());
    amounts.to = formatAmount(decimalToAmount.toDP(tokens.to.decimals).toNumber());
  }

  return [prices, amounts];
}

export function getTokenSwapDetails(token: TokenDisplayWithTicker | null): TokenSwapDetails | null {
  if (!token) return null;

  return {
    img: token.img,
    key: token.key,
    name: token.name,
    symbol: token.symbol,
    decimals: token.decimals,
    verified: token.verified,
    visibility: token.visibility,
    autoImported: token.autoImported,
    assetIdentifier: token.assetIdentifier,
    assetDefinition: token.assetDefinition,
    networkIdentifier: token.networkIdentifier,
    networkDefinition: token.networkDefinition,
  };
}

export function updateTokenPairValues(
  tokens: Partial<Pair<TokenDisplayWithTicker | null>>,
  value: { amount: string; currency: string },
  direction: "from" | "to",
) {
  const toDecimals = tokens.to?.decimals ?? DEFAULT_DECIMALS;
  const fromDecimals = tokens.from?.decimals ?? DEFAULT_DECIMALS;

  const ratio = Number(tokens.from?.priceUSD ?? 0) / Number(tokens.to?.priceUSD ?? 1);

  const newAmountDecimal = new Decimal(value.amount || "0");

  let newFromAmount = "";
  let newToAmount = "";

  let newFromCurrency = "";
  let newToCurrency = "";

  if (tokens.from?.key && value.amount !== "") {
    newFromAmount = direction === "to" ? newAmountDecimal.div(ratio).toDP(fromDecimals).toFixed() : value.amount;

    newFromCurrency =
      direction === "to"
        ? new Decimal(newFromAmount)
          .times(tokens.from?.priceUSD ?? 0)
          .toDP(USD_DECIMALS)
          .toFixed()
        : value.currency;
  }

  if (tokens.to?.key && value.amount !== "") {
    newToAmount = direction === "from" ? newAmountDecimal.times(ratio).toDP(toDecimals).toFixed() : value.amount;

    newToCurrency =
      direction === "from"
        ? new Decimal(newToAmount)
          .times(tokens.to?.priceUSD ?? 0)
          .toDP(USD_DECIMALS)
          .toFixed()
        : value.currency;
  }

  return {
    from: { amount: newFromAmount as Amount, currency: newFromCurrency as Amount },
    to: { amount: newToAmount as Amount, currency: newToCurrency as Amount },
  };
}
