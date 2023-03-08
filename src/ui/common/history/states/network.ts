import { BlockchainNetwork } from "common/types";

import { useHistoryState } from "../hooks";

export interface NetworkHistoryStateValues {
  model: BlockchainNetwork;
}

export function useNetworkHistoryState(initialValue: NetworkHistoryStateValues) {
  return useHistoryState<NetworkHistoryStateValues>("network", initialValue);
}
