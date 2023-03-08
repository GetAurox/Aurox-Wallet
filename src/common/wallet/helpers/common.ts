import { ethers } from "ethers";
import { v4 as uuid4 } from "uuid";

import { HardwareSignerType } from "common/types";
import { Wallet } from "common/operations";

import { HdPath } from "../signerPaths";

// Using this silly import path to prevent circular dependency issues
import * as LedgerHelpers from "./LedgerHelpers";
import * as TrezorHelpers from "./TrezorHelpers";

const numAddresses = 5;

export async function getHardwareAddressHandler(
  hardwareWallet: HardwareSignerType,
  walletIndex: number,
  hdPath: HdPath,
): Promise<Wallet.ImportHardwareSigner.Data[]> {
  let addresses = [];
  if (hardwareWallet === "ledger") {
    addresses = await LedgerHelpers.getMultipleAddresses(walletIndex, numAddresses, hdPath);
  } else if (hardwareWallet === "trezor") {
    addresses = await TrezorHelpers.getMultipleAddresses(walletIndex, numAddresses, hdPath);
  } else {
    throw new Error("Missing implementation");
  }

  return addresses.map((details, index) => ({
    ...details,
    uuid: uuid4(),
    alias: `${hardwareWallet} ${index}`,
    type: "hardware",
    hardwareType: hardwareWallet,
    chainType: "evm",
  }));
}

/**
 * This method takes in revert data coming from a contract call and decodes it to extract the string contents of the revert data.
 * @dev Extra handling implemented for erroneous error messages (error's without a provided message). These errors will return with a length less than 68 (more here: https://ethereum.stackexchange.com/questions/83528/how-can-i-get-the-revert-reason-of-a-call-in-solidity-so-that-i-can-use-it-in-th)
 * @param revertData The abi encoded revertData to decode
 * @returns The decoded revertData
 */
export function getRevertMessageFromRevertData(revertData: string) {
  if (revertData.length < 68) return "Reverted without message";

  try {
    // Decode the response data as a string, also slice the first 4 characters as this is the selector
    const [decodedValue] = ethers.utils.defaultAbiCoder.decode(["string"], ethers.utils.hexDataSlice(revertData, 4));

    return decodedValue;
  } catch (e) {
    // Some errors may be returned in weird formats and will fail the decoding
    return "Reverted without readable message";
  }
}
