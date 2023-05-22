import { SupportedNetworkChain } from "ui/types";

import { createNetworkIdentifier } from "common/utils/network";
import { ChainType } from "common/types";

import { buildDefaultSecondaryNetworks, buildDefaultMainNetworks } from "./defaultNetworks";

import {
  ETHEREUM_MAINNET_NATIVE_ASSET_PRICING_PAIR_ID,
  ETHEREUM_MAINNET_CHAIN_ID,
  BINANCE_SMART_CHAIN_NATIVE_ASSET_PRICING_PAIR_ID,
  BINANCE_SMART_CHAIN_CHAIN_ID,
  POLYGON_CHAIN_ID,
  AVALANCHE_CHAIN_ID,
  DEFAULT_DECIMALS,
  ETHEREUM_MAINNET_NATIVE_ASSET_ID,
  BINANCE_SMART_CHAIN_NATIVE_ASSET_ID,
  POLYGON_NATIVE_ASSET_ID,
  POLYGON_NATIVE_ASSET_PRICING_PAIR_ID,
  AVALANCHE_NATIVE_ASSET_ID,
  AVALANCHE_NATIVE_ASSET_PRICING_PAIR_ID,
  FANTOM_CHAIN_ID,
  FANTOM_NATIVE_ASSET_ID,
  FANTOM_NATIVE_ASSET_PRICING_PAIR_ID,
  ARBITRUM_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  GNOSIS_CHAIN_ID,
  KLAYTN_CHAIN_ID,
  AURORA_CHAIN_ID,
} from "./constants";
import {
  ALCHEMY_ARBITRUM_NFT_URL,
  ALCHEMY_ARBITRUM_RPC_URL,
  ALCHEMY_MAINNET_NFT_URL,
  ALCHEMY_MAINNET_RPC_URL,
  ALCHEMY_OPTIMISM_NFT_URL,
  ALCHEMY_POLYGON_NFT_URL,
  ALCHEMY_POLYGON_RPC_URL,
  AUROX_BLOCKCHAIN_AVALANCHE_GRAPHQL_BASE_URL,
  AUROX_BLOCKCHAIN_BSC_GRAPHQL_BASE_URL,
  AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL,
  AUROX_BLOCKCHAIN_POLYGON_GRAPHQL_BASE_URL,
} from "./urls";

export const supportedChainTypes: ChainType[] = ["evm", "solana"];

export const ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const WETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const WMATIC_ADDRESS = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
export const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const WAVAX_ADDRESS = "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7";

export const NULL_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export const ETH_TRANSFER_GAS_LIMIT = 21000;
export const APPROXIMATE_APPROVAL_GAS_LIMIT = 55000;

export const proxySwapAddressMapping: Record<number, string> = {
  [ETHEREUM_MAINNET_CHAIN_ID]: "0xC65F7B26a7bBa778efD39641C46599bBDBEcCCf7",
  [BINANCE_SMART_CHAIN_CHAIN_ID]: "0x3EF1AB0F87C1072B024b6c5336A51CE219f6D77D",
  [POLYGON_CHAIN_ID]: "0x75D3Db329a4Fb4B4ac0E0B84D24Dd2E6396BD9B0",
  [AVALANCHE_CHAIN_ID]: "0x75D3Db329a4Fb4B4ac0E0B84D24Dd2E6396BD9B0",
  // Not supported right now, but might need to be later on
  // [FANTOM_CHAIN_ID]: "0x75D3Db329a4Fb4B4ac0E0B84D24Dd2E6396BD9B0",
  // [ARBITRUM_CHAIN_ID]: "0x6A91D9822679f1A895DAE24b0610D6f8BA485196",
  // [OPTIMISM_CHAIN_ID]: "0x6A91D9822679f1A895DAE24b0610D6f8BA485196",
  // [GNOSIS_CHAIN_ID]: "",
  // [KLAYTN_CHAIN_ID]: "",
};

export const oneInchAddressMapping: Record<number, string> = {
  [ETHEREUM_MAINNET_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [BINANCE_SMART_CHAIN_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [POLYGON_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [OPTIMISM_CHAIN_ID]: "0x1111111254760f7ab3f16433eea9304126dcd199",
  [ARBITRUM_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [GNOSIS_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [AVALANCHE_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [FANTOM_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [KLAYTN_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  [AURORA_CHAIN_ID]: "0x1111111254fb6c44bAC0beD2854e76F90643097d",
};

export const EVM_GRAPHQL_API_ROOT_ASSET_ALIAS = ETH_ADDRESS;

export const EVM_TRANSACTIONS_RECEIPTS_SURVEY_INTERVAL = 20 * 1000;
export const EVM_TRANSACTIONS_OLD_TRANSACTIONS_SURVEY_INTERVAL = 10 * 60 * 1000;
export const EVM_TRANSACTIONS_MAX_CACHED_PER_ACCOUNT = 30;

export const MULTICALL_NUM_RETRIES = 5;
export const MULTICALL_MINIMUM_BATCH_SIZE = 50;
export const MULTICALL_BATCH_REDUCTION_MULTIPLIER = 0.75;
export const MULTICALL_INITIAL_BATCH_SIZE = 500;

export const NETWORKS = [...buildDefaultMainNetworks(), ...buildDefaultSecondaryNetworks()].map(network => ({
  name: network.name,
  currencySymbol: network.currencySymbol,
  chainId: network.chainId as SupportedNetworkChain,
}));

export const NETWORKS_ICONS: Record<SupportedNetworkChain, string> = {
  [ETHEREUM_MAINNET_CHAIN_ID]: "https://storage.googleapis.com/aurox-coin-icons/color/162.svg",
  [BINANCE_SMART_CHAIN_CHAIN_ID]: "https://storage.googleapis.com/aurox-coin-icons/color/163.svg",
  [POLYGON_CHAIN_ID]: "https://storage.googleapis.com/aurox-coin-icons/color/242.svg",
  [AVALANCHE_CHAIN_ID]: "https://storage.googleapis.com/aurox-coin-icons/color/198.svg",
  [FANTOM_CHAIN_ID]: "https://storage.googleapis.com/aurox-coin-icons/color/215.svg",
  [ARBITRUM_CHAIN_ID]:
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHdpZHRoPSI0NzAuMjg3cHgiIGhlaWdodD0iNTE0LjI1MXB4IiB2aWV3Qm94PSIwIDAgNDcwLjI4NyA1MTQuMjUxIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA0NzAuMjg3IDUxNC4yNTEiDQoJIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGcgaWQ9IkJhY2tncm91bmQiPg0KPC9nPg0KPGcgaWQ9IkxvZ29zX2FuZF9zeW1ib2xzIj4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl8zIj4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfM18zXyI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzQiPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl80XzFfIj4NCgkJPGcgaWQ9IlNZTUJPTF9WRVJfNF8zXyI+DQoJCTwvZz4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfNV8xXyI+DQoJPC9nPg0KCTxnIGlkPSJvZmZfMl8xXyI+DQoJPC9nPg0KCTxnIGlkPSJWRVJfM18xXyI+DQoJCTxnIGlkPSJTWU1CT0xfVkVSXzJfMV8iPg0KCQk8L2c+DQoJPC9nPg0KCTxnIGlkPSJWRVJfMyI+DQoJCTxnIGlkPSJTWU1CT0xfVkVSXzIiPg0KCQk8L2c+DQoJPC9nPg0KCTxnIGlkPSJvZmZfMiI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzUiPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl8xIj4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfMV8xXyI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzEtMV8zXyI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzEtMV8yXyI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzEtMSI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzEtMV8xXyI+DQoJCTxnIGlkPSJfeDMxXy0zIj4NCgkJPC9nPg0KCQk8ZyBpZD0iU3ltYm9sXy1fT3JpZ2luYWxfMTRfIj4NCgkJCTxwYXRoIGZpbGw9IiMyRDM3NEIiIGQ9Ik0yOTEuMTM0LDIzNy40NjlsMzUuNjU0LTYwLjVsOTYuMTAzLDE0OS42ODRsMC4wNDYsMjguNzI3bC0wLjMxMy0xOTcuNjcyDQoJCQkJYy0wLjIyOC00LjgzMi0yLjc5NC05LjI1Mi02Ljg4Ny0xMS44NTlMMjQyLjcxNSw0Ni4zMjRjLTQuMDQ1LTEuOTktOS4xOC0xLjk2Ny0xMy4yMiwwLjA2M2MtMC41NDYsMC4yNzItMS4wNiwwLjU3LTEuNTQ4LDAuODk1DQoJCQkJbC0wLjYwNCwwLjM3OUw1OS4zOTksMTQ0Ljk4M2wtMC42NTEsMC4yOTZjLTAuODM4LDAuMzg1LTEuNjg2LDAuODc1LTIuNDgsMS40NDRjLTMuMTg1LDIuMjgzLTUuMjk5LDUuNjYtNS45ODMsOS40NDgNCgkJCQljLTAuMTAzLDAuNTc0LTAuMTc5LDEuMTU4LTAuMjE0LDEuNzQ5bDAuMjY0LDE2MS4wODNsODkuNTE1LTEzOC43NDVjMTEuMjcxLTE4LjM5NywzNS44MjUtMjQuMzIzLDU4LjYyLTI0LjAwMWwyNi43NTMsMC43MDYNCgkJCQlMNjcuNTg4LDQwOS43NjVsMTguNTgyLDEwLjY5N0wyNDUuNjkyLDE1Ny4yMmw3MC41MS0wLjI1NkwxNTcuMDkxLDQyNi44NDlsNjYuMzA2LDM4LjEzOGw3LjkyMiw0LjU1Ng0KCQkJCWMzLjM1MSwxLjM2Miw3LjMwMiwxLjQzMSwxMC42ODEsMC4yMWwxNzUuNDUzLTEwMS42NzhsLTMzLjU0NCwxOS40MzhMMjkxLjEzNCwyMzcuNDY5eiBNMzA0LjczNiw0MzMuMzk1bC02Ni45NjktMTA1LjEwOA0KCQkJCWw0MC44ODEtNjkuMzcxbDg3Ljk1MiwxMzguNjI4TDMwNC43MzYsNDMzLjM5NXoiLz4NCgkJCTxwb2x5Z29uIGZpbGw9IiMyOEEwRjAiIHBvaW50cz0iMjM3Ljc2OCwzMjguMjg2IDMwNC43MzYsNDMzLjM5NSAzNjYuNjAxLDM5Ny41NDMgMjc4LjY0OCwyNTguOTE1IAkJCSIvPg0KCQkJPHBhdGggZmlsbD0iIzI4QTBGMCIgZD0iTTQyMi45MzcsMzU1LjM3OWwtMC4wNDYtMjguNzI3bC05Ni4xMDMtMTQ5LjY4NGwtMzUuNjU0LDYwLjVsOTIuNzc0LDE1MC4wNDNsMzMuNTQ0LTE5LjQzOA0KCQkJCWMzLjI5LTIuNjczLDUuMjgxLTYuNTk0LDUuNDktMTAuODI1TDQyMi45MzcsMzU1LjM3OXoiLz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0yMC4yMTksMzgyLjQ2OWw0Ny4zNjksMjcuMjk2bDE1Ny42MzQtMjUyLjgwMWwtMjYuNzUzLTAuNzA2Yy0yMi43OTUtMC4zMjItNDcuMzUsNS42MDQtNTguNjIsMjQuMDAxDQoJCQkJTDUwLjMzNCwzMTkuMDA0bC0zMC4xMTUsNDYuMjcxVjM4Mi40Njl6Ii8+DQoJCQk8cG9seWdvbiBmaWxsPSIjRkZGRkZGIiBwb2ludHM9IjMxNi4yMDIsMTU2Ljk2NCAyNDUuNjkyLDE1Ny4yMiA4Ni4xNyw0MjAuNDYyIDE0MS45MjgsNDUyLjU2NSAxNTcuMDkxLDQyNi44NDkgCQkJIi8+DQoJCQk8cGF0aCBmaWxsPSIjOTZCRURDIiBkPSJNNDUyLjY1LDE1Ni42MDFjLTAuNTktMTQuNzQ2LTguNTc0LTI4LjI0NS0yMS4wOC0zNi4xMDRMMjU2LjI4LDE5LjY5Mg0KCQkJCWMtMTIuMzcxLTYuMjI5LTI3LjgyNS02LjIzNy00MC4yMTgtMC4wMDRjLTEuNDY1LDAuNzM5LTE3MC40NjUsOTguNzUyLTE3MC40NjUsOTguNzUyYy0yLjMzOSwxLjEyMi00LjU5MiwyLjQ1OC02LjcxMSwzLjk3NQ0KCQkJCWMtMTEuMTY0LDguMDAxLTE3Ljk2OSwyMC40MzUtMTguNjY4LDM0LjA5NXYyMDguNzY1bDMwLjExNS00Ni4yNzFMNTAuMDcsMTU3LjkyMWMwLjAzNS0wLjU4OSwwLjEwOS0xLjE2OSwwLjIxNC0xLjc0MQ0KCQkJCWMwLjY4MS0zLjc5LDIuNzk3LTcuMTcxLDUuOTgzLTkuNDU2YzAuNzk1LTAuNTY5LDE3Mi42ODItMTAwLjA2NCwxNzMuMjI4LTEwMC4zMzdjNC4wNC0yLjAyOSw5LjE3NS0yLjA1MywxMy4yMi0wLjA2Mw0KCQkJCWwxNzMuMDIyLDk5LjUyM2M0LjA5MywyLjYwNyw2LjY1OSw3LjAyNyw2Ljg4NywxMS44NTl2MTk5LjU0MmMtMC4yMDksNC4yMzEtMS44ODIsOC4xNTItNS4xNzIsMTAuODI1bC0zMy41NDQsMTkuNDM4DQoJCQkJbC0xNy4zMDgsMTAuMDMxbC02MS44NjQsMzUuODUybC02Mi43MzcsMzYuMzU3Yy0zLjM3OSwxLjIyMS03LjMzLDEuMTUyLTEwLjY4MS0wLjIxbC03NC4yMjgtNDIuNjkzbC0xNS4xNjMsMjUuNzE3DQoJCQkJbDY2LjcwNiwzOC40MDZjMi4yMDYsMS4yNTUsNC4xNzEsMi4zNjcsNS43ODQsMy4yNzJjMi40OTcsMS40LDQuMTk5LDIuMzM3LDQuOCwyLjYyOWM0Ljc0MSwyLjMwMywxMS41NjMsMy42NDMsMTcuNzEsMy42NDMNCgkJCQljNS42MzYsMCwxMS4xMzItMS4wMzUsMTYuMzMyLTMuMDcybDE4Mi4yMjUtMTA1LjUzMWMxMC40NTktOC4xMDQsMTYuNjEyLTIwLjMyNSwxNy4xNjYtMzMuNTY0VjE1Ni42MDF6Ii8+DQoJCTwvZz4NCgkJPGcgaWQ9IlN5bWJvbF8tX09yaWdpbmFsXzEzXyI+DQoJCTwvZz4NCgkJPGcgaWQ9IlN5bWJvbF8tX09yaWdpbmFsXzZfIj4NCgkJPC9nPg0KCQk8ZyBpZD0iU3ltYm9sXy1fT3JpZ2luYWxfNF8iPg0KCQk8L2c+DQoJCTxnIGlkPSJPbmVfY29sb3JfdmVyc2lvbl8tX1doaXRlXzNfIj4NCgkJCTxnIGlkPSJTeW1ib2xfLV9PcmlnaW5hbF8xNV8iPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIGlkPSJPbmVfY29sb3JfdmVyc2lvbl8tX1doaXRlIj4NCgkJCTxnIGlkPSJTeW1ib2xfLV9PcmlnaW5hbCI+DQoJCQk8L2c+DQoJCTwvZz4NCgkJPGcgaWQ9IlN5bWJvbF8tX01vbm9jaHJvbWF0aWNfM18iPg0KCQkJPGcgaWQ9Il94MzNfXzdfIj4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBpZD0iU3ltYm9sXy1fTW9ub2Nocm9tYXRpYyI+DQoJCQk8ZyBpZD0iX3gzM19fM18iPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIGlkPSJfeDMzX18yXyI+DQoJCTwvZz4NCgkJPGcgaWQ9Il94MzNfXzFfIj4NCgkJPC9nPg0KCQk8ZyBpZD0iX3gzM18iPg0KCQk8L2c+DQoJCTxnIGlkPSJTeW1ib2xfLV9PcmlnaW5hbF8xMF8iPg0KCQk8L2c+DQoJCTxnIGlkPSJTeW1ib2xfLV9PcmlnaW5hbF8xXyI+DQoJCTwvZz4NCgkJPGcgaWQ9IlN5bWJvbF8tX09yaWdpbmFsXzJfIj4NCgkJPC9nPg0KCQk8ZyBpZD0iX3gzNF9fMV8iPg0KCQk8L2c+DQoJCTxnIGlkPSJTeW1ib2xfLV9Nb25vY2hyb21hdGljXzJfIj4NCgkJCTxnIGlkPSJfeDMzX182XyI+DQoJCQk8L2c+DQoJCTwvZz4NCgkJPGcgaWQ9Ik9uZV9jb2xvcl92ZXJzaW9uXy1fV2hpdGVfMl8iPg0KCQkJPGcgaWQ9IlN5bWJvbF8tX09yaWdpbmFsXzExXyI+DQoJCQk8L2c+DQoJCTwvZz4NCgkJPGcgaWQ9IlN5bWJvbF8tX09yaWdpbmFsXzVfIj4NCgkJCTxnIGlkPSJTeW1ib2xfLV9PcmlnaW5hbF8xMl8iPg0KCQkJPC9nPg0KCQk8L2c+DQoJCTxnIGlkPSJPbmVfY29sb3JfdmVyc2lvbl8tX1doaXRlXzFfIj4NCgkJCTxnIGlkPSJTeW1ib2xfLV9PcmlnaW5hbF85XyI+DQoJCQk8L2c+DQoJCTwvZz4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfMV8yXyI+DQoJCTxnIGlkPSJTWU1CT0xfVkVSXzJfNF8iPg0KCQk8L2c+DQoJCTxnIGlkPSJTWU1CT0xfVkVSXzItMS0xXzFfIj4NCgkJPC9nPg0KCQk8ZyBpZD0iU1lNQk9MX1ZFUl8yLTItMV8xXyI+DQoJCTwvZz4NCgkJPGcgaWQ9IlNZTUJPTF9WRVJfMi0zLTFfNF8iPg0KCQk8L2c+DQoJCTxnIGlkPSJOZXdfU3ltYm9sXzFfIj4NCgkJCTxnIGlkPSJTWU1CT0xfVkVSXzItMy0xXzNfIj4NCgkJCTwvZz4NCgkJPC9nPg0KCQk8ZyBpZD0iTmV3X1N5bWJvbCI+DQoJCQk8ZyBpZD0iU1lNQk9MX1ZFUl8yLTMtMV8xXyI+DQoJCQk8L2c+DQoJCTwvZz4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfMl8yXyI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzRfMl8iPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl8zXzJfIj4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfM18xXyI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzEtMS0xXzFfIj4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfMS0xLTEiPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl8xLTEtMV8yXzJfIj4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfMS0xLTFfMiI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzEtMS0xXzJfMV8iPg0KCTwvZz4NCgk8ZyBpZD0iU3ltYm9sXy1fT3JpZ2luYWxfN18iPg0KCTwvZz4NCgk8ZyBpZD0iU3ltYm9sXy1fT3JpZ2luYWxfOF8iPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl8yLTEtMSI+DQoJPC9nPg0KCTxnIGlkPSJTWU1CT0xfVkVSXzItMi0xIj4NCgk8L2c+DQoJPGcgaWQ9IlNZTUJPTF9WRVJfMi0zLTEiPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl81LTFfMV8iPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl81LTEiPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl81LTJfMV8iPg0KCTwvZz4NCgk8ZyBpZD0iU1lNQk9MX1ZFUl81LTIiPg0KCTwvZz4NCgk8ZyBpZD0iU3ltYm9sXy1fTW9ub2Nocm9tYXRpY18xXyI+DQoJCTxnIGlkPSJfeDMzX180XyI+DQoJCTwvZz4NCgk8L2c+DQo8L2c+DQo8L3N2Zz4NCg==",
  [OPTIMISM_CHAIN_ID]: "https://storage.googleapis.com/aurox-coin-icons/color/21374.svg",

  20: "https://storage.googleapis.com/aurox-coin-icons/color/471.svg",
  25: "https://storage.googleapis.com/aurox-coin-icons/color/181.svg",
  30: "https://storage.googleapis.com/aurox-coin-icons/color/334.svg",
  57: "https://storage.googleapis.com/aurox-coin-icons/color/422.svg",
  59: "https://storage.googleapis.com/aurox-coin-icons/color/182.svg",
  61: "https://storage.googleapis.com/aurox-coin-icons/color/217.svg",
  88: "https://storage.googleapis.com/aurox-coin-icons/color/320.svg",
  100: "https://storage.googleapis.com/aurox-coin-icons/color/308.svg",
  106: "https://storage.googleapis.com/aurox-coin-icons/color/522.svg",
  128: "https://storage.googleapis.com/aurox-coin-icons/color/184.svg",
  199: "https://storage.googleapis.com/aurox-coin-icons/color/15986.svg",
  246: "https://storage.googleapis.com/aurox-coin-icons/color/270.svg",
  288: "https://storage.googleapis.com/aurox-coin-icons/color/13384.svg",
  314: "https://storage.googleapis.com/aurox-coin-icons/color/205.svg",
  321: "https://storage.googleapis.com/aurox-coin-icons/color/267.svg",
  361: "https://storage.googleapis.com/aurox-coin-icons/color/187.svg",
  888: "https://storage.googleapis.com/aurox-coin-icons/color/373.svg",
  1294: "https://storage.googleapis.com/aurox-coin-icons/white/13384.svg",
  2000: "https://storage.googleapis.com/aurox-coin-icons/color/174.svg",
  4689: "https://storage.googleapis.com/aurox-coin-icons/color/372.svg",
  10000: "https://storage.googleapis.com/aurox-coin-icons/color/170.svg",
  32520: "https://storage.googleapis.com/aurox-coin-icons/color/10005.svg",
  32659: "https://storage.googleapis.com/aurox-coin-icons/color/513.svg",
  100001: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  100002: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  100003: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  100004: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  100005: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  100006: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  100007: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  100008: "https://storage.googleapis.com/aurox-coin-icons/color/452.svg",
  1313161554: "https://storage.googleapis.com/aurox-coin-icons/color/13678.svg",
  1666600000: "https://storage.googleapis.com/aurox-coin-icons/color/305.svg",
};

// TODO: might be a good idea to use external service for this, such as: https://chainid.network/chains.json
export interface NativeCurrencyData {
  assetId: number;
  pairId: number;
  symbol: string;
  name: string;
  decimals: number;
  icons: { color?: string; white?: string; black?: string };
}

export const ethereumMainnetNetworkIdentifier = createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID);
export const binanceSmartChainNetworkIdentifier = createNetworkIdentifier("evm", BINANCE_SMART_CHAIN_CHAIN_ID);
export const polygonNetworkIdentifier = createNetworkIdentifier("evm", POLYGON_CHAIN_ID);
export const avalancheNetworkIdentifier = createNetworkIdentifier("evm", AVALANCHE_CHAIN_ID);
export const fantomNetworkIdentifier = createNetworkIdentifier("evm", FANTOM_CHAIN_ID);
export const arbitrumNetworkIdentifier = createNetworkIdentifier("evm", ARBITRUM_CHAIN_ID);
export const optimismNetworkIdentifier = createNetworkIdentifier("evm", OPTIMISM_CHAIN_ID);

export const evmNetworkGraphqlAPI: Record<string, { baseURL: string; nativeWrapper: string }> = {
  [ethereumMainnetNetworkIdentifier]: {
    baseURL: AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL,
    nativeWrapper: WETH_ADDRESS,
  },
  [binanceSmartChainNetworkIdentifier]: { baseURL: AUROX_BLOCKCHAIN_BSC_GRAPHQL_BASE_URL, nativeWrapper: WBNB_ADDRESS },
  [polygonNetworkIdentifier]: { baseURL: AUROX_BLOCKCHAIN_POLYGON_GRAPHQL_BASE_URL, nativeWrapper: WMATIC_ADDRESS },
  [avalancheNetworkIdentifier]: { baseURL: AUROX_BLOCKCHAIN_AVALANCHE_GRAPHQL_BASE_URL, nativeWrapper: WAVAX_ADDRESS },
};

export const networkNativeCurrencyData: Record<string, NativeCurrencyData> = {
  [ethereumMainnetNetworkIdentifier]: {
    assetId: ETHEREUM_MAINNET_NATIVE_ASSET_ID,
    pairId: ETHEREUM_MAINNET_NATIVE_ASSET_PRICING_PAIR_ID,
    symbol: "ETH",
    name: "Ethereum",
    decimals: DEFAULT_DECIMALS,
    icons: { color: NETWORKS_ICONS[ETHEREUM_MAINNET_CHAIN_ID] },
  },
  [binanceSmartChainNetworkIdentifier]: {
    assetId: BINANCE_SMART_CHAIN_NATIVE_ASSET_ID,
    pairId: BINANCE_SMART_CHAIN_NATIVE_ASSET_PRICING_PAIR_ID,
    symbol: "BNB",
    name: "BNB",
    decimals: DEFAULT_DECIMALS,
    icons: { color: NETWORKS_ICONS[BINANCE_SMART_CHAIN_CHAIN_ID] },
  },
  [polygonNetworkIdentifier]: {
    assetId: POLYGON_NATIVE_ASSET_ID,
    pairId: POLYGON_NATIVE_ASSET_PRICING_PAIR_ID,
    symbol: "MATIC",
    name: "Polygon",
    decimals: DEFAULT_DECIMALS,
    icons: { color: NETWORKS_ICONS[POLYGON_CHAIN_ID] },
  },
  [avalancheNetworkIdentifier]: {
    assetId: AVALANCHE_NATIVE_ASSET_ID,
    pairId: AVALANCHE_NATIVE_ASSET_PRICING_PAIR_ID,
    symbol: "AVAX",
    name: "Avalanche",
    decimals: DEFAULT_DECIMALS,
    icons: { color: NETWORKS_ICONS[AVALANCHE_CHAIN_ID] },
  },
  [fantomNetworkIdentifier]: {
    assetId: FANTOM_NATIVE_ASSET_ID,
    pairId: FANTOM_NATIVE_ASSET_PRICING_PAIR_ID,
    symbol: "FTM",
    name: "Fantom",
    decimals: DEFAULT_DECIMALS,
    icons: { color: NETWORKS_ICONS[FANTOM_CHAIN_ID] },
  },
  [arbitrumNetworkIdentifier]: {
    assetId: ETHEREUM_MAINNET_NATIVE_ASSET_ID,
    pairId: ETHEREUM_MAINNET_NATIVE_ASSET_PRICING_PAIR_ID,
    symbol: "ETH",
    name: "Ethereum",
    decimals: DEFAULT_DECIMALS,
    icons: { color: NETWORKS_ICONS[ETHEREUM_MAINNET_CHAIN_ID] },
  },
  [optimismNetworkIdentifier]: {
    assetId: ETHEREUM_MAINNET_NATIVE_ASSET_ID,
    pairId: ETHEREUM_MAINNET_NATIVE_ASSET_PRICING_PAIR_ID,
    symbol: "ETH",
    name: "Ethereum",
    decimals: DEFAULT_DECIMALS,
    icons: { color: NETWORKS_ICONS[ETHEREUM_MAINNET_CHAIN_ID] },
  },
};

export const alchemySimulationSupportedChains: Record<number, string> = {
  [ETHEREUM_MAINNET_CHAIN_ID]: ALCHEMY_MAINNET_RPC_URL,
  [POLYGON_CHAIN_ID]: ALCHEMY_POLYGON_RPC_URL,
  [ARBITRUM_CHAIN_ID]: ALCHEMY_ARBITRUM_RPC_URL,
};

export const alchemyNftAPISupportedChains: Record<number, string> = {
  [ETHEREUM_MAINNET_CHAIN_ID]: ALCHEMY_MAINNET_NFT_URL,
  [POLYGON_CHAIN_ID]: ALCHEMY_POLYGON_NFT_URL,
  [ARBITRUM_CHAIN_ID]: ALCHEMY_ARBITRUM_NFT_URL,
  [OPTIMISM_CHAIN_ID]: ALCHEMY_OPTIMISM_NFT_URL,
};

export const ERC721_INTERFACE_ID = "0x80ac58cd";

export const ERC1155_INTERFACE_ID = "0xd9b67a26";
