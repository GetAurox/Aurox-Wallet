import { AccountInfo, BlockchainNetwork } from "common/types";
import { consolidateAccountsInfo } from "common/utils";

import { autoImportTokenAssetsForEVMChain } from "./importers";
import { AutoImportTokenAssetCandidate } from "./types";

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
