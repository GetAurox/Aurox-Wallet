import { NSResolver } from "common/operations";
import { ProviderManager } from "common/wallet";
import { NetworkManager } from "serviceWorker/managers";

import {
  getAddressFromEVMProvider,
  getDomainFromEVMProvider,
  getAddressFromUnstoppableDomains,
  getDomainFromUnstoppableDomains,
  getAddressFromAuroxENS,
  getDomainFromAuroxENS,
} from "./utils";

const ENS_DOMAIN_ENDING = ".eth";
const AUROX_DOMAIN_ENDING = ".aurox.eth";

export function setupNSResolverService(networkManager: NetworkManager) {
  NSResolver.ResolveAddressFromDomain.registerResponder(async ({ unsDomainRecordType, domain, networkIdentifier }) => {
    const network = networkManager.getNetworkByIdentifier(networkIdentifier);

    if (!network) {
      throw new Error(`Can not find network with identifier ${networkIdentifier}`);
    }

    const provider = ProviderManager.getProvider(network);

    if (provider.chainType !== "evm") {
      return { address: null };
    }

    // Perform ENS domain checking first in case if provided domain ends to .eth
    if (domain.trim().toLowerCase().endsWith(ENS_DOMAIN_ENDING)) {
      // If domain ends to .aurox.eth do check against Aurox NS
      if (domain.trim().toLowerCase().endsWith(AUROX_DOMAIN_ENDING)) {
        return getAddressFromAuroxENS(domain.trim().replace(AUROX_DOMAIN_ENDING, ""));
      }

      return getAddressFromEVMProvider(provider, domain);
    }

    if (unsDomainRecordType) {
      const uns = await getAddressFromUnstoppableDomains(unsDomainRecordType, domain);

      if (uns.address) {
        return uns;
      }
    }

    return getAddressFromEVMProvider(provider, domain);
  });

  NSResolver.ResolveDomainFromAddress.registerResponder(async ({ address, networkIdentifier }) => {
    const network = networkManager.getNetworkByIdentifier(networkIdentifier);

    if (!network) {
      throw new Error(`Can not find network with identifier ${networkIdentifier}`);
    }

    const provider = ProviderManager.getProvider(network);

    if (provider.chainType !== "evm") {
      return { domain: null };
    }

    // First try to get domain from UNS
    const { domain: unsDomain } = await getDomainFromUnstoppableDomains(address);

    // If not found in UNS, try checking ENS and then fallback to Aurox NS
    if (!unsDomain) {
      const { domain: ensDomain } = await getDomainFromEVMProvider(provider, address);

      if (ensDomain) {
        return { domain: ensDomain };
      }

      const { domain: auroxDomain } = await getDomainFromAuroxENS(address);

      if (auroxDomain) {
        return { domain: `${auroxDomain}${AUROX_DOMAIN_ENDING}` };
      }
    }

    return { domain: unsDomain };
  });
}
