import { BigNumber, BytesLike, ethers } from "ethers";
import { Logger } from "ethers/lib/utils";
import { version } from "ethers/lib/_version";
import { ErrorCode } from "@ethersproject/logger";
import slice from "lodash/slice";
import range from "lodash/range";

import { Multicall__factory } from "common/wallet/typechain";

import { getMulticallAddress, getRevertMessageFromRevertData } from "common/wallet/helpers";

import { BlockchainNetwork } from "common/types";
import { withRetry } from "common/utils";

import {
  MULTICALL_INITIAL_BATCH_SIZE,
  MULTICALL_BATCH_REDUCTION_MULTIPLIER,
  MULTICALL_MINIMUM_BATCH_SIZE,
  MULTICALL_NUM_RETRIES,
} from "common/config";

import { OptimalRPCManager } from "../OptimalRPCManager";

interface MulticallRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  params: { to: string; data: BytesLike };
}

export interface MulticallResponse {
  blockNumber: BigNumber;
  returnData: { success: boolean; returnData: string }[];
}

type EthCallParams = [
  { to: string; data?: string; from?: string; gas?: string; gasprice?: string; value?: string },
  ethers.providers.BlockTag,
];

const multicallInterface = Multicall__factory.createInterface();

interface RPCError {
  reason: string;
  code: ErrorCode;
  body: string;
  error: Error;
  requestBody: string;
  requestMethod: string;
  url: string;
}

const logger = new Logger(version);

export class JsonRPCProviderWithRetry extends ethers.providers.JsonRpcProvider {
  #network: BlockchainNetwork;

  // Must use a clone to handle using different RPC url's as the connection field within the JsonRpcProvider class is immutable.
  // Caching the clone here to reduce computation
  #clonedRPCProvider: ethers.providers.JsonRpcProvider | null = null;

  multicallContractAddress: string | null = null;

  #multicallRequests: MulticallRequest[] = [];

  #isMulticallRunning = false;

  #batchSize = MULTICALL_INITIAL_BATCH_SIZE;

  constructor(network: BlockchainNetwork) {
    const connection = OptimalRPCManager.selectOptimalRPC(network.connections);

    super(connection.url);

    this.#network = network;

    this.multicallContractAddress = getMulticallAddress(network.chainId);
  }

  get batchSize() {
    return this.#batchSize;
  }

  #reduceBatchSizeFromMulticallFailure() {
    let newBatchSize = Math.floor(this.#batchSize * MULTICALL_BATCH_REDUCTION_MULTIPLIER);

    if (newBatchSize < MULTICALL_MINIMUM_BATCH_SIZE) {
      newBatchSize = MULTICALL_MINIMUM_BATCH_SIZE;
    }

    this.#batchSize = newBatchSize;
  }

  async #runMulticall() {
    if (!this.multicallContractAddress) throw new Error("Missing multicall address");

    while (this.#multicallRequests.length > 0) {
      const multicallResponse = await withRetry(async () => {
        // Must encode the entire request into an abi encoded string
        const data = multicallInterface.encodeFunctionData("tryAggregateView", [
          false,
          slice(this.#multicallRequests, 0, this.#batchSize).map(req => req.params),
        ]);

        try {
          const rawAggregateResponse = await this.#sendWithOptimalRPC("eth_call", [{ to: this.multicallContractAddress, data }, "latest"]);

          const { returnData: aggregateResponses }: MulticallResponse = multicallInterface.decodeFunctionResult(
            "tryAggregateView",
            rawAggregateResponse,
            // Casting to any here as the response type will be of type MulticallResponse but typescript expects the response to be of ethers.utils.Result
          ) as any;

          for (const [idx, response] of aggregateResponses.entries()) {
            if (!response.success) {
              const multicallRequest = this.#multicallRequests[idx];

              const revertMessage = getRevertMessageFromRevertData(response.returnData);

              // Create an ethers native error using the revert calldata
              multicallRequest.reject(
                logger.makeError(revertMessage, ErrorCode.CALL_EXCEPTION, {
                  args: multicallRequest.params,
                  // Specify the destination address as the multicall request to address
                  address: multicallRequest.params.to,
                  reason: revertMessage,
                  errorSignature: response.returnData.slice(0, 10),
                }),
              );
            } else {
              this.#multicallRequests[idx].resolve(response.returnData);
            }
          }

          this.#multicallRequests = slice(this.#multicallRequests, this.#batchSize);
        } catch (error) {
          const rpcError = error as RPCError;

          // These special conditions; Timeout and Gas exceeds allowance will happen when the given request is too large for the RPC. So reduce the batch size
          if (rpcError.code === ErrorCode.TIMEOUT) {
            this.#reduceBatchSizeFromMulticallFailure();
          } else if (rpcError.code === ErrorCode.SERVER_ERROR) {
            const rpcErrorBody = rpcError.body.toLowerCase();
            if (
              rpcErrorBody.includes("gas required exceeds allowance") ||
              rpcErrorBody.includes("request too large") ||
              rpcErrorBody.includes("out of gas")
            ) {
              this.#reduceBatchSizeFromMulticallFailure();
            }
          }

          throw rpcError;
        }
      }, MULTICALL_NUM_RETRIES);

      if (multicallResponse.failed) {
        // Using the last error from the aggregate errors
        const lastError = multicallResponse.errors[multicallResponse.errors.length - 1] as any as Partial<RPCError>;

        // Creating ethers native error
        const error = logger.makeError(lastError?.body ?? "Unknown Multicall Error", lastError.code, {
          body: lastError.body,
          url: lastError.url,
          reason: lastError.reason,
          error: lastError.error,
          requestMethod: lastError.requestMethod,
        });

        for (const idx of range(this.#batchSize)) {
          this.#multicallRequests[idx]?.reject(error);
        }

        this.#multicallRequests = slice(this.#multicallRequests, this.#batchSize);
      }
    }

    this.#isMulticallRunning = false;
  }

  /**
   * This method creates a promise object to return to the user, this promise object's reject and resolve functions
   * are then stored alongside the users multicall request. Then when the user's request is resolved we can use
   * these methods directly to either reject or resolve the promise
   */
  async #createAndAppendMulticallRequest(params: EthCallParams) {
    let resolveFunction!: (value: unknown) => void;
    let rejectFunction!: (value: unknown) => void;

    const promise = new Promise((resolve, reject) => {
      resolveFunction = resolve;
      rejectFunction = reject;
    });

    this.#multicallRequests.push({
      resolve: resolveFunction,
      reject: rejectFunction,
      params: { to: params[0].to, data: params[0].data ?? ethers.constants.Zero.toHexString() },
    });

    return promise;
  }

  async #sendWithOptimalRPC(method: string, params: Array<any>) {
    const optimalConnection = OptimalRPCManager.selectOptimalRPC(this.#network.connections);

    // Only update the cached clone when required
    if (!this.#clonedRPCProvider || optimalConnection.url !== this.#clonedRPCProvider.connection.url) {
      this.#clonedRPCProvider = new ethers.providers.JsonRpcProvider(optimalConnection.url);
    }

    try {
      return await this.#clonedRPCProvider.send(method, params);
    } catch (error) {
      OptimalRPCManager.registerConnectionFailure(optimalConnection);

      throw error;
    }
  }

  #validateMulticallFields(method: string, params: EthCallParams) {
    // Multicall accepts only eth_call rpc method
    if (method !== "eth_call") return false;

    const { from, to, data } = params[0];

    const hasMandatoryFields = !!(from && to && data);

    // If the request is calling the multicall contract, don't add it as a multicall request as it will infinite loop
    return hasMandatoryFields && this.multicallContractAddress !== to;
  }

  async send(method: string, params: Array<any>, useMulticall = true): Promise<any> {
    // Intercepting this request to return the chainId from the network object, otherwise the ethers provider spams the RPC with this request.
    if (method === "eth_chainId") {
      return ethers.utils.hexlify(this.#network.chainId);
    }

    const ethCallParams = params as EthCallParams;

    const isMulticallValid = this.#validateMulticallFields(method, ethCallParams);

    if (this.multicallContractAddress && isMulticallValid && useMulticall) {
      const request = this.#createAndAppendMulticallRequest(ethCallParams);

      if (!this.#isMulticallRunning) {
        this.#isMulticallRunning = true;

        // Create a small fuzzing timeout of 100ms, to allow for the event-loop of calls to fit within the same multi-call
        setTimeout(() => this.#runMulticall(), 100);
      }

      return request;
    }

    const response = await withRetry(async () => this.#sendWithOptimalRPC(method, params));

    if (response.failed) {
      if (response.errors.every(error => error.name === response.errors[0].name)) {
        throw response.errors[0];
      }

      throw new AggregateError(response.errors);
    }

    return response.result;
  }
}
