import { BigNumber } from "@ethersproject/bignumber";
import { JsonRpcProvider } from "@ethersproject/providers";

import Decimal from "decimal.js";

import { ETH_ADDRESS } from "common/config";
import { RawTransaction } from "common/types";
import { SwapParams } from "common/wallet";
import { ForwardingSwapProxy__factory } from "common/wallet/typechain/factories/ForwardingSwapProxy__factory";

export const HEX_ZERO = BigNumber.from(0).toHexString();

export const DEFAULT_SWAP_GAS_LIMIT = 500000;

export interface ProxySwapParams {
  accountAddress: string;
  swapContractAddress: string;
  swapParams: SwapParams;
  fromTokenAddress: string;
  toTokenAddress: string;
  minimumReturnAmount: string;
  gasRefund: string;
}

/** Returns amount reduced by the slippage percentage
 * @param amount - Amount in WEI
 * @param slippage - Percentage to allow the slippage, anything beyond 100% will return 0
 */
export function calculateMinimumReturnAmount(amount: string, slippage: number): string {
  const converted = {
    amount: new Decimal(amount),
    slippage: new Decimal(slippage),
    one: new Decimal(1),
  };

  const factor = converted.one.minus(converted.slippage.dividedBy(100));

  if (factor.isNegative()) {
    return "0";
  }

  return converted.amount.times(factor).toFixed(0);
}

export function getSwapTransaction(params: ProxySwapParams): RawTransaction {
  const { accountAddress, swapContractAddress, swapParams, fromTokenAddress, toTokenAddress, minimumReturnAmount, gasRefund } = params;

  const contractInterface = ForwardingSwapProxy__factory.createInterface();

  const data = contractInterface.encodeFunctionData("proxySwapWithFee", [
    fromTokenAddress,
    toTokenAddress,
    swapParams,
    gasRefund,
    minimumReturnAmount,
  ]);

  const value = fromTokenAddress === ETH_ADDRESS ? BigNumber.from(swapParams?.value).toHexString() : HEX_ZERO;

  return {
    from: accountAddress,
    to: swapContractAddress,
    data,
    value,
  };
}

export interface GetExchangeRateParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  contractAddress: string;
  provider: JsonRpcProvider;
}

export async function getExchangeRate(params: GetExchangeRateParams) {
  const { fromTokenAddress, toTokenAddress, contractAddress, provider } = params;

  const contract = ForwardingSwapProxy__factory.connect(contractAddress, provider);

  return await contract.getExchangeRate(fromTokenAddress, toTokenAddress);
}
