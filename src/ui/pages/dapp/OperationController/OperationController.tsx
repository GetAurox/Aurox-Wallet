import "common/bootstrap";
import "ui/common/mock";

import { Pagination, Stack, Typography } from "@mui/material";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { DApp as DAppEvents } from "common/events";
import { createNetworkIdentifier, isApproval } from "common/utils";
import { Operation } from "common/types";

import { useCurrentTabDappConnectionInfo, useDAppOperations, useIsWalletUnlocked, useLocalUserPreferences } from "ui/hooks";
import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";

import Connect from "ui/pages/dapp/Connect";
import RegularTransaction from "ui/pages/transaction/RegularTransaction";
import TokenApproval from "ui/pages/token/TokenApproval";
import SignPersonalMessage from "ui/pages/sign/SignPersonalMessage/SignPersonalMessage";
import SignTypedMessage from "ui/pages/sign/SignTypedMessage";

import { theme } from "ui/common/theme";
import { useHistoryReset } from "ui/common/history";

import { ERC20Approval } from "ui/common/tokens";

import NetworkAdd from "ui/pages/settings/Networks/NetworkAdd";
import NetworkEnable from "ui/pages/settings/Networks/NetworkAdd/NetworkEnable";

import SimulateTransaction from "../SimulateTransaction";

const sxStyles = {
  rejectBox: {
    color: theme.palette.primary.main,
    cursor: "pointer",
    borderLeft: "1px solid #2A2E39",
    paddingLeft: "10px",
  },
};

export interface OperationControllerProps {
  /** True if the operations are in popup window and not extension */
  windowPopup?: boolean;
}

export default function OperationController(props: OperationControllerProps) {
  const { windowPopup } = props;
  const isWalletUnlocked = useIsWalletUnlocked();
  const reset = useHistoryReset();

  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [paginationIndex, setPaginationIndex] = useState(1);

  const { domain, tabId } = useCurrentTabDappConnectionInfo();

  const operations = useDAppOperations(!windowPopup ? { domain, tabId } : {});

  const [userPreferences] = useLocalUserPreferences();

  const dappSimulationEnabled = userPreferences.security.dappSimulationEnabled;

  useEffect(() => {
    if (!operations || operations.length === 0) {
      if (!windowPopup) reset("/");

      return;
    }

    if (operations.length > 0 && paginationIndex > operations.length) {
      setPaginationIndex(operations.length);
      setSelectedOperation(operations[operations.length - 1]);
    } else {
      setSelectedOperation(operations[paginationIndex - 1]);
    }
  }, [reset, operations, windowPopup, paginationIndex]);

  const changeOperation = (_: ChangeEvent<unknown>, page: number) => {
    if (operations) {
      setSelectedOperation(operations[page - 1]);
      setPaginationIndex(page);
    }
  };

  const cancelAllOperations = () => {
    if (operations) {
      for (const operation of operations) {
        DAppEvents.TransactionRequestResponded.broadcast(operation.id, null);
      }
    }
  };

  const selectedOperationComponent = useMemo((): JSX.Element => {
    if (!selectedOperation) return <></>;

    if (selectedOperation.operationType === "connect") {
      return <Connect key={selectedOperation.id} operation={selectedOperation} />;
    }

    if (selectedOperation.operationType === "add_network") {
      return <NetworkAdd operation={selectedOperation} />;
    }

    if (selectedOperation.operationType === "enable_network") {
      return <NetworkEnable operation={selectedOperation} />;
    }

    if (selectedOperation.operationType === "transact") {
      const mainnetIdentifier = createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID);

      if (dappSimulationEnabled && !selectedOperation.isSimulated && selectedOperation.networkIdentifier === mainnetIdentifier) {
        return (
          <SimulateTransaction
            key={selectedOperation.id}
            operationId={selectedOperation.id}
            transactionPayload={selectedOperation.transactionPayload}
          />
        );
      }

      if (isApproval(selectedOperation.transactionPayload.data)) {
        const approval = new ERC20Approval(selectedOperation.transactionPayload);

        return <TokenApproval key={selectedOperation.id} operation={selectedOperation} approval={approval} />;
      }

      return <RegularTransaction key={selectedOperation.id} operation={selectedOperation} />;
    }

    if (selectedOperation.operationType === "personal_sign" || selectedOperation.operationType === "eth_sign") {
      return <SignPersonalMessage key={selectedOperation.id} operation={selectedOperation} />;
    }

    if (selectedOperation.operationType === "signTypedData") {
      return <SignTypedMessage key={selectedOperation.id} operation={selectedOperation} />;
    }

    return <></>;
  }, [dappSimulationEnabled, selectedOperation]);

  return (
    <>
      {isWalletUnlocked && operations && operations.length > 1 && (
        <Stack m={2} alignItems="center">
          <Stack flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
            <Pagination page={paginationIndex} count={operations.length} onChange={changeOperation} variant="outlined" size="small" />
            <Stack sx={sxStyles.rejectBox} onClick={cancelAllOperations}>
              <Typography variant="medium">Reject all</Typography>
            </Stack>
          </Stack>
        </Stack>
      )}
      {selectedOperationComponent}
    </>
  );
}
