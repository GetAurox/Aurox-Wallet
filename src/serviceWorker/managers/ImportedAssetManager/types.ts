import { ImportedAssetVisibility } from "common/types";

export type ImportedAssetUpdateToken = [
  uuid: string,
  type: "token",
  payload: { verified: boolean } | { visibility: ImportedAssetVisibility },
];

export type ImportedAssetUpdateNFT = [uuid: string, type: "nft", payload: {}];

export type ImportedAssetUpdate = ImportedAssetUpdateToken | ImportedAssetUpdateNFT;
