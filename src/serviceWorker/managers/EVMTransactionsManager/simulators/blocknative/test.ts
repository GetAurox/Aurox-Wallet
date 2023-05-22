import assert from "assert";

import isEqual from "lodash/isEqual";

import { BlockNativeSimulator } from "serviceWorker/managers/EVMTransactionsManager/simulators";

import { blocknativeSimulatorMocks } from "./mock";

const ACCOUNT_ADDRESS = "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b";

describe("BlockNative simulator tests", () => {
  it("Checks that the transaction with ERC20 transfer can be simulated", () => {
    const result = BlockNativeSimulator.normalizeResponse(ACCOUNT_ADDRESS, blocknativeSimulatorMocks.erc20?.apiResponse);

    assert(isEqual(JSON.stringify(result), JSON.stringify(blocknativeSimulatorMocks.erc20?.simulatorResponse)));
  });

  it("Ensures simulation works when there are empty balance changes", () => {
    BlockNativeSimulator.normalizeResponse(ACCOUNT_ADDRESS, blocknativeSimulatorMocks.unknown?.apiResponse);
  });
});
