import assert from "assert";

import { isEqual } from "lodash";

import { AlchemySimulator } from "serviceWorker/managers/EVMTransactionsManager/simulators";

import { alchemySimulatorMocks } from "./mock";

const ACCOUNT_ADDRESS = "0xdf40aeba2e9907e900089bccf929ffccd8fa4e0b";

describe("Alchemy simulator tests", () => {
  it("Checks that the proper method is used for single transaction", () => {
    const transaction = { from: ACCOUNT_ADDRESS, to: ACCOUNT_ADDRESS, data: "0x", value: null };

    const request = AlchemySimulator.prepareRequest([transaction as any]);

    assert(request.method === "alchemy_simulateAssetChanges");
  });

  it("Checks that the proper method is used for multiple transactions", () => {
    const transaction = { from: ACCOUNT_ADDRESS, to: ACCOUNT_ADDRESS, data: "0x", value: null };

    const transactions = Array(2).fill(transaction);

    const request = AlchemySimulator.prepareRequest(transactions);

    assert(request.method === "alchemy_simulateAssetChangesBundle");
    assert(Array.isArray(request.params[0]));
  });

  it("Checks that the transaction with ERC20 transfer can be simulated", () => {
    const result = AlchemySimulator.normalizeResponse(ACCOUNT_ADDRESS, alchemySimulatorMocks.erc20?.apiResponse);

    assert(isEqual(JSON.stringify(result), JSON.stringify(alchemySimulatorMocks.erc20?.simulatorResponse)));
  });
});
