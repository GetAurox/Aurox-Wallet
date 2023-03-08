import { memo, useLayoutEffect, useRef } from "react";
import clsx from "clsx";

import { Box, Theme, Typography, TypographyProps } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { abbreviateValue, applyDelimiter, getDecimalPlaces, getTrailingZeroFadeParts } from "ui/common/numeric";
import { ImperativeTicker, TickerData, useImperativeTicker } from "ui/common/connections";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    whiteSpace: "pre",
  },
  significant: {
    whiteSpace: "pre",
  },
  zeroes: {
    opacity: 0.1,
    whiteSpace: "pre",
  },
  exotic: {
    whiteSpace: "pre",
    fontWeight: 500,
  },
  whiteSpace: {
    opacity: 0,
    whiteSpace: "pre",
  },
  up: {
    color: theme.palette.success.main,
    fontWeight: 500,
  },
  down: {
    color: theme.palette.error.main,
    fontWeight: 500,
  },
  hide: {
    opacity: 0,
  },
}));

export interface TickerPriceProps extends Omit<TypographyProps, "align"> {
  pairId?: number | null;
  ticker?: ImperativeTicker | null;
  target?: keyof TickerData;
  prefix?: string;
  suffix?: string;
  insertSpaceAfterPrefix?: boolean;
  insertSpaceBeforeSuffix?: boolean;
  align?: boolean;
  signArrow?: boolean;
  colorBySign?: boolean;
  alleviateThrashing?: boolean;
  decimalPoints?: number;
  alignmentLength?: number;
  fadeZeroes?: boolean;
  convert?: number;
  thousandsDelimiter?: boolean;
  abbreviateThreshold?: number;
  abbreviate?: boolean;
  abbreviateDecimals?: number;
  reduce?: (ticker: TickerData, pairId: number) => number;
  formatter?: (value: number) => string;
  hideAllBeforeShowPrice?: boolean;
}

export default memo(function TickerPrice(props: TickerPriceProps) {
  const {
    pairId,
    ticker,
    target,
    prefix,
    suffix,
    insertSpaceAfterPrefix,
    insertSpaceBeforeSuffix,
    align,
    signArrow,
    colorBySign,
    alleviateThrashing,
    decimalPoints,
    alignmentLength,
    fadeZeroes,
    convert,
    thousandsDelimiter,
    abbreviateThreshold,
    abbreviate,
    abbreviateDecimals,
    reduce,
    formatter,
    hideAllBeforeShowPrice,
    ...typographyProps
  } = props;

  const classes = useStyles();

  const rootRef = useRef<HTMLSpanElement>(null);
  const significantRef = useRef<HTMLSpanElement>(null);
  const fadeRef = useRef<HTMLSpanElement>(null);
  const exoticRef = useRef<HTMLSpanElement>(null);

  const maxDecimalPointsRef = useRef<number | null>(null);

  const imperative = useImperativeTicker(ticker ?? pairId ?? null);

  useLayoutEffect(() => {
    if (imperative) {
      const update = () => {
        let value = reduce
          ? reduce(imperative.current, imperative.pairId)
          : convert
          ? convert * imperative.current[target ?? "price"]
          : imperative.current[target ?? "price"];

        const arrow = !signArrow ? "" : value < 0 ? "▼ " : value > 0 ? "▲ " : "  ";
        let sign = "";

        const forceAbbreviate = typeof abbreviateThreshold === "number" && Math.abs(value) >= abbreviateThreshold;

        if (rootRef.current) {
          rootRef.current.classList.remove(classes.hide, classes.up, classes.down);

          if (colorBySign) {
            if (value > 0) {
              rootRef.current.classList.add(classes.up);
            }

            if (value < 0) {
              rootRef.current.classList.add(classes.down);
            }
          }

          if (forceAbbreviate || abbreviate) {
            rootRef.current.title = value.toFixed(decimalPoints);
          } else {
            rootRef.current.title = "";
          }
        }

        if (target === "change24H" || target === "change24HPercent") {
          sign = value > 0 ? "+" : value < 0 ? "-" : " ";
          value = Math.abs(value);
        }

        if (formatter) {
          if (significantRef.current) {
            significantRef.current.textContent = formatter(value);
          }
        } else if (forceAbbreviate || abbreviate) {
          const abbreviated = abbreviateValue(value, abbreviateDecimals ?? 2);

          const { significant, zeroes } = getTrailingZeroFadeParts(
            abbreviated.value,
            abbreviateDecimals ?? 2,
            alignmentLength ? alignmentLength - 1 : 6, // We the unit will occupy an extra space
            true,
            sign,
          );

          if (significantRef.current) {
            significantRef.current.textContent = fadeZeroes ? `${arrow}${significant}` : `${arrow}${significant}${zeroes}`;
          }

          if (fadeRef.current) {
            fadeRef.current.textContent = fadeZeroes ? zeroes : "";
          }

          if (exoticRef.current) {
            exoticRef.current.textContent = abbreviated.unit ?? " ";
          }
        } else if (align && typeof decimalPoints === "number" && typeof alignmentLength === "number") {
          const { significant, zeroes } = getTrailingZeroFadeParts(value, decimalPoints, alignmentLength, thousandsDelimiter, sign);

          if (significantRef.current) {
            significantRef.current.textContent = fadeZeroes ? `${arrow}${significant}` : `${arrow}${significant}${zeroes}`;
          }

          if (fadeRef.current) {
            fadeRef.current.textContent = fadeZeroes ? zeroes : "";
          }

          if (exoticRef.current) {
            exoticRef.current.textContent = "";
          }
        } else {
          const truncated = Number(value.toFixed(decimalPoints ?? (target === "change24HPercent" ? 2 : 8)));

          const decimalPlaces = getDecimalPlaces(truncated);

          let result = applyDelimiter(`${truncated}`, thousandsDelimiter ?? false);

          if (typeof alignmentLength === "number") {
            result = result.padStart(alignmentLength);
          }

          if (fadeRef.current) {
            fadeRef.current.textContent = "";

            if (alleviateThrashing && maxDecimalPointsRef.current !== null) {
              if (maxDecimalPointsRef.current > decimalPlaces) {
                if (decimalPlaces === 0) {
                  fadeRef.current.textContent = "." + "0".repeat(maxDecimalPointsRef.current);
                } else {
                  fadeRef.current.textContent = "0".repeat(maxDecimalPointsRef.current - decimalPlaces);
                }
              }
            }
          }

          if (significantRef.current) {
            significantRef.current.textContent = `${arrow}${sign}${result}`;

            maxDecimalPointsRef.current = Math.max(maxDecimalPointsRef.current ?? decimalPlaces, decimalPlaces);
          }

          if (exoticRef.current) {
            exoticRef.current.textContent = "";
          }
        }
      };

      update();

      imperative.events.addListener("change", update);

      return () => {
        imperative.events.removeListener("change", update);

        maxDecimalPointsRef.current = null;
      };
    }
  }, [imperative, convert, target, decimalPoints, thousandsDelimiter, align, alignmentLength, fadeZeroes, alleviateThrashing, signArrow, classes.up, classes.down, classes.hide, formatter, colorBySign, abbreviate, abbreviateDecimals, reduce, abbreviateThreshold]);

  return (
    <Typography
      variant="medium"
      ref={rootRef}
      className={clsx(classes.root, { [classes.hide]: hideAllBeforeShowPrice })}
      {...typographyProps}
    >
      {prefix || ""}
      {prefix && insertSpaceAfterPrefix ? (
        <Box component="span" className={classes.whiteSpace}>
          {" "}
        </Box>
      ) : (
        ""
      )}
      <Box component="span" className={classes.significant} ref={significantRef} />
      <Box component="span" className={classes.zeroes} ref={fadeRef} />
      <Box component="span" className={classes.exotic} ref={exoticRef} />
      {target === "change24HPercent" && "%"}
      {suffix && insertSpaceBeforeSuffix ? (
        <Box component="span" className={classes.whiteSpace}>
          {" "}
        </Box>
      ) : (
        ""
      )}
      {suffix || ""}
    </Typography>
  );
});
