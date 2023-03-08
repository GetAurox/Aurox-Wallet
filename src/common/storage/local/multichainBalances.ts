import { MultichainBalances } from "common/types";

const topic = "multichain_balances";

export async function saveMultichainBalancesToLocalArea(balances: MultichainBalances) {
  await chrome.storage.local.set({ [topic]: balances });
}

export async function loadMultichainBalancesFromLocalArea(): Promise<MultichainBalances | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  return result ?? null;
}
