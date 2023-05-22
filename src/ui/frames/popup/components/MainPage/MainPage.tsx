import SwipeableViews from "react-swipeable-views";
import { lazy, useEffect } from "react";
import capitalize from "lodash/capitalize";

import { makeStyles } from "@mui/styles";

import { useHistoryState, useMainPageSection } from "ui/common/history";

import LazyRoute from "ui/components/common/LazyRoute";

const Transactions = lazy(() => import(/* webpackChunkName: "pages/transaction/transactions" */ "ui/pages/transaction/Transactions"));
const Profile = lazy(() => import(/* webpackChunkName: "pages/home/profile" */ "ui/pages/home/Profile"));
const Markets = lazy(() => import(/* webpackChunkName: "pages/home/markets" */ "ui/pages/home/Markets"));
const Home = lazy(() => import(/* webpackChunkName: "pages/home/home" */ "ui/pages/home/Home"));

import useAnalytics, { PagesToTrack } from "ui/common/analytics";

import MainPageBottomNavigation from "./MainPageBottomNavigation";

const useStyles = makeStyles({
  slide: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflowX: "hidden !important" as any,
  },
});

const styles = {
  container: {
    height: "100%",
    maxHeight: "100%",
    transition: "transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s",
  },
};

export default function MainPage() {
  const { section, sectionIndex } = useMainPageSection();
  const [tab] = useHistoryState("profileTab", 0);
  const { pageViewed } = useAnalytics();

  useEffect(() => {
    if (section === "profile" && tab === 0) {
      return;
    }

    const page = section === "profile" ? "settings" : section;

    pageViewed(capitalize(page) as PagesToTrack);
  }, [pageViewed, section, tab]);

  const classes = useStyles();

  return (
    <>
      <SwipeableViews containerStyle={styles.container} slideClassName={classes.slide} disabled disableLazyLoading index={sectionIndex}>
        <LazyRoute Route={Home} />
        <LazyRoute Route={Markets} />
        <LazyRoute Route={Transactions} />
        <LazyRoute Route={Profile} />
      </SwipeableViews>
      <MainPageBottomNavigation />
    </>
  );
}
