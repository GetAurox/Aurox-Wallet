import { ContractCallContext, ContractCallResults, Multicall } from "ethereum-multicall";
import chunk from "lodash/chunk";

import {
  BlockchainNetwork,
  ImportedAsset,
  MultichainAccountBalanceInfo,
  MultichainNetworkBalances,
  NFTAssetDefinition,
} from "common/types";
import { getAssetDefinitionFromIdentifier, getAssetIdentifierFromDefinition } from "common/utils";
import { multicallContractAddressForBalanceChecking, NFTProviderManager, SupportedNFTProviders } from "common/wallet";

import { ERC721__factory } from "common/wallet/typechain/factories/ERC721__factory";

const BALANCE_OF_ETH_CALL_REQUEST_BATCH_SIZE = 10;

const BALANCE_OF_ETH_CALL_REQUEST_BATCH_REST_TIME_MS = 1000;

export function createEVMChainERC721BalanceOfResolver(network: BlockchainNetwork, accountAddress: string, assets: ImportedAsset[]) {
  const tokens = assets
    .filter(
      asset =>
        asset.type === "nft" &&
        asset.contractType === "ERC721" &&
        asset.metadata.accountAddress.toLowerCase() === accountAddress.toLowerCase(),
    )
    .map(asset => getAssetDefinitionFromIdentifier(asset.assetIdentifier)) as NFTAssetDefinition[];

  return async function resolveViaEVMChainERC721BalanceOf(signal?: AbortSignal): Promise<MultichainNetworkBalances> {
    const provider = NFTProviderManager.getProvider(network, "ERC721");

    const result: MultichainNetworkBalances = {
      networkIdentifier: network.identifier,
      hasUSDBalanceValues: false,
      totalPortfolioValueUSD: null,
      balances: {},
    };

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
  provider: SupportedNFTProviders,
  tokens: NFTAssetDefinition[],
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
      inputs.push({
        reference: getAssetIdentifierFromDefinition(token),
        contractAddress: token.contractAddress,
        abi: ERC721__factory.abi,
        calls: [{ reference: "ownerOfCall", methodName: "ownerOf", methodParameters: [token.tokenId] }],
      });
    }

    const outputs: ContractCallResults = await multicall.call(inputs);

    for (const [assetIdentifier, value] of Object.entries(outputs.results)) {
      const [ownerOfContext] = value.callsReturnContext;

      const ownerOf = ownerOfContext.returnValues[0];

      const balance = ownerOf && ownerOf.toLowerCase() === accountAddress.toLowerCase() ? "1" : "0";

      result[assetIdentifier] = { assetIdentifier, balance, balanceUSDValue: null };
    }

    return result;
  }

  const getTokenBalanceTasks = tokens.map(async token => {
    const balance = await provider.getTokenBalance(token.contractAddress, accountAddress, token.tokenId);

    const assetIdentifier = getAssetIdentifierFromDefinition(token);

    result[assetIdentifier] = { assetIdentifier, balance, balanceUSDValue: null };
  });

  await Promise.all(getTokenBalanceTasks);

  return result;
}

async function getTokenBalancesUsingStandardEthCall(
  accountAddress: string,
  provider: SupportedNFTProviders,
  tokens: NFTAssetDefinition[],
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
      const balance = await provider.getTokenBalance(token.contractAddress, accountAddress, token.tokenId);

      const assetIdentifier = getAssetIdentifierFromDefinition(token);

      result[assetIdentifier] = { assetIdentifier, balance, balanceUSDValue: null };
    });

    await Promise.all(getTokenBalanceTasks);
  }

  return result;
}
