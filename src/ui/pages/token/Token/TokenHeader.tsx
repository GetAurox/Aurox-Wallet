import { Stack, IconButton, Alert, Typography } from "@mui/material";

import { ArrowBackIos as ArrowBackIosIcon } from "@mui/icons-material";

import { formatPrice, formatPercents, mixSx } from "ui/common/utils";
import { useHistoryGoBack } from "ui/common/history";

import FixedPanel from "ui/components/layout/misc/FixedPanel";
import TokenAvatar from "ui/components/common/TokenAvatar";
import { TokenDisplayWithTicker } from "ui/types";

const sxStyles = {
  wrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    px: 2,
    py: 0.75,
    bgcolor: "background.default",
  },
  button: {
    position: "absolute",
    top: 16,
    padding: 0,
    borderRadius: 0,
  },
  alert: {
    borderRadius: "10px",
  },
  backButton: {
    left: 16,
  },
  favoriteButton: {
    right: 16,
  },
  backButtonIcon: {
    width: 22,
    height: 22,
    fontSize: 22,
  },
  favoriteButtonIcon: {
    width: 24,
    height: 24,
    fontSize: 24,
  },
  token: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
};

const getPriceChangeColor = (priceChange24Hours: number | string) =>
  Number(priceChange24Hours) > 0 ? "success.main" : Number(priceChange24Hours) < 0 ? "error.main" : "text.secondary";

export interface TokenHeaderProps {
  token: TokenDisplayWithTicker | null;
  showNetworkIconOnAvatar?: boolean;
}

export default function TokenHeader(props: TokenHeaderProps) {
  const { token, showNetworkIconOnAvatar } = props;

  const goBack = useHistoryGoBack();

  return (
    <FixedPanel variant="top" disablePortal>
      <Stack direction="row" sx={sxStyles.wrap}>
        <IconButton color="primary" sx={mixSx(sxStyles.button, sxStyles.backButton)} disableRipple onClick={goBack}>
          <ArrowBackIosIcon sx={sxStyles.backButtonIcon} />
        </IconButton>
        {token && (
          <Stack direction="row" gap={1.5} sx={sxStyles.token}>
            <TokenAvatar
              {...token.img}
              tokenIconSize={28}
              networkIconSize={16}
              networkIdentifier={showNetworkIconOnAvatar ? token.networkIdentifier : undefined}
            />
            <Stack>
              <Typography variant="headingSmall" fontSize={14} lineHeight={20 / 14} noWrap>
                {token.name}
              </Typography>
              {token.priceUSD !== null && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Typography variant="small" letterSpacing="normal">
                    ${formatPrice(token.priceUSD)}
                  </Typography>
                  <Typography
                    variant="medium"
                    fontSize={12}
                    lineHeight={14 / 12}
                    color={getPriceChangeColor(token.priceChange24HPercent ?? 0)}
                  >
                    {formatPercents(token.priceChange24HPercent ?? 0)}%
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Stack>
        )}
        {!token && (
          <Alert sx={sxStyles.alert} severity="error">
            Invalid token!
          </Alert>
        )}
      </Stack>
    </FixedPanel>
  );
}
