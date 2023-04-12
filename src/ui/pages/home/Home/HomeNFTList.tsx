import { Fragment, useMemo } from "react";
import orderBy from "lodash/orderBy";
import produce from "immer";

import { Box, Divider, IconButton, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { NFTItem } from "common/types";
import { defaultUserPreferences } from "common/storage";

import { SortSetting } from "ui/types";
import { EasterEgg } from "ui/common/rewardSystem";

import { useActiveAccountFlatNFTBalances, useFuse, useLocalUserPreferences } from "ui/hooks";

import EmptyList from "ui/components/common/EmptyList";
import NFTListItem from "ui/components/entity/nft/NFTListItem";

import { useHistoryPush } from "ui/common/history";

import { applyTokenAssetVisibilityRules } from "common/utils";

import HomeListSubheader from "./HomeListSubheader";
import HomeListSubheaderSort from "./HomeListSubheaderSort";
import { nftMocks } from "./mocks";

const sxStyles = {
  buttonImportToken: {
    padding: 0,
  },
};

export interface HomeNFTListProps {
  activeAccountNetworkAddress: string | null;
}

export default function HomeNFTList(props: HomeNFTListProps) {
  const { activeAccountNetworkAddress } = props;

  const push = useHistoryPush();

  const balances = useActiveAccountFlatNFTBalances();

  const visibleBalances = useMemo(() => balances.filter(applyTokenAssetVisibilityRules), [balances]);

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const sort = userPreferences.myNFTsSort ?? (defaultUserPreferences.myNFTsSort as SortSetting);

  const nfts: NFTItem[] =
    visibleBalances.map((balance, index) => ({
      ...nftMocks[index],
      networkIdentifier: balance.networkIdentifier,
      tokenId: balance.metadata.tokenId,
      symbol: balance.symbol,
      icon: balance.metadata.image ?? "",
      decimals: balance.decimals,
      tokenAddress: balance.contractAddress,
      accountAddress: activeAccountNetworkAddress as string,
      tokenContractType: balance.contractType,
      name: balance.name && balance.name !== "" ? balance.name : "Error: Unable to get NFT information",
    })) ?? [];

  const handleSort = (newSort: SortSetting) => {
    setUserPreferences(
      produce(draft => {
        draft.myNFTsSort = newSort;
      }),
    );
  };

  const { fuzzyResults, onSearch, updateQuery } = useFuse(nfts, {
    keys: ["name", "symbol"],
    matchAllOnEmptyQuery: true,
  });

  const handleSearchClose = () => {
    updateQuery("");
  };

  const handleManageNFTs = () => {
    push("/manage-nfts");
  };
  const ordered = useMemo(
    () =>
      orderBy(
        fuzzyResults.map(item => item.item),
        [item => item[sort.prop as "name"].toLowerCase()],
        [sort.dir === "asc" ? "desc" : "asc"],
      ),
    [fuzzyResults, sort.dir, sort.prop],
  );

  return (
    <Box component="section">
      <HomeListSubheader
        sort={<HomeListSubheaderSort onSort={handleSort} sort={sort} />}
        title="My NFTs"
        onSearch={onSearch}
        onSearchClose={handleSearchClose}
        icon={
          <IconButton sx={sxStyles.buttonImportToken} onClick={handleManageNFTs}>
            <AddIcon color="primary" />
          </IconButton>
        }
      />
      {nfts.length > 0 ? (
        <Stack>
          {ordered.map((nft, index) => {
            return (
              <Fragment key={index}>
                <EasterEgg campaignId="nft_view" blinkerSx={{ top: 4, right: "auto", left: 4 }}>
                  <NFTListItem item={nft} />
                </EasterEgg>
                <Divider component="li" sx={{ height: 0 }} />
              </Fragment>
            );
          })}
        </Stack>
      ) : (
        <EmptyList text="You have no NFTs in this wallet" />
      )}
    </Box>
  );
}
