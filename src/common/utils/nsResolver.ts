import { TokenDisplayWithTicker } from "ui/types";

import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config/constants";
import { networkNativeCurrencyData } from "common/config/web3";

import { UNSDomainRecordType } from "common/types";

import { createNetworkIdentifier } from "./network";

export function getUNSDomainRecordTypeFromTokenDisplay(tokenDisplay?: TokenDisplayWithTicker | null): UNSDomainRecordType {
  const ethereumMainnetNetworkIdentifier = createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID);
  const networkIdentifier = tokenDisplay?.networkIdentifier ?? ethereumMainnetNetworkIdentifier;
  const nativeCurrency = networkNativeCurrencyData[networkIdentifier]?.symbol ?? "ETH";
  const nativeCurrencyUNSDomainRecordType: UNSDomainRecordType = `crypto.${nativeCurrency}.address`;

  if (tokenDisplay) {
    if (tokenDisplay.assetDefinition.type === "native") {
      if (tokenDisplay.networkIdentifier === ethereumMainnetNetworkIdentifier) {
        return nativeCurrencyUNSDomainRecordType;
      }

      return `crypto.${nativeCurrency}.version.${nativeCurrency}.address`;
    } else {
      return `crypto.${tokenDisplay.symbol}.version.${tokenDisplay.assetDefinition.contractType}.address`;
    }
  }

  return nativeCurrencyUNSDomainRecordType;
}
