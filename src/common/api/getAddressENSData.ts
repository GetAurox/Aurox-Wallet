import axios, { AxiosResponse } from "axios";

import { ENS_SERVICE_URL } from "common/config";

export async function getAddressENSData(address: string) {
  let run = 0;

  while (true) {
    try {
      const response: AxiosResponse<{
        subdomain: null;
      }> = await axios(`${ENS_SERVICE_URL}/api/v1/subdomains/checkAddress/${address}`);

      return { isExistedENSAddress: response.data.subdomain !== null, subdomain: response.data.subdomain };
    } catch (e) {
      //In case if we have some network problems we mark like domain is existed to move to next step
      if (axios.isAxiosError(e)) {
        run++;

        if (run === 3) {
          return { isExistedENSAddress: true, subdomain: null };
        }
      } else {
        throw e;
      }
    }
  }
}
