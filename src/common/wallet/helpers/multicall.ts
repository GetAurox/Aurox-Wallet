import {
  ETHEREUM_MAINNET_CHAIN_ID,
  BINANCE_SMART_CHAIN_CHAIN_ID,
  POLYGON_CHAIN_ID,
  AVALANCHE_CHAIN_ID,
  FANTOM_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "common/config";

/**
 * Not all EVM chains have a deployed multicall contract, deployment of this contract will be rolled out to EVM chains overtime
 * @note All addresses are the same for chainId's but keeping it in this mapping to help with readability and also if one unexpectedly is deployed with a different address
 */
export const multicallAddressMapping: Record<number, string> = {
  [ETHEREUM_MAINNET_CHAIN_ID]: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  // Ropsten
  3: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  // Rinkeby
  4: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  // Goerli
  5: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  // Optimism
  [OPTIMISM_CHAIN_ID]: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  // Kovan
  42: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  [BINANCE_SMART_CHAIN_CHAIN_ID]: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  [POLYGON_CHAIN_ID]: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  [FANTOM_CHAIN_ID]: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  [ARBITRUM_CHAIN_ID]: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
  [AVALANCHE_CHAIN_ID]: "0xeA555f39654DB33414337e9BA9f93bFf56e2B52d",
};

export function getMulticallAddress(chainId: number): string | null {
  const multicallAddress = multicallAddressMapping[chainId];

  if (!multicallAddress) return null;

  return multicallAddress;
}

export const multicallContractAddressForBalanceChecking: Record<string, string> = {
  [ETHEREUM_MAINNET_CHAIN_ID]: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
  // Kovan
  42: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
  // Goerli
  5: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
  // Rinkeby
  4: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
  // Ropsten
  3: "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696",
  [BINANCE_SMART_CHAIN_CHAIN_ID]: "0xC50F4c1E81c873B2204D7eFf7069Ffec6Fbe136D",
  // Binance Smart Chain Testnet
  97: "0x73CCde5acdb9980f54BcCc0483B28B8b4a537b4A",
  // "xdai": "0x2325b72990D81892E0e09cdE5C80DD221F147F8B",
  // Mumbai
  80001: "0xe9939e7Ea7D7fb619Ac57f648Da7B1D425832631",
  // EtherLite Chain
  111: "0x21681750D7ddCB8d1240eD47338dC984f94AF2aC",
  [POLYGON_CHAIN_ID]: "0x275617327c958bD06b5D6b871E7f491D76113dd8",
  [ARBITRUM_CHAIN_ID]: "0x7a7443f8c577d537f1d8cd4a629d40a3148dd7ee",
  // Avalanche Fuji Testnet
  43113: "0x3D015943d2780fE97FE3f69C97edA2CCC094f78c",
  [AVALANCHE_CHAIN_ID]: "0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4",
  [FANTOM_CHAIN_ID]: "0xD98e3dBE5950Ca8Ce5a4b59630a5652110403E5c",
  // Cronos Mainnet Beta
  25: "0x5e954f5972EC6BFc7dECd75779F10d848230345F",
  // "harmony": "0x5c41f6817feeb65d7b2178b0b9cebfc8fad97969",
  [OPTIMISM_CHAIN_ID]: "0xeAa6877139d436Dc6d1f75F3aF15B74662617B2C",
  // Optimism Kovan
  69: "0x91c88479F21203444D2B20Aa001f951EC8CF2F68",
};

export const balanceCheckingContractABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
