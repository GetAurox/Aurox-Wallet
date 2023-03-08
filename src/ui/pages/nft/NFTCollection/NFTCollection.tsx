import { memo, useState } from "react";

import { Box, Tab, Tabs } from "@mui/material";

import { useHistoryPathParams } from "ui/common/history";
import { useNFTCollection } from "ui/hooks";

import TransactionNFTList from "ui/components/entity/transaction/TransactionNFTList";
import AlertStatus from "ui/components/common/AlertStatus";
import TokenPriceChart from "ui/components/charting/TokenPriceChart";

import NFTCollectionInformation from "./NFTCollectionInformation";
import NFTCollectionTokenList from "./NFTCollectionTokenList";
import NFTCollectionCard from "./NFTCollectionCard";

const sxStyles = {
  bottomTabs: {
    marginTop: "-16px",
  },
  transactionBox: {
    marginBottom: "16px",
  },
};

export default memo(function NFTCollection() {
  const [topTab, setTopTab] = useState(0);
  const [bottomTab, setBottomTab] = useState(0);

  const { slug = "" } = useHistoryPathParams<"slug">();

  // @TODO to remove when ohlcv service is finished
  const pairId = 60267;

  const { collection, loading, error } = useNFTCollection(slug);

  const status = <AlertStatus loading={loading} loadingText="Loading..." error={!loading && !!error} errorText={error} />;

  const handleTopTab = (newTab: number) => {
    setTopTab(newTab);
  };

  const handleBottomTab = (newTab: number) => {
    setBottomTab(newTab);
  };

  const body = !loading && collection && (
    <>
      {collection && <NFTCollectionCard collection={collection} />}

      <Tabs value={topTab} onChange={(event, newTab) => handleTopTab(newTab)} variant="fullWidth">
        <Tab label="General" />
        <Tab label="Transactions" />
      </Tabs>

      {topTab === 0 && <TokenPriceChart pairId={pairId} />}
      {topTab === 1 && (
        <Box sx={sxStyles.transactionBox}>
          <TransactionNFTList height={document.body.clientHeight} />
        </Box>
      )}

      <Tabs value={bottomTab} onChange={(event, newTab) => handleBottomTab(newTab)} variant="fullWidth" sx={sxStyles.bottomTabs}>
        <Tab label="NFTs" />
        <Tab label="Information" />
      </Tabs>

      {bottomTab === 0 && <NFTCollectionTokenList slug={slug} />}
      {bottomTab === 1 && <NFTCollectionInformation />}
    </>
  );

  return (
    <>
      {status}
      {body}
    </>
  );
});
