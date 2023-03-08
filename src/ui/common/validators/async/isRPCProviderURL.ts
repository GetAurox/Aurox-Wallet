import memoize from "lodash/memoize";
import { v4 as uuidV4 } from "uuid";
import axios from "axios";

export type RPCProviderURLValidationResult =
  | { failed: false; response: { result: string; id: string; jsonrpc: string } }
  | { failed: true; error: { code: number; message: string } };

export const isRPCProviderURL = memoize(async function isRPCProviderURL(rpcUrl: string): Promise<RPCProviderURLValidationResult | null> {
  try {
    const { data, status } = await axios.post(rpcUrl, {
      id: uuidV4(),
      jsonrpc: "2.0",
      method: "eth_chainId",
      params: [],
    });

    if (status === 200) {
      return { failed: false, response: data };
    }
  } catch (error) {
    return { failed: true, error: { code: error.code, message: error.message } };
  }

  return null;
});
