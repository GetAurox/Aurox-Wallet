import axios, { AxiosResponse } from "axios";

import { WalletManager } from "serviceWorker/managers";

import { ENS } from "common/operations";
import { ENS_SERVICE_URL } from "common/config";
import { MnemonicAccountInfo } from "common/types";

export function setupEnsService(walletManager: WalletManager) {
  ENS.AddENS.registerResponder(async ({ subdomain }) => {
    const activeAccountInfo = walletManager.getActiveAccountInfo();
    const address = (activeAccountInfo as MnemonicAccountInfo)?.addresses?.evm ?? "";
    const uuid = activeAccountInfo?.uuid ?? "";

    const data = { ethAddress: address, requestedSubdomain: subdomain };
    const requestMethod = "POST";
    const requestPath = "/api/v2/subdomains/register";
    const message = `${requestMethod}${requestPath}${JSON.stringify(data)}`;

    const signature = await walletManager.signMessage({
      chainType: "evm",
      message,
      uuid,
      shouldArrayify: false,
    });

    const headers = {
      "x-aurox-signature": signature,
      "x-aurox-address": address,
    };

    try {
      const response: AxiosResponse<{
        result?: "OK";
        error?: string;
      }> = await axios(`${ENS_SERVICE_URL}${requestPath}`, { method: requestMethod, data, headers });

      if (response.data.result === "OK") {
        return { status: true };
      }

      return { status: false, error: response.data.error ?? "Unknown error from ENS server" };
    } catch (e) {
      return { status: false, error: e.response.data.error };
    }
  });
}
