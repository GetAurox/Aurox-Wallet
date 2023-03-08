import { Multicall, ContractCallResults, ContractCallContext } from "ethereum-multicall";
import { ethers } from "ethers";

import chunk from "lodash/chunk";

import { BlockchainNetwork, ContractAssetDefinition, MultichainAccountBalanceInfo, MultichainNetworkBalances } from "common/types";
import { getAssetDefinitionFromIdentifier, getAssetIdentifierFromDefinition } from "common/utils";
import { ProviderManager, SupportedProviders, balanceCheckingContractABI, multicallContractAddressForBalanceChecking } from "common/wallet";
import { ETH_ADDRESS } from "common/config";

const BALANCE_OF_ETH_CALL_REQUEST_BATCH_SIZE = 10;

const BALANCE_OF_ETH_CALL_REQUEST_BATCH_REST_TIME_MS = 1000;

export function createEVMChainERC20BalanceOfResolver(network: BlockchainNetwork, accountAddress: string, assetIdentifiers: string[]) {
  const assets = assetIdentifiers.map(getAssetDefinitionFromIdentifier);

  const includeNative = assets.some(asset => asset.type === "native");

  const tokens = assets.filter(asset => asset.type === "contract" && asset.contractType === "ERC20") as ContractAssetDefinition[];

  return async function resolveViaEVMChainERC20BalanceOf(signal?: AbortSignal): Promise<MultichainNetworkBalances> {
    const provider = ProviderManager.getProvider(network);

    const result: MultichainNetworkBalances = {
      networkIdentifier: network.identifier,
      hasUSDBalanceValues: false,
      totalPortfolioValueUSD: null,
      balances: {},
    };

    if (includeNative) {
      const balance = await provider.getTokenBalance(ETH_ADDRESS, accountAddress);

      const assetIdentifier = getAssetIdentifierFromDefinition({ type: "native" });

      result.balances[assetIdentifier] = { assetIdentifier, balance, balanceUSDValue: null };
    }

    if (signal?.aborted) return result;

    if (tokens.length > 0) {
      const tokenBalances = provider.getHasMulticallSupport()
        ? await getTokenBalancesUsingMulticall(network, accountAddress, provider, tokens)
        : await getTokenBalancesUsingStandardEthCall(accountAddress, provider, tokens, signal);

      Object.assign(result.balances, tokenBalances);
    }

    return result;
  };
}

async function getTokenBalancesUsingMulticall(
  network: BlockchainNetwork,
  accountAddress: string,
  provider: SupportedProviders,
  tokens: ContractAssetDefinition[],
) {
  const result: Record<string, MultichainAccountBalanceInfo> = {};

  if (provider.chainType === "evm" && multicallContractAddressForBalanceChecking[network.chainId]) {
    const multicall = new Multicall({
      ethersProvider: provider.provider,
      tryAggregate: true,
      multicallCustomContractAddress: multicallContractAddressForBalanceChecking[network.chainId],
    });

    const inputs: ContractCallContext[] = [];

    for (const token of tokens) {
      if (token.contractType === "ERC20") {
        inputs.push({
          reference: getAssetIdentifierFromDefinition(token),
          contractAddress: token.contractAddress,
          abi: balanceCheckingContractABI,
          calls: [
            { reference: "decimalsCall", methodName: "decimals", methodParameters: [] },
            { reference: "balanceOfCall", methodName: "balanceOf", methodParameters: [accountAddress] },
          ],
          context: { token },
        });
      }
    }

    const outputs: ContractCallResults = await multicall.call(inputs);

    for (const [assetIdentifier, value] of Object.entries(outputs.results)) {
      const [decimalsContext, balanceOfContext] = value.callsReturnContext;

      const decimals = decimalsContext.returnValues[0];
      const balanceOf = balanceOfContext.returnValues[0];

      const balance = ethers.utils.formatUnits(balanceOf, decimals);

      result[assetIdentifier] = { assetIdentifier, balance, balanceUSDValue: null };
    }

    return result;
  }

  const getTokenBalanceTasks = tokens.map(async token => {
    if (token.contractType === "ERC20") {
      const balance = await provider.getTokenBalance(token.contractAddress, accountAddress);

      const assetIdentifier = getAssetIdentifierFromDefinition(token);

      result[assetIdentifier] = { assetIdentifier, balance, balanceUSDValue: null };
    }
  });

  await Promise.all(getTokenBalanceTasks);

  return result;
}

async function getTokenBalancesUsingStandardEthCall(
  accountAddress: string,
  provider: SupportedProviders,
  tokens: ContractAssetDefinition[],
  signal?: AbortSignal,
) {
  const result: Record<string, MultichainAccountBalanceInfo> = {};

  let firstCall = true;

  for (const batch of chunk(tokens, BALANCE_OF_ETH_CALL_REQUEST_BATCH_SIZE)) {
    if (!firstCall) {
      if (signal?.aborted) return result;

      await new Promise(resolve => setTimeout(resolve, BALANCE_OF_ETH_CALL_REQUEST_BATCH_REST_TIME_MS));

      if (signal?.aborted) return result;
    }

    firstCall = false;

    const getTokenBalanceTasks = batch.map(async token => {
      if (token.contractType === "ERC20") {
        const balance = await provider.getTokenBalance(token.contractAddress, accountAddress);

        const assetIdentifier = getAssetIdentifierFromDefinition(token);

        result[assetIdentifier] = { assetIdentifier, balance, balanceUSDValue: null };
      }
    });

    await Promise.all(getTokenBalanceTasks);
  }

  return result;
}
