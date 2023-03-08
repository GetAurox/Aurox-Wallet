import { Stack, Link, Typography } from "@mui/material";

import { formatAmount } from "ui/common/utils";

import InfoTooltip from "../../info/InfoTooltip";

export interface ApproximateFeeProps {
  fee: number | string | undefined;
}

export default function ApproximateFee(props: ApproximateFeeProps) {
  const { fee } = props;

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
      <Typography variant="medium">Approximate Network Fee: {fee ? `$${formatAmount(fee)}` : "--"}</Typography>
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
  );
}
