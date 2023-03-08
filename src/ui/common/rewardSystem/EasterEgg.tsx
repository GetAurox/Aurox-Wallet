import { MouseEvent } from "react";

import { SxProps, Theme, Box, BoxProps, styled } from "@mui/material";
import { keyframes } from "@mui/system";

import { mixSx } from "../utils";

import { OneTimeCampaignId } from "./types";
import { useRewardSystemContext } from "./context";

export interface EasterEggProps extends BoxProps {
  campaignId: OneTimeCampaignId;
  blinkerSx?: SxProps<Theme>;
}

const pulsateAlpha = keyframes`
  0%: { transform: scale(1); }
  25% { transform: scale(2); }
  50% { transform: scale(2); }
  75% { transform: scale(2); }
  100% { transform: scale(1); }
`;

const pulsateBeta = keyframes`
  0%: { transform: scale(1); }
  25% { transform: scale(2); }
  50% { transform: scale(3); }
  75% { transform: scale(2); }
  100% { transform: scale(1); }
`;

const Blinker = styled(Box)(({ theme }) => ({
  ["&.MuiBox-root"]: {
    zIndex: 2,
    position: "absolute",
    width: "6px",
    height: "6px",
    borderRadius: "3px",
    backgroundColor: theme.palette.primary.main,
    pointerEvents: "none",

    "&::before, &::after": {
      // eslint-disable-next-line quotes
      content: '" "',
      position: "absolute",
      top: 0,
      right: 0,
      width: "100%",
      height: "100%",
      borderRadius: "3px",
    },

    "&::before": {
      zIndex: 1,
      backgroundColor: "rgba(44, 129, 252, 0.45)",
      animation: `${pulsateAlpha} infinite 1s linear`,
    },

    "&::after": {
      zIndex: 0,
      backgroundColor: "rgba(44, 129, 252, 0.25)",
      animation: `${pulsateBeta} infinite 1s linear`,
    },
  },
}));

export function EasterEgg(props: EasterEggProps) {
  const { campaignId, blinkerSx, children, ...rest } = props;

  const { oneTimeCampaignIdsTriggered, triggerOneTimeCampaign, rewards } = useRewardSystemContext();

  const isTriggered = oneTimeCampaignIdsTriggered.has(campaignId);

  const handleBlinkerClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  if (isTriggered || rewards === null) {
    return <>{children}</>;
  }

  return (
    <Box position="relative" component="span" onClick={() => triggerOneTimeCampaign(campaignId)} {...rest}>
      <Blinker component="span" title="Click to get reward" sx={mixSx({ top: 0, right: 0 }, blinkerSx)} onClick={handleBlinkerClick} />
      {children}
    </Box>
  );
}
