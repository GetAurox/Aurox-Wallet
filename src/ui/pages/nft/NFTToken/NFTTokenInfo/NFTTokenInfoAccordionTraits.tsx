import { List } from "@mui/material";

import { NFTTrait } from "ui/types";

import NFTTokenInfoAccordionTraitsItem from "./NFTTokenInfoAccordionTraitsItem";

const sxStyles = {
  root: {
    backgroundColor: "transparent",
    backgroundImage: "none",
    boxShadow: "none",
    padding: 0,
  },
};

export interface NFTTokenInfoAccordionTraitsProps {
  traits: NFTTrait[];
}

export default function NFTTokenInfoAccordionTraits(props: NFTTokenInfoAccordionTraitsProps) {
  const { traits } = props;

  return (
    <List sx={sxStyles.root}>
      {traits.map(trait => (
        <NFTTokenInfoAccordionTraitsItem
          primaryText={trait.type}
          secondaryText={trait.value}
          value={trait.traitPercentage}
          key={trait.value}
        />
      ))}
    </List>
  );
}
