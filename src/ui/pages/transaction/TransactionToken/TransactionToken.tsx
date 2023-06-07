import { useMemo } from "react";

import { Divider, Stack } from "@mui/material";

import { TokenTransactionDetails } from "common/types";

import { useHistoryGoBackOrReset, useHistoryPathParams } from "ui/common/history";
import { mapTokenTransactionToTokenTransactionDetails } from "ui/common/transactions";
import { useAccountTransactions, useActiveAccount, useAddressIsContract } from "ui/hooks";

import Header from "ui/components/layout/misc/Header";

import { nftTransactionMocks } from "ui/pages/home/Home/mocks";

import TransactionTokenSectionStatus from "./TransactionTokenSectionStatus";
import TransactionTokenSectionFromTo from "./TransactionTokenSectionFromTo";
import TransactionTokenSectionPrice from "./TransactionTokenSectionPrice";
import TransactionTokenSectionAdvanced from "./TransactionTokenSectionAdvanced";

export default function TransactionToken() {
  const { txHash } = useHistoryPathParams<"txHash">();

  const goBackOrReset = useHistoryGoBackOrReset();

  const activeAccount = useActiveAccount();

  const apiArgs = txHash ? { all: { txHash: [txHash] } } : undefined;

  const { transactions } = useAccountTransactions({
    accountInfo: activeAccount,
    ...(apiArgs && { apiArguments: apiArgs }),
  });

  const transactionData = useMemo<TokenTransactionDetails | null>(() => {
    const transaction = transactions?.[0];

    if (!activeAccount || !transaction) return null;

    return mapTokenTransactionToTokenTransactionDetails(transaction);
  }, [activeAccount, transactions]);

  const { addressIsContract: receiverIsContract } = useAddressIsContract(
    transactionData?.secondSideAddress ?? null,
    transactionData?.networkIdentifier ?? null,
  );

  const handleBackButtonClick = () => {
    // When a swap or send is dispatched, the user is redirected to this page, however, we cannot go back to the swap page
    // we must go back to home page in this particular case
    goBackOrReset("/");
  };

  //@TODO to update when transaction's NFT will be finished
  const isNFTTransaction = nftTransactionMocks.find(item => item.txHash === transactionData?.txHash);
  let title = transactionData?.title ?? "Loading";

  if (isNFTTransaction) {
    title = "NFT Transfer";
  } else if (transactionData?.isCached) {
    title = receiverIsContract ? "Contract Interaction" : "Send Token";
  }

  return (
    <>
      <Header title={title} onBackClick={handleBackButtonClick} />
      {transactionData && (
        <Stack direction="column" spacing={1.5} padding={`${isNFTTransaction ? 0 : 21}px 16px 0 16px`}>
          {isNFTTransaction && (
            <>
              {/** <NFTHeader nft={nftMocks[0]} /> */}
              <Divider />
            </>
          )}
          {activeAccount?.uuid && (
            <TransactionTokenSectionStatus
              status={transactionData.status}
              date={transactionData.date}
              accountUUID={activeAccount?.uuid}
              transactionHash={transactionData.txHash}
              networkIdentifier={transactionData.networkIdentifier}
              showActions={!transactionData.gasless}
            />
          )}
          {transactionData.side !== "swap" && (
            <TransactionTokenSectionFromTo
              to={transactionData.side === "sender" ? transactionData.secondSideAddress : transactionData.accountAddress}
              from={transactionData.side === "sender" ? transactionData.accountAddress : transactionData.secondSideAddress}
            />
          )}
          <TransactionTokenSectionPrice
            txCost={transactionData.txCost}
            amount={transactionData.amount}
            buyPrice={transactionData.buyPrice}
            valueUSD={transactionData.valueUSD ?? null}
            totalCost={transactionData.totalCost}
            status={transactionData.status ?? null}
          />
          <TransactionTokenSectionAdvanced
            side={transactionData.side}
            nonce={transactionData.nonce}
            txHash={transactionData.txHash}
            symbol={transactionData.symbol}
            gasLimit={transactionData.gasLimit}
            gasPrice={transactionData.gasPrice}
            networkIdentifier={transactionData.networkIdentifier}
            status={transactionData.status ?? null}
            showAdvanced={!isNFTTransaction}
          />
        </Stack>
      )}
    </>
  );
}
