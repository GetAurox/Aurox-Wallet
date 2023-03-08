import { Wallet as EthersWallet } from "@ethersproject/wallet";

import { validateMnemonicsValueWordlist } from "../bip39";

export type IsValidType = "mnemonic" | "private-key" | "invalid";

export function isValidMnemonicOrPrivateKey(mnemonicOrPrivateKey: string): IsValidType {
  if (validateMnemonicsValueWordlist(mnemonicOrPrivateKey)) return "mnemonic";

  try {
    new EthersWallet(mnemonicOrPrivateKey);

    return "private-key";
  } catch {
    return "invalid";
  }
}
