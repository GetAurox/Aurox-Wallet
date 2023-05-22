import { Fragment, useMemo, useState, MouseEvent } from "react";
import { Button, Stack, Typography } from "@mui/material";

import { IconChevronRight } from "ui/components/icons";

import { TokenDisplayWithTicker } from "ui/types";

import SwapRouteModal from "./SwapRouteModal";
import { getSwapRoute } from "./mock";
import { getTokenSwapRouteStages, normalizeTokenSwapRouteStages } from "./utils";

export interface SwapRoutesProps {
  from: TokenDisplayWithTicker;
  to: TokenDisplayWithTicker;
}

export default function SwapRoutes(props: SwapRoutesProps) {
  const { from, to } = props;

  const [open, setOpen] = useState(false);

  const swapRoute = useMemo(
    () => getSwapRoute({ img: from.img, symbol: from.symbol, name: from.name }, { img: to.img, symbol: to.symbol, name: to.name }),
    [from.img, from.symbol, from.name, to.img, to.symbol, to.name],
  );

  const swapRouteStages = getTokenSwapRouteStages(swapRoute);

  const normalizedSwapRouteStages = normalizeTokenSwapRouteStages(swapRouteStages);

  const handleOpenRouteModal = (event: MouseEvent) => {
    event.preventDefault();

    setOpen(true);
  };

  const handleCloseRouteModal = () => {
    setOpen(false);
  };
  return (
    <>
      <Stack mt="17px" px={2} direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="medium" color="text.secondary">
          Route
        </Typography>
        <Stack direction="row" alignItems="center">
          {swapRouteStages && normalizedSwapRouteStages && (
            <Button onClick={handleOpenRouteModal} title={swapRouteStages.join(" > ")}>
              <Stack direction="row" alignItems="center" component="span">
                {normalizedSwapRouteStages.map((name, index) => (
                  <Fragment key={index}>
                    {index > 0 && <IconChevronRight />}
                    <Typography variant="medium" maxWidth={60} overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                      {name}
                    </Typography>
                  </Fragment>
                ))}
              </Stack>
            </Button>
          )}
        </Stack>
      </Stack>
      {swapRoute && open && <SwapRouteModal onClose={handleCloseRouteModal} swapRoute={swapRoute} />}
    </>
  );
}
