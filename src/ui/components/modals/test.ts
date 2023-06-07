import { BigNumber } from "@ethersproject/bignumber";

import { TransactionType } from "ui/common/fee";

import { getTransactionReplacementGasSettings } from "./helpers";

describe("Test increaseTransactionGas function", () => {
  it("Verifies that proper gas overrides are created for EIP1559", () => {
    const originalTransaction = { maxPriorityFeePerGas: 1e9, maxFeePerGas: String(3e9) } as any;
    const currentFeeSettings = {
      maxPriorityFeePerGas: BigNumber.from("2"),
      baseFee: 3.1e9,
      type: TransactionType.EIP1559,
    } as any;

    const result = getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    expect(result.maxPriorityFeePerGas).toEqual("1.1");
    expect(result.baseFee).toEqual("3.72");
    expect(result.gasPrice).toBeUndefined();
  });

  it("Verifies that it handles big numbers for EIP1559", () => {
    const originalTransaction = { maxPriorityFeePerGas: BigNumber.from(String(1e20)), maxFeePerGas: BigNumber.from(String(3e20)) } as any;
    const currentFeeSettings = {
      maxPriorityFeePerGas: BigNumber.from(String(2e20)),
      // Not BigNumber but very very big number
      baseFee: String(1e40),
      type: TransactionType.EIP1559,
    } as any;

    const testFunction = () => getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    expect(testFunction).not.toThrow();
  });

  it("Verifies that EIP1559 override works with ", () => {
    // Simulating cross-context data transfer. EG. Service worker -> Extension
    const oneGwei = BigNumber.from(String(1e9));
    const oneGweiAfterContextChange = JSON.parse(JSON.stringify(oneGwei));

    const originalTransaction = {
      maxPriorityFeePerGas: oneGweiAfterContextChange,
      maxFeePerGas: oneGweiAfterContextChange,
    } as any;

    const currentFeeSettings = {
      maxPriorityFeePerGas: BigNumber.from("2"),
      baseFee: 3.1e9,
      type: TransactionType.EIP1559,
    } as any;

    const result = getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    expect(result.maxPriorityFeePerGas).toEqual("1.1");
    expect(result.baseFee).toEqual("3.72");
  });

  it("Verifies that EIP1559 override will work with zero values", () => {
    const originalTransaction = { maxPriorityFeePerGas: null, maxFeePerGas: null } as any;
    const currentFeeSettings = { maxPriorityFeePerGas: 1e9, baseFee: 1e9, type: TransactionType.EIP1559 } as any;

    const result = getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    expect(result.maxPriorityFeePerGas).toEqual("1.1");
    expect(result.baseFee).toEqual("1.2");
  });

  it("Verifies that Legacy override will work with zero values", () => {
    const originalTransaction = { gasPrice: null } as any;
    const currentFeeSettings = { gasPrice: 1e9, type: TransactionType.Legacy } as any;

    const result = getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    // should take bigger gasPrice and increase it by 30%
    expect(result.gasPrice).toEqual("1.3");
    expect(result.maxPriorityFeePerGas).toBeUndefined();
    expect(result.baseFee).toBeUndefined();
  });

  it("Verifies that proper gas overrides are created for Legacy", () => {
    const originalTransaction = { gasPrice: 10e9 } as any;
    const currentFeeSettings = { gasPrice: 23e9, type: TransactionType.Legacy } as any;

    const result = getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    // should take bigger gasPrice and increase it by 30%
    expect(result.gasPrice).toEqual("29.9");
    expect(result.maxPriorityFeePerGas).toBeUndefined();
    expect(result.baseFee).toBeUndefined();
  });

  it("Verifies legacy gas override does not throw", () => {
    const originalTransaction = { gasPrice: "1" } as any;
    const currentFeeSettings = { gasPrice: "1", type: TransactionType.Legacy } as any;

    const testFunction = () => getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    expect(testFunction).not.toThrow();
  });

  it("Verifies that big numbers from another context will be used properly for Legacy)", () => {
    // Simulating cross-context data transfer. EG. Service worker -> Extension
    const tenGwei = BigNumber.from(String(10e9));
    const tenGweiAfterContextChange = JSON.parse(JSON.stringify(tenGwei));

    const originalTransaction = { gasPrice: tenGweiAfterContextChange } as any;
    const currentFeeSettings = { gasPrice: 5e9, type: TransactionType.Legacy } as any;

    const result = getTransactionReplacementGasSettings({ originalTransaction, currentFeeSettings });

    expect(result.gasPrice).toEqual("13.0");
  });
});
