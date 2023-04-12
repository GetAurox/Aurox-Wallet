import { Simulation, TransactionRequest } from "common/types";

import { AlchemySimulator, BlockNativeSimulator } from "./simulators";

export class EVMTransactionsSimulationManager {
  #simulator: Simulation.SupportedSimulator;

  constructor(simulator: Simulation.SupportedSimulator) {
    this.#simulator = simulator;
  }

  simulate(transactions: TransactionRequest[], chainId?: number) {
    switch (this.#simulator) {
      case "alchemy":
        return AlchemySimulator.simulate(transactions, chainId);
      case "blocknative":
        return BlockNativeSimulator.simulate(transactions);
      case "pocketuniverse":
        throw new Error("Pocket universe is no longer supported");
      default:
        throw new Error(`Simulator is not configured properly, got ambigious "${this.#simulator}"`);
    }
  }
}
