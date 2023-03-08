import { Stack, Link, Typography } from "@mui/material";
import { useState, MouseEvent } from "react";

import { FeeConfiguration } from "ui/common/fee";
import { formatAmount } from "ui/common/utils";
import FeeModal from "ui/components/modals/FeeModal";

import InfoTooltip from "../../info/InfoTooltip";

export interface NetworkFeeProps {
  networkIdentifier: string;
  feeConfiguration?: FeeConfiguration | null;
  setFee: (fee: FeeConfiguration) => void;
}

export default function NetworkFee(props: NetworkFeeProps) {
  const { feeConfiguration, networkIdentifier, setFee } = props;

  const [openFeeModal, setOpenFeeModal] = useState(false);

  const handleOpenFeeModal = (event: MouseEvent) => {
    event.preventDefault();

    setOpenFeeModal(true);
  };

  const handleCloseFeeModal = () => {
    setOpenFeeModal(false);
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
              Approximate network fee to submit the transaction to the selected blockchain. This fee is paid to the miners/stakers of the
              blockchain so that your transaction can be processed.
            </Typography>
            <Typography variant="large" mt={1}>
              <Link href="https://ethereum.org/en/developers/docs/gas/" target="_blank" rel="noreferrer" underline="hover">
                Learn more
              </Link>
            </Typography>
          </InfoTooltip>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="medium">~${formatAmount(0)}</Typography>
          <Typography variant="medium">
            <Link href="#" underline="none" onClick={handleOpenFeeModal}>
              Edit
            </Link>
          </Typography>
        </Stack>
      </Stack>
      {openFeeModal && (
        <FeeModal networkIdentifier={networkIdentifier} onClose={handleCloseFeeModal} selectedFee={feeConfiguration} onFeeSelect={setFee} />
      )}
    </>
  );
}
