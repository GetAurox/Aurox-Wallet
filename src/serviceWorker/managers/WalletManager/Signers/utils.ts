import { ChainType, HardwareSignerType } from "common/types";

import { PrivateKeySignerConstructorFromChainType, HardwareSignerConstructorFromChainType } from "./types";
import { SolanaSigner } from "./SolanaSigner";
import { LedgerSigner } from "./LedgerSigner";
import { TrezorSigner } from "./TrezorSigner";
import { EVMSigner } from "./EVMSigner";
import { BTCSigner } from "./BTCSigner";

const privateKeyConstructors: { [T in ChainType]: PrivateKeySignerConstructorFromChainType<T> } = {
  evm: EVMSigner,
  solana: SolanaSigner,
  btc: BTCSigner,
};

const hardwareConstructors: { [T in HardwareSignerType]: HardwareSignerConstructorFromChainType<T> } = {
  ledger: LedgerSigner,
  trezor: TrezorSigner,
};

export function getPrivateKeySignerConstructor<T extends ChainType>(chainType: T) {
  return privateKeyConstructors[chainType];
}

export function getHardwareSignerConstructor<T extends HardwareSignerType>(hardwareType: T) {
  return hardwareConstructors[hardwareType];
}
