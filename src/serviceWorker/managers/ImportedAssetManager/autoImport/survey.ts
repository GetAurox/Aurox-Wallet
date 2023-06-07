import { AccountInfo, BlockchainNetwork, ImportedAssetNFT } from "common/types";
import { consolidateAccountsInfo } from "common/utils";
import { getNFTMetadata } from "common/wallet";

import { ImportedAssetUpdate } from "../types";

import { autoImportNFTAssetsForEVMChain, autoImportTokenAssetsForEVMChain } from "./importers";
import { AutoImportNFTAssetCandidate, AutoImportTokenAssetCandidate } from "./types";

const AUTO_UPDATE_NFT_DELAY = 5 * 1000;

export async function surveyAutoTokenImporters(accounts: AccountInfo[], networks: BlockchainNetwork[], signal: AbortSignal) {
  const networkCandidates = new Map<string, AutoImportTokenAssetCandidate[]>();

  if (accounts.length === 0 || networks.length === 0) {
    return networkCandidates;
  }

  const tasks = [];

  for (const network of networks) {
    const consolidatedAccounts = [...consolidateAccountsInfo(accounts, network.chainType)];

    if (consolidatedAccounts.length > 0) {
      if (network.chainType === "evm") {
        const addresses = consolidatedAccounts.map(account => account.address);

        const task = async () => {
          const candidates = await autoImportTokenAssetsForEVMChain(network.identifier, addresses, signal);

          if (candidates.length > 0) {
            networkCandidates.set(network.identifier, candidates);
          }
        };

        tasks.push(task());
      }
    }
  }

  if (tasks.length === 0) return networkCandidates;

  const results = await Promise.allSettled(tasks);

  if (!signal.aborted) {
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Failed to auto import, cause: ", result.reason);
      }
    }
  }

  return networkCandidates;
}

export async function surveyAutoNFTImporters(accounts: AccountInfo[], networks: BlockchainNetwork[], signal: AbortSignal) {
  const networkCandidates = new Map<string, AutoImportNFTAssetCandidate[]>();

  if (accounts.length === 0 || networks.length === 0) {
    return networkCandidates;
  }

  const tasks = [];

  for (const network of networks) {
    const consolidatedAccounts = [...consolidateAccountsInfo(accounts, network.chainType)];

    if (consolidatedAccounts.length > 0) {
      if (network.chainType === "evm") {
        const addresses = consolidatedAccounts.map(account => account.address);

        const task = async () => {
          const candidates = await autoImportNFTAssetsForEVMChain(network, addresses, signal);

          if (candidates.length > 0) {
            networkCandidates.set(network.identifier, candidates);
          }
        };

        tasks.push(task());
      }
    }
  }

  if (tasks.length === 0) return networkCandidates;

  const results = await Promise.allSettled(tasks);

  if (!signal.aborted) {
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Failed to auto import NFT, cause: ", result.reason);
      }
    }
  }

  return networkCandidates;
}

export async function surveyAutoNFTUpdates(
  NFTAssets: ImportedAssetNFT[],
  networks: BlockchainNetwork[],
  signal: AbortSignal,
  firstCall: boolean,
) {
  const updates: ImportedAssetUpdate[] = [];

  const networksMap = new Map(networks.map(network => [network.identifier, network]));

  const tasks = [];
  const i = 0;

  for (const asset of NFTAssets) {
    const task = async () => {
      const network = networksMap.get(asset.networkIdentifier);

      if (!network || signal.aborted) return;

      await new Promise(resolve => setTimeout(resolve, (firstCall ? i : i + 1) * AUTO_UPDATE_NFT_DELAY));

      if (signal.aborted) return;

      const nftMetadata = await getNFTMetadata(asset.contractAddress, asset.metadata.tokenId, network);

      const NFTName = String(nftMetadata.name).trim() ? nftMetadata.name : asset.name;

      updates.push([
        asset.key,
        "nft",
        {
          name: NFTName,
          verified: !!String(NFTName).trim(),
          metadata: {
            tokenId: asset.metadata.tokenId,
            image: nftMetadata.image ?? asset.metadata.image,
            updatedAt: Date.now(),
            accountAddress: asset.metadata.accountAddress,
          },
        },
      ]);
    };

    tasks.push(task());
  }

  if (tasks.length === 0) return updates;

  const results = await Promise.allSettled(tasks);

  if (!signal.aborted) {
    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Failed to auto update NFT, cause: ", result.reason);
      }
    }
  }

  return updates;
}
