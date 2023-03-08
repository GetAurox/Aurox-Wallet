import { BigNumber, BigNumberish, ethers } from "ethers";
import { ErrorCode } from "@ethersproject/logger";
import range from "lodash/range";
import keys from "lodash/keys";

import { ERC20, ERC20__factory, Multicall__factory } from "common/wallet/typechain";

import { MULTICALL_NUM_RETRIES, NULL_ADDRESS } from "common/config";

import { OptimalRPCManager } from "../OptimalRPCManager";

import { mockEthereumNetwork } from "../__mocks__/networks";

import { mockUnsuccessfulCallRevertData } from "../__mocks__";

import { JsonRPCProviderWithRetry } from "./JsonRPCProviderWithRetry";

const FailFunction = (fields?: { body?: string; code?: ErrorCode }) => {
  const error = new Error();

  for (const key of keys(fields)) {
    (error as any)[key as any] = (fields as any)[key];
  }

  throw error;
};

const SuccessFunction = <T>(value?: T) => value ?? null;

describe("JsonRPCProvider", () => {
  let provider: JsonRPCProviderWithRetry;
  let spy: jest.SpyInstance<Promise<any>, [method: string, params: any[]]>;

  beforeEach(async () => {
    (OptimalRPCManager as any).resetFailures();

    jest
      .spyOn(ethers.providers.JsonRpcProvider.prototype, "detectNetwork")
      .mockImplementation(() => Promise.resolve({ chainId: mockEthereumNetwork.chainId, name: mockEthereumNetwork.name }));

    if (spy) spy.mockReset();

    spy = jest.spyOn(ethers.providers.JsonRpcProvider.prototype, "send");

    provider = new JsonRPCProviderWithRetry(mockEthereumNetwork);

    // Because a request is sent to grab the eth_chainId from the derived JsonRpcProvider class. We need to wait for this request to resolve. This method is being mocked above and will handle it, but for some reason it requires the timeout to work
    await new Promise(r => setTimeout(() => r(null), 100));
  });

  const generateSpies = (spyMethods: Array<() => any>) => {
    for (const method of spyMethods) {
      spy.mockImplementationOnce(method);
    }
  };

  it("tests that when failing on the first request sent by the provider, the error is logged", async () => {
    generateSpies([FailFunction, SuccessFunction]);

    await provider.send("eth_mock", []);

    const failures = OptimalRPCManager.getFailureCountForConnection(mockEthereumNetwork.connections[0]);

    expect(failures).toEqual(1);

    expect(spy).toBeCalledTimes(2);
  });

  it("tests that when failing on the first request sent by the provider and then returning the optimal RPC returns the next item in the array", async () => {
    generateSpies([FailFunction, SuccessFunction]);

    await provider.send("eth_mock", []);

    const optimal = OptimalRPCManager.selectOptimalRPC(mockEthereumNetwork.connections);

    expect(optimal).toStrictEqual(mockEthereumNetwork.connections[1]);
  });

  it("tests that when failing on the first request and second request, then succeeding on the final results in the last RPC to get chosen as optimal", async () => {
    generateSpies([FailFunction, FailFunction, SuccessFunction]);

    await provider.send("eth_mock", []);

    expect(OptimalRPCManager.selectOptimalRPC(mockEthereumNetwork.connections)).toStrictEqual(mockEthereumNetwork.connections[2]);
  });

  it("tests that failing a single time for each connection and then succeeding, results in the optimal RPC being the first connection", async () => {
    const numSpies = mockEthereumNetwork.connections.length;

    generateSpies([...range(numSpies).map(() => FailFunction), SuccessFunction]);

    try {
      await provider.send("eth_mock", []);
    } catch {
      // ignore
    }

    expect(spy).toBeCalledTimes(numSpies);

    for (const connection of mockEthereumNetwork.connections) {
      const failures = OptimalRPCManager.getFailureCountForConnection(connection);

      expect(failures).toEqual(1);
    }

    expect(OptimalRPCManager.selectOptimalRPC(mockEthereumNetwork.connections)).toStrictEqual(mockEthereumNetwork.connections[0]);
  });

  it("tests that failing 5 times results in an error being throw", async () => {
    const numSpies = 5;

    generateSpies(range(numSpies).map(() => FailFunction));

    // The error message is getting randomly prefixed with "Error: "
    await expect(provider.send("eth_mock", [])).rejects.toStrictEqual(new AggregateError([]));
  });

  describe("Multicall", () => {
    const multicallInterface = Multicall__factory.createInterface();

    let usdc: ERC20;

    beforeEach(() => {
      // Using an instance of an ERC20 class connected to the provider to test requests, this will handle request and response formatting and emulates real usage
      usdc = ERC20__factory.connect(NULL_ADDRESS, provider);
    });

    const encodeResponse = (mockResponse: {
      blockNumber: BigNumber;
      returnData: {
        success: boolean;
        returnData: BigNumberish;
      }[];
    }) =>
      multicallInterface.encodeFunctionResult("tryAggregateView", [
        mockResponse.blockNumber,
        mockResponse.returnData.map(data => {
          let returnData;
          if (data.returnData instanceof BigNumber) {
            // The response data needs to be 32 characters in length as a HEX string to work
            returnData = ethers.utils.hexZeroPad(data.returnData.toHexString(), 32);
          } else {
            returnData = data.returnData;
          }

          return [data.success, returnData];
        }),
      ]);

    const generateMockedResponse = (numRequests: number) => {
      const mockResponse = {
        blockNumber: BigNumber.from(0),
        returnData: range(numRequests).map((_, idx) => ({ success: true, returnData: BigNumber.from(idx) })),
      };

      return { mockResponse, encodedResponse: encodeResponse(mockResponse) };
    };

    it("tests that calling the balanceOf function through type-chain results in the multicall method being called and all the responses being returned correctly", async () => {
      const numRequests = 100;

      const { encodedResponse, mockResponse } = generateMockedResponse(numRequests);
      generateSpies([() => SuccessFunction(encodedResponse)]);

      const response = await Promise.all(range(numRequests).map(() => usdc.balanceOf(NULL_ADDRESS)));
      expect(mockResponse.returnData.map(data => data.returnData)).toStrictEqual(response);
    });

    it("tests that failing the request once with a request too large error, results in the batch size being reduced", async () => {
      const { encodedResponse } = generateMockedResponse(1);

      generateSpies([
        () => FailFunction({ body: "Request Too Large", code: ErrorCode.SERVER_ERROR }),
        () => SuccessFunction(encodedResponse),
      ]);

      const beforeBatchSize = provider.batchSize;

      await usdc.balanceOf(NULL_ADDRESS);

      expect(beforeBatchSize - provider.batchSize).toBeGreaterThan(0);
    });

    it("tests that failing the request once with a timeout error, results in the batch size being reduced", async () => {
      const { encodedResponse } = generateMockedResponse(1);

      generateSpies([() => FailFunction({ code: ErrorCode.TIMEOUT }), () => SuccessFunction(encodedResponse)]);

      const beforeBatchSize = provider.batchSize;

      await usdc.balanceOf(NULL_ADDRESS);

      expect(beforeBatchSize - provider.batchSize).toBeGreaterThan(0);
    });

    it("tests that failing more than the retry logic, results in all the requests rejecting", async () => {
      const numRequests = provider.batchSize;
      generateSpies(range(MULTICALL_NUM_RETRIES).map(() => FailFunction));

      await Promise.all(
        range(numRequests).map(async () => {
          await expect(usdc.balanceOf(NULL_ADDRESS)).rejects.toThrow();
        }),
      );
    });

    it("tests that failing more than the retry logic for multiple batches, results in all the requests rejecting", async () => {
      const numRequests = provider.batchSize * 2.5;
      generateSpies(range(MULTICALL_NUM_RETRIES * 3).map(() => FailFunction));

      await Promise.all(
        range(numRequests).map(async () => {
          await expect(usdc.balanceOf(NULL_ADDRESS)).rejects.toThrow();
        }),
      );
    });

    it("tests that failing all the requests for a single batch and then succeeding ensures the results for the next batch are returned", async () => {
      const numRequests = provider.batchSize * 1.5;

      const { encodedResponse, mockResponse } = generateMockedResponse(numRequests);

      generateSpies([...range(MULTICALL_NUM_RETRIES).map(() => FailFunction), () => SuccessFunction(encodedResponse)]);

      await Promise.all(
        range(numRequests).map(async idx => {
          if (idx < provider.batchSize) {
            await expect(usdc.balanceOf(NULL_ADDRESS)).rejects.toThrow();
          } else {
            // Because of how the responses are mocked by the JSONRPC provider, when the first few requests fail their real responses will still be there and when the successful requests start it will start from the initial index. This doesn't affect real usage because the multicall contract will be requested with the next valid requests
            const indexToUseResponseFor = idx - provider.batchSize;

            expect(await usdc.balanceOf(NULL_ADDRESS)).toStrictEqual(mockResponse.returnData[indexToUseResponseFor].returnData);
          }
        }),
      );
    });

    it("tests that passing multiple unsuccessful responses among an array of successful responses results in the unsuccessful responses reverting correctly and the successful ones returning correctly", async () => {
      const numRequests = 100;

      const mockResponse = {
        blockNumber: BigNumber.from(0),
        returnData: range(numRequests).map((_, idx) => {
          // Set the first 10 results to have unsuccessful status
          if (idx < 10) {
            return { success: false, returnData: mockUnsuccessfulCallRevertData.revertData };
          }

          return { success: true, returnData: BigNumber.from(idx) };
        }),
      };

      const encodedResponse = encodeResponse(mockResponse);

      generateSpies([() => SuccessFunction(encodedResponse)]);

      await Promise.all(
        range(numRequests).map(async idx => {
          if (idx < 10) {
            try {
              await usdc.balanceOf(NULL_ADDRESS);
              // Ensures the catch statement is invoked
              expect(true).toBe(false);
            } catch (e) {
              // Check that the call revert data was decoded successfully
              expect(e.error.reason).toBe(mockUnsuccessfulCallRevertData.revertMessage);
            }
          } else {
            expect(await usdc.balanceOf(NULL_ADDRESS)).toEqual(mockResponse.returnData[idx].returnData);
          }
        }),
      );
    });

    it("tests that sending more requests than the batch size results in receiving all the correct responses", async () => {
      const numRequests = provider.batchSize * 2.5;

      const { encodedResponse, mockResponse } = generateMockedResponse(numRequests);
      generateSpies([
        () => SuccessFunction(encodedResponse),
        () => SuccessFunction(encodedResponse),
        () => SuccessFunction(encodedResponse),
      ]);

      const response = await Promise.all(range(numRequests).map(() => usdc.balanceOf(NULL_ADDRESS)));

      expect(mockResponse.returnData.map(data => data.returnData)).toStrictEqual(response);
    });
  });
});
