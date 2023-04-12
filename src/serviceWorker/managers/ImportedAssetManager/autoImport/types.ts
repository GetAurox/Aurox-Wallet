import { SupportedNFTContractType, SupportedTokenContractType } from "common/types";

export interface AutoImportTokenAssetCandidate {
  assetIdentifier: string;
  contractType: SupportedTokenContractType;
  contractAddress: string;
  decimals: number;
  symbol: string;
  name: string;
  /**
   * This property does not come from the blockchain, but rather from our backend.
   * Therefore, it is subject to change. Expect possible updates to this value.
   */
  verified: boolean;
}

export interface AutoImportNFTAssetCandidate {
  assetIdentifier: string;
  contractType: SupportedNFTContractType;
  contractAddress: string;
  decimals: number;
  symbol: string;
  name: string;
  /**
   * This property does not come from the blockchain, but rather from our backend.
   * Therefore, it is subject to change. Expect possible updates to this value.
   */
  verified: boolean;
  metadata: {
    tokenId: string;
    image: string | null;
    updatedAt: number | null;
    accountAddress: string;
  };
}
