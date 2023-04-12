import { Fragment, SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import sortBy from "lodash/sortBy";
import isEqual from "lodash/isEqual";
import orderBy from "lodash/orderBy";
import partition from "lodash/partition";
import difference from "lodash/difference";

import { Box, Button, Tab, Tabs, IconButton, List, Divider } from "@mui/material";

import { ImportedAsset } from "common/operations";
import { applyTokenAssetVisibilityRules, getNetworkDefinitionFromIdentifier } from "common/utils";

import { useActiveAccountBalances, useEnabledNetworks, useFuse, useImportedAssets, useTokensDisplayWithTickers } from "ui/hooks";
import { useHistoryState, useHistoryGoBack, useHistoryPush } from "ui/common/history";
import { FlatTokenBalanceInfo, TokenDisplay, TokenDisplayWithTicker } from "ui/types";

import CustomControls from "ui/components/controls/CustomControls";
import { IconUnion, IconFilterAlt } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import Search from "ui/components/common/Search";

import {
  arbitrumNetworkIdentifier,
  avalancheNetworkIdentifier,
  binanceSmartChainNetworkIdentifier,
  ethereumMainnetNetworkIdentifier,
  fantomNetworkIdentifier,
  optimismNetworkIdentifier,
  polygonNetworkIdentifier,
} from "common/config";

import ManageTokenFilterDialog, { VisibilityFilter } from "./ManageTokenFilterDialog";
import ManageTokenListItem from "./ManageTokenListItem";

const sxStyles = {
  root: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  wrap: {
    paddingRight: 2,
  },
  header: {
    display: "flex",
    flexShrink: 0,
    flexDirection: "column",
    position: "relative",
  },
  filterBtn: {
    padding: 0,
  },
  filterIcon: {
    margin: "5px",
    width: 20,
    height: 20,
  },
  tab: {
    fontSize: 13,
    lineHeight: 16 / 13,
  },
  search: {
    width: "90%",
    marginX: "16px",
  },
  list: {
    width: "100%",
    listStyleType: "none",
    overflow: "auto",
    flexShrink: 1,
    flexGrow: 1,
  },
  buttonWrapper: {
    flexShrink: 0,
    alignItems: "center",
    width: "100%",
    padding: 2,
    bgcolor: "background.default",
  },
  button: {
    flex: 1,
    whiteSpace: "nowrap",
  },
  icon: {
    width: 24,
    height: 24,
  },
  divider: {
    height: 0,
  },
};

type VerifyFilter = "verified" | "unverified";

const orderedNetworkIdentifiers = [
  ethereumMainnetNetworkIdentifier,
  binanceSmartChainNetworkIdentifier,
  polygonNetworkIdentifier,
  avalancheNetworkIdentifier,
  arbitrumNetworkIdentifier,
  optimismNetworkIdentifier,
  fantomNetworkIdentifier,
];

export default function ManageTokens() {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedAssetKeys, setSelectedAssetKeys] = useState<string[]>([]);
  const [unselectedAssetKeys, setUnselectedAssetKeys] = useState<string[]>([]);

  const goBack = useHistoryGoBack();
  const push = useHistoryPush();

  const [verifyFilter, setVerifyFilter] = useHistoryState<VerifyFilter>("verifyFilter", "verified");
  const [visibilityFilter, setVisibilityFilter] = useHistoryState<VisibilityFilter>("visibilityFilter", "show-all");
  const enabledNetworks = useEnabledNetworks();

  const showVerified = verifyFilter === "verified";

  const enabledNetworkIdentifiers = useMemo(() => enabledNetworks?.map(network => network.identifier), [enabledNetworks]);

  const balances = useActiveAccountBalances();
  const importedAssets = useImportedAssets();

  const targetAssets = useMemo(() => {
    const targetAssets: FlatTokenBalanceInfo[] = [];

    for (const asset of importedAssets ?? []) {
      const balanceInfo = balances?.[asset.networkIdentifier]?.balances?.[asset.assetIdentifier];

      if (asset.type === "token") {
        targetAssets.push({
          ...asset,
          type: "contract",
          ...getNetworkDefinitionFromIdentifier(asset.networkIdentifier),
          balance: balanceInfo?.balance ?? "0",
          balanceUSDValue: balanceInfo?.balanceUSDValue ?? null,
        });
      }
    }

    const verifyFiltered = targetAssets.filter(asset => asset.verified === showVerified);

    if (visibilityFilter === "show-visible") {
      return verifyFiltered.filter(applyTokenAssetVisibilityRules);
    }

    if (visibilityFilter === "show-hidden") {
      return verifyFiltered.filter(asset => !applyTokenAssetVisibilityRules(asset));
    }

    return verifyFiltered;
  }, [balances, importedAssets, showVerified, visibilityFilter]);

  const tokens = useTokensDisplayWithTickers(targetAssets);

  const { fuzzyResults, onSearch } = useFuse(tokens, {
    keys: ["name", "symbol", "assetDefinition.contractAddress"],
    matchAllOnEmptyQuery: true,
  });

  const currentlyVisibleAssetKeys = useMemo(
    () => tokens.filter(token => applyTokenAssetVisibilityRules(token)).map(token => token.key),
    [tokens],
  );

  const ordered = useMemo(() => {
    if (showVerified) {
      return fuzzyResults;
    }

    type FuzzyToken = {
      item: TokenDisplayWithTicker;
      refIndex: number;
    };

    const [tokensWithBalance, tokensWithoutBalance] = partition(fuzzyResults, token => Number(token.item.balance) > 0);

    const sortedTokensWithBalance = orderBy(tokensWithBalance, token => Number(token.item.balance), "desc");

    const otherEnabledNetworkIdentifiers = difference(enabledNetworkIdentifiers, orderedNetworkIdentifiers);

    const prioritizedNetworkIdentifiers = [...orderedNetworkIdentifiers, ...otherEnabledNetworkIdentifiers];

    let tokensWithoutBalanceByNetwork = tokensWithoutBalance;

    const sortedTokensWithoutBalanceByNetwork: FuzzyToken[] = [];

    // Sort tokens without balance by network priority
    for (const networkIdentifier of prioritizedNetworkIdentifiers) {
      const [tokens, otherTokens] = partition(tokensWithoutBalanceByNetwork, token => token.item.networkIdentifier === networkIdentifier);

      sortedTokensWithoutBalanceByNetwork.push(...orderBy(tokens, fuzzyToken => fuzzyToken.item.name.toLowerCase()));

      tokensWithoutBalanceByNetwork = otherTokens;
    }

    // Sort remaining tokens without balance by name alphabetically
    const sortedOtherTokensWithoutBalance: FuzzyToken[] = orderBy(tokensWithoutBalanceByNetwork, fuzzyToken =>
      fuzzyToken.item.name.toLowerCase(),
    );

    return [...sortedTokensWithBalance, ...sortedTokensWithoutBalanceByNetwork, ...sortedOtherTokensWithoutBalance];
  }, [enabledNetworkIdentifiers, fuzzyResults, showVerified]);

  const disableSave = isEqual(sortBy(currentlyVisibleAssetKeys), sortBy(selectedAssetKeys));

  useEffect(() => {
    const candidates: string[] = [];

    for (const currentlyVisibleAssetKey of currentlyVisibleAssetKeys) {
      if (!selectedAssetKeys.includes(currentlyVisibleAssetKey) && !unselectedAssetKeys.includes(currentlyVisibleAssetKey)) {
        candidates.push(currentlyVisibleAssetKey);
      }
    }

    if (candidates.length > 0) {
      setSelectedAssetKeys(prevSelected => [...prevSelected, ...candidates]);
    }
  }, [currentlyVisibleAssetKeys, selectedAssetKeys, unselectedAssetKeys]);

  const openFilterDialog = () => setFilterDialogOpen(true);

  const closeFilterDialog = () => setFilterDialogOpen(false);

  const handleTabChange = (event: SyntheticEvent, newVerifyFilter: VerifyFilter) => {
    setVerifyFilter(newVerifyFilter);
  };

  const handleSelect = useCallback(
    (token: TokenDisplay) => {
      if (selectedAssetKeys.includes(token.key)) {
        setSelectedAssetKeys(prevSelected => prevSelected.filter(tokenKey => tokenKey !== token.key));
        setUnselectedAssetKeys(prevUnselected => [...prevUnselected, token.key]);
      } else {
        setSelectedAssetKeys(prevSelected => [...prevSelected, token.key]);
        setUnselectedAssetKeys(prevUnselected => prevUnselected.filter(tokenKey => tokenKey !== token.key));
      }
    },
    [selectedAssetKeys],
  );

  const handleSave = () => {
    for (const tokenToUpdate of tokens) {
      const isSelected = selectedAssetKeys.includes(tokenToUpdate.key);

      const isChanged = applyTokenAssetVisibilityRules(tokenToUpdate) !== isSelected;

      if (isChanged) {
        ImportedAsset.SetVisibility.perform(tokenToUpdate.key, !isSelected ? "hidden" : "force-show", "token");
      }
    }

    goBack();
  };

  const handleImport = () => push("/import-token");

  return (
    <Box sx={sxStyles.root}>
      <Header title="Manage Tokens" onBackClick={goBack} sx={sxStyles}>
        <IconButton onClick={openFilterDialog} sx={sxStyles.filterBtn}>
          <IconFilterAlt style={sxStyles.filterIcon} />
        </IconButton>
      </Header>
      <Box sx={sxStyles.header}>
        <Search onChange={onSearch} sx={sxStyles.search} />
        <Tabs variant="fullWidth" value={verifyFilter} onChange={handleTabChange}>
          <Tab value="verified" sx={sxStyles.tab} label="Verified" />
          <Tab value="unverified" sx={sxStyles.tab} label="Unverified" />
        </Tabs>
      </Box>
      <List sx={sxStyles.list}>
        {ordered.map(({ item: token }, index) => (
          <Fragment key={token.key}>
            <ManageTokenListItem token={token} onSelect={handleSelect} selected={selectedAssetKeys.includes(token.key)} />
            {index + 1 !== ordered.length && <Divider component="li" variant="middle" sx={sxStyles.divider} />}
          </Fragment>
        ))}
      </List>

      <CustomControls
        primary={
          <Button variant="contained" disabled={disableSave} fullWidth onClick={handleSave}>
            Save
          </Button>
        }
        secondary={
          <Button fullWidth startIcon={<IconUnion style={sxStyles.icon} />} variant="outlined" onClick={handleImport}>
            Import Manually
          </Button>
        }
      />
      <ManageTokenFilterDialog
        open={filterDialogOpen}
        onClose={closeFilterDialog}
        visibilityFilter={visibilityFilter}
        setVisibilityFilter={setVisibilityFilter}
      />
    </Box>
  );
}
