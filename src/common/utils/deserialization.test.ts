import assert from "assert";

import { BigNumber } from "@ethersproject/bignumber";

import { restoreBigNumberFields } from "./deserialization";

interface MockParamsInterface {
  gasLimit: BigNumber;
  maxFeePerGas: BigNumber;
}

interface NestedMockInterface {
  fields: MockParamsInterface;
}

interface DeeplyNestedMockInterface extends MockParamsInterface {
  nested: NestedMockInterface;

  flatFields: MockParamsInterface;
}

const mockObject = {
  maxFeePerGas: {
    type: "BigNumber",
    _hex: "0x04a8b1e632",
  },
  gasLimit: {
    type: "BigNumber",
    hex: "0x7b0c",
  },
};

const nestedMockObject = {
  nested: {
    fields: mockObject,
  },

  flatFields: mockObject,

  ...mockObject,
};

const transactionObject = {
  "accountUUID": "0e62ef98-4d02-4a9d-aa75-fa1cb46d460c",
  "networkIdentifier": "evm::5",
  "receipt": {
    "blockHash": "0x27373e3a70425d3e1f8b7f5ad96cea206aed6493ee5b3589a92e3ee41bff426d",
    "blockNumber": 8490819,
    "byzantium": true,
    "confirmations": 1,
    "contractAddress": null,
    "cumulativeGasUsed": {
      "_hex": "0xbca526",
      "_isBigNumber": true,
    },
    "effectiveGasPrice": {
      "_hex": "0x035d08e32d",
      "_isBigNumber": true,
    },
    "from": "0xDF40aEBa2e9907E900089bCcf929ffcCD8fA4e0b",
    "gasUsed": {
      "_hex": "0x5208",
      "_isBigNumber": true,
    },
    "logs": [],
    "logsBloom":
      "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "status": 1,
    "to": "0xDF40aEBa2e9907E900089bCcf929ffcCD8fA4e0b",
    "transactionHash": "0x2c80a88f68b784bb8a2ccdb7d007fb099bf96aa2e8a1e2cef8ef1fdeecc1da58",
    "transactionIndex": 39,
    "type": 2,
  },
  "status": 1,
  "timestamp": 1676385829,
  "transaction": {
    "accessList": [],
    "chainId": 5,
    "confirmations": 0,
    "data": "0x",
    "from": "0xDF40aEBa2e9907E900089bCcf929ffcCD8fA4e0b",
    "gasLimit": {
      "_hex": "0x7b0c",
      "_isBigNumber": true,
    },
    "gasPrice": null,
    "hash": "0x2c80a88f68b784bb8a2ccdb7d007fb099bf96aa2e8a1e2cef8ef1fdeecc1da58",
    "maxFeePerGas": {
      "_hex": "0x06bbb4e298",
      "_isBigNumber": true,
    },
    "maxPriorityFeePerGas": {
      "_hex": "0x5f5e1000",
      "_isBigNumber": true,
    },
    "nonce": 71,
    "r": "0x57137db0634a976ad38f74095871043258d4a6d968fa4d47fb058aeb201cec7a",
    "s": "0x20f09507e4699709750b93a01717ac2a4c431a5f600f43c888bef73a85a7543b",
    "to": "0xDF40aEBa2e9907E900089bCcf929ffcCD8fA4e0b",
    "type": 2,
    "v": 1,
    "value": {
      "_hex": "0x023d766a5ceaa68c",
      "_isBigNumber": true,
    },
  },
  "txHash": "0x2c80a88f68b784bb8a2ccdb7d007fb099bf96aa2e8a1e2cef8ef1fdeecc1da58",
};

describe("It should restore BigNumber fields to proper type", () => {
  it("Restored field can use BigNumber operations", () => {
    const restoredObject = restoreBigNumberFields<MockParamsInterface>(mockObject);

    assert(restoredObject.maxFeePerGas.eq(restoredObject.maxFeePerGas));
    assert(restoredObject.gasLimit.eq(restoredObject.gasLimit));
  });

  it("Restores fields from nested objects", () => {
    const { flatFields, nested, maxFeePerGas, gasLimit } = restoreBigNumberFields<DeeplyNestedMockInterface>(nestedMockObject);

    const conversionSuccessful = maxFeePerGas.add(flatFields.maxFeePerGas).div(nested.fields.maxFeePerGas).eq(2);

    const underscoreConversionSuccessful = gasLimit.add(flatFields.gasLimit).div(nested.fields.gasLimit).eq(2);

    assert(conversionSuccessful, "Failed to convert with hex field");
    assert(underscoreConversionSuccessful, "Failed to convert with _hex field");
  });

  it("Can restore full transaction object", () => {
    const result = restoreBigNumberFields<typeof transactionObject>(transactionObject);

    const conversionSuccessful = !!(result.transaction.maxFeePerGas as BigNumber)
      .add(result.transaction.gasLimit as BigNumber)
      .add(result.transaction.maxPriorityFeePerGas as BigNumber);

    assert(conversionSuccessful, "Failed to convert with hex field");
  });
});
