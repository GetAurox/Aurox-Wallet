export function isEthereumAddress(addressLike: unknown): addressLike is string {
  if (typeof addressLike !== "string") {
    return false;
  }

  return /^0x[a-fA-F0-9]{40}$/.test(addressLike);
}
