import randomColor from "randomcolor";

import { Stack, Avatar, styled, Tooltip, tooltipClasses, TooltipProps, StackProps, Typography } from "@mui/material";

import { formatAmount, formatPrice, getAvatarAltChar, mixSx } from "ui/common/utils";
import { TokenDisplay } from "ui/types";

import { useNetworkGetter } from "ui/hooks";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 300,
      borderRadius: "10px",
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const sxStyles = {
  avatar: { width: 20, height: 20, py: 0, fontSize: 16 },
};

export interface TokenIconDisplayProps extends StackProps {
  tokens: TokenDisplay[];
}

export default function TokenIconDisplay(props: TokenIconDisplayProps) {
  const { tokens, ...stackProps } = props;

  const networkGetter = useNetworkGetter();

  return (
    <Stack direction="row" height="20px" my="7px" spacing={0.5} {...stackProps}>
      {tokens
        .sort((a, b) => Number(b.balanceUSDValue) - Number(a.balanceUSDValue))
        .slice(0, 10)
        .map(({ key, symbol, balance = "", balanceUSDValue, img, networkIdentifier }) => (
          <HtmlTooltip
            key={key}
            title={
              <Stack component="ul" m={0} p={0.5} gap={0.5}>
                <Stack direction="row" gap={0.5} component="li">
                  <Typography variant="medium" color="text.secondary">
                    Name:
                  </Typography>
                  <Typography variant="medium">{symbol}</Typography>
                </Stack>
                <Stack direction="row" gap={0.5} component="li">
                  <Typography variant="medium" color="text.secondary">
                    Network:
                  </Typography>
                  <Typography variant="medium">{networkGetter(networkIdentifier)?.name}</Typography>
                </Stack>
                <Stack direction="row" gap={0.5} component="li">
                  <Typography variant="medium" color="text.secondary">
                    Total Amount:
                  </Typography>
                  <Typography variant="medium">{formatAmount(balance ?? 0, { mantissa: 4, optionalMantissa: false })}</Typography>
                </Stack>
                {Number(balanceUSDValue) > 0 && (
                  <Stack direction="row" gap={0.5} component="li">
                    <Typography variant="medium" color="text.secondary">
                      Total Value:
                    </Typography>
                    <Typography variant="medium">${formatPrice(balanceUSDValue ?? 0, { mantissa: 2, optionalMantissa: false })}</Typography>
                  </Stack>
                )}
              </Stack>
            }
          >
            <Avatar
              src={img.src}
              alt={img.alt}
              sx={mixSx(sxStyles.avatar, {
                bgcolor: img.src
                  ? "transparent"
                  : randomColor({
                      luminosity: "bright",
                      seed: img.alt ?? "default",
                    }),
              })}
            >
              {img.alt && getAvatarAltChar(img.alt)}
            </Avatar>
          </HtmlTooltip>
        ))}
    </Stack>
  );
}
