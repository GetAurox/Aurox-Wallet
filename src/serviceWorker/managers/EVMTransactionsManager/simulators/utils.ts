import { isAddress } from "@ethersproject/address";

export function isAddressEqual(address?: string, targetAddress?: string) {
  return typeof address === "string" && isAddress(address) && address.toLowerCase() === targetAddress?.toLowerCase();
}
