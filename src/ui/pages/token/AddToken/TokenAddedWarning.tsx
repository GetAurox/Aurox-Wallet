import { Stack, Typography } from "@mui/material";

import { IconDanger } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import DefaultControls from "ui/components/controls/DefaultControls";

export interface TokenAddedWarningProps {
  onClose: () => void;
}

export default function TokenAddedWarning(props: TokenAddedWarningProps) {
  const { onClose } = props;

  return (
    <>
      <Header title="Add Coin to Wallet" />
      <Stack flexGrow={1} justifyContent="center" alignItems="center" rowGap="33px">
        <IconDanger />
        <Typography variant="headingSmall" textAlign="center" maxWidth={256}>
          The coin is already added to all your wallets.
        </Typography>
      </Stack>
      <DefaultControls primary="Close" onPrimary={onClose} />
    </>
  );
}
