import produce, { Patch, produceWithPatches } from "immer";
import { TypedEmitter } from "tiny-typed-emitter";
import groupBy from "lodash/groupBy";

import { AccountInfo, BlockchainNetwork, ImportedAsset, MultichainBalances, MultichainNetworkBalances } from "common/types";
import {
  applyTokenAssetVisibilityRules,
  extractAssetKeyDetails,
  getAssetIdentifierFromDefinition,
  tryGetAccountAddressForChainType,
} from "common/utils";
import { loadMultichainBalancesFromLocalArea, saveMultichainBalancesToLocalArea } from "common/storage";

import { applyImportedAssetUpdates, ImportedAssetUpdate } from "../ImportedAssetManager";

import { MultichainBalanceResolutionQuery, MultichainBalanceResolverType, resolveMultichainBalances } from "./balanceResolver";

// The amount of time to wait before running a full scan in case the user is quickly going through the accounts
const FULL_SCAN_DELAY_TIME = 500;

// How long to wait before doing another full scan
const FULL_SCAN_RE_RUN_TIME = 30 * 1000;

export interface MultichainBalanceManagerEvents {
  "patch": (patches: Patch[]) => void;
}

export class MultichainBalanceManager extends TypedEmitter<MultichainBalanceManagerEvents> {
  #balances: MultichainBalances = {};

  #activeAccountInfo: AccountInfo | null = null;

  #networks: BlockchainNetwork[];
  #importedAssets: ImportedAsset[];

  #initialized = false;

  #fullScanDelayTimer: any;
  #fullScanAbortController: AbortController | null = null;

  constructor(networks: BlockchainNetwork[], importedAssets: ImportedAsset[]) {
    super();

    this.#networks = networks;
    this.#importedAssets = importedAssets;
  }

  public async initialize() {
    const loadedBalances = await loadMultichainBalancesFromLocalArea();

    if (loadedBalances) {
      this.#balances = loadedBalances;
    }

    this.#initialized = true;

    return this;
  }

  public getCurrentBalancesState() {
    if (!this.#initialized) {
      throw new Error("MultichainBalanceManager manager is not initialized yet!");
    }

    return this.#balances;
  }

  public setActiveAccountInfo(activeAccountInfo: AccountInfo | null) {
    if (this.#activeAccountInfo?.uuid !== activeAccountInfo?.uuid) {
      this.#activeAccountInfo = activeAccountInfo;

      if (this.#activeAccountInfo === null) {
        this.#cancelOngoingFullScan();
      } else {
        this.#initiateFullScan();
      }
    }
  }

  public async setNetworks(newNetworks: BlockchainNetwork[]) {
    this.#cancelOngoingFullScan();

    this.#networks = newNetworks;

    const validNetworkIdentifiers = new Set(newNetworks.map(({ identifier }) => identifier));

    try {
      await this.#patchBalances(draft => {
        for (const { networks } of Object.values(draft)) {
          for (const { networkIdentifier } of Object.values(networks)) {
            if (!validNetworkIdentifiers.has(networkIdentifier)) {
              delete networks[networkIdentifier];
            }
          }
        }
      });
    } finally {
      this.#initiateFullScan();
    }
  }

  public async addNetwork(newNetwork: BlockchainNetwork) {
    this.#networks = [...this.#networks, newNetwork];

    const targetAccount = this.#activeAccountInfo;

    if (!targetAccount) return;

    const accountAddress = tryGetAccountAddressForChainType(targetAccount, newNetwork.chainType);

    if (!accountAddress) return;

    await this.#resolveBalances(targetAccount, [newNetwork]);
  }

  public async removeNetwork(removedNetworkIdentifier: string) {
    this.#networks = this.#networks.filter(network => network.identifier !== removedNetworkIdentifier);

    await this.#patchBalances(draft => {
      for (const { networks } of Object.values(draft)) {
        delete networks[removedNetworkIdentifier];
      }
    });
  }

  public async applyAssetModifications(updates: ImportedAssetUpdate[]) {
    // The updates that are allowed for now do not qualify for any actions
    // to be taken, we only keep the states in sync here
    this.#importedAssets = produce(this.#importedAssets, draft => {
      applyImportedAssetUpdates(draft, updates);
    });
  }

  public async addImportedAssets(importedAssets: ImportedAsset[]) {
    this.#importedAssets = [...this.#importedAssets, ...importedAssets];

    const targetAccount = this.#activeAccountInfo;

    if (!targetAccount) return;

    const networkGrouping = groupBy(importedAssets, asset => asset.networkIdentifier);

    const networks: BlockchainNetwork[] = [];

    for (const [networkIdentifier] of Object.entries(networkGrouping)) {
      const targetNetwork = this.#networks.find(network => network.identifier === networkIdentifier);

      if (!targetNetwork) return;

      networks.push(targetNetwork);
    }

    if (networks.length > 0) {
      await this.#resolveBalances(targetAccount, networks);
    }
  }

  public async removeImportedAsset(targetAssetKey: string) {
    const toBeRemoved = this.#importedAssets.find(asset => asset.key === targetAssetKey);

    if (!toBeRemoved) return;

    this.#importedAssets = this.#importedAssets.filter(asset => asset.key !== targetAssetKey);

    await this.#patchBalances(draft => {
      for (const { networks } of Object.values(draft)) {
        const targetNetwork = networks?.[toBeRemoved.networkIdentifier];

        if (targetNetwork) {
          delete targetNetwork?.balances?.[toBeRemoved.assetIdentifier];
        }
      }
    });
  }

  public async discardAccount(accountUUID: string) {
    if (!this.#balances[accountUUID]) return;

    await this.#patchBalances(draft => {
      delete draft[accountUUID];
    });
  }

  public async forceSyncTargetAssets(assetKeys: string[]) {
    const targetAccount = this.#activeAccountInfo;

    if (!targetAccount) return;

    const networkRequests = new Set<string>();

    for (const assetKey of assetKeys) {
      networkRequests.add(extractAssetKeyDetails(assetKey).networkIdentifier);
    }

    const networks: BlockchainNetwork[] = [];

    for (const networkIdentifier of networkRequests) {
      const network = this.#getAllEnabledNetworks().find(network => network.identifier === networkIdentifier);

      if (!network) continue;

      networks.push(network);
    }

    if (networks.length > 0) {
      await this.#resolveBalances(targetAccount, networks);
    }
  }

  #getAllEnabledNetworks() {
    return this.#networks.filter(network => !network.disabled);
  }

  #initiateFullScan() {
    this.#cancelOngoingFullScan();

    this.#fullScanDelayTimer = setTimeout(this.#runFullScan, FULL_SCAN_DELAY_TIME);
  }

  #cancelOngoingFullScan() {
    clearTimeout(this.#fullScanDelayTimer);

    if (this.#fullScanAbortController) {
      this.#fullScanAbortController.abort();

      this.#fullScanAbortController = null;
    }
  }

  #runFullScan = async () => {
    this.#fullScanAbortController = new AbortController();
    const signal = this.#fullScanAbortController.signal;

    const targetAccount = this.#activeAccountInfo;

    if (!targetAccount) return;

    try {
      await this.#resolveBalances(targetAccount, this.#getAllEnabledNetworks(), signal);
    } finally {
      if (!signal.aborted) {
        this.#fullScanDelayTimer = setTimeout(this.#runFullScan, FULL_SCAN_RE_RUN_TIME);
      }

      this.#fullScanAbortController = null;
    }
  };

  async #resolveBalances(targetAccount: AccountInfo, networks: BlockchainNetwork[], signal?: AbortSignal) {
    await resolveMultichainBalances(this.#buildScanQueries(targetAccount, networks), {
      signal,
      applyUpdate: (networkIdentifier, balances, resolverType) => {
        this.#applyUpdate(targetAccount, networkIdentifier, balances, resolverType);
      },
      reportError: (query, error) => {
        const assetsText = `assets="${query.assetIdentifiers.join(",")}"`;

        console.error(`Failed to get ${assetsText} from network="${query.network.identifier}" for ${query.accountAddress}, cause:`);

        console.error(error);
      },
    });
  }

  #buildScanQueries(targetAccount: AccountInfo, networks: BlockchainNetwork[]) {
    const queries: MultichainBalanceResolutionQuery[] = [];

    for (const network of networks) {
      const accountAddress = tryGetAccountAddressForChainType(targetAccount, network.chainType);

      if (accountAddress) {
        const assetIdentifiers = new Set([getAssetIdentifierFromDefinition({ type: "native" })]);

        const assets = this.#importedAssets.filter(applyTokenAssetVisibilityRules);

        const networkAssets: ImportedAsset[] = [];

        for (const asset of assets) {
          if (asset.networkIdentifier === network.identifier) {
            assetIdentifiers.add(asset.assetIdentifier);
            networkAssets.push(asset);
          }
        }

        queries.push({ accountAddress, network, assetIdentifiers: [...assetIdentifiers], assets: networkAssets });
      }
    }

    return queries;
  }

  async #applyUpdate(
    targetAccount: AccountInfo,
    networkIdentifier: string,
    update: MultichainNetworkBalances,
    resolverType: MultichainBalanceResolverType,
  ) {
    await this.#patchBalances(draft => {
      if (!draft[targetAccount.uuid]) {
        draft[targetAccount.uuid] = { accountUUID: targetAccount.uuid, networks: {} };
      }

      if (!draft[targetAccount.uuid].networks[networkIdentifier]) {
        draft[targetAccount.uuid].networks[networkIdentifier] = {
          networkIdentifier,
          hasUSDBalanceValues: false,
          totalPortfolioValueUSD: null,
          balances: {},
        };
      }

      if (resolverType === "rpc") {
        // If update type is "rpc" we apply balances of tokens as is, cause RPC has correct balances amounts

        Object.assign(draft[targetAccount.uuid].networks[networkIdentifier].balances, update.balances);
      } else {
        // Use "leecher" update type for updating amounts and USD values;

        draft[targetAccount.uuid].networks[networkIdentifier].hasUSDBalanceValues = update.hasUSDBalanceValues;
        draft[targetAccount.uuid].networks[networkIdentifier].totalPortfolioValueUSD = update.totalPortfolioValueUSD;

        for (const assetIdentifier of Object.keys(update.balances)) {
          if (!draft[targetAccount.uuid].networks[networkIdentifier].balances[assetIdentifier]) {
            draft[targetAccount.uuid].networks[networkIdentifier].balances[assetIdentifier] = update.balances[assetIdentifier];
          } else {
            if (update.balances[assetIdentifier].balance) {
              draft[targetAccount.uuid].networks[networkIdentifier].balances[assetIdentifier].balance =
                update.balances[assetIdentifier].balance;
            }

            if (update.balances[assetIdentifier].balanceUSDValue) {
              draft[targetAccount.uuid].networks[networkIdentifier].balances[assetIdentifier].balanceUSDValue =
                update.balances[assetIdentifier].balanceUSDValue;
            }
          }
        }
      }
    });
  }

  async #patchBalances(recipe: (draft: MultichainBalances) => void) {
    const [newState, patches] = produceWithPatches(this.#balances, draft => {
      recipe(draft);

      // Always keep the balances object as small as possible by cleaning the empty balances, empty networks and empty accounts
      for (const { accountUUID, networks } of Object.values(draft)) {
        for (const { networkIdentifier, balances } of Object.values(networks)) {
          for (const { assetIdentifier, balance } of Object.values(balances)) {
            if (!balance || Number(balance) <= 0) {
              delete balances[assetIdentifier];
            }
          }

          if (Object.keys(balances).length === 0) {
            delete networks[networkIdentifier];
          }
        }

        if (Object.keys(networks).length === 0) {
          delete draft[accountUUID];
        }
      }
    });

    if (newState === this.#balances) return;

    this.#balances = newState;

    await saveMultichainBalancesToLocalArea(this.#balances);

    this.emit("patch", patches);
  }
}
