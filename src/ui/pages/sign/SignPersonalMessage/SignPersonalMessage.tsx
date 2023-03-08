import { memo, useState } from "react";

import { Box, Divider, List, ListItem, Stack, Theme, Typography } from "@mui/material";

import { Wallet } from "common/operations";
import { DApp as DAppEvents } from "common/events";
import { OperationSimpleSign } from "common/types";

import { useAccountByUUID, useNetworkByIdentifier } from "ui/hooks";

import AlertStatus from "ui/components/common/AlertStatus";
import SigningPageWrapper from "ui/components/flows/transaction/SigningPageWrapper";

export interface SignPersonalMessageProps {
  operation: OperationSimpleSign;
}

export default memo(function SignPersonalMessage(props: SignPersonalMessageProps) {
  const { operation } = props;

  const [notification, setNotification] = useState<string | null>(null);
  const [disableButton, setDisableButton] = useState(false);

  const account = useAccountByUUID(operation.accountUUID);
  const network = useNetworkByIdentifier(operation.networkIdentifier);

  const handleOnSubmit = async () => {
    if (!account || !network) return;

    setNotification(null);

    if (account.type === "hardware") {
      setNotification(`Check your ${account.hardwareType} device`);
    }

    setDisableButton(true);

    try {
      const signature = await Wallet.SignMessageV2.perform({
        chainType: "evm",
        message: operation.message,
        uuid: account.uuid,
        unsafeWithoutPrefix: operation.operationType === "eth_sign",
        dappOperationId: operation.id,
      });

      DAppEvents.TransactionRequestResponded.broadcast(operation.id, signature);
    } catch (error) {
      if (typeof error === "string") {
        setNotification(error);
      } else {
        setNotification("Failed to sign personal message. Try again?");
      }
    } finally {
      setDisableButton(false);
    }
  };

  return (
    <SigningPageWrapper
      submitText="Sign"
      handleOnSubmit={handleOnSubmit}
      operation={operation}
      activeSubmit={!disableButton}
      errorComponent={
        operation.operationType === "eth_sign" && (
          <Box mt={1.5} mb={1.5}>
            <AlertStatus
              error
              errorText="Signing this message can be dangerous and it can potentially be used to execute something on your account's behalf"
            />
          </Box>
        )
      }
    >
      <Typography variant="large" fontWeight={500} mb="6px">
        {operation.documentTitle}
      </Typography>
      <List disablePadding>
        <ListItem disablePadding>
          <Stack direction="row" width={1} justifyContent="space-between" columnGap={0.5}>
            <Typography variant="medium" sx={{ color: (theme: Theme) => theme.palette.custom.grey[60] }}>
              Website:
            </Typography>
            <Typography variant="medium">{operation.domain}</Typography>
          </Stack>
        </ListItem>
      </List>
      <Divider sx={{ my: "19px", borderColor: (theme: Theme) => theme.palette.custom.grey["19"] }} />
      <Typography variant="large" fontWeight={500} mb="6px">
        Message
      </Typography>
      <List disablePadding>
        <ListItem disablePadding>
          <Stack direction="row" width={1} justifyContent="space-between" columnGap={0.5}>
            <Typography variant="medium" sx={{ color: (theme: Theme) => theme.palette.custom.grey[60] }}>
              Contents:
            </Typography>
            <Typography variant="medium" sx={{ wordBreak: "break-all", whiteSpace: "pre-wrap" }}>
              {operation.message}
            </Typography>
          </Stack>
        </ListItem>
      </List>
      {notification && (
        <Stack mt={2}>
          <AlertStatus info infoText={notification} />
        </Stack>
      )}
    </SigningPageWrapper>
  );
});
