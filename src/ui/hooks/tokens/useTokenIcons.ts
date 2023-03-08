import { useMemo } from "react";

import { AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL } from "common/config";

import { useFetch } from "../utils";

const brandAddress = (address: string) => `__${address}`;
const removeAddressBranding = (brandedAddress: string) => String(brandedAddress).substring(2);

export interface IconMappingItem {
  id: string;
  color: string | null;
  white: string | null;
  black: string | null;
  /**
   * used to pass props directly to <img> (alt and src)
   */
  img: {
    alt?: string;
    src?: string;
  };
}

interface ResponseTokenPayload {
  id: string;
  icons?: Partial<Record<"color" | "white" | "black", string | null>> | null;
}

interface ResponsePayload {
  data: { market: Record<string, ResponseTokenPayload> };
}

export function useTokenIcons(tokenAddresses: string[]) {
  // `tokenAddresses` order may vary and thus `query` changes so in order to avoid unnecessary re-renders sort is needed
  tokenAddresses.sort();

  let query = "";

  for (const address of tokenAddresses) {
    query += `
    ${brandAddress(address)}: coin(address: "${address}") {
      id
      icons { color, white, black }
    }
  `;
  }

  const { response, loading, error } = useFetch<ResponsePayload>(
    {
      shouldSkip: tokenAddresses.length === 0,
      refetchInterval: undefined,
      method: "POST",
      baseURL: AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL,
      data: {
        query: `{ market { ${query} } }`,
      },
    },
    [query],
  );

  const brandedTokenIcons = response?.data?.data?.market;

  const icons = useMemo(() => {
    const result: Record<string, IconMappingItem> = {};

    for (const [brand, payload] of Object.entries(brandedTokenIcons ?? {})) {
      if (payload?.id) {
        result[removeAddressBranding(brand)] = {
          id: payload.id,
          color: payload.icons?.color ?? null,
          white: payload.icons?.white ?? null,
          black: payload.icons?.black ?? null,
          img: {
            alt: payload.id,
            src: payload.icons?.color ?? payload.icons?.white ?? payload.icons?.black ?? undefined,
          },
        };
      }
    }

    return result;
  }, [brandedTokenIcons]);

  return { icons, loading, error };
}
