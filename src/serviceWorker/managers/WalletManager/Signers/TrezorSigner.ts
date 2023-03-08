import { HardwareSignerStorageData } from "common/types";

import { HardwareSigner } from "./HardwareSigner";

export class TrezorSigner extends HardwareSigner<"trezor"> {
  constructor(storage: Omit<HardwareSignerStorageData, "type" | "hardwareType">) {
    super("trezor", storage);
  }
}
