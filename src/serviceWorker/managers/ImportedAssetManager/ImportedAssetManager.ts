import { TypedEmitter } from "tiny-typed-emitter";
import partition from "lodash/partition";
import produce from "immer";

import {
  AccountInfo,
  BlockchainNetwork,
  ImportedAsset,
  ImportedAssetToken,
  ImportedAssetVisibility,
  ImportNewAssetResult,
} from "common/types";
import { loadImportedAssetsFromLocalArea, saveImportedAssetsToLocalArea } from "common/storage";
import { createAssetKey } from "common/utils";

import { surveyAutoTokenImporters } from "./autoImport";
import { applyImportedAssetUpdates } from "./utils";
import { ImportedAssetUpdate } from "./types";

const AUTO_IMPORT_RESCHEDULE_DELAY = 1000;

const AUTO_IMPORT_REFRESH_DELAY = 30 * 1000;

export interface ImportedAssetManagerEvents {
  "networks-synced": () => void;
  "assets-modified": (updates: ImportedAssetUpdate[]) => void;
  "assets-imported": (assets: ImportedAsset[]) => void;
  "asset-removed": (assetKey: string) => void;
  "network-assets-removed": (targetNetworkIdentifier: string, assetKeys: string[]) => void;
}

export class ImportedAssetManager extends TypedEmitter<ImportedAssetManagerEvents> {
  #initialized = false;

  #accounts: AccountInfo[] = [];
  #networks: BlockchainNetwork[] = [];

  #importedAssets: ImportedAsset[] = [];

  #autoImportAbortController: AbortController | null = null;
  #autoImportTimer: any;

  getAllImportedAssets() {
    if (!this.#initialized) {
      throw new Error("ImportedAsset manager is not initialized yet!");
    }

    return this.#importedAssets;
  }

  async initialize() {
    const loadedAssets = await loadImportedAssetsFromLocalArea();

    if (loadedAssets) {
      this.#importedAssets = loadedAssets;
    }

    this.#initialized = true;

    return this;
  }

  async syncAccounts(accounts: AccountInfo[]) {
    this.#accounts = accounts;

    this.#rescheduleAutoImportSurvey();
  }

  async syncNetworks(networks: BlockchainNetwork[]) {
    if (!this.#initialized) {
      throw new Error("ImportedAsset manager is not initialized yet!");
    }

    this.#networks = networks;

    this.#rescheduleAutoImportSurvey();

    const validNetworkIdentifierSet = new Set(networks.map(network => network.identifier));

    const newAssets = this.#importedAssets.filter(asset => validNetworkIdentifierSet.has(asset.networkIdentifier));

    if (this.#importedAssets.length !== newAssets.length) {
      this.#importedAssets = newAssets;

      await saveImportedAssetsToLocalArea(this.#importedAssets);

      this.emit("networks-synced");

      return { synced: true };
    }

    return { synced: false };
  }

  async importNewAsset(asset: ImportedAsset): Promise<ImportNewAssetResult> {
    if (!this.#initialized) {
      throw new Error("ImportedAsset manager is not initialized yet!");
    }

    if (this.#importedAssets.some(({ key }) => asset.key === key)) {
      return {
        status: "error",
        code: "Duplicate",
        message: "This asset has already been imported for the selected network.",
      };
    }

    this.#importedAssets = [...this.#importedAssets, asset];

    await saveImportedAssetsToLocalArea(this.#importedAssets);

    this.emit("assets-imported", [asset]);

    return { status: "success" };
  }

  async removeImportedAsset(targetAssetKey: string) {
    if (!this.#initialized) {
      throw new Error("ImportedAsset manager is not initialized yet!");
    }

    if (!this.#importedAssets.some(asset => asset.key === targetAssetKey)) {
      throw new Error("The provided identity does not match any of the imported assets.");
    }

    this.#importedAssets = this.#importedAssets.filter(asset => asset.key !== targetAssetKey);

    await saveImportedAssetsToLocalArea(this.#importedAssets);

    this.emit("asset-removed", targetAssetKey);
  }

  async setVisibility(targetAssetKey: string, newVisibilityValue: ImportedAssetVisibility) {
    if (!this.#initialized) {
      throw new Error("ImportedAsset manager is not initialized yet!");
    }

    if (!this.#importedAssets.some(asset => asset.key === targetAssetKey)) {
      throw new Error("The provided identity does not match any of the imported assets.");
    }

    const newImportedAssetState = produce(this.#importedAssets, draft => {
      const target = draft.find(asset => asset.key === targetAssetKey);

      if (target) {
        target.visibility = newVisibilityValue;
      }
    });

    if (newImportedAssetState !== this.#importedAssets) {
      this.#importedAssets = newImportedAssetState;

      await saveImportedAssetsToLocalArea(this.#importedAssets);

      this.emit("assets-modified", [[targetAssetKey, "token", { visibility: newVisibilityValue }]]);
    }
  }

  async cleanUpRemovedNetwork(removedNetworkIdentifier: string) {
    if (!this.#initialized) {
      throw new Error("ImportedAsset manager is not initialized yet!");
    }

    this.#networks = this.#networks.filter(network => network.identifier !== removedNetworkIdentifier);

    this.#rescheduleAutoImportSurvey();

    if (!this.#importedAssets.some(asset => asset.networkIdentifier === removedNetworkIdentifier)) {
      return { excludedAssetKeys: [] };
    }

    const [excluded, filtered] = partition(this.#importedAssets, asset => asset.networkIdentifier === removedNetworkIdentifier);

    this.#importedAssets = filtered;

    await saveImportedAssetsToLocalArea(this.#importedAssets);

    const excludedAssetKeys = excluded.map(asset => asset.key);

    this.emit("network-assets-removed", removedNetworkIdentifier, excludedAssetKeys);

    return { excludedAssetKeys };
  }

  #getAllEnabledNetworks() {
    return this.#networks.filter(network => !network.disabled);
  }

  #rescheduleAutoImportSurvey(refreshing?: boolean) {
    clearTimeout(this.#autoImportTimer);

    this.#autoImportAbortController?.abort();

    const abortController = new AbortController();

    this.#autoImportAbortController = abortController;

    const delay = refreshing ? AUTO_IMPORT_REFRESH_DELAY : AUTO_IMPORT_RESCHEDULE_DELAY;

    this.#autoImportTimer = setTimeout(() => this.#runAutoImportSurvey(abortController.signal), delay);
  }

  async #runAutoImportSurvey(signal: AbortSignal) {
    this.#autoImportAbortController = null;
    this.#rescheduleAutoImportSurvey(true);

    const [tokensResult, nftResult] = await Promise.all([
      this.#runAutoImportSurveyForTokens(signal),
      this.#runAutoImportSurveyForNFTs(signal),
    ]);

    const allUpdates = [
      ...tokensResult.updates.map(update => [update[0], "token", update[1]] as ImportedAssetUpdate),
      ...nftResult.updates.map(update => [update[0], "nft", update[1]] as ImportedAssetUpdate),
    ];

    const allImported = [...tokensResult.imported, ...nftResult.imported];

    const newImportedAssetState = produce(this.#importedAssets, draft => {
      applyImportedAssetUpdates(draft, allUpdates);

      draft.push(...allImported);
    });

    if (newImportedAssetState !== this.#importedAssets) {
      this.#importedAssets = newImportedAssetState;

      await saveImportedAssetsToLocalArea(this.#importedAssets);

      if (allUpdates.length > 0) {
        this.emit("assets-modified", allUpdates);
      }

      if (allImported.length > 0) {
        this.emit("assets-imported", allImported);
      }
    }
  }

  async #runAutoImportSurveyForTokens(signal: AbortSignal) {
    const candidates = await surveyAutoTokenImporters(this.#accounts, this.#getAllEnabledNetworks(), signal);

    if (signal.aborted || candidates.size === 0) return { imported: [], updates: [] };

    const existingTokenAssets = this.#importedAssets.filter(asset => asset.type === "token") as ImportedAssetToken[];

    const existingAssetsMap = new Map(existingTokenAssets.map(asset => [asset.key, asset]));

    const imported: ImportedAssetToken[] = [];

    const updates: [key: string, update: { verified: boolean }][] = [];

    for (const [networkIdentifier, importedAssets] of candidates) {
      for (const importedAsset of importedAssets) {
        const key = createAssetKey(networkIdentifier, importedAsset.assetIdentifier);

        const existingCorrespondingAsset = existingAssetsMap.get(key);

        if (!existingCorrespondingAsset) {
          imported.push({
            key,
            networkIdentifier,
            type: "token",
            visibility: "default",
            autoImported: true,
            ...importedAsset,
          });
        } else if (existingCorrespondingAsset.verified !== importedAsset.verified) {
          updates.push([existingCorrespondingAsset.key, { verified: importedAsset.verified }]);
        }
      }
    }

    return { imported, updates };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async #runAutoImportSurveyForNFTs(signal: AbortSignal) {
    // TODO: Must be added once NFT support requirements are finalized

    return { imported: [] as ImportedAssetToken[], updates: [] as [key: string, update: {}][] };
  }
}
