import axios, { AxiosResponse } from "axios";
import { DOMAIN_INFO_BASE_URL } from "common/config";

export async function checkIfDomainIsNew(targetDomain: string): Promise<boolean> {
  const response: AxiosResponse<{
    result: boolean | "undefined";
  }> = await axios({
    method: "GET",
    baseURL: DOMAIN_INFO_BASE_URL,
    url: `domain/${targetDomain}`,
  });

  return response.data.result === "undefined" ? false : response.data.result;
}
