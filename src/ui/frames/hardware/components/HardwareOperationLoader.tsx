import { useEffect, useMemo, useState } from "react";

import { Button, CircularProgress, Stack, Typography } from "@mui/material";

import { HardwareOperation } from "common/types";
import { getAccountAddressForChainType } from "common/utils";
import { Hardware } from "common/events";

import { collapseIdentifier } from "ui/common/utils";
import { IconHWLedger, IconHWTrezor } from "ui/components/icons";
import { useAccountByUUID } from "ui/hooks";

import { HardwareOperationManager } from "../services";

const walletIcons = {
  "trezor": <IconHWTrezor />,
  "ledger": <IconHWLedger />,
};

async function wait(waitTimeInMiliseconds: number) {
  await new Promise(resolve => setTimeout(resolve, waitTimeInMiliseconds));
}

export interface HardwareOperationLoaderProps {
  operation: HardwareOperation;
}

export default function HardwareOperationLoader(props: HardwareOperationLoaderProps) {
  const { device, operationType, accountUUID } = props.operation;

  const [statusText, setStatusText] = useState<string | null>(null);

  const account = useAccountByUUID(accountUUID);

  const address = useMemo(() => {
    if (account) {
      return getAccountAddressForChainType(account, "evm");
    }
  }, [account]);

  const text = useMemo(() => {
    switch (operationType) {
      case "signMessage":
        return "Signing message";
      case "signTypedData":
        return "Signing typed data";
      case "signTransaction":
        return "Signing transaction";
    }
  }, [operationType]);

  useEffect(() => {
    if (!account || account.type !== "hardware") return;

    const handleOperation = async () => {
      if (props.operation.cancelled) {
        await cancelOperation();

        return;
      }

      const result = await HardwareOperationManager.submitOperation(account, props.operation);

      if (result) {
        setStatusText(result.error ?? "Success");

        await wait(1500);

        Hardware.Message.broadcast(result);
      }
    };

    handleOperation();
  }, [props.operation, account]);

  const cancelOperation = async () => {
    setStatusText("Operation cancelled!");

    await wait(1500);

    const details = await HardwareOperationManager.cancelOperation();

    Hardware.Message.broadcast(details);
  };

  return (
    <Stack alignItems="center" pt={2}>
      {device && walletIcons[device]}
      {statusText && <Typography sx={{ marginTop: 6, fontSize: "20px", textTransform: "capitalize" }}> {statusText} </Typography>}
      {!statusText && (
        <>
          <Typography mt={2} sx={{ fontSize: "16px" }}>
            {text}
          </Typography>
          <CircularProgress sx={{ color: "#fff", marginTop: 2 }} />
          <Typography mt={2} sx={{ fontSize: "12x", color: "text.secondary" }}>
            Account used
          </Typography>
          <Typography mt={2} sx={{ fontSize: "14px", wordWrap: "break-word" }}>
            {address && collapseIdentifier(address, { showLeft: 8, showRight: 8 })}
          </Typography>
          <Button onClick={cancelOperation}>Cancel</Button>
        </>
      )}
    </Stack>
  );
}
