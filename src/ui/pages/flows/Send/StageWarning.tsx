import { Stack, Box } from "@mui/material";

import DefaultControls from "ui/components/controls/DefaultControls";
import WarningStage from "ui/components/flows/stages/WarningStage";
import ErrorText from "ui/components/form/ErrorText";

export interface StageWarningProps {
  recipientAddress: string;
  onContractAsRecipientAcceptedChange: (contractAsRecipientAccepted: boolean) => void;
  onPreview: () => void;
  onSetup: () => void;
  error: string | null;
  stepButtonDisabled: boolean;
}

export default function StageWarning(props: StageWarningProps) {
  const { recipientAddress, onContractAsRecipientAcceptedChange, onPreview, onSetup, error, stepButtonDisabled } = props;

  const stepButtonHandler = () => {
    onContractAsRecipientAcceptedChange(true);

    onPreview();
  };

  return (
    <>
      <Stack width={1} px={2}>
        <WarningStage recipient={recipientAddress} />
      </Stack>
      <Box flexGrow={1} />
      <ErrorText error={error} mt={1} justifyContent="center" />
      <DefaultControls
        primary="Continue"
        secondary="Go Back"
        onPrimary={stepButtonHandler}
        onSecondary={onSetup}
        disabledPrimary={stepButtonDisabled}
      />
    </>
  );
}
