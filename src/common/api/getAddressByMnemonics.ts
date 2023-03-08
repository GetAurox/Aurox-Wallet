import { Wallet } from "ethers";

export function getAddressByMnemonics(mnemonic: string) {
  const wallet = Wallet.fromMnemonic(mnemonic);

  return wallet.getAddress();
}
