import { ONBOARDING_FILENAME } from "common/entities";

import { loadOnboardingData, saveOnboardingData } from "common/storage";
import { MnemonicAccountInfo } from "common/types";

import { WalletManager } from "serviceWorker/managers";

import { getAddressENSData } from "common/api/getAddressENSData";

import { OnboardingHistoryStateValues } from "common/types";

async function checkForMissingAuroxUsername(address?: string | null) {
  if (!address) return;

  const data = await loadOnboardingData<OnboardingHistoryStateValues>();

  if (!data?.username) {
    const { isExistedENSAddress, subdomain } = await getAddressENSData(address);

    if (isExistedENSAddress && subdomain) {
      await saveOnboardingData({ ...data, action: data?.step ?? "main", username: subdomain });
    }

    setTimeout(() => checkForMissingAuroxUsername(address), 30 * 60 * 1000);
  }
}

export const setupOpeningOnBoardingOnInstallExtension = () => {
  chrome.runtime.onInstalled.addListener(details => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.tabs.create({ url: ONBOARDING_FILENAME });
    }
  });
};

export function setupOnBoardingService(walletManager: WalletManager) {
  walletManager.addListener("wallet-unlocked", () => {
    const rootAccountEVMAddress = (
      walletManager.getAllAccountInfo().find(account => account.type === "mnemonic" && account.accountNumber === 0) as MnemonicAccountInfo
    )?.addresses?.evm;

    checkForMissingAuroxUsername(rootAccountEVMAddress);
  });
}
