export type HdPath = "Ledger Live" | "Legacy (MEW / MyCrypto)" | "Bip44 Standard (e.g. Metamask, Trezor)";

// Calculating the EVM signer path based on the provided option. The links below indicate the paths required
// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
// https://github.com/ethereum/EIPs/issues/84
export function getEVMSignerPath(accountNumber: number, hdPath: HdPath = "Bip44 Standard (e.g. Metamask, Trezor)") {
  switch (hdPath) {
    case "Bip44 Standard (e.g. Metamask, Trezor)":
      return `m/44'/60'/0'/0/${accountNumber}`;
    case "Ledger Live":
      return `m/44'/60'/${accountNumber}'/0/0`;
    case "Legacy (MEW / MyCrypto)":
      return `m/44'/60'/0'/${accountNumber}`;
    default:
      throw new Error("Missing implementation for EVM signer path");
  }
}

export function getSolanaSignerPath(accountNumber: number) {
  return `m/44'/501'/${accountNumber}'/0'`;
}
