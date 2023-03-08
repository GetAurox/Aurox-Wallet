import { PocketSimulator, Transaction, SimulateOptions, Result } from "pocket-universe-js";

import { POCKETUNIVERSE_API_URL } from "common/config";

const pocket = new PocketSimulator(POCKETUNIVERSE_API_URL);

export async function fetchSimulate(transaction: Transaction, options?: SimulateOptions): Promise<Result> {
  return pocket.simulate(
    {
      value: transaction.value ?? "0x0",
      from: transaction.from,
      data: transaction.data,
      to: transaction.to,
    },
    options,
  );
}
