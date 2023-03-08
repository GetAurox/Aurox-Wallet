import { ChangeEvent, useCallback, useState } from "react";

import { Button, Stack } from "@mui/material";

import { TokenApprovalItem } from "common/types";

import { useHistoryGoBack } from "ui/common/history";

import DialogBase from "ui/components/common/DialogBase";
import Header from "ui/components/layout/misc/Header";
import Search from "ui/components/common/Search";

import TokenApprovalsTable from "./TokenApprovalsTable";

import { mockItems } from "./mocks";

const sxStyles = {
  search: {
    mx: 2,
    mt: 1,
    borderRadius: "10px",
  },
};

function filterByQuery(item: TokenApprovalItem, query: string) {
  if (query.length > 0) {
    return [item.fullName.toLowerCase(), item.shortName.toLowerCase(), item.contractAddress.toLowerCase()].includes(query.toLowerCase());
  }

  return true;
}

export default function TokenApprovals() {
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const goBack = useHistoryGoBack();

  const handleRevoke = useCallback((token: string) => {
    setTokenToRevoke(token);
  }, []);

  const handleCloseDialog = () => {
    setTokenToRevoke(null);
  };

  const handleBack = () => {
    setTokenToRevoke(null);
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const filteredItems = mockItems.filter(row => filterByQuery(row, query));

  return (
    <>
      <Header title="Token Approvals" onBackClick={goBack} />
      <Search sx={sxStyles.search} onChange={handleSearch} value={query} />
      <TokenApprovalsTable onRevoke={handleRevoke} items={filteredItems} />
      <DialogBase
        onClose={handleCloseDialog}
        open={!!tokenToRevoke}
        title={`Do you want to revoke ${tokenToRevoke}`}
        content={
          <Stack spacing={1.5}>
            <Button variant="contained">Yes, revoke</Button>
            <Button onClick={handleBack} variant="outlined">
              No, go back
            </Button>
          </Stack>
        }
      />
    </>
  );
}
