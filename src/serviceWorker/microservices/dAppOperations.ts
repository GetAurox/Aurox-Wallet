import { createHash } from "crypto";

import { getAddress } from "@ethersproject/address";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";

import pick from "lodash/pick";

import { v4 as uuidV4 } from "uuid";

import { DApp as DAppOps } from "common/operations";
import { PublicDAppOperationsState } from "common/states";
import { EVMProvider, ProviderManager } from "common/wallet";

import {
  DAppConnectionManager,
  DAppOperationsManager,
  DAppRateLimiterManager,
  NetworkManager,
  WalletManager,
  WindowManager,
} from "serviceWorker/managers";

import { ErrorCodes, ProviderRpcError } from "common/errors";
import { formatChainId, mapDAppNetworkRequestToBlockchainNetwork, tryParsePersonalMessage } from "common/utils";

import { DAppPermissions, Operation, RawTransaction, SignTypedDataPayload } from "common/types";
import { ethereumMainnetNetworkIdentifier, ETHEREUM_MAINNET_CHAIN_ID } from "common/config";
import { NetworkRequest } from "common/types/dapp/networkRequest";
import { CACHED_RPC_METHODS, SAFE_RPC_METHODS } from "common/rpc";
import { LRUCache } from "common/caching";

export async function setupDAppOperationsService(network: NetworkManager, wallet: WalletManager, connectionManager: DAppConnectionManager) {
  const windowManager = new WindowManager();

  const provider = PublicDAppOperationsState.buildProvider({ operations: [] });

  const manager = new DAppOperationsManager(windowManager, provider);

  const cache = new LRUCache(100);

  const rateLimiter = new DAppRateLimiterManager();

  DAppOps.RemovePopup.registerResponder(async () => {
    await manager.removePopup();
  });

  DAppOps.SimulateTransaction.registerResponder(async data => {
    await provider.update(draft => {
      const operation = draft.operations.find(op => op.id === data.operationId);

      if (operation?.operationType === "transact") {
        const operationIndex = draft.operations.indexOf(operation);

        operation.isSimulated = data.simulated;

        draft.operations[operationIndex] = operation;
      }
    });
  });

  const dappOperationHandler = async (data: DAppOps.InternalRPCRequest.InterceptedRequest) => {
    const { tabId, documentTitle, domain } = data;

    const connection = await connectionManager.getTabConnection(domain, tabId);

    // Some DApp's provide these params incorrectly and nest the required parameters within the data.method field
    if (typeof data.method === "object") {
      data.method = (data.method as any).method;
      data.params = (data.method as any).params ?? [];
    }

    if (data.method === "aurox_notifyOtherProvidersExist") {
      connectionManager.setConnectionPolicy(domain, tabId, true, true);

      return null;
    }

    if (data.method === "aurox_initialize") {
      connectionManager.emit("initialized", domain, tabId);

      return null;
    }

    if (data.method === "eth_requestAccounts" || data.method === "wallet_requestPermissions") {
      rateLimiter.clearLimiter();

      if (!connection && !connectionManager.isConnectionLocked(domain, tabId)) {
        connectionManager.disableConnection(domain, tabId);

        const { isDefaultProvider, considerOtherProvider } = connectionManager.getConnectionPolicy(domain, tabId);

        const operation: Operation = {
          id: uuidV4(),
          tabId,
          domain,
          documentTitle: documentTitle,
          operationType: "connect",
          considerOtherProvider,
          isDefaultProvider,
        };

        const preferredNetworkIdentifier = await connectionManager.getPreferredTabNetwork(domain, tabId);

        if (preferredNetworkIdentifier) {
          operation.preferredNetworkIdentifier = preferredNetworkIdentifier;
        }

        const { accountUUID, networkIdentifier } = await manager.scheduleOperation<DAppPermissions>(operation).finally(() => {
          connectionManager.enableConnection(domain, tabId);
        });

        const updatedConnection = connectionManager.getConnectionPolicy(domain, tabId);

        if (!updatedConnection.isDefaultProvider) {
          throw new ProviderRpcError(ErrorCodes.PROVIDER_CHANGE_REQUESTED);
        }

        await connectionManager.connectTab({ accountUUID, networkIdentifier, tabId, domain });

        const accountAddress = wallet.getAddress(accountUUID, "evm");

        return [accountAddress];
      }

      if (!wallet.isUnlocked) {
        return [];
      }

      const address = wallet.getAddress(connection.accountUUID, "evm");

      return address ? [address] : [];
    }

    if (data.method === "eth_chainId" || data.method === "net_version") {
      const preferredIdentifier = await connectionManager.getPreferredTabNetwork(domain, tabId);

      const shouldHexlify = data.method === "eth_chainId";

      if (preferredIdentifier) {
        const targetNetwork = network.getNetworkByIdentifier(preferredIdentifier);

        if (!targetNetwork) {
          throw new ProviderRpcError(ErrorCodes.CHAIN_UNSUPPORTED);
        }

        return formatChainId(targetNetwork.chainId, shouldHexlify);
      }

      return formatChainId(ETHEREUM_MAINNET_CHAIN_ID, shouldHexlify);
    }

    if (data.method === "eth_accounts") {
      if (!connection) return [];

      const accountAddress = wallet.getAddress(connection.accountUUID, "evm");

      return accountAddress ? [accountAddress] : [];
    }

    // A support for a very debatable EIP-2255 which is required by some dapps
    if (["wallet_getPermissions"].includes(data.method)) {
      return [{ parentCapability: "eth_accounts" }];
    }

    if (data.method === "wallet_addEthereumChain" && data.params) {
      const networkRequest = data.params[0] as NetworkRequest;

      if (!parseInt(networkRequest.chainId, 16)) {
        return null;
      }

      const blockchainNetwork = mapDAppNetworkRequestToBlockchainNetwork(networkRequest);

      const targetNetwork = network.getAllNetworks().find(network => network.identifier === blockchainNetwork.identifier);

      if (!targetNetwork) {
        const operation: Operation = {
          id: uuidV4(),
          operationType: "add_network",
          network: blockchainNetwork,
          tabId,
          domain,
          documentTitle,
        };

        await manager.scheduleOperation(operation);

        await network.addNetwork(blockchainNetwork);
      }

      if (!connection) {
        connectionManager.registerPreferredTabNetwork(domain, tabId, blockchainNetwork.identifier);

        return null;
      }

      data.method = "wallet_switchEthereumChain";
    }

    if (data.method === "wallet_switchEthereumChain" && data.params) {
      const { chainId } = data.params[0] as any;

      const targetNetwork = network.getAllNetworks().find(network => network.chainId === Number(chainId));

      if (!targetNetwork) {
        throw new ProviderRpcError(ErrorCodes.CHAIN_UNSUPPORTED);
      }

      if (!connection) {
        const accounts = await dappOperationHandler({ ...data, method: "eth_requestAccounts" });

        if (!accounts) {
          throw new ProviderRpcError(ErrorCodes.REJECTED);
        }

        const newConnection = await connectionManager.getTabConnection(domain, tabId);

        if (newConnection.networkIdentifier === targetNetwork.identifier) {
          return null;
        }
      }

      if (targetNetwork.disabled) {
        const operation: Operation = {
          id: uuidV4(),
          operationType: "enable_network",
          network: targetNetwork,
          tabId,
          domain,
          documentTitle,
        };

        await manager.scheduleOperation(operation);

        await network.modifyNetwork(targetNetwork.identifier, { disabled: false });
      }

      await connectionManager.changeTabNetwork(domain, tabId, targetNetwork.identifier);

      return null;
    }

    if (!connection && !SAFE_RPC_METHODS.includes(data.method)) {
      throw new ProviderRpcError(ErrorCodes.UNAUTHORIZED);
    }

    /**
     * Signing operations
     */
    if (data.method === "eth_sendTransaction" && data.params) {
      const operation: Operation = {
        id: uuidV4(),
        accountUUID: connection.accountUUID,
        operationType: "transact",
        networkIdentifier: connection.networkIdentifier,
        transactionPayload: data.params[0] as RawTransaction,
        tabId,
        domain,
        documentTitle,
      };

      return await manager.scheduleOperation<string>(operation);
    }

    if (data.method === "eth_sign") {
      const [, message] = data.params as string[];

      const operation: Operation = {
        id: uuidV4(),
        tabId,
        accountUUID: connection.accountUUID,
        networkIdentifier: connection.networkIdentifier,
        domain,
        documentTitle,
        operationType: "eth_sign",
        message,
      };

      return await manager.scheduleOperation<string>(operation);
    }

    if (data.method === "personal_sign") {
      const params = data.params as string[];

      const address = wallet.getAddress(connection.accountUUID, "evm");

      const message = String(params.find(param => String(param).trim().toLowerCase() !== address?.trim().toLowerCase()));

      const parsedMessage = tryParsePersonalMessage(message);

      const operation: Operation = {
        id: uuidV4(),
        tabId,
        accountUUID: connection.accountUUID,
        networkIdentifier: connection.networkIdentifier,
        domain,
        documentTitle,
        operationType: "personal_sign",
        message: parsedMessage,
      };

      return await manager.scheduleOperation<string>(operation);
    }

    if (data.method === "eth_signTypedData" || data.method === "eth_signTypedData_v3" || data.method === "eth_signTypedData_v4") {
      const [, rawTypedData] = data.params as string[];

      const typedData = JSON.parse(rawTypedData) as SignTypedDataPayload;

      const operation: Operation = {
        id: uuidV4(),
        tabId,
        accountUUID: connection.accountUUID,
        networkIdentifier: connection.networkIdentifier,
        domain,
        documentTitle,
        operationType: "signTypedData",
        typedData,
      };

      return await manager.scheduleOperation<string>(operation);
    }

    if (data.method === "personal_ecRecover" && data.params) {
      const [signedData, signature] = data.params as string[];

      const address = recoverPersonalSignature({ signature, data: signedData });

      // Convert to checksumed address
      return getAddress(address);
    }

    if (data.method.startsWith("eth_") || data.method.startsWith("net_") || data.method.startsWith("web3_")) {
      rateLimiter.track(domain);

      const networkIdentifier = connection?.networkIdentifier ?? ethereumMainnetNetworkIdentifier;

      const targetNetwork = network.getNetworkByIdentifier(networkIdentifier);

      if (!targetNetwork) {
        console.error("Can not find network with id", networkIdentifier);

        throw new ProviderRpcError(ErrorCodes.CHAIN_DISCONNECTED);
      }

      const cacheKey = createHash("sha256")
        .update(targetNetwork.chainId + JSON.stringify(data))
        .digest("hex");

      const cachedValue = cache.get(cacheKey);

      if (cachedValue && CACHED_RPC_METHODS.includes(data.method)) {
        return cachedValue;
      }

      if (rateLimiter.isLimited(domain)) {
        throw new ProviderRpcError(ErrorCodes.REQUEST_LIMIT_EXCEEDED);
      }

      const { provider } = ProviderManager.getProvider(targetNetwork) as EVMProvider;

      try {
        if (data.method === "eth_estimateGas" && data.params?.[0]) {
          data.params[0] = pick(data.params[0], ["from", "to", "value", "data"]);
        }

        const result = await provider.send(data.method, data.params ?? [], false);

        if (CACHED_RPC_METHODS.includes(data.method)) {
          cache.set(cacheKey, result);
        }

        return result;
      } catch (error) {
        console.error("RPC call failed", error);
      }
    } else {
      console.error("Method not found for: ", data);
    }

    throw new ProviderRpcError(ErrorCodes.UNSUPPORTED_METHOD);
  };

  DAppOps.InternalRPCRequest.registerResponder(dappOperationHandler);

  return { provider, manager };
}
