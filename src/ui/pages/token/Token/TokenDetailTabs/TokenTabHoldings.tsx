import clsx from "clsx";

import { makeStyles } from "@mui/styles";
import { Theme } from "@mui/material";

import { formatPrice, formatAmount, formatValue, formatPercents } from "ui/common/utils";
import { TokenDisplayWithTicker } from "ui/types";

import EqualWidthSplitColumns from "ui/components/layout/misc/EqualWidthSplitColumns";
import AlertStatus from "ui/components/common/AlertStatus";
import InfoPair from "ui/components/info/InfoPair";

const useStyles = makeStyles((theme: Theme) => ({
  up: {
    color: theme.palette.success.main,
  },
  down: {
    color: theme.palette.error.main,
  },
}));

export interface TokenTabHoldingsProps {
  token: TokenDisplayWithTicker;
}

export default function TokenTabHoldings(props: TokenTabHoldingsProps) {
  const { token } = props;

  const priceChange24HPercent = Number(token.priceChange24HPercent ?? 0);

  const classes = useStyles();

  return (
    <AlertStatus info={Number(token.balance) <= 0} infoText="No holdings">
      <EqualWidthSplitColumns
        left={<InfoPair caption="Total Amount" value={`${formatAmount(token.balance)} ${token.symbol}`} />}
        right={
          <>
            <InfoPair
              caption="Value of the Holdings"
              value={token.balanceUSDValue === null ? "-" : `$${formatValue(token.balanceUSDValue)}`}
              subValue={
                token.balanceUSDValue === null ? undefined : (
                  <>
                    <span>
                      {priceChange24HPercent < 0 ? "-" : ""}$
                      {formatPrice(Math.abs((Number(token.balanceUSDValue) * priceChange24HPercent) / 100))}
                    </span>{" "}
                    <span
                      className={clsx({
                        [classes.up]: priceChange24HPercent > 0,
                        [classes.down]: priceChange24HPercent < 0,
                      })}
                    >
                      ({formatPercents(priceChange24HPercent)}
                      %)
                    </span>
                  </>
                )
              }
            />
          </>
        }
      />
    </AlertStatus>
  );
}
