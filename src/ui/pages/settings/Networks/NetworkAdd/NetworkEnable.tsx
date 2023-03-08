import { Stack, Typography } from "@mui/material";

import { DApp as DAppEvents } from "common/events";
import { OperationEnableNetwork } from "common/types";

import { useDocumentTitle } from "ui/hooks";

import { IconUnplugged } from "ui/components/icons";
import DefaultControls from "ui/components/controls/DefaultControls";

export interface NetworkEnableProps {
  operation: OperationEnableNetwork;
}

export default function NetworkEnable(props: NetworkEnableProps) {
  const { operation } = props;

  useDocumentTitle("Enable wallet network");

  const handleEnableNetwork = () => {
    DAppEvents.TransactionRequestResponded.broadcast(operation.id, operation.network.identifier);
  };

  const handleCancel = () => {
    DAppEvents.TransactionRequestResponded.broadcast(operation.id, null);
  };

  return (
    <>
      <Stack alignItems="center" flexGrow={1} justifyContent="center">
        <IconUnplugged />
        <Typography variant="headingSmall" textAlign="center" maxWidth={224} mt="33px">
          Do you want to enable {operation.network.name}?
        </Typography>
        <Typography variant="medium" lineHeight="24px" mt="6px" color="text.secondary">
          This network is already added to your wallet.
        </Typography>
      </Stack>
      <DefaultControls primary="Enable Network" onPrimary={handleEnableNetwork} onSecondary={handleCancel} />
    </>
  );
}
