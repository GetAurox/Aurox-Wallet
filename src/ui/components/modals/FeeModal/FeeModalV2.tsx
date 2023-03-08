import { MouseEvent, useState, useEffect, useCallback, useRef } from "react";
import capitalize from "lodash/capitalize";

import { Theme, Stack, Button, Collapse, Link, paperClasses, inputBaseClasses, Typography } from "@mui/material";

import { formatAmount, formatValueFromAmountAndPrice, unformattedAmount } from "ui/common/utils";
import IconExpandMore from "ui/components/styled/IconExpandMore";
import ExpandButton from "ui/components/styled/ExpandButton";
import DialogBase from "ui/components/common/DialogBase";

import { feePreferences, getFeeEstimatedSecondsPresentation, EVMFeeManager, EVMFeePreference, TransactionType } from "ui/common/fee";
import { useNativeTokenMarketTicker, useNetworkByIdentifier } from "ui/hooks";

import NumericField from "ui/components/form/NumericField";

import FeeToggleButtonGroup from "./FeeToggleButtonGroup";
import FeeToggleButton from "./FeeToggleButton";

const sxStyles = {
  expandButton: {
    mt: "34px",
    mx: "auto",
    mb: "4px",
  },
  formField: {
    inputPaper: {
      [`&.${paperClasses.root}`]: {
        borderColor: (theme: Theme) => theme.palette.custom.grey["30"],
        backgroundColor: (theme: Theme) => theme.palette.custom.grey["30"],
      },
    },
    input: {
      [`&.${inputBaseClasses.root}`]: {
        fontSize: 14,
        lineHeight: 20 / 14,
        letterSpacing: "0.25px",
      },
    },
  },
};

export interface FeeModalPropsV2 {
  feeManager: EVMFeeManager;
  networkIdentifier: string;
  onClose: () => void;
}

export default function FeeModalV2(props: FeeModalPropsV2) {
  const { onClose, feeManager, networkIdentifier } = props;

  const [expanded, setExpanded] = useState(false);

  const network = useNetworkByIdentifier(networkIdentifier);
  const ticker = useNativeTokenMarketTicker(networkIdentifier);

  const initialStateResetRef = useRef(false);

  const [preference, setPreference] = useState<EVMFeePreference>("medium");
  const [gasPrice, setGasPrice] = useState("");
  const [gasLimit, setGasLimit] = useState("");
  const [baseFee, setBaseFee] = useState("");
  const [maxPriorityFeePerGas, setMaxPriorityFeePerGas] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType | null>(feeManager?.feeSettingsNormalized?.type ?? null);

  const resetState = useCallback(() => {
    if (!feeManager.feeSettingsNormalized) return;

    setPreference(feeManager.feePreference);

    const settings = feeManager.feeSettingsNormalized;

    if (settings.type === TransactionType.EIP1559) {
      const { gasLimit, baseFee, maxPriorityFeePerGas } = settings;

      setGasLimit(gasLimit);
      setBaseFee(baseFee as string);
      setMaxPriorityFeePerGas(maxPriorityFeePerGas as string);
    } else if (settings.type === TransactionType.Legacy) {
      const { gasPrice, gasLimit } = settings;

      setGasLimit(gasLimit);
      setGasPrice(gasPrice as string);
    }

    setTransactionType(settings.type);
  }, [feeManager]);

  useEffect(() => {
    if (!initialStateResetRef.current || feeManager.feePreference !== "custom") {
      initialStateResetRef.current = true;

      resetState();
    }
  }, [feeManager.feePriceInNativeCurrency, feeManager.feePreference, resetState]);

  const handleChangeFeePreference = (event: MouseEvent<HTMLElement>, newFeePreference: EVMFeePreference) => {
    if (!newFeePreference) return;

    feeManager.changeFeePreference(newFeePreference);

    resetState();
  };

  const handleExpandToggle = () => {
    setExpanded(value => !value);
  };

  const handleGasLimitChange = (value: string) => {
    setGasLimit(value);

    feeManager.changeGasLimit(value);
  };

  const handleBaseFeeChange = (value: string) => {
    setBaseFee(value);

    if (feeManager && feeManager.currentFeeSettings?.type === TransactionType.EIP1559) {
      feeManager.changeBaseFee(unformattedAmount(value).toString());
    }
  };

  const handlePriorityFeeChange = (value: string) => {
    setMaxPriorityFeePerGas(value);

    feeManager.changeMaxPriorityFeePerGas(unformattedAmount(value).toString());
  };

  const handleGasPriceChange = (value: string) => {
    setGasPrice(value);

    feeManager.changeGasPrice(unformattedAmount(value).toString());
  };

  const price = formatValueFromAmountAndPrice(feeManager.feePriceInNativeCurrency ?? 0, parseFloat(ticker.priceUSD ?? "0"), "~$");

  const { color: timeColor, text: timeText } = getFeeEstimatedSecondsPresentation(0);

  return (
    <DialogBase
      open
      onClose={onClose}
      title={
        <>
          <Typography component="h1" variant="headingSmall" align="center">
            Edit Fee
          </Typography>{" "}
          <Stack mt={2.5} direction="row" alignItems="center" justifyContent="center">
            <FeeToggleButtonGroup
              size="small"
              value={preference}
              exclusive
              onChange={handleChangeFeePreference}
              aria-label="fee preference"
            >
              {feePreferences.map(value => (
                <FeeToggleButton key={value} value={value} disableRipple aria-label={`${value} fee`}>
                  {capitalize(value)}
                </FeeToggleButton>
              ))}
            </FeeToggleButtonGroup>
          </Stack>
        </>
      }
      content={
        <>
          <Typography component="p" variant="headingMedium" align="center">
            {price}
          </Typography>
          <Stack mt="13px" direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="medium" color="text.secondary">
              Total fee:
            </Typography>
            <Typography variant="medium" align="right">{` ${formatAmount(feeManager.feePriceInNativeCurrency ?? 0)} ${
              network?.currencySymbol
            }`}</Typography>
          </Stack>
          <Stack mt={1.5} direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="medium" color="text.secondary">
              Time:
            </Typography>
            <Typography variant="medium" align="right" color={timeColor}>
              {timeText}
            </Typography>
          </Stack>
          <ExpandButton
            variant="text"
            disableRipple
            sx={sxStyles.expandButton}
            endIcon={<IconExpandMore expand={expanded} aria-expanded={expanded} aria-label="Advanced" />}
            onClick={handleExpandToggle}
          >
            Advanced
          </ExpandButton>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Stack mt={1.5} spacing="21px">
              <NumericField
                type="number"
                name="gasLimit"
                label="Gas limit"
                autoComplete="off"
                sx={sxStyles.formField}
                placeholder="Enter gas limit"
                value={gasLimit}
                decimals={0}
                onNumericInputChange={handleGasLimitChange}
              />
              {transactionType === TransactionType.Legacy && (
                <NumericField
                  type="number"
                  name="gasPrice"
                  autoComplete="off"
                  label="Gas price (GWEI)"
                  sx={sxStyles.formField}
                  placeholder="Enter gas price"
                  value={gasPrice}
                  decimals={9}
                  onNumericInputChange={handleGasPriceChange}
                />
              )}
              {transactionType === TransactionType.EIP1559 && (
                <>
                  <NumericField
                    type="number"
                    name="baseFee"
                    autoComplete="off"
                    label="Base fee (GWEI)"
                    sx={sxStyles.formField}
                    placeholder="Enter base fee"
                    value={baseFee}
                    decimals={9}
                    onNumericInputChange={handleBaseFeeChange}
                  />
                  <NumericField
                    type="number"
                    name="priorityFee"
                    autoComplete="off"
                    label="Priority fee (GWEI)"
                    sx={sxStyles.formField}
                    placeholder="Enter priority limit"
                    value={maxPriorityFeePerGas}
                    decimals={9}
                    onNumericInputChange={handlePriorityFeeChange}
                  />
                </>
              )}
            </Stack>
            <Typography component="p" variant="medium" mt={2.5} align="center">
              <Link
                href="https://docs.getaurox.com/product-docs/aurox-wallet-guides/gas-settings"
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                Need help?
              </Link>
            </Typography>
          </Collapse>
        </>
      }
      actions={
        <Button fullWidth variant="contained" onClick={onClose}>
          Save
        </Button>
      }
    />
  );
}
