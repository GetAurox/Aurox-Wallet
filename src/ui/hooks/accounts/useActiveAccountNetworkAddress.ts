import { getAccountAddressForChainType } from "common/utils";

import { useActiveAccount } from "../states";

export function useActiveAccountNetworkAddress() {
  const activeAccount = useActiveAccount();

  if (!activeAccount) return null;

  return getAccountAddressForChainType(activeAccount, "evm");
}
