import { EVMTransactions } from "common/operations";
import { Simulation, TransactionRequest } from "common/types";

import { getNFTNameAndSymbol } from "common/api/getNFTMetadata";

export async function fetchSimulate(transaction: TransactionRequest, chainId: number): Promise<Simulation.Result> {
  const result = await EVMTransactions.SimulateEVMTransactions.perform({
    chainId,
    transactions: [
      {
        value: transaction.value ?? "0x0",
        from: transaction.from,
        data: transaction.data,
        to: transaction.to,
      } as any,
    ],
  });

  if (result.success) {
    for (const balanceChange of result.balanceChanges) {
      for (const change of balanceChange) {
        if (!!change.tokenId && !change.tokenLogoURL) {
          const nftDetails = await getNFTNameAndSymbol(change.contractAddress, change.tokenId, chainId);

          change.tokenLogoURL = nftDetails.url;
          change.contractName = nftDetails.name || "Unknown NFT name";
        }
      }
    }
  }

  return result;
}
