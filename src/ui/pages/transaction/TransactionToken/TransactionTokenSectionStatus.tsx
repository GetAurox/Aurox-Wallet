import { Divider, Box, IconButton, Tooltip, Typography } from "@mui/material";

import { TransactionStatus } from "common/types";

import TokenTransactionActions from "ui/components/entity/transaction/TokenTransactionActions";

import { IconInfo } from "ui/components/icons";

export const tokenStatusColor: Record<TransactionStatus, string> = {
  completed: "#54C06E",
  failed: "#F24840",
  pending: "#F6C009",
  replaced: "#F24840",
  timeout: "#F24840",
  cancelled: "#F24840",
};

const sxStyles = {
  tokenActions: {
    gridArea: "3 / 1 / 4 / 3",
  },
  iconButton: {
    padding: 0,
  },
};

export interface TransactionTokenSectionStatusProps {
  accountUUID: string;
  networkIdentifier: string;
  transactionHash: string;
  date: string;
  status?: TransactionStatus;
}

export default function TransactionTokenSectionStatus(props: TransactionTokenSectionStatusProps) {
  const { date, status, accountUUID, networkIdentifier, transactionHash } = props;

  return (
    <>
      <Box rowGap={1.5} columnGap="1px" display="grid" component="section" gridTemplateRows="auto" gridTemplateColumns="repeat(2, 1fr)">
        <Typography variant="medium" color="text.secondary">
          Date:
        </Typography>
        <Typography variant="medium" textAlign="right">
          {date}
        </Typography>
        <Typography variant="medium" color="text.secondary">
          Status:
        </Typography>
        <Box display="flex" justifyContent="right">
          {status && (
            <Typography variant="medium" textAlign="right" color={tokenStatusColor[status]} textTransform="capitalize">
              {status}
            </Typography>
          )}
          {status === "failed" && (
            <Tooltip title="There was an error returned by the blockchain when processing the transaction. Please click on the blockchain transaction ID to see more information">
              <IconButton color="error" sx={sxStyles.iconButton}>
                <IconInfo />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {status === "pending" && (
          <TokenTransactionActions
            sx={sxStyles.tokenActions}
            justifyContent="right"
            mt="-5px"
            accountUUID={accountUUID}
            networkIdentifier={networkIdentifier}
            transactionHash={transactionHash}
          />
        )}
      </Box>
      <Divider />
    </>
  );
}
