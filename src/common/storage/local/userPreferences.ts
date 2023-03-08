const topic = "user_preferences";

import type { SortSetting, ChartPeriod, ConnectionPlugPopover } from "ui/types";

export interface UserPreferences {
  balanceVisible: boolean;
  ownTokensSort: SortSetting;
  favoritesSort: SortSetting;
  myNFTsSort?: SortSetting;
  portfolioChartPeriod: ChartPeriod;
  connectionPlugPopover?: ConnectionPlugPopover;
  marketTags: string[];
  security: {
    dappSimulationEnabled: boolean;
    domainCheckerEnabled: boolean;
    antiPhishingEnabled: boolean;
    smartContractMonitoringEnabled: boolean;
  };
  general?: {
    chainSorting?: boolean;
  };
  testnet?: {
    enabled: boolean;
    networkIdentifier?: string;
  };
}

export const defaultUserPreferences: UserPreferences = {
  balanceVisible: true,
  connectionPlugPopover: {
    show: true,
    open: false,
    isInitial: true,
  },
  ownTokensSort: { prop: "value", dir: "desc" },
  favoritesSort: { prop: "price", dir: "asc" },
  myNFTsSort: { prop: "name", dir: "asc" },
  portfolioChartPeriod: "1W",
  marketTags: [],
  security: {
    dappSimulationEnabled: true,
    domainCheckerEnabled: true,
    antiPhishingEnabled: true,
    smartContractMonitoringEnabled: true,
  },
  general: {
    chainSorting: true,
  },
  testnet: {
    enabled: false,
  },
};

export async function saveUserPreferencesToLocalArea(preferences: UserPreferences) {
  await chrome.storage.local.set({ [topic]: preferences });
}

export async function loadUserPreferencesFromLocalArea(): Promise<UserPreferences> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  return result ?? defaultUserPreferences;
}
