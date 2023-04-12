import { BigNumber } from "ethers";
import { Deferrable } from "ethers/lib/utils";
import { TransactionRequest } from "@ethersproject/abstract-provider";

import { FeeConfigurationLegacy, LegacyFeeManager } from "./Legacy";
import { EIP1559FeeManager, FeeConfigurationEIP1559 } from "./EIP1559";
import { EVMFeePreference } from "./types";

export type EVMFeeConfiguration = FeeConfigurationLegacy<BigNumber> | FeeConfigurationEIP1559<BigNumber>;
export type SupportedFeeConfigurationViews = FeeConfigurationLegacy<string> | FeeConfigurationEIP1559<string>;

export type EVMFeeManager = LegacyFeeManager | EIP1559FeeManager;

export interface EVMFeeManagerInterface<T> {
  /** Supported fee settings based on the transaction type */
  currentFeeSettings: T | null;

  /** Allows users quick preview of the gas settings depending
   * on how they want their transactions to be executed
   * */
  feePreference: EVMFeePreference;

  /** Transaction prepared for sending via JSON-RPC */
  transaction: Deferrable<TransactionRequest>;

  /** Returns amount of native currency to be sent with transaction (ETH, MATIC, etc.) */
  transactionValue: BigNumber;

  /** Indicates if the user has enough funds to pay for the gas.
   * Null if it is still estimating
   * */
  hasEnoughFunds: boolean | null;

  /** Fee settings with all numbers converted to Hex strings */
  feeSettingsForEthereum: SupportedFeeConfigurationViews | null;

  /** Fee settings with all numbers converted to human readable format */
  feeSettingsNormalized: SupportedFeeConfigurationViews | null;

  /** Fee price total in wei */
  feePrice: BigNumber | null;

  /** Total price in native EVM blockchain currency */
  feePriceInNativeCurrency: number | null;

  /** Allows toggling between fee preferences */
  changeFeePreference: (preference: EVMFeePreference) => void;

  /** Updates fee information from the blockchain */
  updateFees: () => Promise<void>;
}
