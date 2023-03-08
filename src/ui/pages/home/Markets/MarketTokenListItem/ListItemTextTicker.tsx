import { memo } from "react";

import { Stack } from "@mui/material";

import { formatPrice } from "ui/common/utils";
import { ImperativeTicker } from "ui/common/connections";

import TickerPrice from "ui/components/common/TickerPrice";

export interface ListItemTextTickerProps {
  ticker: ImperativeTicker | null;
}

export default memo(function ListItemTextTicker(props: ListItemTextTickerProps) {
  const { ticker } = props;

  return (
    <Stack direction="row" justifyContent="end">
      <TickerPrice ticker={ticker} prefix="$" suffix=" " target="price" hideAllBeforeShowPrice formatter={formatPrice} />
      <TickerPrice
        align
        prefix="("
        suffix=")"
        fadeZeroes
        colorBySign
        ticker={ticker}
        hideAllBeforeShowPrice
        target="change24HPercent"
        abbreviateThreshold={1000}
      />
    </Stack>
  );
});
