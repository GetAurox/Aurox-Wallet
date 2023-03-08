import { TransferParams, TransferWithSeedParams } from "@solana/web3.js";
import { BigNumber } from "ethers";

import { ProviderClass, TransactionRequest } from "common/types";
import { EthereumToken } from "ui/types";

export class SolanaProvider implements ProviderClass<"solana"> {
  chainType: "solana" = "solana";

  getHasMulticallSupport(): boolean {
    throw new Error("Method not implemented.");
  }

  getTokenBalance(token: string, addressOfUser: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getTokenDetails(token: string): Promise<EthereumToken> {
    throw new Error("Method not implemented.");
  }

  getCode(address: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getNetworkFeeData(): Promise<{ baseFee: string }> {
    throw new Error("Method not implemented.");
  }

  returnFeeData(): Promise<{ maxFeePerGas: BigNumber; maxPriorityFeePerGas: BigNumber }> {
    throw new Error("Method not implemented.");
  }

  getUpdatedTransactionFeeEstimate(transaction: TransferParams | TransferWithSeedParams): Promise<TransactionRequest> {
    throw new Error("Method not implemented.");
  }

  lookupAddress(address: string): Promise<string | null> {
    throw new Error("Method not implemented");
  }

  resolveName(name: string): Promise<string | null> {
    throw new Error("Method not implemented");
  }

  getTransaction(txHash: string) {
    throw new Error("Method not implemented");
  }

  getTransactionReceipt(txHash: string) {
    throw new Error("Method not implemented");
  }
}
