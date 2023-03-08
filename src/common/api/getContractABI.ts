import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL, GRAPHQL_LEECHER_X_API_KEY } from "common/config";

function getContractABIRequest(signature: string): AxiosRequestConfig {
  return {
    method: "POST",
    baseURL: AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL,
    data: {
      query: `
        {
          ethereum {
            evm {
              methodSignature(id: "${signature}") {
                id
                signature
              } 
            }
          }
        }`,
    },
    headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY },
  };
}

export async function getContractABI(signature: string): Promise<string> {
  const response: AxiosResponse<any> = await axios(getContractABIRequest(signature));

  return response.data;
}
