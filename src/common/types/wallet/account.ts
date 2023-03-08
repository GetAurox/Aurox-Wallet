import { ChainType, HardwareSignerType, SignerType } from "./common";

export interface SignerAccountInfoBase {
  uuid: string;
  alias: string;
  chainType: ChainType;
  address: string;
  hidden?: boolean;
}

export interface HardwareSignerAccountInfo extends SignerAccountInfoBase {
  type: "hardware";
  hardwareType: HardwareSignerType;
  accountNumber: number;
  path: string;
}

export interface PrivateKeySignerAccountInfo extends SignerAccountInfoBase {
  type: "private-key";
}

export type SignerAccountInfo = HardwareSignerAccountInfo | PrivateKeySignerAccountInfo;

export type SignerAccountInfoFromType<S extends SignerType> = Extract<SignerAccountInfo, { type: S }>;

export interface MnemonicAccountCreationData {
  alias: string;
  accountNumber?: number | null;
}

export interface MnemonicAccountInfo {
  type: "mnemonic";
  uuid: string;
  alias: string;
  accountNumber: number;
  addresses: Record<ChainType, string>;
  hidden?: boolean;
  imported?: boolean;
}

export type AccountInfo = SignerAccountInfo | MnemonicAccountInfo;

export type AccountInfoType = AccountInfo["type"];

export type AccountInfoFromType<T extends AccountInfoType> = Extract<AccountInfo, { type: T }>;

export interface ConsolidatedAccountInfo {
  type: AccountInfo["type"];
  uuid: string;
  alias: string;
  address: string;
  hidden: boolean;
}
