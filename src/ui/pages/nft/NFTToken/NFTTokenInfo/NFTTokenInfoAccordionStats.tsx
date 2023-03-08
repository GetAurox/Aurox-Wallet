import { List } from "@mui/material";

import { NFTTokenStat } from "common/types";

import NFTTokenInfoAccordionStatsItem from "./NFTTokenInfoAccordionStatsItem";

const sxStyles = {
  root: {
    backgroundColor: "transparent",
    backgroundImage: "none",
    boxShadow: "none",
  },
};

interface NFTTokenInfoAccordionStatsProps {
  stats: NFTTokenStat[];
}

export default function NFTTokenInfoAccordionStats(props: NFTTokenInfoAccordionStatsProps) {
  const { stats } = props;

  return (
    <List sx={sxStyles.root}>
      {stats.map(stat => (
        <NFTTokenInfoAccordionStatsItem property={stat.name} value={stat.value} maxValue={stat.maxValue} key={stat.name} />
      ))}
    </List>
  );
}
