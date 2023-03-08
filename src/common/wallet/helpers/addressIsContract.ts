export interface ProviderLikeWithGetCode {
  getCode: (address: string) => Promise<string>;
}

/**
 * Determines whether specified address is contract.
 * Contracts have source code hex value of which get returned by `getCode` function of `ethers`
 * Regular wallets don't have source code and return empty code, the `"0x"` string
 * @param provider Provider interface
 * @param {string} address Address to check
 * @returns `true` if passed address is a contract and `false` if address is not a contract
 */
export async function addressIsContract(provider: ProviderLikeWithGetCode, address: string) {
  const code = await provider.getCode(address);

  // Contracts have source code, e.g. `"0x606060405236156100..."`, whilst wallets don't
  return code !== "0x";
}
