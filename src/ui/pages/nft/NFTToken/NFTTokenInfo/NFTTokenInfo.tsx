import { Accordion, AccordionDetails, AccordionSummary, Divider, Typography } from "@mui/material";

import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

import { EthereumAccountNFT } from "ui/types";

import NotFound from "ui/components/common/NotFound";

import NFTTokenInfoAccordionTraits from "./NFTTokenInfoAccordionTraits";

const sxStyles = {
  root: {
    backgroundColor: "transparent",
    backgroundImage: "none",
    boxShadow: "none",
    "&:before": {
      backgroundColor: "transparent",
    },
  },
  list: {
    py: 0,
    display: "flex",
    flexDirection: "column",
  },
  button: {
    margin: "0 16px 12px 16px",
  },
  accordionHeader: {
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "24px",
    letterSpacing: "0.15px",
  },
  accordionDetails: {
    padding: "0px 16px",
  },
  accordionSummary: {
    "& .MuiAccordionSummary-content": {
      margin: "17px 0 15px 0",
    },
  },
};

export interface NFTTokenInfoProps {
  nft: EthereumAccountNFT;
}

export default function NFTTokenInfo(props: NFTTokenInfoProps) {
  const { nft } = props;

  const hasTraits = !!nft.metadata?.traits?.length;
  const hasDescription = !!nft.metadata?.description;

  if (!hasTraits && !hasDescription) {
    return <NotFound height={100} mt={2.5} />;
  }

  return (
    <>
      {nft.metadata?.description && (
        <Accordion sx={sxStyles.root}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ mr: "2px" }} />}
            aria-controls="panel-description-content"
            id="panel-description"
            sx={sxStyles.accordionSummary}
          >
            <Typography sx={sxStyles.accordionHeader}>Description</Typography>
          </AccordionSummary>
          <AccordionDetails sx={sxStyles.accordionDetails}>
            <Typography>{nft.metadata.description}</Typography>
          </AccordionDetails>
        </Accordion>
      )}
      <Divider variant="middle" />
      {nft.metadata?.traits && (
        <Accordion sx={sxStyles.root}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-properties-content"
            id="panel-properties"
            sx={sxStyles.accordionSummary}
          >
            <Typography sx={sxStyles.accordionHeader}>Properties</Typography>
          </AccordionSummary>
          <AccordionDetails sx={sxStyles.accordionDetails}>
            <NFTTokenInfoAccordionTraits traits={nft.metadata.traits} />
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
}
