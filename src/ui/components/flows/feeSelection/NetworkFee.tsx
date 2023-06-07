import { useState, MouseEvent, useMemo } from "react";
import isEmpty from "lodash/isEmpty";
import produce from "immer";
import Decimal from "decimal.js";

import { Stack, Link, CircularProgress, Typography, StackProps } from "@mui/material";

import { EVMFeeStrategy } from "ui/common/fee";
import { formatValueFromAmountAndPrice } from "ui/common/utils";

import InfoTooltip from "ui/components/info/InfoTooltip";
import FeeModal from "ui/components/modals/FeeModal/FeeModal";

import { useLocalUserPreferences, useNativeTokenMarketTicker, useNetworkByIdentifier } from "ui/hooks";
import { TokenDisplayWithTicker } from "ui/types";

const defaultInfoText =
  "Approximate network fee to submit the transaction to the selected blockchain. This fee is paid to the miners/stakers of the blockchain so that your transaction can be processed.";

export interface NetworkFeeProps extends StackProps {
  networkIdentifier: string;
  feeManager: EVMFeeStrategy | null;
  gasless?: boolean;
  token?: TokenDisplayWithTicker;
  title?: string;
  infoText?: string;
  infoIconPosition?: "prefix" | "suffix";
}

export default function NetworkFee(props: NetworkFeeProps) {
  const {
    feeManager,
    networkIdentifier,
    gasless,
    token,
    title = "Network Fee:",
    infoText = defaultInfoText,
    infoIconPosition = "suffix",
    ...stackProps
  } = props;

  const network = useNetworkByIdentifier(networkIdentifier);
  const ticker = useNativeTokenMarketTicker(networkIdentifier);
  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const [openFeeModal, setOpenFeeModal] = useState(false);

  const isEstimating = feeManager && !feeManager.feeSettingsForEthereum;

  const handleOpenFeeModal = (event: MouseEvent) => {
    event.preventDefault();

    setOpenFeeModal(true);
  };

  const handleCloseFeeModal = () => {
    setOpenFeeModal(false);
  };

  const handleDisableGasPresets = (event: MouseEvent) => {
    event.preventDefault();

    if (!general || !general.gasPresets) {
      return;
    }

    setUserPreferences(
      produce(draft => {
        if (!draft.general || !draft.general.gasPresets) {
          return draft;
        }

        draft.general.gasPresets[networkIdentifier].enabled = false;
      }),
    );
  };

  const priceField = useMemo(() => {
    if (ticker.priceUSD && feeManager?.feePriceInNativeCurrency) {
      return formatValueFromAmountAndPrice(feeManager.feePriceInNativeCurrency, parseFloat(ticker.priceUSD), "~$");
    }

    if (feeManager?.feePriceInNativeCurrency && network) {
      return `~${feeManager.feePriceInNativeCurrency} ${network.currencySymbol}`;
    }

    return "--";
  }, [feeManager?.feePriceInNativeCurrency, network, ticker.priceUSD]);

  const { general } = userPreferences;

  const feePreference = feeManager?.feePreference ?? "medium";

  const showCustomGasWarning = useMemo(() => {
    if (!general || !general.gasPresets) {
      return false;
    }
    const isCorrectPreference = feePreference !== "custom";

    const gasPresets = general.gasPresets[networkIdentifier];

    return gasPresets?.enabled && isCorrectPreference && !isEmpty(gasPresets[feePreference]);
  }, [feePreference, general, networkIdentifier]);

  const tokenAmount = useMemo(() => {
    let fee: string | null = null;

    if (ticker.priceUSD && feeManager?.feePriceInNativeCurrency) {
      fee = formatValueFromAmountAndPrice(feeManager.feePriceInNativeCurrency, parseFloat(ticker.priceUSD));
    } else if (feeManager?.feePriceInNativeCurrency && network) {
      fee = feeManager.feePriceInNativeCurrency.toString();
    }

    if (fee && token?.priceUSD && Number(token.priceUSD) > 0) {
      return new Decimal(fee).div(token.priceUSD).toDP(token.decimals).toFixed(2);
    }

    return null;
  }, [feeManager, network, ticker.priceUSD, token]);

  return (
    <>
      <Stack mt={1.5} direction="row" alignItems="center" justifyContent="space-between" {...stackProps}>
        <Stack direction="row" alignItems="center" columnGap={0.25}>
          {infoIconPosition === "suffix" && (
            <Typography variant="medium" color="text.secondary">
              {title}
            </Typography>
          )}
          <InfoTooltip>
            <Stack rowGap={1}>
              <Typography variant="large">{infoText}</Typography>
              <Link
                variant="medium"
                href="https://docs.getaurox.com/product-docs/aurox-wallet-guides/gas-settings"
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                Learn more
              </Link>
            </Stack>
          </InfoTooltip>
          {infoIconPosition === "prefix" && (
            <Typography variant="medium" color="text.secondary">
              {title}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="medium">
            {priceField}
            {gasless && tokenAmount && token?.symbol ? ` (${tokenAmount} ${token.symbol})` : ""}
          </Typography>
          {isEstimating && <CircularProgress sx={{ color: "theme.main", maxWidth: "20px", maxHeight: "20px" }} />}
          {feeManager && !isEstimating && network && !gasless && (
            <Link component="button" variant="medium" underline="none" onClick={handleOpenFeeModal}>
              Edit
            </Link>
          )}
        </Stack>
      </Stack>
      {showCustomGasWarning && (
        <>
          <Typography variant="medium" color="error" mt={1.5}>
            You have custom gas setting enabled for this network.
          </Typography>
          <Link variant="medium" component="button" underline="always" alignSelf="start" onClick={handleDisableGasPresets}>
            Click here to disable
          </Link>
        </>
      )}
      {openFeeModal && feeManager && (
        <FeeModal networkIdentifier={networkIdentifier} feeManager={feeManager} onClose={handleCloseFeeModal} />
      )}
    </>
  );
}
