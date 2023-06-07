import {
  ALCHEMY_ARBITRUM_MAINNET_API_KEY,
  ALCHEMY_ETH_MAINNET_API_KEY,
  ALCHEMY_OPTIMISM_MAINNET_API_KEY,
  ALCHEMY_POLYGON_MAINNET_API_KEY,
  INFURA_ETH_MAINNET_API_KEY,
  POCKETUNIVERSE_API_KEY,
  SENTRY_PUBLIC_KEY,
} from "./keys";

export const DOMAIN_INFO_BASE_URL = "https://domain-info.getaurox.com/api/v1";

export const NFT_SERVICE_URL = "https://nft-service.getaurox.com/api/v1/";

export const SAFELIST_CONTRACT_URL = "https://safelist.getaurox.com/api/v1/";

export const OHLCV_BASE_URL = "https://ohlcv-history.getaurox.com/api/v1/ohlcv";
export const STREAMER_OHLCV_BASE_URL = "wss://streamer-ohlcv.getaurox.com";

export const TICKER_WEBSOCKET_URL = "wss://ticker.getaurox.com";

export const SENTRY_DSN = `https://${SENTRY_PUBLIC_KEY}@o1325805.ingest.sentry.io/6585210`;

export const CHAIN_ID_URL = "https://chainid.network/chains.json";

export const POCKETUNIVERSE_API_URL = `https://pocketsimulator.app/v2/${POCKETUNIVERSE_API_KEY}`;

export const REWARD_SYSTEM_CONNECTION_URL = "wss://reward-system-test.getaurox.com:60080";

export const ENS_SERVICE_URL = "https://ens.getaurox.com";

export const AUROX_TUTORIALS_PAGE_URL = "https://getaurox.com/tutorials";
export const CONGRATULATION_PAGE_URL = AUROX_TUTORIALS_PAGE_URL;

export const AUROX_BLOCKCHAIN_GRAPHQL_BASE_URL = "https://api.blockchain.getaurox.com/v2/graphql";

export const AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL = "https://api.blockchain.getaurox.com/v1/ethereum/graphql";
export const AUROX_BLOCKCHAIN_BSC_GRAPHQL_BASE_URL = "https://api.blockchain.getaurox.com/v1/bsc/graphql";
export const AUROX_BLOCKCHAIN_POLYGON_GRAPHQL_BASE_URL = "https://api.blockchain.getaurox.com/v1/polygon/graphql";
export const AUROX_BLOCKCHAIN_AVALANCHE_GRAPHQL_BASE_URL = "https://api.blockchain.getaurox.com/v1/avalanche/graphql";

export const INFURA_ETHEREUM_MAINNET_WEBSOCKET_URL = `wss://mainnet.infura.io/ws/v3/${INFURA_ETH_MAINNET_API_KEY}`;

export const UNS_RESOLVE_BASE_URL = "https://resolve.unstoppabledomains.com";

export const SCAVENGER_HUNT_URL = "https://schunt.getaurox.com";

export const GASLESS_SERVICE_URL = "https://aurox-gassless-swaps.labrys.group";
export const FLASHBOTS_PROTECT_URL = "https://protect.flashbots.net";

export const BLOCKNATIVE_URL = "https://api.blocknative.com";

export const ONE_INCH_API_URL = "https://api.1inch.io/v4.0";

export const ALCHEMY_MAINNET_NFT_URL = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_ETH_MAINNET_API_KEY}`;
export const ALCHEMY_POLYGON_NFT_URL = `https://polygon-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_POLYGON_MAINNET_API_KEY}`;
export const ALCHEMY_ARBITRUM_NFT_URL = `https://arb-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_ARBITRUM_MAINNET_API_KEY}`;
export const ALCHEMY_OPTIMISM_NFT_URL = `https://opt-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_OPTIMISM_MAINNET_API_KEY}`;

export const ALCHEMY_MAINNET_RPC_URL = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ETH_MAINNET_API_KEY}`;
export const ALCHEMY_POLYGON_RPC_URL = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_POLYGON_MAINNET_API_KEY}`;
export const ALCHEMY_ARBITRUM_RPC_URL = `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_ARBITRUM_MAINNET_API_KEY}`;
export const ALCHEMY_OPTIMISM_RPC_URL = `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_OPTIMISM_MAINNET_API_KEY}`;

export const UNINSTALL_URL = "https://aurox.typeform.com/wallet";
