import axios, { AxiosResponse } from "axios";
import identity from "lodash/identity";
import range from "lodash/range";

import { Wallet } from "common/operations";
import { GRAPHQL_LEECHER_X_API_KEY, evmNetworkGraphqlAPI } from "common/config";

const BATCH_SIZE = 5;
const CONSECUTIVE_FAILS_BEFORE_ABORT = 5;
const CONSECUTIVE_EMPTY_BATCHES_BEFORE_ABORT = 1;

/** Converts account address to the GraphQL identifier: 0xa4b8C1f3ad... => _0xa4b8C1f3ad... */
function toIdentifier(accountAddress: string) {
  return `_${accountAddress}`;
}

/** Converts GraphQL identifier to the account address: _0xa4b8C1f3ad... => 0xa4b8C1f3ad... */
function fromIdentifier(accountIdentifier: string) {
  return accountIdentifier.slice(1);
}

interface EthAddressTxQueryResult {
  transactions: { all: string[] };
}

type EthAddressTxQueryBatchedResponse = AxiosResponse<{
  data: { ethereum: Record<string, EthAddressTxQueryResult> };
}>;

/**
 * Returns information whether address has some tx
 *
 * @param {string[]} addresses list of account addresses to check
 *
 * @returns {Promise<boolean[]>} list of whether account has some tx
 */
async function detectEVMAddressesWithTx(addresses: string[], { signal }: { signal: AbortSignal }) {
  let query = "";

  for (const address of addresses) {
    query += `${toIdentifier(address)}: account(accountAddress:"${address}") {
      transactions {
        all {
          ...on EthereumAccountETHTransaction { txHash }
          ...on EthereumAccountTokenApproval { txHash }
          ...on EthereumAccountTokenTransfer { txHash }
          ...on EthereumAccountTokenSwap { txHash }
          ...on EthereumAccountTokenDeposit { txHash }
          ...on EthereumAccountTokenWithdrawal { txHash }
        }
      }
      balance { valueUSD }
    }`;
  }

  const recordsPerChain: { identifier: string; baseURL: string; data: Record<string, EthAddressTxQueryResult> | null }[] = Array.from(
    Object.entries(evmNetworkGraphqlAPI).map(([identifier, value]) => ({ identifier, baseURL: value.baseURL, data: null })),
  );

  // Get information about all transactions of given accounts addresses for all chains
  const responses: PromiseSettledResult<EthAddressTxQueryBatchedResponse>[] = await Promise.allSettled(
    recordsPerChain.map(recordPerChain =>
      axios({
        method: "POST",
        signal,
        baseURL: recordPerChain.baseURL,
        data: { query: `{ ethereum { ${query} } }` },
        headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY },
      }),
    ),
  );

  for (let index = 0; index < recordsPerChain.length; index += 1) {
    const response = responses[index];
    const record = recordsPerChain[index];

    if (response.status === "fulfilled") {
      recordsPerChain[index].data = response.value.data.data?.ethereum ?? null;
    } else {
      console.error(`Failed to get transactions information for addresses: "${addresses.join(", ")}" in "${record.identifier}" blockchain`);
      console.error("Reason", response.reason);
    }
  }

  const addressToResponseMap = new Map<string, number>();

  for (const recordPerChain of recordsPerChain) {
    const { data } = recordPerChain;

    if (data !== null) {
      for (const [identifier, value] of Object.entries(data)) {
        const accountAddress = fromIdentifier(identifier);

        // Count transactions from all chains
        if (addressToResponseMap.has(accountAddress)) {
          const txCount = addressToResponseMap.get(accountAddress);

          if (txCount !== undefined) {
            addressToResponseMap.set(accountAddress, txCount + value.transactions.all.length);
          }

          continue;
        }

        addressToResponseMap.set(accountAddress, value.transactions.all.length);
      }
    }
  }

  return addresses.map(address => {
    const result = addressToResponseMap.get(address);

    if (result !== undefined) {
      return result > 0;
    }

    return false;
  });
}

export async function detectMainAccountsWithTx({ signal }: { signal: AbortSignal }) {
  let nextAccountNumberToCheck = 0;

  let consecutiveEmptyBatches = 0;
  let failedAttempts = 0;

  while (true) {
    if (signal.aborted) return;

    const accountNumbers = range(nextAccountNumberToCheck, nextAccountNumberToCheck + BATCH_SIZE);

    try {
      let hasTxValues = accountNumbers.map(() => false);

      // TODO: add support for other chainTypes
      for (const chainType of ["evm"] as const) {
        const derivedAddresses = await Wallet.GetDerivedAddresses.perform(chainType, accountNumbers);

        if (signal.aborted) return;

        const hasTxValuesOnCurrentChainType = await detectEVMAddressesWithTx(derivedAddresses, { signal });

        if (signal.aborted) return;

        // This logic aggregates the accountNumbersWithTx across all chains in-place
        // the in-place logic is needed to stop the search early when all accountNumbers in the batch are included
        hasTxValues = hasTxValues.map((hasTx, index) => hasTx || hasTxValuesOnCurrentChainType[index]);

        if (hasTxValues.every(identity)) break;
      }

      if (hasTxValues.some(identity)) {
        const accountNumbersWithTx = accountNumbers.filter((_, index) => hasTxValues[index]);

        const creationData = accountNumbersWithTx.map(accountNumber => ({
          alias: `Derived Account ${accountNumber}`,
          accountNumber,
        }));

        await Wallet.CreateNewMnemonicAccounts.perform(creationData, { skipAccountSwitching: true });

        if (signal.aborted) return;
      } else {
        consecutiveEmptyBatches++;

        if (consecutiveEmptyBatches >= CONSECUTIVE_EMPTY_BATCHES_BEFORE_ABORT) {
          return;
        }
      }

      nextAccountNumberToCheck += BATCH_SIZE;
    } catch (error) {
      console.error(error);

      failedAttempts++;

      if (failedAttempts >= CONSECUTIVE_FAILS_BEFORE_ABORT) {
        return;
      }
    }
  }
}
