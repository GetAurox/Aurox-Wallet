import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import produce from "immer";

import { evmNetworkGraphqlAPI, GRAPHQL_LEECHER_X_API_KEY, TRANSACTIONS_REFRESH_INTERVAL } from "common/config";
import {
  AccountTransactionsAPIArguments,
  AccountTransactionsTokenDefinitions,
  EthereumAccountNFTTransfer,
  EthereumAccountTransaction,
  GraphQLEthereumAccountAllTransactionsResponse,
} from "ui/types";
import { assetsDefinitionsToAPIArguments, stringifyAPIArguments } from "ui/common/utils";
import { AccountInfo } from "common/types";
import { getAccountAddressForChainType } from "common/utils";

import { useEVMTransactionsOfAccount } from "../states/evmTransactions";

import { useMergeTransactions } from "./useMergeTransactions";

const ethTransaction = `
  {
    __typename
    accountAddress
    failed
    timestamp
    nonce
    contractAddress
    txFrom: from
    txTo: to
    side
    fee
    feeUSD(maxDecimals: 2)
    gasLimit
    gasUsed
    gasPrice(maxDecimals: 18)
    gasPriceUSD(maxDecimals: 2)
    value
    valueUSD(maxDecimals: 2)
    balance
    balanceUSD(maxDecimals: 2)
    methodID
    method {
      signature
      shortName
    }
    blockNumber
    txIndex
    txHash
  }
`;

const transactionsRequest = `
{
  __typename
  ... on EthereumAccountETHTransaction ${ethTransaction}
  ... on EthereumAccountTokenTransfer {
    transaction ${ethTransaction}
    token {
      symbol
      name
      address
    }
    tokenContractType
    from
    to
    value
    side
    valueUSD(maxDecimals: 2)
    balance
    balanceUSD(maxDecimals: 2)
    logIndex
    accountAddress
    timestamp
    blockNumber
    txIndex
    txHash
  }
  ... on EthereumAccountTokenApproval {
    transaction ${ethTransaction}
    token {
      symbol
      name,
      address
    }
    owner
    spender
    value
    valueUSD(maxDecimals: 2)
    logIndex
    accountAddress
    timestamp
    blockNumber
    txIndex
    txHash
  }
  ... on EthereumAccountTokenSwap {
    transaction ${ethTransaction}
    soldToken {
      token {
        symbol
        name
        address
      }
      value
      valueUSD(maxDecimals: 2)
      balance
      balanceUSD(maxDecimals: 2)
    }
    receivedToken {
      token {
        symbol
        name
        address
      }
      value
      valueUSD(maxDecimals: 2)
      balance
      balanceUSD(maxDecimals: 2)
    }
    logIndex
    accountAddress
    timestamp
    blockNumber
    txIndex
    txHash
  }
  ... on EthereumAccountTokenDeposit {
    transaction ${ethTransaction}
    logIndex
    token {
      symbol
      name
      address
    }
    value
    valueUSD(maxDecimals: 2)
    tokenAddress
    ETHBalance(maxDecimals: 8)
    ETHBalanceUSD(maxDecimals: 2)
    tokenBalance(maxDecimals: 8)
    tokenBalanceUSD(maxDecimals: 2)
    accountAddress
    timestamp
    blockNumber
    txIndex
    txHash
  }
  ... on EthereumAccountTokenWithdrawal {
    transaction ${ethTransaction}
    token {
      symbol
      name
      address
    }
    value
    valueUSD(maxDecimals: 2)
    tokenAddress
    ETHBalance(maxDecimals: 8)
    ETHBalanceUSD(maxDecimals: 2)
    tokenBalance(maxDecimals: 8)
    tokenBalanceUSD(maxDecimals: 2)
    accountAddress
    timestamp
    blockNumber
    txIndex
    txHash
  }
}`;

const nftTransfersRequest = `{
      __typename
      transaction {
        failed
        side,
        nonce
        feeUSD
        type
        fee
        value
        valueUSD
        method {
          name
          shortName
        }
        outputToken {
          token {
            symbol
          }
        }
        inputToken {
          token {
            symbol
          }
        }
      }
      token {
          symbol
          name
          metadata {
            fullName
          }
      }
      to
      from
      side
      txHash
      timestamp
}`;

export function useAccountTransactions({
  accountInfo,
  apiArguments,
  tokenDefinitions,
  refetchInterval = TRANSACTIONS_REFRESH_INTERVAL,
}: {
  accountInfo?: AccountInfo | null;
  apiArguments?: { all?: AccountTransactionsAPIArguments; nftTransfers?: AccountTransactionsAPIArguments } | null;
  tokenDefinitions?: AccountTransactionsTokenDefinitions | null;
  refetchInterval?: number | "never";
}) {
  const accountAddress = accountInfo && getAccountAddressForChainType(accountInfo, "evm");

  const [allTransactions, setAllTransactions] = useState<(EthereumAccountTransaction & { networkIdentifier: string })[]>([]);
  const [nftTransfers, setNftTransfers] = useState<(EthereumAccountNFTTransfer & { networkIdentifier: string })[]>([]);

  const apiAllArgumentsString = JSON.stringify(apiArguments?.all);
  const apiNFTTransfersArgumentsString = JSON.stringify(apiArguments?.nftTransfers);
  const tokenDefinitionsString = JSON.stringify(tokenDefinitions);

  useEffect(() => {
    let intervalId: number;
    let mounted = true;

    const process = async () => {
      let apiAllArgs: AccountTransactionsAPIArguments | null = null;
      let apiNFTTransferArgs: AccountTransactionsAPIArguments | null = null;
      let tokenDefs: AccountTransactionsTokenDefinitions | null = null;

      try {
        apiAllArgs = apiAllArgumentsString ? JSON.parse(apiAllArgumentsString) : null;
        apiNFTTransferArgs = apiNFTTransfersArgumentsString ? JSON.parse(apiNFTTransfersArgumentsString) : null;
      } catch {
        // ignore;
      }

      try {
        tokenDefs = JSON.parse(tokenDefinitionsString);
      } catch {
        // ignore;
      }

      setAllTransactions([]);
      setNftTransfers([]);

      for (const [evmNetworkIdentifier, value] of Object.entries(evmNetworkGraphqlAPI)) {
        let paramsAll: AccountTransactionsAPIArguments | undefined;
        let paramsNFTTransfers: AccountTransactionsAPIArguments | undefined;

        if (tokenDefs) {
          if (tokenDefs[evmNetworkIdentifier]) {
            paramsAll = { ...paramsAll, ...assetsDefinitionsToAPIArguments(tokenDefs[evmNetworkIdentifier]) };
          } else {
            continue;
          }
        }

        if (apiAllArgs) {
          paramsAll = { ...paramsAll, ...apiAllArgs };
        }

        if (apiNFTTransferArgs) {
          paramsNFTTransfers = { ...paramsNFTTransfers, ...apiNFTTransferArgs };
        }

        const paramsAllStringified = paramsAll && stringifyAPIArguments(paramsAll);
        const paramsNFTTransfersStringified = paramsNFTTransfers && stringifyAPIArguments(paramsNFTTransfers);
        const allStr = paramsAllStringified ? `all(${paramsAllStringified})` : "all";
        const nftTransfersStr = paramsNFTTransfersStringified ? `nftTransfers(${paramsNFTTransfersStringified})` : "nftTransfers";

        const query = `account(accountAddress: "${accountAddress}") {
          transactions {
            ${allStr} ${transactionsRequest}
            ${nftTransfersStr} ${nftTransfersRequest}
          }
        }`;

        axios
          .post<GraphQLEthereumAccountAllTransactionsResponse>(
            value.baseURL,
            { query: `{ ethereum { ${query} } }` },
            {
              timeout: 1e4,
              headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY },
            },
          )
          .then(result => {
            const txs = (result?.data?.data?.ethereum?.account?.transactions?.all || []).map(t => ({
              ...t,
              networkIdentifier: evmNetworkIdentifier,
            }));

            const nftTxs = (result?.data?.data?.ethereum?.account?.transactions?.nftTransfers || []).map(t => ({
              ...t,
              networkIdentifier: evmNetworkIdentifier,
            }));

            if (mounted && txs.length > 0) {
              setAllTransactions(
                produce(draft => {
                  draft.push(...txs);
                }),
              );
            }
            if (mounted && nftTxs.length > 0) {
              setNftTransfers(
                produce(draft => {
                  draft.push(...nftTxs);
                }),
              );
            }
          })
          .catch(error => {
            console.error(
              `Failed to get transactions information for address: "${accountAddress}" in "${evmNetworkIdentifier}" blockchain`,
              error,
            );
          });
      }
    };

    if (accountAddress) {
      process();

      if (refetchInterval !== "never") {
        intervalId = window.setInterval(process, refetchInterval);
      }
    }

    return () => {
      mounted = false;

      window.clearInterval(intervalId);
    };
  }, [accountAddress, apiAllArgumentsString, tokenDefinitionsString, refetchInterval, apiNFTTransfersArgumentsString]);

  const tokenTransactionsOfAccount = useMemo(() => {
    return allTransactions?.filter(tx => accountAddress && tx.accountAddress.toLowerCase() === accountAddress.toLowerCase());
  }, [accountAddress, allTransactions]);

  const combinedTokenTransactions = useMergeTransactions(
    tokenTransactionsOfAccount,
    useEVMTransactionsOfAccount(accountInfo?.uuid),
    apiArguments?.all?.txHash ? apiArguments.all.txHash : null,
  );

  const combinedNFTTransfers = useMergeTransactions(
    nftTransfers,
    useEVMTransactionsOfAccount(accountInfo?.uuid),
    apiArguments?.nftTransfers?.txHash ? apiArguments.nftTransfers.txHash : null,
  );

  return {
    transactions: combinedTokenTransactions,
    nftTransfers: combinedNFTTransfers,
  };
}
