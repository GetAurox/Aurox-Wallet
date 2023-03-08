import { ChangeEvent } from "react";

import { Typography } from "@mui/material";

import { BOTTOM_BAR_HEIGHT } from "common/config";

import Search from "ui/components/common/Search";
import TransactionTokenList from "ui/components/entity/transaction/TransactionTokenList";

import { useTransactionHistorySearch } from "ui/common/history/states/transaction";

import { TRANSACTIONS_HEADER_HEIGHT, TRANSACTIONS_SEARCH_HEIGHT } from "./constants";

const sxStyles = {
  search: {
    m: 2,
    mb: 1,
  },
};

export default function Transactions() {
  const [search, setSearch] = useTransactionHistorySearch("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const listHeight = document.body.clientHeight - TRANSACTIONS_HEADER_HEIGHT - TRANSACTIONS_SEARCH_HEIGHT - BOTTOM_BAR_HEIGHT - 1;

  return (
    <>
      <Typography component="h1" fontWeight={500} fontSize={24} mt={2.5} align="center">
        Transactions
      </Typography>
      <Search sx={sxStyles.search} value={search} onChange={handleSearchChange} />
      <TransactionTokenList height={listHeight} search={search} />
    </>
  );
}
