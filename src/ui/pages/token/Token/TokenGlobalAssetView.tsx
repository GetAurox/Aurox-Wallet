import { Box, Button, IconButton, Stack, Tooltip, Typography, buttonClasses } from "@mui/material";

import { TokenDisplayWithTicker } from "ui/types";
import { useActiveAccount, useTokenAssetTicker, useTokenMarketDetails } from "ui/hooks";

import { useHistoryPush } from "ui/common/history";

import { IconInfo } from "ui/components/icons";
import TokenLinks from "ui/components/entity/token/TokenLinks";
import TokenSocials from "ui/components/entity/token/TokenSocials";
import TokenPriceChart from "ui/components/charting/TokenPriceChart";
import CustomControls from "ui/components/controls/CustomControls";

import TokenStats from "./sections/TokenStats";
import TokenAbout from "./sections/TokenAbout";

import TokenHeader from "./TokenHeader";
import TokenBalances from "./TokenBalances";
import { TokenSectionWrapper } from "./TokenSectionWrapper";

const sxStyles = {
  fixedPanel: {
    mt: 3.5,
  },
  button: {
    flex: 1,
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
  balances: TokenDisplayWithTicker[];
}

export default function TokenGlobalAssetView(props: TokenNetworkSpecificAssetProps) {
  const { assetKey, balances } = props;

  const push = useHistoryPush();
  const token = useTokenAssetTicker(assetKey);
  const { tokenDetails } = useTokenMarketDetails(assetKey);
  const activeAccount = useActiveAccount();

  const isHardwareWallet = activeAccount?.type === "hardware";

  const handleBuy = () => {
    push("/swap", { toAssetKey: token.key });
  };

  return (
    <>
      <TokenHeader token={token} />
      <TokenPriceChart pairId={token.pairId} />
      {balances && <TokenBalances balances={balances} />}

      <Stack p={2} rowGap={3.75}>
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
          isHardwareWallet ? (
            <Tooltip
              PopperProps={{ disablePortal: true }}
              componentsProps={{ tooltip: { sx: sxStyles.tooltip } }}
              title={
                <Typography variant="medium" textAlign="center">
                  Swapping with Hardware Wallets will be supported soon
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
                  onClick={handleBuy}
                  disabled
                >
                  Buy
                </Button>
              </Box>
            </Tooltip>
          ) : (
            <Button variant="outlined" sx={sxStyles.button} onClick={handleBuy}>
              Buy
            </Button>
          )
        }
      />
    </>
  );
}
