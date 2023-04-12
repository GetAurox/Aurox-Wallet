import { TypedEmitter } from "tiny-typed-emitter";
import partition from "lodash/partition";
import produce from "immer";
import moment from "moment";
import chunk from "lodash/chunk";
import shuffle from "lodash/shuffle";

import {
  AccountInfo,
  BlockchainNetwork,
  ImportedAsset,
  ImportedAssetNFT,
  ImportedAssetToken,
  ImportedAssetVisibility,
  ImportNewAssetResult,
} from "common/types";
import { loadImportedAssetsFromLocalArea, saveImportedAssetsToLocalArea } from "common/storage";
import { createAssetKey } from "common/utils";

import { surveyAutoNFTImporters, surveyAutoNFTUpdates, surveyAutoTokenImporters } from "./autoImport";
import { applyImportedAssetUpdates } from "./utils";
import { ImportedAssetUpdate, ImportedAssetUpdateNFT } from "./types";

const AUTO_IMPORT_RESCHEDULE_DELAY = 1000;

const AUTO_IMPORT_REFRESH_DELAY = 30 * 1000;

const AUTO_UPDATE_NFT_REFRESH_DELAY = 30;

const AUTO_UPDATE_NFT_REFRESH_BATCH_SIZE = 3;

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

  #autoUpdateNFTAbortController: AbortController | null = null;

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

    this.#scheduleAutoUpdateNFTSurvey();
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

  async setVisibility(targetAssetKey: string, newVisibilityValue: ImportedAssetVisibility, tokenType: "token" | "nft") {
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

      this.emit("assets-modified", [[targetAssetKey, tokenType, { visibility: newVisibilityValue }]]);
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

  async updateCustomNFTAssets(updates: ImportedAssetUpdateNFT[]) {
    const newImportedAssetState = produce(this.#importedAssets, draft => {
      applyImportedAssetUpdates(draft, updates);
    });

    if (newImportedAssetState !== this.#importedAssets) {
      this.#importedAssets = newImportedAssetState;

      await saveImportedAssetsToLocalArea(this.#importedAssets);

      if (updates.length > 0) {
        this.emit("assets-modified", updates);
      }
    }
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

  #scheduleAutoUpdateNFTSurvey() {
    this.#autoUpdateNFTAbortController?.abort();

    const abortController = new AbortController();

    this.#autoUpdateNFTAbortController = abortController;

    setTimeout(() => this.#runAutoUpdateNFTSurvey(abortController.signal));
  }

  async #runAutoUpdateNFTSurvey(signal: AbortSignal) {
    // Take NFT with expired or null metadata.updated
    let existingTokenAssets = this.#importedAssets.filter(asset => {
      const updated = moment((asset as ImportedAssetNFT)?.metadata?.updatedAt ?? moment().subtract(AUTO_UPDATE_NFT_REFRESH_DELAY, "days"));

      return asset.type === "nft" && moment().diff(updated, "days") >= AUTO_UPDATE_NFT_REFRESH_DELAY;
    }) as ImportedAssetNFT[];

    // This is not required, but sometimes performing NFTs information can take long time. (for scammed NFT for example)
    // This is prevented stacking every time if scammed NFT at the top of imported NFTs
    existingTokenAssets = shuffle(existingTokenAssets);

    if (existingTokenAssets.length > 0) {
      let firstCall = true;

      for (const batch of chunk(existingTokenAssets, AUTO_UPDATE_NFT_REFRESH_BATCH_SIZE)) {
        const updates = await surveyAutoNFTUpdates(batch, this.#getAllEnabledNetworks(), signal, firstCall);

        const newImportedAssetState = produce(this.#importedAssets, draft => {
          applyImportedAssetUpdates(draft, updates);
        });

        firstCall = false;

        if (newImportedAssetState !== this.#importedAssets) {
          this.#importedAssets = newImportedAssetState;

          await saveImportedAssetsToLocalArea(this.#importedAssets);

          if (updates.length > 0) {
            this.emit("assets-modified", updates);
          }
        }
      }
    }
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

        // update NFT metadata for imported assets
        this.#scheduleAutoUpdateNFTSurvey();
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

  async #runAutoImportSurveyForNFTs(signal: AbortSignal) {
    const candidates = await surveyAutoNFTImporters(this.#accounts, this.#getAllEnabledNetworks(), signal);

    if (signal.aborted || candidates.size === 0) return { imported: [], updates: [] };

    const existingNFTAssets = this.#importedAssets.filter(asset => asset.type === "nft") as ImportedAssetNFT[];

    const existingAssetsMap = new Map(existingNFTAssets.map(asset => [asset.key, asset]));

    const imported: ImportedAssetNFT[] = [];

    const updates: [
      key: string,
      update:
        | { verified: boolean }
        | {
            name: string;
            metadata: {
              tokenId: string;
              image: string | null;
              updatedAt: number | null;
              accountAddress: string;
            };
          },
    ][] = [];

    for (const [networkIdentifier, importedAssets] of candidates) {
      for (const importedAsset of importedAssets) {
        const key = createAssetKey(networkIdentifier, importedAsset.assetIdentifier);

        const existingCorrespondingAsset = existingAssetsMap.get(key);

        if (!existingCorrespondingAsset) {
          imported.push({
            key,
            networkIdentifier,
            type: "nft",
            visibility: "default",
            autoImported: true,
            ...importedAsset,
          });
        } else if (existingCorrespondingAsset.verified !== importedAsset.verified) {
          updates.push([existingCorrespondingAsset.key, { verified: importedAsset.verified }]);
        } else if (existingCorrespondingAsset.metadata?.accountAddress !== importedAsset.metadata?.accountAddress) {
          updates.push([
            existingCorrespondingAsset.key,
            {
              name: existingCorrespondingAsset.name,
              metadata: {
                ...existingCorrespondingAsset.metadata,
                accountAddress: importedAsset.metadata?.accountAddress,
              },
            },
          ]);
        }
      }
    }

    return { imported, updates };
  }
}
