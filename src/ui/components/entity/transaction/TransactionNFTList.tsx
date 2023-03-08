import { CSSProperties } from "react";
import take from "lodash/take";
import { ListOnScrollProps, VariableSizeList } from "react-window";

import { Box, Divider, Link } from "@mui/material";

import { AccountInfo } from "common/types";
import { NFT_PAGE_TRANSACTIONS_THRESHOLD } from "common/config";

import { createTransactionHistorySearchState, useGoHome } from "ui/common/history";
import { BASIC_LIST_ITEM_HEIGHT, EXPANDED_LIST_ITEM_HEIGHT } from "ui/common/constants";
import { mapTokenTransactionsToTokenTransactionRenderData } from "ui/common/transactions";

import { EthereumAccountNFT } from "ui/types";
import { useAccountTransactions } from "ui/hooks";

import EmptyList from "ui/components/common/EmptyList";

import TokenTransactionListItem from "./TokenTransactionListItem";

const sxStyles = {
  link: {
    my: 1,
    mr: 2,
  },
};

export interface TransactionNFTListProps {
  height?: number;
  style?: CSSProperties;
  account?: AccountInfo | null;
  nft?: EthereumAccountNFT | null;
  onScrollingChanged?: (props: ListOnScrollProps) => void;
}

export default function TransactionNFTList(props: TransactionNFTListProps) {
  const { height, onScrollingChanged, nft, account, style } = props;

  const goHome = useGoHome();

  const apiArgs = nft?.tokenAddress
    ? { nftTransfers: { tokenAddress: [nft.tokenAddress], limit: NFT_PAGE_TRANSACTIONS_THRESHOLD + 1 } }
    : undefined;

  const { nftTransfers } = useAccountTransactions({ accountInfo: account, ...(apiArgs && { apiArguments: apiArgs }) });

  const nftTransactions = mapTokenTransactionsToTokenTransactionRenderData(take(nftTransfers, NFT_PAGE_TRANSACTIONS_THRESHOLD));

  const numberOfPendingTransactions = nftTransactions.filter(transaction => transaction.status === "pending").length;
  const numberOfOtherTransactions = nftTransactions.length - numberOfPendingTransactions;

  const listHeight = height ?? numberOfOtherTransactions * BASIC_LIST_ITEM_HEIGHT + numberOfPendingTransactions * EXPANDED_LIST_ITEM_HEIGHT;

  const getSize = (index: number): number => {
    return nftTransactions[index].status === "pending" ? EXPANDED_LIST_ITEM_HEIGHT : BASIC_LIST_ITEM_HEIGHT;
  };

  const handleShowMore = () => {
    goHome("transactions", createTransactionHistorySearchState(nft?.tokenAddress ?? ""));
  };

  if (nftTransactions.length === 0) {
    return <EmptyList text="Transactions will be here" />;
  }

  return (
    <>
      <VariableSizeList
        width="100%"
        style={style}
        itemSize={getSize}
        height={listHeight}
        itemData={nftTransactions}
        onScroll={onScrollingChanged}
        itemCount={nftTransactions.length}
      >
        {({ data, index, style }) => (
          <Box key={data[index].txHash} style={style}>
            <TokenTransactionListItem item={data[index]} />
            <Divider component="li" sx={{ height: 0 }} />
          </Box>
        )}
      </VariableSizeList>
      {nftTransfers.length > NFT_PAGE_TRANSACTIONS_THRESHOLD && (
        <Link alignSelf="end" component="button" disabled sx={sxStyles.link} underline="hover" onClick={handleShowMore}>
          Show more
        </Link>
      )}
    </>
  );
}
