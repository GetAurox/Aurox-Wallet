import { Stack, Link, Typography } from "@mui/material";
import capitalize from "lodash/capitalize";

import InfoTooltip from "../../info/InfoTooltip";

export interface CurrentNetworkInfoProps {
  networkName: string | undefined;
}

export default function CurrentNetworkInfo(props: CurrentNetworkInfoProps) {
  const { networkName } = props;

  if (!networkName) return null;

  const capitalizedNetworkName = capitalize(networkName);

  return (
    <Stack mt={3.125} direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
      <Typography variant="medium">You are sending via the {capitalizedNetworkName} network</Typography>
      <InfoTooltip>
        <Typography variant="large">
          The token you’re trying to send is on the {capitalizedNetworkName} network. Make sure the recipient’s address is also on the{" "}
          {capitalizedNetworkName} network
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
