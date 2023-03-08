import { Fragment } from "react";
import orderBy from "lodash/orderBy";
import produce from "immer";

import { Box, Divider, IconButton, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { NFTItem } from "common/types";
import { defaultUserPreferences } from "common/storage";

import { SortSetting } from "ui/types";
import { EasterEgg } from "ui/common/rewardSystem";

import { useLocalUserPreferences } from "ui/hooks";
import { useAccountNFTsBalance } from "ui/hooks/accounts/useAccountNFTsBalance";

import EmptyList from "ui/components/common/EmptyList";
import NFTListItem from "ui/components/entity/nft/NFTListItem";

import { useHistoryPush } from "ui/common/history";

import { nftMocks } from "./mocks";

import HomeListSubheader from "./HomeListSubheader";
import HomeListSubheaderSort from "./HomeListSubheaderSort";

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

  const result = useAccountNFTsBalance([activeAccountNetworkAddress]);
  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const sort = userPreferences.myNFTsSort ?? (defaultUserPreferences.myNFTsSort as SortSetting);

  const nfts: NFTItem[] =
    result.balances[activeAccountNetworkAddress ?? ""]?.balance.nftTokens.map((nft, index) => ({
      ...nftMocks[index],
      tokenId: nft.tokenId,
      symbol: nft.token.symbol,
      icon: nft.metadata?.imageUrl,
      decimals: nft.token.decimals,
      tokenAddress: nft.tokenAddress,
      accountAddress: nft.accountAddress,
      tokenContractType: nft.tokenContractType,
      name: (nft.metadata?.name || nft.token?.name) ?? "Error: Unable to get NFT information",
    })) ?? [];

  const handleSort = (newSort: SortSetting) => {
    setUserPreferences(
      produce(draft => {
        draft.myNFTsSort = newSort;
      }),
    );
  };

  const handleSearch = () => undefined;

  const handleSearchClose = () => undefined;

  const handleManageNFTs = () => {
    push("/manage-nfts");
  };

  const ordered = orderBy(nfts, [sort.prop], [sort.dir]);

  return (
    <Box component="section">
      <HomeListSubheader
        sort={<HomeListSubheaderSort onSort={handleSort} sort={sort} />}
        title="My NFTs"
        onSearch={handleSearch}
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
