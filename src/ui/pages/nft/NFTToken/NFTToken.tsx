import { CSSProperties, SyntheticEvent, useState } from "react";

import { Stack, Tab, Tabs } from "@mui/material";

import { useActiveAccount, useNFTToken } from "ui/hooks";
import { useHistoryGoBack, useHistoryPathParams, useHistoryPush } from "ui/common/history";

import AlertStatus from "ui/components/common/AlertStatus";
import DefaultControls from "ui/components/controls/DefaultControls";
import TransactionNFTList from "ui/components/entity/transaction/TransactionNFTList";

import { getAccountAddressForChainType } from "common/utils";

import NFTTokenCard from "./NFTTokenCard";
import NFTTokenInfo from "./NFTTokenInfo";

const sxStyles = {
  tabs: {
    mt: -1,
  },
  tab: {
    fontWeight: 500,
    fontSize: "13px",
    lineHeight: "16px",
    textTransform: "none",
    letterSpacing: "0.25px",
    color: "text.secondary",
    borderBottom: "1px solid #ffffff1f",
  },
};

const listStyle: CSSProperties = {
  overflow: "hidden",
};

export default function NFTToken() {
  const [tabValue, setTabValue] = useState(0);

  const push = useHistoryPush();
  const goBack = useHistoryGoBack();
  const { contractAddress = "", tokenId = "" } = useHistoryPathParams<"contractAddress" | "tokenId">();

  const account = useActiveAccount();

  const chainType = account?.type === "private-key" ? account.chainType : "evm";

  const accountAddress = account ? getAccountAddressForChainType(account, chainType) : null;

  const { nft: response, loading, error } = useNFTToken([accountAddress], contractAddress, tokenId);

  const nft = accountAddress ? response[accountAddress] : null;

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTransfer = () => {
    push(`/send-nft/${contractAddress}/${tokenId}`);
  };

  const isInfo = nft && tabValue === 0;
  const isTransactions = nft ? tabValue === 1 : tabValue === 0;

  if (!loading && error) {
    return <AlertStatus error errorText={error} showButton onButtonClick={goBack} />;
  }

  if (loading && !error) {
    return <AlertStatus loading loadingText="Loading token, please wait..." />;
  }

  return (
    <Stack>
      <NFTTokenCard nft={nft} />
      <Tabs variant="fullWidth" value={tabValue} onChange={handleTabChange} sx={sxStyles.tabs}>
        {nft && <Tab tabIndex={0} sx={sxStyles.tab} label="General" />}
        <Tab tabIndex={nft ? 1 : 0} sx={sxStyles.tab} label="Transactions" />
      </Tabs>
      {isInfo && (
        <>
          <NFTTokenInfo nft={nft} />
          <DefaultControls onPrimary={handleTransfer} primary="Transfer" />
        </>
      )}
      {isTransactions && <TransactionNFTList nft={nft} account={account} style={listStyle} />}
    </Stack>
  );
}
