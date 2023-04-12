import assert from "assert";

import { BigNumber } from "ethers";

import { changeByPercentage } from "./utils";

const value = BigNumber.from(10000);

const outputs = [
  ["-100", 0],
  ["-50", 5000],
  ["0", 10000],
  ["0.5", 10050],
  ["20", 12000],
  ["20.5", 12050],
  ["50", 15000],
  ["50.0000001", 15000],
  ["70", 17000],
  ["99.99", 19999],
  ["99.999", 20000],
  ["100", 20000],
  ["200", 30000],
];

describe("Test fee manager utils", () => {
  it("Verifies increaseByPercentage for big numbers", () => {
    for (const [percentage, expectedOutput] of outputs) {
      const result = changeByPercentage(value, Number(percentage));

      assert(result.eq(expectedOutput), `Failed to increase by ${percentage}%. Expected: ${expectedOutput}, got ${result}`);
    }
  });
});
