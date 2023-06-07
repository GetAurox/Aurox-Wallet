import { Pair } from "common/wallet";

import { calculatePricesAndAmounts } from "./helpers";

describe("[Non-gasless] Test swap helpers", () => {
  it("Verifies that tokens with the same price can be exchanged for large amounts", () => {
    const tokens = { from: { priceUSD: "10,000.00" }, to: { priceUSD: "10000" } };
    const tokenAmounts: Pair<string> = { from: "10", to: "10" };

    const [prices, amounts] = calculatePricesAndAmounts(tokens as any, tokenAmounts, 1, false);

    expect(prices.from).toEqual("100000");
    expect(prices.to).toEqual("100000");
    expect(amounts.from).toEqual("10");
    expect(amounts.to).toEqual("10");
  });

  it("Verifies that tokens with big prices and big amounts can be exchanged", () => {
    const tokens = { from: { priceUSD: "1,250.31313" }, to: { priceUSD: "1,33.432" } };
    const tokenAmounts: Pair<string> = { from: "2e3", to: "111" };

    const [prices, amounts] = calculatePricesAndAmounts(tokens as any, tokenAmounts, 1, false);

    expect(prices).toEqual({ from: "2500626.26", to: "14810.95" });
    expect(amounts).toEqual({ from: "2,000", to: "111", fee: "" });
  });
});

describe("[Gasless] Test swap helpers", () => {
  it("Verifies that the fee is taken into account for gasless swap", () => {
    const tokens = { from: { priceUSD: "1.24" }, to: { priceUSD: "2.24" } };
    const tokenAmounts: Pair<string> = { from: "1,200.00", to: "2" };

    const [prices, amounts] = calculatePricesAndAmounts(tokens as any, tokenAmounts, 1, true);

    expect(prices).toEqual({ from: "1487", to: "4.48" });
    expect(amounts).toEqual({ from: "1,199.19", to: "2", fee: "0.8065" });
  });

  it("Verifies that large amounts can be used", () => {
    const tokens = { from: { priceUSD: "1,200.00" }, to: { priceUSD: "4,500.00" } };
    const tokenAmounts: Pair<string> = { from: "1e3", to: "40.0000000000000000000000000000000001" };

    const [prices, amounts] = calculatePricesAndAmounts(tokens as any, tokenAmounts, 100000, true);

    expect(prices).toEqual({ from: "1100000", to: "180000" });
    expect(amounts).toEqual({ from: "916.67", to: "40", fee: "83.33" });
  });

  it("Verifies that incorrect networkFeeUSD type will not cause errors", () => {
    const tokens = { from: { priceUSD: "1.24" }, to: { priceUSD: "2.24" } };
    const tokenAmounts: Pair<string> = { from: "1,200.00", to: "2" };

    const networkFeeUSD = "1,200.00";

    expect(() => calculatePricesAndAmounts(tokens as any, tokenAmounts, networkFeeUSD as any, true)).not.toThrow();
  });
});
