import { ListChildComponentProps } from "react-window";

import { Box } from "@mui/material";

import AlertStatus from "ui/components/common/AlertStatus";
import { EasterEgg } from "ui/common/rewardSystem";

import { GraphQLMarketsAPICoin } from "ui/types";

import Delayed from "ui/components/common/Delayed";

import MarketTokenListItem from "./MarketTokenListItem";

const sxStyles = {
  blinker: {
    left: 4,
    top: "50%",
    right: "auto",
    transform: "translateY(-50%)",
  },
};

export interface MarketsTokenRowProps extends ListChildComponentProps {
  loading?: boolean;
  onClick: (token: GraphQLMarketsAPICoin, index: number) => void;
  token: GraphQLMarketsAPICoin | null;
  error?: string;
  isFavoritesFilterSet?: boolean;
}

export default function MarketsTokenRow(props: MarketsTokenRowProps) {
  const { loading, style, onClick, token, error, index, isFavoritesFilterSet } = props;

  const handleClick = () => {
    if (!token) {
      return;
    }

    onClick(token, index);
  };

  if (loading) {
    return (
      <Box style={style}>
        <Delayed delay={isFavoritesFilterSet ? 500 : 0}>
          <AlertStatus loading={loading} loadingText="Loading..." error={!loading && !!error} errorText={error} />
        </Delayed>
      </Box>
    );
  }

  if (token) {
    return (
      <Box style={style}>
        <EasterEgg campaignId="coin_viewed" blinkerSx={sxStyles.blinker}>
          <MarketTokenListItem token={token} key={token.id} onClick={handleClick} />
        </EasterEgg>
      </Box>
    );
  }

  return <Box style={style}>{status}</Box>;
}
