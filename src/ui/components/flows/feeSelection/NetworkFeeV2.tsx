import { useState, MouseEvent } from "react";

import { Stack, Link, CircularProgress, Typography } from "@mui/material";

import { EVMFeeManager } from "ui/common/fee";
import { formatValueFromAmountAndPrice } from "ui/common/utils";

import InfoTooltip from "ui/components/info/InfoTooltip";
import FeeModalV2 from "ui/components/modals/FeeModal/FeeModalV2";

import { useNativeTokenMarketTicker, useNetworkByIdentifier } from "ui/hooks";

export interface NetworkFeeProps {
  networkIdentifier: string;
  feeManager: EVMFeeManager | null;
}

export default function NetworkFee(props: NetworkFeeProps) {
  const { feeManager, networkIdentifier } = props;

  const network = useNetworkByIdentifier(networkIdentifier);
  const ticker = useNativeTokenMarketTicker(networkIdentifier);

  const [openFeeModal, setOpenFeeModal] = useState(false);

  const isEstimating = !feeManager?.feeSettingsForEthereum;

  const handleOpenFeeModal = (event: MouseEvent) => {
    event.preventDefault();

    setOpenFeeModal(true);
  };

  const handleCloseFeeModal = () => {
    setOpenFeeModal(false);
  };

  const priceField = () => {
    if (ticker.priceUSD && feeManager?.feePriceInNativeCurrency) {
      return formatValueFromAmountAndPrice(feeManager.feePriceInNativeCurrency, parseFloat(ticker.priceUSD), "~$");
    }

    if (feeManager?.feePriceInNativeCurrency && network) {
      return `~${feeManager.feePriceInNativeCurrency} ${network.currencySymbol}`;
    }

    return "--";
  };

  return (
    <>
      <Stack mt={1.5} direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center">
          <Typography variant="medium" color="text.secondary">
            Network Fee:
          </Typography>
          <InfoTooltip>
            <Typography variant="large">
              Approximate network fee to submit the transaction to the selected blockchain. This fee is paid to the miners/stakers of the{" "}
              blockchain so that your transaction can be processed.
            </Typography>
            <Typography variant="medium" mt={1}>
              <Link href="#" target="_blank" rel="noreferrer" underline="hover">
                Learn more
              </Link>
            </Typography>
          </InfoTooltip>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="medium">{priceField()}</Typography>
          {isEstimating && <CircularProgress sx={{ color: "theme.main", maxWidth: "20px", maxHeight: "20px" }} />}
          {feeManager && !isEstimating && network && (
            <Typography variant="medium">
              <Link href="#" underline="none" onClick={handleOpenFeeModal}>
                Edit
              </Link>
            </Typography>
          )}
        </Stack>
      </Stack>
      {openFeeModal && feeManager && (
        <FeeModalV2 networkIdentifier={networkIdentifier} feeManager={feeManager} onClose={handleCloseFeeModal} />
      )}
    </>
  );
}
