import assert from "assert";

import { calculateMinimumReturnAmount } from "./ProxySwap";

describe("It tests that the minimum return amount can be calculated", () => {
  it("Test that method does not throw for 0 inputs", () => {
    const result = calculateMinimumReturnAmount("200000", 0);

    assert(result === "200000", "Values do not match");
  });

  it("Test that method calculates for small amount", () => {
    const result = calculateMinimumReturnAmount("200000", 0.03);

    const expected = 200000 * (1 - 0.03 / 100);

    assert(result === expected.toString(), "Values do not match");
  });

  it("Test that method returns zero for too high percentages", () => {
    const percentage = 102;

    const result = calculateMinimumReturnAmount("200000", percentage);

    assert(result === "0", "Values do not match");
  });

  it("Tests that method returns ok for very high values", () => {
    const percentage = 50;
    const value = (10e30).toString();

    const result = calculateMinimumReturnAmount(value, percentage);

    assert(result === "5000000000000000000000000000000", "Values do not match");
  });
});
