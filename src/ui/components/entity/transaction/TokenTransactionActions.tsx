import { useState } from "react";
import { Button, Box, BoxProps } from "@mui/material";

import TransactionActionsModal from "ui/components/modals/TransactionActionsModal";

export interface TokenTransactionActionsProps extends BoxProps {
  accountUUID: string;
  networkIdentifier: string;
  transactionHash: string;
}

export default function TokenTransactionActions(props: TokenTransactionActionsProps) {
  const { accountUUID, networkIdentifier, transactionHash, ...boxProps } = props;

  const [action, setAction] = useState<"cancel" | "speedUp" | null>(null);

  const handleSpeedUpClick = () => {
    setAction("speedUp");
  };

  const handleCancelClick = () => {
    setAction("cancel");
  };

  const clearSelection = () => {
    setAction(null);
  };

  const handleCompleted = async () => {
    setAction(null);
  };

  return (
    <Box display="flex" gap={0.5} {...boxProps}>
      <Button variant="contained" size="small" onClick={handleSpeedUpClick}>
        Speed Up
      </Button>
      <Button variant="outlined" size="small" onClick={handleCancelClick}>
        Cancel
      </Button>
      {action && (
        <TransactionActionsModal
          accountUUID={accountUUID}
          networkIdentifier={networkIdentifier}
          transactionHash={transactionHash}
          action={action}
          onCompleted={handleCompleted}
          onClose={clearSelection}
        />
      )}
    </Box>
  );
}
