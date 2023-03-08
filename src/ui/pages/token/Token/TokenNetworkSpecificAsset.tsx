import { Alert, Box, Button, buttonClasses, IconButton, Stack, Tooltip, Typography } from "@mui/material";

import { isNativeAsset } from "common/utils";

import { useHistoryPush } from "ui/common/history";
import { useTokenAssetTicker, useTokenMarketDetails } from "ui/hooks";

import { IconInfo } from "ui/components/icons";
import TokenLinks from "ui/components/entity/token/TokenLinks";
import TokenSocials from "ui/components/entity/token/TokenSocials";
import CustomControls from "ui/components/controls/CustomControls";
import TokenPriceChart from "ui/components/charting/TokenPriceChart";

import TokenStats from "./sections/TokenStats";
import TokenAbout from "./sections/TokenAbout";
import TokenNetwork from "./sections/TokenNetwork";

import TokenHeader from "./TokenHeader";
import TokenDetailTabs from "./TokenDetailTabs";
import { TokenSectionWrapper } from "./TokenSectionWrapper";

const sxStyles = {
  alert: {
    borderRadius: "10px",
    margin: 2,
  },
  fixedPanel: {
    mt: 3.5,
  },
  infoIconButton: {
    p: 0,
  },
  primaryButton: {
    [`&.${buttonClasses.endIcon}`]: {
      ml: 0.5,
    },
  },
  secondaryButton: {
    flex: 1,
  },
  tooltip: {
    ml: 2,
    maxWidth: "none",
    mb: "24px !important",
  },
};

export interface TokenNetworkSpecificAssetProps {
  assetKey: string;
}

export default function TokenNetworkSpecificAsset(props: TokenNetworkSpecificAssetProps) {
  const { assetKey } = props;

  const push = useHistoryPush();
  const token = useTokenAssetTicker(assetKey);
  const { tokenDetails } = useTokenMarketDetails(assetKey);

  const verified = token.verified || isNativeAsset(token.assetIdentifier);

  const handleSwap = () => {
    // push("/swap", { fromAssetKey: token.key });
    push("/", { section: "swap" });
  };

  const handleSend = () => {
    push("/send", { assetKey: token.key });
  };

  return (
    <>
      <TokenHeader token={token} showNetworkIconOnAvatar />
      <TokenPriceChart pairId={token.pairId} />
      {!verified && (
        <Alert sx={sxStyles.alert} severity="warning">
          {token.symbol} is not an Aurox approved token. If you do not know where you received or purchased this token, avoid interacting
          with it.
        </Alert>
      )}
      <TokenDetailTabs token={token} />

      <Stack p={2} rowGap={3.75}>
        <TokenSectionWrapper title="Network">
          <TokenNetwork token={token} />
        </TokenSectionWrapper>
        {tokenDetails && (
          <TokenSectionWrapper title="Stats">
            <TokenStats details={tokenDetails} price={token.priceUSD} decimals={token.decimals} />
          </TokenSectionWrapper>
        )}
        {tokenDetails?.description && (
          <TokenSectionWrapper title="About">
            <TokenAbout description={tokenDetails?.description} />
          </TokenSectionWrapper>
        )}
        {tokenDetails?.links && (
          <TokenSectionWrapper title="Links">
            <TokenLinks links={tokenDetails?.links} />
          </TokenSectionWrapper>
        )}
        {tokenDetails?.socials && tokenDetails.socials.length > 0 && (
          <TokenSectionWrapper title="Social Media">
            <TokenSocials socials={tokenDetails.socials} />
          </TokenSectionWrapper>
        )}
      </Stack>

      <CustomControls
        spacerSx={sxStyles.fixedPanel}
        primary={
          <Tooltip
            PopperProps={{ disablePortal: true }}
            componentsProps={{ tooltip: { sx: sxStyles.tooltip } }}
            title={
              <Typography variant="medium" textAlign="center">
                Gasless swapping is being finished & will be available soon.
              </Typography>
            }
          >
            <Box height="fitContent" flex={1} component="span">
              <Button
                sx={sxStyles.primaryButton}
                endIcon={
                  <IconButton sx={sxStyles.infoIconButton} color="primary">
                    <IconInfo />
                  </IconButton>
                }
                variant="contained"
                fullWidth
                onClick={handleSwap}
                disabled
              >
                Swap
              </Button>
            </Box>
          </Tooltip>
        }
        secondary={
          <Button variant="outlined" sx={sxStyles.secondaryButton} onClick={handleSend}>
            Send
          </Button>
        }
      />
    </>
  );
}
