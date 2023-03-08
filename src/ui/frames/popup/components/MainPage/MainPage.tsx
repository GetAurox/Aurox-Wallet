import SwipeableViews from "react-swipeable-views";
import { lazy } from "react";

import { makeStyles } from "@mui/styles";

import { useMainPageSection } from "ui/common/history";

import LazyRoute from "ui/components/common/LazyRoute";

const Transactions = lazy(() => import(/* webpackChunkName: "pages/transaction/transactions" */ "ui/pages/transaction/Transactions"));
const Profile = lazy(() => import(/* webpackChunkName: "pages/home/profile" */ "ui/pages/home/Profile"));
const Markets = lazy(() => import(/* webpackChunkName: "pages/home/markets" */ "ui/pages/home/Markets"));
const Home = lazy(() => import(/* webpackChunkName: "pages/home/home" */ "ui/pages/home/Home"));
const SwapComingSoon = lazy(() => import(/* webpackChunkName: "pages/flows/swap" */ "ui/pages/flows/Swap/SwapComingSoon"));

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
  const { sectionIndex } = useMainPageSection();

  const classes = useStyles();

  return (
    <>
      <SwipeableViews containerStyle={styles.container} slideClassName={classes.slide} disabled disableLazyLoading index={sectionIndex}>
        <LazyRoute Route={Home} />
        <LazyRoute Route={Markets} />
        <LazyRoute Route={Transactions} />
        <LazyRoute Route={Profile} />
        <LazyRoute Route={SwapComingSoon} />
      </SwipeableViews>
      <MainPageBottomNavigation />
    </>
  );
}
