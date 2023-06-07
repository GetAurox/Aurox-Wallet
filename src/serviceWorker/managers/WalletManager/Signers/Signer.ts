import { ChainType, SignerType, SignerAccountInfoBase, SignerAccountInfoFromType, SignerStorageDataFromType } from "common/types";

import { SignerSpecificAccountInfo, SignerSpecificStorageData } from "./types";

export abstract class Signer<S extends SignerType = SignerType> {
  #type: S;
  #uuid: string;
  #alias: string;
  #chainType: ChainType;
  #address: string;
  #hidden: boolean;

  public get type() {
    return this.#type;
  }

  public get uuid() {
    return this.#uuid;
  }

  public get alias() {
    return this.#alias;
  }

  public get chainType() {
    return this.#chainType;
  }

  public get address() {
    return this.#address;
  }

  public get hidden() {
    return this.#hidden;
  }

  constructor(type: S, { uuid, alias, address, chainType, hidden }: SignerAccountInfoBase) {
    this.#type = type;
    this.#uuid = uuid;
    this.#alias = alias;
    this.#chainType = chainType;
    this.#address = address;
    this.#hidden = hidden ?? false;
  }

  public setAlias(newAlias: string) {
    this.#alias = newAlias;
  }

  public setHidden(newHidden: boolean) {
    this.#hidden = newHidden;
  }

  public getSignerAccountInfo(): SignerAccountInfoFromType<S> {
    return {
      ...this.getSignerSpecificAccountInfo(),
      type: this.#type,
      uuid: this.#uuid,
      alias: this.#alias,
      chainType: this.#chainType,
      address: this.#address,
      hidden: this.#hidden,
    } as SignerAccountInfoFromType<S>;
  }

  public getSignerStorageData(): SignerStorageDataFromType<S> {
    return {
      ...this.getSignerAccountInfo(),
      ...this.getSignerSpecificStorageData(),
    } as SignerStorageDataFromType<S>;
  }

  protected abstract getSignerSpecificAccountInfo(): SignerSpecificAccountInfo<S>;

  protected abstract getSignerSpecificStorageData(): SignerSpecificStorageData<S>;
}
