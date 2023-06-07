import { useMemo, ChangeEvent, SyntheticEvent } from "react";
import produce from "immer";

import { Stack, Tab, Tabs, Button, Pagination, PaginationItem, Theme, Typography } from "@mui/material";

import { Wallet } from "common/operations";
import { applyTokenAssetVisibilityRules } from "common/utils";

import { useAccountsAutoImportContext } from "ui/common/accountsAutoImport";
import { useHistoryPush, useHistoryState } from "ui/common/history";
import { EasterEgg } from "ui/common/rewardSystem";
import {
  useActiveAccountFlatTokenBalances,
  useTokensDisplayWithTickers,
  useActiveAccountNetworkAddress,
  useAccountsVisibleOrdered,
  useActiveAccount,
  useCurrentTabDappConnectionInfo,
  useLocalUserPreferences,
  useActiveAccountPortfolioUSDValue,
} from "ui/hooks";

import PortfolioValueChart from "ui/components/charting/PortfolioValueChart";
import AlertWithLink from "ui/components/common/AlertWithLink";

import useAnalytics from "ui/common/analytics";

import HomeAccountCard from "./HomeAccountCard";
import HomeTokenList from "./HomeTokenList";
import HomeNFTList from "./HomeNFTList";
import HomeHeader from "./HomeHeader";

const sxStyles = {
  tab: {
    fontSize: 13,
    lineHeight: 16 / 13,
  },
  walletCard: {
    root: {
      mx: 2,
    },
  },
  buttonManage: {
    "&.MuiButton-sizeMedium": {
      padding: 0,
      width: "52px",
      height: "20px",
      borderRadius: 0,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0.25px",
      minWidth: "fit-content",
    },
  },
  pagination: {
    margin: 1,
    justifyContent: "center",
    display: "flex",

    "& .MuiButtonBase-root": {
      fontSize: "0.675rem",
    },
  },
  connectedPaginationItem: {
    borderColor: (theme: Theme) => theme.palette.custom.green["54"],
  },
};

export default function Home() {
  const [tabValue, setTabValue] = useHistoryState("homeTab", 0);

  const push = useHistoryPush();
  const { trackButtonClicked } = useAnalytics();

  const balances = useActiveAccountFlatTokenBalances();
  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const tokens = useTokensDisplayWithTickers(balances);

  const visibleTokens = useMemo(() => tokens.filter(applyTokenAssetVisibilityRules), [tokens]);

  const portfolioBalanceUSD = useActiveAccountPortfolioUSDValue();

  const { started, finished, notified } = useAccountsAutoImportContext();

  const accounts = useAccountsVisibleOrdered() ?? [];
  const activeAccount = useActiveAccount();

  const { isDAppConnected, connection } = useCurrentTabDappConnectionInfo();

  const activeAccountNetworkAddress = useActiveAccountNetworkAddress();

  const activeAccountIndex = accounts.findIndex(acc => acc.uuid === activeAccount?.uuid);
  const connectedAccountIndex = accounts.findIndex(acc => isDAppConnected && connection?.accountUUID === acc.uuid);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOnChangePage = (event: ChangeEvent<unknown>, page: number) => {
    const isNextAccountConnected = isDAppConnected && accounts[page - 1].uuid === connection?.accountUUID;
    const isCurrentAccountConnected = isDAppConnected && activeAccount?.uuid === connection?.accountUUID;

    if (
      userPreferences.connectionPlugPopover?.isInitial &&
      userPreferences.connectionPlugPopover?.show &&
      !isNextAccountConnected &&
      isCurrentAccountConnected
    ) {
      setUserPreferences(
        produce(draft => {
          if (draft.connectionPlugPopover) {
            draft.connectionPlugPopover.open = true;
          }
        }),
      );
    }

    Wallet.SwitchAccount.perform(accounts[page - 1].uuid);
  };

  const handleManage = () => {
    trackButtonClicked("Manage Wallets");

    push("/manage");
  };

  const isTabToken = tabValue === 0;
  const isTabNFT = tabValue === 1;
  const hasMultipleAccounts = accounts.length > 1;

  return (
    <>
      <HomeHeader />
      {started && !notified && (
        <AlertWithLink severity={finished ? "success" : "warning"} linkLabel="View" linkHref="/accounts-auto-import" sx={{ mx: 2, my: 1 }}>
          <Typography variant="medium" letterSpacing="0.1px">
            {finished ? "Importing of wallets is finished" : "Importing wallets in progress"}
          </Typography>
        </AlertWithLink>
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" mx={2} mt={1} mb={1.5}>
        <Typography variant="headingSmall">My Wallets</Typography>
        <EasterEgg campaignId="wallet_manage_clicked" blinkerSx={{ top: 10, right: "auto", left: -12 }}>
          <Button color="primary" variant="text" sx={sxStyles.buttonManage} onClick={handleManage}>
            Manage
          </Button>
        </EasterEgg>
      </Stack>
      {activeAccountNetworkAddress && activeAccount && (
        <HomeAccountCard
          sx={sxStyles.walletCard}
          account={activeAccount}
          networkAddress={activeAccountNetworkAddress}
          portfolioBalanceUSD={Number(portfolioBalanceUSD ?? 0)}
        />
      )}
      {hasMultipleAccounts && (
        <Pagination
          size="small"
          variant="text"
          count={accounts.length}
          sx={sxStyles.pagination}
          page={activeAccountIndex + 1}
          onChange={handleOnChangePage}
          renderItem={item => {
            const isConnected = item.type === "page" && item.page === connectedAccountIndex + 1;

            return (
              <PaginationItem
                {...item}
                variant={isConnected ? "outlined" : "text"}
                sx={isConnected ? sxStyles.connectedPaginationItem : undefined}
              />
            );
          }}
        />
      )}
      {activeAccountNetworkAddress && <PortfolioValueChart px={2} mt="23px" mb={2} accountAddress={activeAccountNetworkAddress} />}
      <Tabs variant="fullWidth" value={tabValue} onChange={handleTabChange}>
        <Tab tabIndex={0} sx={sxStyles.tab} label="Coins" />
        <Tab tabIndex={1} sx={sxStyles.tab} label="NFTs" />
      </Tabs>
      {isTabNFT && <HomeNFTList activeAccountNetworkAddress={activeAccountNetworkAddress} />}
      {isTabToken && <HomeTokenList tokens={visibleTokens} />}
    </>
  );
}
