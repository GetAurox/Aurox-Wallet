import minBy from "lodash/minBy";

import { BlockchainNetworkConnection } from "common/types";

export class OptimalRPCManager {
  static #connectionFailureCounts = new Map<string, number>();

  // Providing a reset function for failures to allow resetting the state during test-runs
  private static resetFailures() {
    this.#connectionFailureCounts.clear();
  }

  static selectOptimalRPC(validConnections: BlockchainNetworkConnection[]): BlockchainNetworkConnection {
    if (validConnections.length === 0) {
      throw new Error("The provided list of network connections is empty");
    }

    const priorities: [BlockchainNetworkConnection, number][] = [];

    for (const [index, connection] of validConnections.entries()) {
      const failures = this.#connectionFailureCounts.get(connection.url) ?? 0;
      const threshold = index === 0 ? 0 : 2 ** index;

      priorities.push([connection, failures + threshold]);
    }

    return minBy(priorities, ([, priority]) => priority)![0];
  }

  static getFailureCountForConnection(connection: BlockchainNetworkConnection) {
    return this.#connectionFailureCounts.get(connection.url) ?? 0;
  }

  static registerConnectionFailure(failedConnection: BlockchainNetworkConnection) {
    const currentFailureCount = this.#connectionFailureCounts.get(failedConnection.url) ?? 0;

    this.#connectionFailureCounts.set(failedConnection.url, currentFailureCount + 1);
  }
}
