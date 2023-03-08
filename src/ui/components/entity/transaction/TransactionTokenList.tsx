import { memo, useEffect } from "react";
import { VariableSizeList } from "react-window";

import { Divider, Box } from "@mui/material";

import { TokenTransaction } from "common/types";

import { useAccountTransactions, useActiveAccount, useFuse } from "ui/hooks";

import { EasterEgg } from "ui/common/rewardSystem";
import { BASIC_LIST_ITEM_HEIGHT, EXPANDED_LIST_ITEM_HEIGHT } from "ui/common/constants";
import { mapTokenTransactionsToTokenTransactionRenderData } from "ui/common/transactions";

import EmptyList from "ui/components/common/EmptyList";
import TokenTransactionListItem from "ui/components/entity/transaction/TokenTransactionListItem";

export interface TransactionTokenListProps {
  search: string;
  height: number;
}

export default memo(function TransactionTokenList(props: TransactionTokenListProps) {
  const { search, height } = props;

  const activeAccount = useActiveAccount();

  const { transactions } = useAccountTransactions({ accountInfo: activeAccount });

  const transactionsRenderData = mapTokenTransactionsToTokenTransactionRenderData(transactions);

  const { fuzzyResults, updateQuery } = useFuse(transactionsRenderData, {
    keys: ["txHash", "title", "tokenAddress"],
    matchAllOnEmptyQuery: true,
    findAllMatches: true,
    threshold: 0.2,
    sortFn: (a, b) => {
      const aTimestamp = (a.item as unknown as TokenTransaction)?.timestamp ?? 0;
      const bTimestamp = (b.item as unknown as TokenTransaction)?.timestamp ?? 0;

      return bTimestamp - aTimestamp;
    },
  });

  useEffect(() => {
    updateQuery(search);
  }, [updateQuery, search]);

  const txs = fuzzyResults.map(tx => tx.item);

  const getSize = (index: number): number => {
    return txs[index].status === "pending" ? EXPANDED_LIST_ITEM_HEIGHT : BASIC_LIST_ITEM_HEIGHT;
  };

  const isEmpty = txs.length === 0;

  return (
    <>
      {isEmpty && <EmptyList text="Transactions will be here" />}
      {!isEmpty && (
        <>
          <VariableSizeList width="100%" itemSize={getSize} itemData={txs} itemCount={txs.length} height={height}>
            {({ data, index, style }) => (
              <Box key={data[index].txHash} style={style}>
                <EasterEgg campaignId="transaction_viewed" blinkerSx={{ top: 4, right: "auto", left: 4 }}>
                  <TokenTransactionListItem item={data[index]} />
                </EasterEgg>
                <Divider component="li" sx={{ height: 0 }} />
              </Box>
            )}
          </VariableSizeList>
        </>
      )}
    </>
  );
});
