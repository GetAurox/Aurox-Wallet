import { ImportedAssetVisibility } from "common/types";

export type ImportedAssetUpdateToken = [
  uuid: string,
  type: "token",
  payload: { verified: boolean } | { visibility: ImportedAssetVisibility },
];

export type ImportedAssetUpdateNFT = [
  uuid: string,
  type: "nft",
  payload:
    | { verified: boolean }
    | { visibility: ImportedAssetVisibility }
    | {
        name: string;
        verified?: boolean;
        metadata: {
          tokenId: string;
          image: string | null;
          updatedAt: number | null;
          accountAddress: string;
        };
      },
];

export type ImportedAssetUpdate = ImportedAssetUpdateToken | ImportedAssetUpdateNFT;
