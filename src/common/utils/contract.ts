import { ethers } from "ethers";

export function formatChainId(chainId: string | number, hex = true): string {
  const number = Number(chainId);

  if (hex) return `0x${number.toString(16)}`;

  return number.toString();
}

export function tryParsePersonalMessage(message: string) {
  try {
    return ethers.utils.toUtf8String(message);
  } catch (error) {
    return message;
  }
}
