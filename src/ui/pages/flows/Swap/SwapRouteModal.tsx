import { Fragment } from "react";

import { Theme, Stack, useTheme, Typography } from "@mui/material";

import TokenIdentity, { TokenIdentityIconVariant, TokenIdentityPrimaryVariant } from "ui/components/entity/token/TokenIdentity";
import DialogBase from "ui/components/common/DialogBase";

import { IconArrowDown } from "ui/components/icons";
import { TokenSwapRoute } from "common/types";

interface SwapRouteModalProps {
  swapRoute: TokenSwapRoute;
  onClose: () => void;
}

export default function SwapRouteModal(props: SwapRouteModalProps) {
  const { swapRoute, onClose } = props;

  const theme = useTheme();

  return (
    <DialogBase
      open
      onClose={onClose}
      title={
        <Typography variant="headingSmall" align="center">
          Route
        </Typography>
      }
      content={
        <Stack pt="14px" pb={3} alignItems="center" spacing={1.5}>
          {swapRoute.map((routeItem, index) => {
            const { symbol, img, protocol, percentage } = routeItem;

            let primaryVariant: TokenIdentityPrimaryVariant = "small";
            let iconVariant: TokenIdentityIconVariant = "medium";

            if (index === 0 || index === swapRoute.length - 1) {
              primaryVariant = "large";
              iconVariant = "x-large";
            }

            return (
              <Fragment key={index}>
                {index > 0 && <IconArrowDown color={theme.palette.primary.main} />}
                {protocol ? (
                  <Stack
                    py="11px"
                    px={1.5}
                    alignItems="center"
                    borderRadius="12px"
                    bgcolor={(theme: Theme) => theme.palette.custom.grey["30"]}
                    spacing={0.25}
                  >
                    <TokenIdentity {...img} primary={symbol} primaryVariant={primaryVariant} iconVariant={iconVariant} spacing={1} />
                    <Typography variant="medium" color="text.secondary" align="center">
                      {protocol}
                      {percentage ? ` ${percentage}%` : null}
                    </Typography>
                  </Stack>
                ) : (
                  <TokenIdentity {...img} primary={symbol} primaryVariant={primaryVariant} iconVariant={iconVariant} spacing={1} />
                )}
              </Fragment>
            );
          })}
        </Stack>
      }
    />
  );
}
