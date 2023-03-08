import { Fragment } from "react";

import { Divider, Link, Stack, StackProps } from "@mui/material";

import { TOKEN_PAGE_TRANSACTIONS_THRESHOLD } from "common/config";

import { TokenDisplayWithTicker } from "ui/types";
import { useActiveAccount, useAccountTransactions } from "ui/hooks";
import { createTransactionHistorySearchState, useGoHome } from "ui/common/history";
import { mapTokenTransactionsToTokenTransactionRenderData } from "ui/common/transactions";

import EmptyList from "ui/components/common/EmptyList";
import TokenTransactionListItem from "ui/components/entity/transaction/TokenTransactionListItem";

const sxStyles = {
  link: {
    cursor: "pointer",
    mr: 2,
    mt: 1,
    alignSelf: "end",
    underline: "hover",
    width: "fit-content",
  },
};

export interface TokenTabTransactionsProps extends StackProps {
  token: TokenDisplayWithTicker;
}

export default function TokenTabTransactions(props: TokenTabTransactionsProps) {
  const { token, ...stackProps } = props;

  const goHome = useGoHome();

  const activeAccount = useActiveAccount();

  const { transactions } = useAccountTransactions({
    accountInfo: activeAccount,
    tokenDefinitions: {
      [token.networkIdentifier]: [token.assetDefinition],
    },
  });

  const transactionsRenderData = mapTokenTransactionsToTokenTransactionRenderData(transactions);

  const handleShowMoreClicked = () => {
    goHome("transactions", createTransactionHistorySearchState(token.symbol));
  };

  const isEmpty = transactionsRenderData.length === 0;

  return (
    <>
      {isEmpty && <EmptyList text="Transactions will be here" />}
      {!isEmpty && (
        <Stack {...stackProps}>
          {transactionsRenderData.slice(0, TOKEN_PAGE_TRANSACTIONS_THRESHOLD).map((token, index) => {
            return (
              <Fragment key={index}>
                <TokenTransactionListItem item={token} />
                {TOKEN_PAGE_TRANSACTIONS_THRESHOLD !== index + 1 && <Divider component="li" sx={{ height: 0 }} />}
              </Fragment>
            );
          })}
          {transactionsRenderData.length > TOKEN_PAGE_TRANSACTIONS_THRESHOLD && (
            <Link sx={sxStyles.link} onClick={handleShowMoreClicked}>
              Show more
            </Link>
          )}
        </Stack>
      )}
    </>
  );
}
