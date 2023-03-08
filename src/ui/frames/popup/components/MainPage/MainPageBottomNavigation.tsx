import { MouseEvent, useCallback } from "react";

import { makeStyles } from "@mui/styles";

import { Stack, Theme } from "@mui/material";

import { MainPageSection, useMainPageSection, useMainPagePopupOpen } from "ui/common/history";

import FixedPanel from "ui/components/layout/misc/FixedPanel";

import { IconBlueTransferBtn, IconHome, IconMarkets, IconTransactions } from "ui/components/icons";

import RewardsAvatar from "ui/components/entity/rewards/RewardsAvatar";

import { useRewardSystemNextLevelData } from "ui/common/rewardSystem";

import { EasterEgg } from "ui/common/rewardSystem";

import MainPageBottomNavigationButton from "./MainPageBottomNavigationButton";
import MainPageQuickOpsPopup from "./MainPageQuickOpsPopup";

const useStyles = makeStyles({
  icon: {
    width: 24,
  },
  settingsIcon: {
    width: 20,
    height: 20,
    margin: "auto",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    textAlign: "center",
    textDecoration: "none",
  },
  centerIcon: {
    width: 36,
    height: 36,
  },
});

export interface MainPageBottomNavigationProps {
  beforeButtonClick?: (section: MainPageSection) => void;
}

export default function MainPageBottomNavigation(props: MainPageBottomNavigationProps) {
  const { beforeButtonClick } = props;

  const classes = useStyles();

  const { section, setSection } = useMainPageSection();

  const { popupOpen, setPopupOpen } = useMainPagePopupOpen();

  const rewardSystemNextLevelData = useRewardSystemNextLevelData();

  const handleCloseQuickOpsPopup = useCallback(() => setPopupOpen(false), [setPopupOpen]);

  const handleOpenQuickOpsPopup = (event: MouseEvent) => {
    event.preventDefault();

    beforeButtonClick?.("home");

    setPopupOpen(true);
  };

  const createHandleButtonClick = (section: MainPageSection) => () => {
    beforeButtonClick?.(section);
    setSection(section);
  };

  const homeButton = (
    <MainPageBottomNavigationButton
      text="Home"
      active={section === "home"}
      onClick={createHandleButtonClick("home")}
      icon={<IconHome className={classes.icon} />}
    />
  );

  const marketsButton = (
    <EasterEgg campaignId="view_market_overview" blinkerSx={{ top: 20, right: "auto", left: 16 }}>
      <MainPageBottomNavigationButton
        text="Markets"
        active={section === "markets"}
        onClick={createHandleButtonClick("markets")}
        icon={<IconMarkets className={classes.icon} />}
      />
    </EasterEgg>
  );

  const transactionsButton = (
    <EasterEgg campaignId="transactions_tab_viewed" blinkerSx={{ top: 20, right: "auto", left: 16 }}>
      <MainPageBottomNavigationButton
        text="Transactions"
        active={section === "transactions"}
        onClick={createHandleButtonClick("transactions")}
        icon={<IconTransactions className={classes.icon} />}
      />
    </EasterEgg>
  );

  const profileButton = (
    <MainPageBottomNavigationButton
      text="My Aurox"
      active={section === "profile"}
      onClick={createHandleButtonClick("profile")}
      icon={
        <Stack alignItems="center" justifyContent="center" width={24} height={24}>
          <RewardsAvatar src={rewardSystemNextLevelData.iconSrc.normal} size="small" progress={rewardSystemNextLevelData.progress} />
        </Stack>
      }
    />
  );

  return (
    <>
      <FixedPanel variant="bottom">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          borderTop={(theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`}
          bgcolor="background.default"
        >
          {homeButton}
          {marketsButton}

          <a onClick={handleOpenQuickOpsPopup} href="#" className={classes.center}>
            <IconBlueTransferBtn className={classes.centerIcon} />
          </a>

          {transactionsButton}
          {profileButton}
        </Stack>
      </FixedPanel>

      <MainPageQuickOpsPopup open={popupOpen} onClose={handleCloseQuickOpsPopup} />
    </>
  );
}
