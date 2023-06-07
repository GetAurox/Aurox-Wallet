/// <reference lib="webworker" />

import "common/bootstrap";

import "./lifecycle";
import "./axiosFix";

import { setupSWKeepAlive } from "common/chrome/workarounds/swKeepAlive/serviceWorker";

import { resetEphemeralStorage } from "common/storage";
import { UNINSTALL_URL } from "common/config";

import {
  setupDAppConnectionService,
  setupDAppOperationsService,
  setupImportedAssetService,
  setupNetworkService,
  setupPasswordService,
  setupWalletService,
  setupBalancesService,
  setupOnBoardingService,
  setupEnsService,
  setupNSResolverService,
  setupEVMTransactionsService,
  setupOpeningOnBoardingOnInstallExtension,
  setupNotificationsService,
  setupGaslessTransactionsService,
} from "./microservices";

async function setup() {
  chrome.runtime.setUninstallURL(UNINSTALL_URL);

  setupOpeningOnBoardingOnInstallExtension();

  await resetEphemeralStorage();

  const [PasswordService, NetworkService] = await Promise.all([setupPasswordService(), setupNetworkService()]);

  const [WalletService] = await Promise.all([setupWalletService(PasswordService.manager)]);

  const DAppConnectionService = await setupDAppConnectionService(NetworkService.manager, WalletService.manager);

  const DappOperationsService = await setupDAppOperationsService(
    NetworkService.manager,
    WalletService.manager,
    DAppConnectionService.manager,
  );

  const [ImportedAssetService, EVMTransactionsManager] = await Promise.all([
    setupImportedAssetService(WalletService.manager, NetworkService.manager),
    setupEVMTransactionsService(WalletService.manager, NetworkService.manager, DappOperationsService.manager),
  ]);

  await setupBalancesService(WalletService.manager, NetworkService.manager, ImportedAssetService.manager);

  await setupGaslessTransactionsService(
    WalletService.manager,
    EVMTransactionsManager.storageManager,
    EVMTransactionsManager.operationManager,
  );

  setupSWKeepAlive();

  setupOnBoardingService(WalletService.manager);
  setupEnsService(WalletService.manager);

  setupNSResolverService(NetworkService.manager);

  setupNotificationsService(EVMTransactionsManager.operationManager);
}

setup();
