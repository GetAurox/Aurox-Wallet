import { JsonRpcProvider } from "@ethersproject/providers";
import { BigNumber } from "@ethersproject/bignumber";

import { GasOptions, GasPresetSettings, TokenSwapDetails } from "ui/types";

import { AccountInfo, BlockchainNetwork, TokenSwapDirection } from "common/types";

export type Pair<T> = { [key in TokenSwapDirection]: T };

// OneInch
export interface OneInchSwapRequest {
  swapFromAddress: string;
  swapToAddress: string;
  amount: string;
  from: string;
  chainId: number;
  slippage: number;
  destReceiver: string;
}

export interface SwapParams {
  to: string;
  data: string;
  amount: string;
  value: string;
}

export interface OneInchTokenDetails {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  logoURI: string;
  isCustom: boolean;
}

export interface OneInchSwapResult {
  fromToken: OneInchTokenDetails;
  toToken: OneInchTokenDetails;
  toTokenAmount: string;
  fromTokenAmount: string;
  protocols: any;
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
  };
  swapParams: SwapParams;
}

// Approvals

export interface ApprovalManagerParams {
  account: AccountInfo;
  network: BlockchainNetwork;
  token: TokenSwapDetails;
  accountAddress: string;
  spender: string;
  amount: string;
  userBalance: string;
  gasOptions: GasOptions;
}

export interface ApprovalRequest {
  accountAddress: string;
  tokenAddress: string;
  spender: string;
  amount: BigNumber;
}

export interface AllowanceCheck {
  network: BlockchainNetwork;
  accountAddress: string;
  tokenAddress: string;
  tokenDecimals: number;
  spender: string;
}

// Swap

export interface SwapDetails {
  tokens: Pair<TokenSwapDetails | null>;
  amounts: Pair<string>;
  slippage: number;
  gasless: boolean;
}

export interface SwapManagerParams extends SwapDetails {
  accountInfo: AccountInfo;
  network: BlockchainNetwork;
  accountAddress: string;
  swapContract: string;
  userBalance: string;
  gasPresets?: GasPresetSettings;
}

export interface ProxySwapParams {
  accountAddress: string;
  swapContractAddress: string;
  swapParams: SwapParams;
  fromTokenAddress: string;
  toTokenAddress: string;
  minimumReturnAmount: string;
  gasRefund: string;
}

export interface GasRefundRequest {
  network: BlockchainNetwork;
  token: TokenSwapDetails;
  amount: string;
  swapContract: string;
  totalCostInETH: number;
}

export interface GetExchangeRateParams {
  fromTokenAddress: string;
  toTokenAddress: string;
  contractAddress: string;
  provider: JsonRpcProvider;
}
