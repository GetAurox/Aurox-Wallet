import { useState, ReactNode } from "react";

import { Transaction, Result } from "pocket-universe-js";

import { Stack, Box, Button, CircularProgress, Typography } from "@mui/material";

import { DApp as DAppOps } from "common/operations";
import { DApp as DAppEvents } from "common/events";

import { fetchSimulate } from "common/api";

import { IconStatusError, IconStatusFail } from "ui/components/icons";
import DefaultControls from "ui/components/controls/DefaultControls";
import CustomControls from "ui/components/controls/CustomControls";
import AlertStatus from "ui/components/common/AlertStatus";

import { useDocumentTitle, useLocalUserPreferences } from "ui/hooks";

import { simulationIsRevert, simulationIsSuccess } from "./guards";
import SimulationAssetChanges from "./SimulationAssetChanges";

type Stage = "simulating" | "error" | "success" | "reject" | "continue";

export interface SimulateTransactionProps {
  operationId: string;
  transactionPayload: Transaction;
}

const RenderFrame = ({ top, bottom }: { top: ReactNode; bottom: ReactNode }) => {
  return (
    <>
      <Stack p={2} flexGrow={1} flexShrink={1} alignItems="center" justifyContent="center">
        {top}
      </Stack>
      <Stack p={2} spacing={1.5} flexGrow={0} flexShrink={0}>
        {bottom}
      </Stack>
    </>
  );
};

const SimulationRevert = ({ error }: { error?: string | null }) => (
  <AlertStatus error errorText={`Simulation could not be ran.${error && ` Message: "${error}"`}`} />
);

export default function SimulateTransaction(props: SimulateTransactionProps) {
  const { operationId, transactionPayload } = props;
  const [stage, setStage] = useState<Stage | null>(null);
  const [result, setResult] = useState<(Result & { from: string; to: string }) | null>(null);

  const [userPreferences] = useLocalUserPreferences();

  useDocumentTitle("Simulate Transaction");

  if (!userPreferences.security.dappSimulationEnabled) {
    return <></>;
  }

  const handleInitial = () => setStage(null);
  const handleSimulate = async () => {
    if (transactionPayload) {
      setStage("simulating");
      setResult(null);

      try {
        const response = await fetchSimulate(transactionPayload);

        setStage("success");
        setResult({ ...response, from: transactionPayload.from, to: transactionPayload.to });
      } catch (error) {
        setStage("error");
      }
    }
  };

  const handleReject = () => {
    DAppEvents.TransactionRequestResponded.broadcast(operationId, null);

    setStage("reject");
  };

  const handleContinue = () => {
    DAppOps.SimulateTransaction.perform(operationId, true);

    setStage("continue");
  };

  if (!stage) {
    return (
      <>
        <Stack p={2} flexGrow={1} flexShrink={1} alignItems="center" justifyContent="center">
          <Typography variant="headingMedium" fontSize={24} lineHeight={32 / 24}>
            Simulation
          </Typography>
          <Typography variant="large" mt="5px" color="text.secondary" align="center">
            Aurox Wallet can simulate your transaction, determine the outcome and display the balance changes below.
          </Typography>
        </Stack>
        <CustomControls
          primary={
            <Button variant="contained" sx={{ flex: 1 }} onClick={handleSimulate}>
              Simulate transaction
            </Button>
          }
          secondary={
            <Button variant="outlined" sx={{ flex: 0.5 }} onClick={handleContinue}>
              Don&apos;t simulate
            </Button>
          }
        />
      </>
    );
  }

  if (stage === "simulating") {
    return (
      <RenderFrame
        top={
          <>
            <Typography variant="headingSmall" mb="23px">
              Simulation In Progress
            </Typography>
            <CircularProgress size={44} sx={{ color: "common.white" }} />
          </>
        }
        bottom={
          <>
            <Button color="primary" variant="contained" onClick={handleContinue}>
              Skip
            </Button>
          </>
        }
      />
    );
  }

  if (stage === "error") {
    return (
      <>
        <Stack p={2} flexGrow={1} flexShrink={1} alignItems="center" justifyContent="center">
          <Box width={92} height={92} sx={{ "& > svg": { width: "100%", height: "100%" } }}>
            <IconStatusFail />
          </Box>
          <Typography variant="headingMedium" mt={3} fontSize={24} lineHeight={32 / 24}>
            Simulation Failed
          </Typography>
          <Typography variant="large" mt="5px" color="text.secondary" align="center">
            Do you want to try again?
          </Typography>
        </Stack>
        <CustomControls
          primary={
            <Button variant="contained" fullWidth onClick={handleSimulate}>
              Try Again
            </Button>
          }
          secondary={
            <Button variant="outlined" fullWidth onClick={handleContinue}>
              Don&apos;t simulate
            </Button>
          }
        />
      </>
    );
  }

  if (stage === "success") {
    return (
      <>
        <Stack p={2} flexGrow={1} flexShrink={1} alignItems="center" justifyContent="center">
          <Typography variant="headingMedium" fontSize={24} lineHeight={32 / 24}>
            Simulation Completed
          </Typography>
          <Typography variant="large" mt="5px" mb="23px" color="text.secondary" align="center">
            Aurox Wallet simulates your transactions, determines the outcome and displays the balance changes below.
          </Typography>

          {result?.simulation && simulationIsRevert(result.simulation) && <SimulationRevert error={result?.simulation?.revert.message} />}
          {result?.simulation && simulationIsSuccess(result.simulation) && (
            <SimulationAssetChanges from={result.from} to={result.to} assetChanges={result.simulation.success} metadata={result.metadata} />
          )}
        </Stack>
        <DefaultControls primary="Continue" secondary="Reject" onPrimary={handleContinue} onSecondary={handleReject} />
      </>
    );
  }

  if (stage === "reject") {
    return (
      <RenderFrame
        top={
          <>
            <Box width={92} height={92} sx={{ "& > svg": { width: "100%", height: "100%" } }}>
              <IconStatusError />
            </Box>
            <Typography variant="headingMedium" mt={3} fontSize={24} lineHeight={32 / 24}>
              Transaction Rejected
            </Typography>
          </>
        }
        bottom={
          <Button color="primary" variant="contained" onClick={handleInitial}>
            Start Over
          </Button>
        }
      />
    );
  }

  if (stage === "continue") {
    return (
      <RenderFrame
        top={
          <>
            <Typography variant="headingMedium" mt={3} fontSize={24} lineHeight={32 / 24}>
              Transaction Overview
            </Typography>
          </>
        }
        bottom={
          <Button color="primary" variant="contained" onClick={handleInitial}>
            Start Over
          </Button>
        }
      />
    );
  }

  return <></>;
}
