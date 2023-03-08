import { MouseEvent, ChangeEvent, useState } from "react";
import capitalize from "lodash/capitalize";
import { parseUnits } from "ethers/lib/utils";

import { Theme, Box, Stack, Button, Collapse, Link, paperClasses, inputBaseClasses, Typography } from "@mui/material";

import { formatAmount } from "ui/common/utils";

import {
  FeePreference,
  FeeConfiguration,
  feePreferences,
  getFeeEstimatedSecondsPresentation,
  getUpdatedFeeConfiguration,
  defaultFeePreference,
  getUpdatedFeeFields,
} from "ui/common/fee";

import { useNativeTokenMarketTicker } from "ui/hooks";

import IconExpandMore from "ui/components/styled/IconExpandMore";
import ExpandButton from "ui/components/styled/ExpandButton";
import DialogBase from "ui/components/common/DialogBase";
import FormField from "ui/components/form/FormField";

import FeeToggleButtonGroup from "./FeeToggleButtonGroup";
import FeeToggleButton from "./FeeToggleButton";

const sxStyles = {
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

function handleEventInput(value: string): string {
  if (!value.trim()) return "0";

  return Number.isNaN(Number(value)) ? "0" : value;
}

export interface FeeModalProps {
  onClose: () => void;
  networkIdentifier: string;
  onFeeSelect: (fee: FeeConfiguration) => void;
  selectedFee?: FeeConfiguration | null;
}

export default function FeeModal(props: FeeModalProps) {
  const { onClose, networkIdentifier, onFeeSelect: onNetworkFeeSelect, selectedFee: selectedNetworkFee } = props;

  const [expanded, setExpanded] = useState(false);
  const [configuration, setConfiguration] = useState<FeeConfiguration | null>(selectedNetworkFee ?? null);

  const ticker = useNativeTokenMarketTicker(networkIdentifier);

  const handleChangeFeePreference = (event: MouseEvent<HTMLElement>, newFeePreference: FeePreference | null) => {
    if (newFeePreference !== null && configuration) {
      setConfiguration(config => {
        if (!config) throw new Error("Missing configuration");

        return getUpdatedFeeConfiguration(config, newFeePreference, ticker);
      });
    }
  };

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  const handleGasLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfiguration(config => {
      if (!config) throw new Error("Missing configuration");

      return getUpdatedFeeConfiguration(
        {
          ...config,
          gasLimit: handleEventInput(event.target.value),
        },
        config.preference,
        ticker,
      );
    });
  };

  const handleMaxBaseFeeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setConfiguration(config => {
      if (!config) throw new Error("Missing configuration");

      const { feeNativeAsset, feeUSD } = getUpdatedFeeFields(
        {
          baseFee: config.baseFee,
          gasLimit: config.gasLimit,
          maxPriorityFeePerGas: config.maxPriorityFeePerGas,
        },
        ticker,
      );

      return {
        ...config,
        maxFeePerGas: parseUnits(value, "gwei").toString(),
        feeNativeAsset,
        feeUSD,
      };
    });
  };

  const handlePriorityFeeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    setConfiguration(config => {
      if (!config) throw new Error("Missing configuration");

      try {
        const { feeNativeAsset, feeUSD } = getUpdatedFeeFields(
          {
            baseFee: config.baseFee,
            gasLimit: config.gasLimit,
            maxPriorityFeePerGas: value,
          },
          ticker,
        );

        return {
          ...config,
          maxPriorityFeePerGas: value,
          feeNativeAsset,
          feeUSD,
        };
      } catch (error) {
        return config;
      }
    });
  };

  const handleSave = () => {
    if (!configuration) throw new Error("Missing configuration");

    onNetworkFeeSelect(configuration);
    onClose();
  };

  const { color: timeColor, text: timeText } = getFeeEstimatedSecondsPresentation(configuration?.time ?? 0);

  return (
    <DialogBase
      open
      onClose={onClose}
      title={
        <>
          <Typography variant="headingSmall" align="center">
            Edit Fee
          </Typography>{" "}
          <Stack mt={2.5} direction="row" alignItems="center" justifyContent="center">
            <FeeToggleButtonGroup
              size="small"
              value={configuration?.preference ?? defaultFeePreference}
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
          <Typography variant="headingMedium" align="center">
            ~${formatAmount(configuration?.feeUSD ?? 0)}
          </Typography>
          <Stack mt="13px" direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="medium" color="text.secondary">
              Max fee:
            </Typography>
            <Typography variant="medium" align="right">
              {configuration ? `$${formatAmount(configuration.feeUSD)} (${formatAmount(configuration.feeNativeAsset)} ETH)` : "--"}
            </Typography>
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
            sx={{ mt: "34px", mx: "auto", mb: "4px" }}
            endIcon={<IconExpandMore expand={expanded} aria-expanded={expanded} aria-label="Advanced" />}
            onClick={handleExpandToggle}
          >
            Advanced
          </ExpandButton>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box width={1} mt={1.5}>
              <FormField
                type="number"
                name="gasLimit"
                label="Gas limit"
                autoComplete="off"
                sx={sxStyles.formField}
                placeholder="Enter gas limit"
                onChange={handleGasLimitChange}
                value={configuration?.gasLimit ?? ""}
              />
            </Box>
            <Box width={1} mt="21px">
              <FormField
                type="number"
                name="maxBaseFee"
                autoComplete="off"
                label="Max base fee"
                sx={sxStyles.formField}
                placeholder="Enter max base fee"
                onChange={handleMaxBaseFeeChange}
                value={configuration?.maxFeePerGas ?? ""}
              />
            </Box>
            <Box width={1} mt="21px">
              <FormField
                type="number"
                name="priorityFee"
                autoComplete="off"
                label="Priority fee"
                sx={sxStyles.formField}
                placeholder="Enter priority limit"
                onChange={handlePriorityFeeChange}
                value={configuration?.maxPriorityFeePerGas}
              />
            </Box>
            <Typography variant="medium" mt={2.5} align="center">
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
        <Button fullWidth variant="contained" onClick={handleSave}>
          Save
        </Button>
      }
    />
  );
}
