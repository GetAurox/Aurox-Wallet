import { HardwareSignerStorageData, HardwareSignerType } from "common/types";

import { SignerSpecificAccountInfo, SignerSpecificStorageData } from "./types";
import { Signer } from "./Signer";

export abstract class HardwareSigner<H extends HardwareSignerType = HardwareSignerType> extends Signer<"hardware"> {
  #hardwareType: H;
  #accountNumber: number;
  #path: string;

  public get hardwareType() {
    return this.#hardwareType;
  }

  public get accountNumber() {
    return this.#accountNumber;
  }

  public get path() {
    return this.#path;
  }

  constructor(hardwareType: H, { accountNumber, path, ...storage }: Omit<HardwareSignerStorageData, "type" | "hardwareType">) {
    super("hardware", storage);

    this.#hardwareType = hardwareType;
    this.#accountNumber = accountNumber;
    this.#path = path;
  }

  protected getSignerSpecificAccountInfo(): SignerSpecificAccountInfo<"hardware"> {
    return { hardwareType: this.#hardwareType, accountNumber: this.#accountNumber, path: this.#path };
  }

  protected getSignerSpecificStorageData(): SignerSpecificStorageData<"hardware"> {
    return {};
  }
}
