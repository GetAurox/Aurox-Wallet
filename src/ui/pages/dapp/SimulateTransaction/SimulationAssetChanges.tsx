import { ethers } from "ethers";

import { OperationTransact, Simulation } from "common/types";
import AlertStatus from "ui/components/common/AlertStatus";

import { Box } from "@mui/material";

import SimulationTokenRow from "./SimulationTokenRow";

export interface SimulationAssetChangesProps {
  simulation: Simulation.Result & { success: true };
  operation: OperationTransact;
  chainId?: number;
}

export default function SimulationAssetChanges(props: SimulationAssetChangesProps) {
  const { simulation, operation, chainId } = props;

  const warnings: string[] = [];
  const showApprovalMessage = simulation.balanceChanges.some(change => change.some(c => c.contractMethod === "APPROVE"));

  return (
    <>
      {showApprovalMessage && (
        <Box width={1} mb={1}>
          <AlertStatus warning warningText="This contract is requesting approval for the token below" />
        </Box>
      )}
      {simulation.balanceChanges.flatMap((balanceChange, topIndex) =>
        balanceChange.map((change, index) => {
          const key = `simulation_${topIndex}_${index}`;

          const infinite =
            operation.transactionPayload.data?.toLowerCase().endsWith("ffffffffffffffffffffffffffffffffffffffff") &&
            operation.transactionPayload.data?.startsWith("0x095ea7b3");

          const name = change.contractName ?? change.contractSymbol;
          const unknownNameMessage = change.contractType === "erc20" ? "Unable to retrieve token symbol" : "Unable to retrieve NFT name";

          const row = (
            <SimulationTokenRow
              key={key}
              amount={change.decimalAmount}
              name={name || unknownNameMessage}
              type={change.direction}
              image={change.tokenLogoURL}
              infinite={infinite}
              chainId={chainId}
              skipAmountSign={change.contractMethod === "APPROVE"}
            />
          );

          if (change.contractMethod === "APPROVE" && change.tokenId) {
            warnings.push(
              `This dApp is requesting permission to withdraw NFTs from the collection below. This type of transaction\n
               can be dangerous in certain cases. Make sure you are connected to a trusted dApp, such as OpenSea`,
            );
          }

          return row;
        }),
      )}
      {warnings.length > 0 && (
        <Box mt={3}>
          <AlertStatus error errorText={warnings.join("\n")} />
        </Box>
      )}
    </>
  );
}
