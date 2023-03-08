import { SupportedTokenContractType } from "./blockchain";

/**
 * default:
 *  - For tokens: show when verified, hide when unverified
 *  - For NFTs: show when owned, hide when not
 *
 * hidden:
 *  - For tokens: Hide even if verified
 *  - For NFTs: Hide even if owned
 *
 * force-show:
 *  - For tokens: Show even if unverified
 *  - For NFTs: Show even if not owned
 */
export type ImportedAssetVisibility = "default" | "hidden" | "force-show";

export interface ImportedAssetCommonProperties {
  key: string;
  assetIdentifier: string;
  networkIdentifier: string;
  contractType: SupportedTokenContractType;
  contractAddress: string;
  visibility: ImportedAssetVisibility;
  autoImported: boolean;
}

export interface ImportedAssetToken extends ImportedAssetCommonProperties {
  type: "token";
  decimals: number;
  symbol: string;
  name: string;
  verified: boolean;
}

export interface ImportedAssetNFT extends ImportedAssetCommonProperties {
  type: "nft";
  // TODO: add appropriate metadata props
  decimals: number;
  symbol: string;
  name: string;
  verified: boolean;
}

export type ImportedAsset = ImportedAssetToken | ImportedAssetNFT;

export type ImportNewAssetResult = { status: "error"; code: string; message: string } | { status: "success" };

export interface NativeAssetDefinition {
  type: "native";
}

export interface ContractAssetDefinition {
  type: "contract";
  contractType: SupportedTokenContractType;
  contractAddress: string;
}

export type AssetDefinition = NativeAssetDefinition | ContractAssetDefinition;
