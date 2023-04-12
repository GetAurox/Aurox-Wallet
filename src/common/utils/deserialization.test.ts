import assert from "assert";

import { BigNumber } from "@ethersproject/bignumber";

import { restoreBigNumberFields } from "./deserialization";

interface MockInterface {
  gasLimit: BigNumber;
  maxFeePerGas: BigNumber;
  maxPriorityFeePerGas: BigNumber;
}

const mockObject = {
  "maxPriorityFeePerGas": {
    "type": "BigNumber",
    "hex": "0x59682f00",
  },
  "maxFeePerGas": {
    "type": "BigNumber",
    "hex": "0x04a8b1e632",
  },
  "gasPrice": null,
  "gasLimit": {
    "type": "BigNumber",
    "hex": "0x7b0c",
  },
  "value": {
    "type": "BigNumber",
    "hex": "0x0301083e9aa046d9",
  },
  "data": "0x",
};

describe("It should restore BigNumber fields to proper type", () => {
  it("Restored field can use BigNumber operations", () => {
    const restoredObject = restoreBigNumberFields<MockInterface>(mockObject);

    assert(restoredObject.maxPriorityFeePerGas.eq(restoredObject.maxPriorityFeePerGas));
    assert(restoredObject.maxFeePerGas.eq(restoredObject.maxFeePerGas));
    assert(restoredObject.gasLimit.eq(restoredObject.gasLimit));
  });
});
