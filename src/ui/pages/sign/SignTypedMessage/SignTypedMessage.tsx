import { memo, useState } from "react";
import capitalize from "lodash/capitalize";

import { OpenInNew as OpenInNewIcon } from "@mui/icons-material";
import { Theme, Box, Stack, List, ListItem, Divider, Link, Typography } from "@mui/material";

import { DApp as DAppEvents } from "common/events";
import { OperationSignTypedData } from "common/types";

import {
  useAccountByUUID,
  useContractStatus,
  useLocalUserPreferences,
  useNetworkBlockchainExplorerLinkResolver,
  useNetworkByIdentifier,
} from "ui/hooks";

import CopyableText from "ui/components/clipboard/CopyableText";
import ContractAlertStatus from "ui/components/common/ContractAlertStatus";
import SigningPageWrapper from "ui/components/flows/transaction/SigningPageWrapper";

import { collapseIdentifier } from "ui/common/utils";
import { isEthereumAddress } from "ui/common/validators";

import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";
import AlertStatus from "ui/components/common/AlertStatus";

import { Wallet } from "common/operations";

import { mapMessageDataStructure } from "./utils";

export interface SignTypedMessageProps {
  operation: OperationSignTypedData;
}

export default memo(function SignTypedMessage(props: SignTypedMessageProps) {
  const { operation } = props;

  const [error, setError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const [disableButton, setDisableButton] = useState(false);

  const [userPreferences] = useLocalUserPreferences();
  const account = useAccountByUUID(operation.accountUUID);
  const network = useNetworkByIdentifier(operation.networkIdentifier);
  const { status } = useContractStatus(operation.typedData.domain.verifyingContract ?? "", operation.networkIdentifier);
  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(network?.identifier);

  const contractLink = getContractAddressExplorerLink(operation.typedData.domain.verifyingContract ?? "");

  const handleOnSubmit = async () => {
    if (!account || !network || disableButton) return;

    setError("");
    setNotification(null);

    if (account.type === "hardware") {
      setNotification(`Check your ${account.hardwareType} device`);
    }

    setDisableButton(true);

    try {
      const { accountUUID, typedData, id } = operation;

      const signature = await Wallet.SignTypedDataV2.perform({ accountUUID, data: typedData, dappOperationId: id });

      DAppEvents.TransactionRequestResponded.broadcast(operation.id, signature);
    } catch (error) {
      if (typeof error === "string") {
        setNotification(error);
      } else {
        setNotification("Failed to sign this message. Try again?");
      }
    } finally {
      setDisableButton(false);
    }
  };

  const structuredMessage = mapMessageDataStructure(operation.typedData.message);
  const contractStatus = userPreferences.security.smartContractMonitoringEnabled ? status : null;

  return (
    <SigningPageWrapper
      handleOnSubmit={handleOnSubmit}
      operation={operation}
      activeSubmit={!disableButton}
      submitText="Sign"
      errorComponent={contractStatus ? <ContractAlertStatus status={contractStatus} /> : undefined}
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
        {network && (
          <ListItem disablePadding sx={{ mt: 1.5 }}>
            <Stack direction="row" width={1} justifyContent="space-between" columnGap={0.5}>
              <Typography variant="medium" sx={{ color: (theme: Theme) => theme.palette.custom.grey[60] }}>
                Blockchain:
              </Typography>
              <Stack direction="row" alignItems="center" columnGap={0.5}>
                <NetworkAvatar network={network} size={20} />
                <Typography variant="medium">{network?.name}</Typography>
              </Stack>
            </Stack>
          </ListItem>
        )}
        {contractLink && (
          <ListItem disablePadding sx={{ mt: 1.5 }}>
            <Stack direction="row" width={1} flexWrap="wrap" justifyContent="space-between" columnGap={0.5}>
              <Typography variant="medium" sx={{ color: (theme: Theme) => theme.palette.custom.grey[60] }}>
                Contract:
              </Typography>
              <Link target="_blank" color="primary" underline="hover" href={contractLink} component="a">
                <Stack direction="row" alignItems="center" columnGap={0.5}>
                  <Typography variant="medium">{collapseIdentifier(operation.typedData.domain.verifyingContract ?? "")}</Typography>
                  <OpenInNewIcon sx={{ width: 16, height: 16 }} color="primary" />
                </Stack>
              </Link>
            </Stack>
          </ListItem>
        )}
      </List>
      <Divider sx={{ my: "19px", borderColor: (theme: Theme) => theme.palette.custom.grey["19"] }} />
      {operation.typedData.message && (
        <>
          <Typography variant="large" fontWeight={500} mb="6px">
            Message
          </Typography>
          <List disablePadding>
            {structuredMessage.map(({ prop, value }, index) => (
              <ListItem key={index} disablePadding sx={{ mt: index > 0 ? 1.5 : 0 }}>
                <Stack direction="row" width={1} flexWrap="wrap" justifyContent="space-between" columnGap={0.5}>
                  {prop !== null && (
                    <Typography
                      variant="medium"
                      sx={{ color: (theme: Theme) => (value === null ? theme.palette.text.primary : theme.palette.custom.grey[60]) }}
                    >
                      {capitalize(prop)}:
                    </Typography>
                  )}
                  {value !== null && (
                    <>
                      {isEthereumAddress(value) ? (
                        <Box ml="auto">
                          <CopyableText key={value} text={value} />
                        </Box>
                      ) : (
                        <Typography variant="medium" sx={{ ml: "auto", wordBreak: "break-all" }}>
                          {value}
                        </Typography>
                      )}
                    </>
                  )}
                </Stack>
              </ListItem>
            ))}
          </List>
        </>
      )}
      {error}
      {notification && (
        <Stack mt={2}>
          <AlertStatus info infoText={notification} />
        </Stack>
      )}
    </SigningPageWrapper>
  );
});
