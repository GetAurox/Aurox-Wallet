import { List } from "@mui/material";

import { NFTTokenLevel } from "common/types";

import NFTTokenInfoAccordionLevelsItem from "./NFTTokenInfoAccordionLevelsItem";

const sxStyles = {
  list: {
    backgroundColor: "transparent",
    backgroundImage: "none",
    boxShadow: "none",
  },
};

export interface NFTTokenInfoAccordionLevelsProps {
  levels: NFTTokenLevel[];
}

export default function NFTTokenInfoAccordionLevels(props: NFTTokenInfoAccordionLevelsProps) {
  const { levels } = props;

  return (
    <List sx={sxStyles.list}>
      {levels.map(level => (
        <NFTTokenInfoAccordionLevelsItem property={level.name} value={level.value} maxValue={level.maxValue} key={level.name} />
      ))}
    </List>
  );
}
