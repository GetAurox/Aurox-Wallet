import { HardwareSignerStorageData } from "common/types";

import { HardwareSigner } from "./HardwareSigner";

export class LedgerSigner extends HardwareSigner<"ledger"> {
  constructor(storage: Omit<HardwareSignerStorageData, "type" | "hardwareType">) {
    super("ledger", storage);
  }
}
