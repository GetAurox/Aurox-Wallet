import { AccountInfo, ConsolidatedAccountInfo, ChainType } from "common/types";

export function tryGetAccountAddressForChainType(account: AccountInfo, chainType: ChainType): string | null {
  switch (account.type) {
    case "mnemonic":
      return account.addresses[chainType];
    case "hardware":
    case "private-key":
      if (account.chainType !== chainType) {
        return null;
      }

      return account.address;
  }

  return null;
}

export function getAccountAddressForChainType(account: AccountInfo, chainType: ChainType): string {
  switch (account.type) {
    case "mnemonic":
      return account.addresses[chainType];
    case "hardware":
    case "private-key":
      if (account.chainType !== chainType) {
        throw new Error("Account chain type does not match the requested address chain type");
      }

      return account.address;
  }
}

export function* consolidateAccountsInfo(accounts: AccountInfo[], chainType: ChainType): Generator<ConsolidatedAccountInfo> {
  for (const account of accounts) {
    let address;

    switch (account.type) {
      case "mnemonic":
        address = account.addresses[chainType];
        break;
      case "hardware":
      case "private-key":
        if (account.chainType !== chainType) {
          continue;
        }

        address = account.address;
        break;
    }

    yield { type: account.type, uuid: account.uuid, alias: account.alias, address, hidden: account.hidden ?? false };
  }
}
