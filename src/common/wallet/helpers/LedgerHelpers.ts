import type Transport from "@ledgerhq/hw-transport-webhid";
import type Eth from "@ledgerhq/hw-app-eth";
import range from "lodash/range";

import { HdPath, getEVMSignerPath } from "../signerPaths";

import { HardwarePathResult } from "./types";

/**
 * The Transport module throws an error if instantiated more than once, so requiring a singleton here
 */
export class LedgerTransportSingleton {
  private static _transport: Transport | undefined;
  private static _eth: Eth | undefined;

  public static async getTransport() {
    if (!this._transport) {
      const { default: HWTransportWebHID } = await import(/* webpackChunkName: "vendors/ledger" */ "@ledgerhq/hw-transport-webhid");

      this._transport = (await HWTransportWebHID.create()) as Transport;
    }

    return this._transport;
  }

  public static async getEth() {
    if (!this._eth) {
      const { default: HWAppEth } = await import(/* webpackChunkName: "vendors/ledger" */ "@ledgerhq/hw-app-eth");

      this._eth = new HWAppEth(await this.getTransport());
    }

    return this._eth;
  }
}

// This method adds the 0x prefix and converts the v value to a number for returned signatures. Some hardware wallets return their results in weird formats that require converting
export const parseSignature = (signature: { v: number | string; r: string; s: string }) => ({
  v: parseInt(signature.v.toString()),
  r: "0x" + signature.r,
  s: "0x" + signature.s,
});

export const getAddress = async (accountNumber: number, hdPath: HdPath): Promise<HardwarePathResult> => {
  const eth = await LedgerTransportSingleton.getEth();

  const path = getEVMSignerPath(accountNumber, hdPath);

  const { address } = await eth.getAddress(path);

  return { address, path, accountNumber };
};

export const getMultipleAddresses = async (startIndex: number, numAddresses: number, hdPath: HdPath): Promise<HardwarePathResult[]> => {
  const results: HardwarePathResult[] = [];

  for (const idx of range(numAddresses)) {
    results.push(await getAddress(idx + startIndex, hdPath));
  }

  return results;
};
