import {
  AssetDefinition,
  ImportedAssetVisibility,
  NativeAssetDefinition,
  SupportedNFTContractType,
  SupportedTokenContractType,
} from "common/types";

export function isNativeAsset(assetIdentifier: string): boolean;
export function isNativeAsset(assetDefinition: AssetDefinition): assetDefinition is NativeAssetDefinition;
export function isNativeAsset(asset: AssetDefinition | string): boolean {
  return typeof asset === "string" ? getAssetDefinitionFromIdentifier(asset).type === "native" : asset?.type === "native";
}

export function getAssetIdentifierFromDefinition(assetDefinition: AssetDefinition) {
  switch (assetDefinition.type) {
    case "native":
      return "native";
    case "contract":
      return `contract::${assetDefinition.contractType}::${assetDefinition.contractAddress}`;
    case "nft":
      return `nft::${assetDefinition.contractType}::${assetDefinition.contractAddress}::${assetDefinition.tokenId}`;
  }
}

export function getAssetDefinitionFromIdentifier(assetIdentifier: string): AssetDefinition {
  const [type, contractType, ...contractAddressParts] = String(assetIdentifier).split("::");

  if (type === "native") {
    return { type: "native" };
  }

  if (type === "contract" && contractType && contractAddressParts.length > 0) {
    const contractAddress = contractAddressParts.join("::");

    return { type: "contract", contractType: contractType as SupportedTokenContractType, contractAddress };
  }

  if (type === "nft" && contractType) {
    const [contractAddress, tokenId] = contractAddressParts;

    return {
      type: "nft",
      contractType: contractType as SupportedNFTContractType,
      contractAddress: contractAddress,
      tokenId: tokenId,
    };
  }

  throw new Error(`Invalid asset identifier provided: ${assetIdentifier}`);
}

export function createAssetKey(networkIdentifier: string, assetIdentifier: string) {
  return `${networkIdentifier}||${assetIdentifier}`;
}

export function extractAssetKeyDetails(assetKey: string) {
  const [networkIdentifier, ...assetIdentifierParts] = assetKey.split("||");

  if (networkIdentifier && assetIdentifierParts.length > 0) {
    const assetIdentifier = assetIdentifierParts.join("||");

    return { networkIdentifier, assetIdentifier };
  }

  throw new Error(`Invalid imported asset key provided: ${assetKey}`);
}

export function applyTokenAssetVisibilityRules(asset: { verified?: boolean; visibility: ImportedAssetVisibility }) {
  if (asset.visibility === "default") {
    return !!asset.verified;
  }

  return asset.visibility === "force-show";
}
