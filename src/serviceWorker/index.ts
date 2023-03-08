/// <reference lib="webworker" />

import "common/bootstrap";

import "./lifecycle";
import "./axiosFix";

import { setupSW5MinuteDeathmarkWorkaroundForServiceWorker } from "common/chrome/workarounds/sw5MinuteDeathmark/serviceWorker";

import { resetEphemeralStorage } from "common/storage";

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
} from "./microservices";

async function setup() {
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

  setupSW5MinuteDeathmarkWorkaroundForServiceWorker();

  setupOnBoardingService(WalletService.manager);
  setupEnsService(WalletService.manager);

  setupNSResolverService(NetworkService.manager);

  setupNotificationsService(EVMTransactionsManager.operationManager);
}

setup();
