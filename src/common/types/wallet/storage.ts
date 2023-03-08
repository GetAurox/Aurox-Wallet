import { PrivateKeySignerAccountInfo, HardwareSignerAccountInfo, MnemonicAccountInfo } from "./account";
import { ChainType, SignerType } from "./common";

export type HardwareSignerStorageData = HardwareSignerAccountInfo;

export interface PrivateKeySignerStorageData extends PrivateKeySignerAccountInfo {
  privateKey: string;
}

export type SignerStorageData = HardwareSignerStorageData | PrivateKeySignerStorageData;

export type SignerStorageDataFromType<S extends SignerType> = Extract<SignerStorageData, { type: S }>;

export interface MnemonicAccountStorageData extends MnemonicAccountInfo {
  privateKeys: Record<ChainType, string>;
}

export interface MnemonicWalletStorageData {
  /**
   * The plain mnemonic phrases
   */
  mnemonic: string;

  /**
   * Accounts added by the user on the mnemonic account across all chains
   */
  accounts: MnemonicAccountStorageData[];
}
