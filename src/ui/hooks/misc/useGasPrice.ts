import { ETHERSCAN_API_KEY, GAS_PRICE_REFRESH_INTERVAL } from "common/config";
import { EtherscanGasPriceOracleResponse } from "ui/types";

import { useFetch } from "../utils";

export function useGasPrice() {
  const { response, loading, error } = useFetch<EtherscanGasPriceOracleResponse>(
    {
      refetchInterval: GAS_PRICE_REFRESH_INTERVAL,
      method: "GET",
      baseURL: "https://api.etherscan.io/api",
      params: {
        module: "gastracker",
        action: "gasoracle",
        apikey: ETHERSCAN_API_KEY,
      },
    },
    [],
  );

  return {
    gasPrice: Math.round(Number(response?.data?.result?.ProposeGasPrice ?? 0)),
    loading,
    error,
  };
}
