import axios, { AxiosResponse } from "axios";
import { ethers } from "ethers";
import produce from "immer";

import { ENS_SERVICE_URL, UNS_API_KEY, UNS_RESOLVE_BASE_URL } from "common/config";
import { UNSDomainRecordType, UNSDomainResponse } from "common/types";
import { EVMProvider } from "common/wallet";

import { loadNSCacheFromLocalArea, saveNSCacheToLocalArea } from "common/storage/local";

const NS_RECORD_CACHE_EXPIRATION = 2 * 60 * 60 * 1000; // NS cache record TTL is 2 hours

async function getCachedNSRecordValue(
  recordKey: string,
): Promise<{ cachedValue: string | null; cache: Record<string, [string, number]> | null }> {
  const cache = await loadNSCacheFromLocalArea();
  const recordValue = cache?.[recordKey.toLowerCase()];

  if (cache && recordValue) {
    if (Date.now() - recordValue[1] < NS_RECORD_CACHE_EXPIRATION) {
      return { cachedValue: recordValue[0].toLowerCase(), cache };

      // If NS record is expired, delete it from cache
    } else {
      await saveNSCacheToLocalArea(
        produce(cache, draft => {
          delete draft[recordKey.toLowerCase()];
        }),
      );
    }
  }

  return { cachedValue: null, cache };
}

export async function getAddressFromEVMProvider(provider: EVMProvider, domain: string) {
  const { cachedValue, cache } = await getCachedNSRecordValue(`ens||${domain}`);

  if (cachedValue) return { address: cachedValue };

  try {
    const address = await provider.resolveName(domain);

    if (address) {
      // Cache NS record and its reverse record
      await saveNSCacheToLocalArea(
        produce(cache || {}, draft => {
          draft[`ens||${domain}`.toLowerCase()] = [address.toLowerCase(), Date.now()];
          draft[`ens||${address}`.toLowerCase()] = [domain.toLowerCase(), Date.now()];
        }),
      );
    }

    return { address };
  } catch (error) {
    console.warn(`Failed to resolve address from name "${domain}" from EVMProvider`, error);

    return { address: null };
  }
}

export async function getDomainFromEVMProvider(provider: EVMProvider, address: string) {
  const { cachedValue, cache } = await getCachedNSRecordValue(`ens||${address}`);

  if (cachedValue) return { domain: cachedValue };

  try {
    const domain = await provider.lookupAddress(address);

    if (domain) {
      // Cache NS record and its reverse record
      await saveNSCacheToLocalArea(
        produce(cache || {}, draft => {
          draft[`ens||${address}`.toLowerCase()] = [domain.toLowerCase(), Date.now()];
          draft[`ens||${domain}`.toLowerCase()] = [address.toLowerCase(), Date.now()];
        }),
      );
    }

    return { domain };
  } catch (error) {
    console.warn(`Failed to lookup domain for address "${address}" from EVMProvider`, error);

    return { domain: null };
  }
}

// Per documentation domain name in UnstoppableDomains may resolve to several addresses depending on the context
export async function getAddressFromUnstoppableDomains(unsDomainRecordType: UNSDomainRecordType, domain: string) {
  const { cachedValue, cache } = await getCachedNSRecordValue(`ud||${unsDomainRecordType}::${domain}`);

  if (cachedValue) return { address: cachedValue };

  try {
    const response: AxiosResponse<UNSDomainResponse> = await axios(`/domains/${domain}`, {
      baseURL: UNS_RESOLVE_BASE_URL,
      headers: {
        Authorization: `Bearer ${UNS_API_KEY}`,
      },
    });

    const address = response?.data?.records?.[unsDomainRecordType] ?? null;

    if (address) {
      await saveNSCacheToLocalArea(
        produce(cache || {}, draft => {
          draft[`ud||${unsDomainRecordType}::${domain}`.toLowerCase()] = [address.toLowerCase(), Date.now()];
        }),
      );
    }

    return { address };
  } catch (error) {
    console.warn(`Failed to resolve address from name "${domain}" from UnstoppableDomains`, error);

    return { address: null };
  }
}

export async function getDomainFromUnstoppableDomains(address: string) {
  const { cachedValue, cache } = await getCachedNSRecordValue(`ud||${address}`);

  if (cachedValue) return { domain: cachedValue };

  try {
    const response: AxiosResponse<UNSDomainResponse> = await axios(`/reverse/${address}`, {
      baseURL: UNS_RESOLVE_BASE_URL,
      headers: {
        Authorization: `Bearer ${UNS_API_KEY}`,
      },
    });

    const domain = response?.data?.meta?.domain ?? null;

    if (domain) {
      await saveNSCacheToLocalArea(
        produce(cache || {}, draft => {
          draft[`ud||${address}`.toLowerCase()] = [domain.toLowerCase(), Date.now()];
        }),
      );
    }

    return { domain };
  } catch (error) {
    console.warn(`Failed to lookup domain for address "${address}" from UnstoppableDomains`, error);

    return { domain: null };
  }
}

export async function getAddressFromAuroxENS(domain: string) {
  const { cachedValue, cache } = await getCachedNSRecordValue(`aurox||${domain}`);

  if (cachedValue) return { address: cachedValue };

  try {
    const response: AxiosResponse<{
      resolveAddress?: string | null;
    }> = await axios(`${ENS_SERVICE_URL}/api/v1/subdomains/check/${domain}`);

    let address = response?.data?.resolveAddress ?? null;

    if (address === ethers.constants.AddressZero) {
      address = null;
    }

    if (address) {
      const addressString = address.toLowerCase();

      // Cache NS record and its reverse record
      await saveNSCacheToLocalArea(
        produce(cache || {}, draft => {
          draft[`aurox||${domain}`.toLowerCase()] = [addressString, Date.now()];
          draft[`aurox||${addressString}`] = [domain.toLowerCase(), Date.now()];
        }),
      );
    }

    return { address: address ?? null };
  } catch (error) {
    console.warn(`Failed to resolve address from name "${domain}" from UnstoppableDomains`, error);

    return { address: null };
  }
}

export async function getDomainFromAuroxENS(address: string) {
  const { cachedValue, cache } = await getCachedNSRecordValue(`aurox||${address}`);

  if (cachedValue) return { domain: cachedValue };

  try {
    const response: AxiosResponse<{
      subdomain?: string | null;
    }> = await axios(`${ENS_SERVICE_URL}/api/v1/subdomains/checkAddress/${address}`);

    const domain = response?.data?.subdomain ?? null;

    if (domain) {
      // Cache NS record and its reverse record
      await saveNSCacheToLocalArea(
        produce(cache || {}, draft => {
          draft[`aurox||${address}`.toLowerCase()] = [domain.toLowerCase(), Date.now()];
          draft[`aurox||${domain}`.toLowerCase()] = [address.toLowerCase(), Date.now()];
        }),
      );
    }

    return { domain: domain ?? null };
  } catch (error) {
    console.warn(`Failed to lookup domain for address "${address}" from UnstoppableDomains`, error);

    return { domain: null };
  }
}
