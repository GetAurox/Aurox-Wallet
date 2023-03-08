import { CHAIN_ID_URL } from "common/config";

import { useFetch } from "./useFetch";

export interface ChainList {
  name: string;
  chainId: number;
  shortName: string;
  rpc: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  infoURL: string;
}

export function useChainList() {
  const { response, loading, error } = useFetch<ChainList[]>({ baseURL: CHAIN_ID_URL }, []);

  const list = response?.data || [];

  return { list, loading, error };
}
