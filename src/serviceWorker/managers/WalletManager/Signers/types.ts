import {
  ChainType,
  HardwareSignerType,
  SignerAccountInfoBase,
  SignerAccountInfoFromType,
  SignerStorageDataFromType,
  SignerType,
} from "common/types";

import { SolanaSigner } from "./SolanaSigner";
import { TrezorSigner } from "./TrezorSigner";
import { LedgerSigner } from "./LedgerSigner";
import { EVMSigner } from "./EVMSigner";
import { BTCSigner } from "./BTCSigner";

export type SignerSpecificAccountInfo<S extends SignerType> = Omit<SignerAccountInfoFromType<S>, keyof SignerAccountInfoBase | "type">;
export type SignerSpecificStorageData<S extends SignerType> = Omit<SignerStorageDataFromType<S>, keyof SignerAccountInfoFromType<S>>;

export interface SignerFromMnemonicData {
  mnemonic: string;
  accountNumber: number;
  alias: string;
  uuid: string;
}

export interface SignerFromPrivateKeyData {
  privateKey: string;
  alias: string;
  uuid: string;
}

export type PrivateKeySignerFromChainType<T extends ChainType> = { "evm": EVMSigner; "solana": SolanaSigner; "btc": BTCSigner }[T];

export type PrivateKeySignerConstructorFromChainType<T extends ChainType> = {
  "evm": typeof EVMSigner;
  "solana": typeof SolanaSigner;
  "btc": typeof BTCSigner;
}[T];

export type HardwareSignerFromChainType<T extends HardwareSignerType> = { "ledger": LedgerSigner; "trezor": TrezorSigner }[T];

export type HardwareSignerConstructorFromChainType<T extends HardwareSignerType> = {
  "ledger": typeof LedgerSigner;
  "trezor": typeof TrezorSigner;
}[T];
