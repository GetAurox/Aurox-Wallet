import { Box, Card, CardContent, cardContentClasses, Stack, Typography } from "@mui/material";

import Header from "ui/components/layout/misc/Header";
import DefaultControls from "ui/components/controls/DefaultControls";

import { useDocumentTitle } from "ui/hooks";

import { OperationAddNetwork } from "common/types";

import { DApp as DAppEvents } from "common/events";

import { getDomain } from "common/utils/domain";

import { NetworkCardItem } from "./NetworkCardItem";

const sxStyles = {
  card: {
    mt: "7px",
    borderRadius: "10px",
    bgcolor: "transparent",
  },
  cardContent: {
    px: 1.5,
    py: 1.75,
    [`&.${cardContentClasses.root}:last-child`]: {
      pb: 1.75,
    },
  },
};

export interface NetworkAddProps {
  operation: OperationAddNetwork;
}

export default function NetworkAdd(props: NetworkAddProps) {
  useDocumentTitle("Add network");

  const { operation } = props;

  const { network } = operation;

  const handleApprove = () => {
    DAppEvents.TransactionRequestResponded.broadcast(operation.id, "accepted");
  };

  const handleCancel = () => {
    DAppEvents.TransactionRequestResponded.broadcast(operation.id, null);
  };

  return (
    <>
      <Header title="Add Network to Wallet" />
      <Stack px={1.5} rowGap="21px">
        <Typography variant="headingSmall" textAlign="center">
          Allow {getDomain(operation.domain) ?? "this site"} to add a network?
        </Typography>
        <Box>
          <Typography variant="medium">Network details</Typography>
          <Card sx={sxStyles.card} variant="outlined">
            <CardContent sx={sxStyles.cardContent}>
              <Stack rowGap={1.5}>
                <NetworkCardItem label="Network Name:" value={network.name} />
                <NetworkCardItem link label="Network URL:" value={network.connections[0]?.url} />
                <NetworkCardItem label="Chain ID:" value={network.chainId.toString()} />
                <NetworkCardItem label="Currency Symbol:" value={network.currencySymbol} />
                <NetworkCardItem link label="Blockchain Explorer URL:" value={network.chainExplorer?.baseURL ?? "Not provided"} />
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
      <DefaultControls primary="Approve" onPrimary={handleApprove} onSecondary={handleCancel} />
    </>
  );
}
