import cloneDeep from "lodash/cloneDeep";

import { EVMTransactionEntry, EVMTransactions } from "common/types";
import { EthereumAccountTransaction } from "ui/types";

// Merges transactions cached in storage and transactions from graphql
export function useMergeTransactions(
  leecherTxs?: (EthereumAccountTransaction & { networkIdentifier: string })[],
  cachedTxs?: EVMTransactions | null,
  targetTxHash?: string[] | null,
) {
  if (targetTxHash) {
    const targetLeecherTx = leecherTxs ? leecherTxs.find(tx => targetTxHash.includes(tx.txHash)) : null;

    if (targetLeecherTx) {
      return [targetLeecherTx];
    }

    const targetCachedTx = Object.values(cachedTxs ?? {}).find(tx => targetTxHash.includes(tx.txHash));

    if (targetCachedTx) {
      return [targetCachedTx];
    }

    return [];
  }

  const resultTx: ((EthereumAccountTransaction & { networkIdentifier: string }) | EVMTransactionEntry)[] = cloneDeep(leecherTxs) ?? [];

  for (const cachedTx of Object.values(cachedTxs ?? {})) {
    const matchingLeecherTx = leecherTxs ? leecherTxs.find(tx => tx.txHash === cachedTx.txHash) : undefined;

    if (!matchingLeecherTx) {
      resultTx.push(cachedTx);
    }
  }

  return resultTx;
}
