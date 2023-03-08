import { ComponentType } from "react";

import { Box, Typography } from "@mui/material";

import { TokenTransaction, TransactionStatus } from "common/types";

import { IconStatusDone, IconStatusFail, IconStatusPending } from "ui/components/icons";

export const statusIconComponent: Record<TransactionStatus, ComponentType> = {
  completed: IconStatusDone,
  failed: IconStatusFail,
  pending: IconStatusPending,
  replaced: IconStatusFail,
  timeout: IconStatusFail,
  cancelled: IconStatusFail,
};

export interface TokenTransactionStatusPrimaryProps {
  item: TokenTransaction;
}

export default function TokenTransactionStatusPrimary(props: TokenTransactionStatusPrimaryProps) {
  const { title, status } = props.item;

  const StatusIcon = statusIconComponent[status ?? "pending"];

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box minWidth="fit-content">{StatusIcon && <StatusIcon />}</Box>
      <Typography fontSize="16px" fontWeight={500} lineHeight="20px" noWrap>
        {title}
      </Typography>
    </Box>
  );
}
