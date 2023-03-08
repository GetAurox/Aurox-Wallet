import { BlockchainNetwork } from "common/types";

// Import directly to prevent circular dependencies
import { createNetworkIdentifier } from "common/utils/network";

import {
  ETHEREUM_MAINNET_CHAIN_ID,
  BINANCE_SMART_CHAIN_CHAIN_ID,
  POLYGON_CHAIN_ID,
  AVALANCHE_CHAIN_ID,
  FANTOM_CHAIN_ID,
  ARBITRUM_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
} from "./constants";
import {
  INFURA_ETH_MAINNET_API_KEY,
  ALCHEMY_ETH_MAINNET_API_KEY,
  ALCHEMY_POLYGON_MAINNET_API_KEY,
  ALCHEMY_ARBIRUM_MAINNET_API_KEY,
  ALCHEMY_OPTIMISM_MAINNET_API_KEY,
  QUIKNODE_BSC_API_KEY,
  QUIKNODE_AVALANCHE_MAINNET_API_KEY,
} from "./keys";

export function buildDefaultMainNetworks(): BlockchainNetwork[] {
  return [
    {
      identifier: createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID),
      name: "Ethereum",
      shortName: "Ethereum",
      currencySymbol: "ETH",
      chainId: ETHEREUM_MAINNET_CHAIN_ID,
      chainType: "evm",
      deployment: "mainnet",
      disabled: false,
      chainExplorer: {
        name: "Etherscan",
        baseURL: "https://etherscan.io",
      },
      connections: [
        {
          url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_ETH_MAINNET_API_KEY}`,
        },
        {
          url: "https://rpc.ankr.com/eth",
        },
      ],
      originalConnections: [
        {
          // Requires the open Infura project Id for this to work
          url: `https://mainnet.infura.io/v3/${INFURA_ETH_MAINNET_API_KEY}`,
        },
        {
          url: "https://rpc.ankr.com/eth",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", BINANCE_SMART_CHAIN_CHAIN_ID),
      name: "Binance",
      shortName: "Binance",
      currencySymbol: "BNB",
      chainId: BINANCE_SMART_CHAIN_CHAIN_ID,
      chainType: "evm",
      deployment: "mainnet",
      disabled: false,
      chainExplorer: {
        name: "BscScan",
        baseURL: "https://bscscan.com",
      },
      connections: [
        {
          url: `https://cool-purple-darkness.bsc.quiknode.pro/${QUIKNODE_BSC_API_KEY}/`,
        },
        {
          url: "https://rpc.ankr.com/bsc",
        },
      ],
      originalConnections: [
        {
          url: "https://bsc-dataseed.binance.org",
        },
        {
          url: "https://rpc.ankr.com/bsc",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", POLYGON_CHAIN_ID),
      name: "Polygon",
      shortName: "Polygon",
      currencySymbol: "MATIC",
      chainId: POLYGON_CHAIN_ID,
      chainType: "evm",
      deployment: "mainnet",
      disabled: false,
      chainExplorer: {
        name: "PolygonScan",
        baseURL: "https://polygonscan.com",
      },
      connections: [
        {
          url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_POLYGON_MAINNET_API_KEY}`,
        },
        {
          url: "https://rpc.ankr.com/polygon",
        },
      ],
      originalConnections: [
        {
          url: "https://polygon-rpc.com",
        },
        {
          url: "https://rpc.ankr.com/polygon",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", FANTOM_CHAIN_ID),
      name: "Fantom",
      shortName: "Fantom",
      currencySymbol: "FTM",
      chainId: FANTOM_CHAIN_ID,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "FtmScan",
        baseURL: "https://ftmscan.com",
      },
      connections: [
        {
          url: "https://rpcapi.fantom.network",
        },
        {
          url: "https://rpc.ankr.com/fantom",
        },
      ],
      originalConnections: [
        {
          url: "https://rpcapi.fantom.network",
        },
        {
          url: "https://rpc.ankr.com/fantom",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", AVALANCHE_CHAIN_ID),
      name: "Avalanche",
      shortName: "Avalanche",
      currencySymbol: "AVAX",
      chainId: AVALANCHE_CHAIN_ID,
      chainType: "evm",
      deployment: "mainnet",
      disabled: false,
      chainExplorer: {
        name: "SnowTrace",
        baseURL: "https://snowtrace.io",
      },
      connections: [
        {
          url: `https://dimensional-side-dawn.avalanche-mainnet.quiknode.pro/${QUIKNODE_AVALANCHE_MAINNET_API_KEY}/ext/bc/C/rpc`,
        },
        {
          url: "https://rpc.ankr.com/avalanche",
        },
      ],
      originalConnections: [
        {
          url: "https://api.avax.network/ext/bc/C/rpc",
        },
        {
          url: "https://rpc.ankr.com/avalanche",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", ARBITRUM_CHAIN_ID),
      name: "Arbitrum",
      shortName: "Arbitrum",
      currencySymbol: "ETH",
      chainId: ARBITRUM_CHAIN_ID,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "ArbiScan",
        baseURL: "https://arbiscan.io/",
      },
      connections: [
        {
          url: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_ARBIRUM_MAINNET_API_KEY}`,
        },
        {
          url: "https://rpc.ankr.com/arbitrum",
        },
      ],
      originalConnections: [
        {
          url: "https://arb1.arbitrum.io/rpc",
        },
        {
          url: "https://rpc.ankr.com/arbitrum",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", OPTIMISM_CHAIN_ID),
      name: "Optimism",
      shortName: "Optimism",
      currencySymbol: "ETH",
      chainId: OPTIMISM_CHAIN_ID,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Optimism-Etherscan",
        baseURL: "https://optimistic.etherscan.io/",
      },
      connections: [
        {
          url: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_OPTIMISM_MAINNET_API_KEY}`,
        },
        {
          url: "https://rpc.ankr.com/optimism",
        },
      ],
      originalConnections: [
        {
          url: "https://mainnet.optimism.io",
        },
        {
          url: "https://rpc.ankr.com/optimism",
        },
      ],
    },
  ];
}

export function buildDefaultSecondaryNetworks(): BlockchainNetwork[] {
  return [
    {
      identifier: createNetworkIdentifier("evm", 19),
      name: "Songbird Canary",
      shortName: "sgb",
      currencySymbol: "SGB",
      chainId: 19,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Songbird",
        baseURL: "https://songbird-explorer.flare.network",
      },
      connections: [
        {
          url: "https://songbird-api.flare.network/ext/C/rpc",
        },
        {
          url: "https://songbird.towolabs.com/rpc",
        },
      ],
      originalConnections: [
        {
          url: "https://songbird-api.flare.network/ext/C/rpc",
        },
        {
          url: "https://songbird.towolabs.com/rpc",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 20),
      name: "Elastos",
      shortName: "esc",
      currencySymbol: "ELA",
      chainId: 20,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Elastos ESC",
        baseURL: "https://esc.elastos.io",
      },
      connections: [
        {
          url: "https://api.elastos.io/eth",
        },
      ],
      originalConnections: [
        {
          url: "https://api.elastos.io/eth",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 25),
      name: "Cronos",
      shortName: "cro",
      currencySymbol: "CRO",
      chainId: 25,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Cronos",
        baseURL: "https://cronoscan.com",
      },
      connections: [
        {
          url: "https://evm.cronos.org",
        },
      ],
      originalConnections: [
        {
          url: "https://evm.cronos.org",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 30),
      name: "RSK",
      shortName: "rsk",
      currencySymbol: "RBTC",
      chainId: 30,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "RSK",
        baseURL: "https://explorer.rsk.co",
      },
      connections: [
        {
          url: "https://public-node.rsk.co",
        },
        {
          url: "https://mycrypto.rsk.co",
        },
      ],
      originalConnections: [
        {
          url: "https://public-node.rsk.co",
        },
        {
          url: "https://mycrypto.rsk.co",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 40),
      name: "Telos",
      shortName: "telos",
      currencySymbol: "TLOS",
      chainId: 40,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "TeloScan",
        baseURL: "https://teloscan.io",
      },
      connections: [
        {
          url: "https://mainnet.telos.net/evm",
        },
      ],
      originalConnections: [
        {
          url: "https://mainnet.telos.net/evm",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 50),
      name: "XinFin",
      shortName: "xdc",
      currencySymbol: "XDC",
      chainId: 50,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "XDCscan",
        baseURL: "https://xdcscan.io",
      },
      connections: [
        {
          url: "https://erpc.xinfin.network",
        },
        {
          url: "https://rpc.xinfin.network",
        },
      ],
      originalConnections: [
        {
          url: "https://erpc.xinfin.network",
        },
        {
          url: "https://rpc.xinfin.network",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 57),
      name: "Syscoin",
      shortName: "sys",
      currencySymbol: "SYS",
      chainId: 57,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Syscoin",
        baseURL: "https://explorer.syscoin.org",
      },
      connections: [
        {
          url: "https://rpc.syscoin.org",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.syscoin.org",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 59),
      name: "EOS",
      shortName: "eos",
      currencySymbol: "EOS",
      chainId: 59,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Bloks",
        baseURL: "https://bloks.eosargentina.io",
      },
      connections: [
        {
          url: "https://api.eosargentina.io",
        },
      ],
      originalConnections: [
        {
          url: "https://api.eosargentina.io",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 61),
      name: "Ethereum Classic",
      shortName: "etc",
      currencySymbol: "ETC",
      chainId: 61,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "BlockScout",
        baseURL: "https://blockscout.com/etc/mainnet",
      },
      connections: [
        {
          url: "https://www.ethercluster.com/etc",
        },
      ],
      originalConnections: [
        {
          url: "https://www.ethercluster.com/etc",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 66),
      name: "OKXChain",
      shortName: "okt",
      currencySymbol: "OKT",
      chainId: 66,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "OKLink",
        baseURL: "https://www.oklink.com/en/okc",
      },
      connections: [
        {
          url: "https://exchainrpc.okex.org",
        },
        {
          url: "https://okc-mainnet.gateway.pokt.network/v1/lb/6275309bea1b320039c893ff",
        },
      ],
      originalConnections: [
        {
          url: "https://exchainrpc.okex.org",
        },
        {
          url: "https://okc-mainnet.gateway.pokt.network/v1/lb/6275309bea1b320039c893ff",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 82),
      name: "Meter",
      shortName: "meter",
      currencySymbol: "MTR",
      chainId: 82,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Meter Scan",
        baseURL: "https://scan.meter.io",
      },
      connections: [
        {
          url: "https://rpc.meter.io",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.meter.io",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 86),
      name: "GateChain",
      shortName: "gt",
      currencySymbol: "GT",
      chainId: 86,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "GateScan",
        baseURL: "https://www.gatescan.org",
      },
      connections: [
        {
          url: "https://evm.gatenode.cc",
        },
        {
          url: "https://evm.gatenode.net",
        },
      ],
      originalConnections: [
        {
          url: "https://evm.gatenode.cc",
        },
        {
          url: "https://evm.gatenode.net",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 88),
      name: "TomoChain",
      shortName: "tomo",
      currencySymbol: "TOMO",
      chainId: 88,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "TomoScan",
        baseURL: "https://tomoscan.io/",
      },
      connections: [
        {
          url: "https://rpc.tomochain.com",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.tomochain.com",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100),
      name: "Gnosis",
      shortName: "gno",
      currencySymbol: "xDAI",
      chainId: 100,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "GnosisScan",
        baseURL: "https://gnosisscan.io",
      },
      connections: [
        {
          url: "https://rpc.gnosischain.com",
        },
        {
          url: "https://rpc.ankr.com/gnosis",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.gnosischain.com",
        },
        {
          url: "https://rpc.ankr.com/gnosis",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 106),
      name: "Velas",
      shortName: "vlx",
      currencySymbol: "VLX",
      chainId: 106,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Velas",
        baseURL: "https://evmexplorer.velas.com",
      },
      connections: [
        {
          url: "https://evmexplorer.velas.com/rpc",
        },
      ],
      originalConnections: [
        {
          url: "https://evmexplorer.velas.com/rpc",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 108),
      name: "ThunderCore",
      shortName: "tt",
      currencySymbol: "TT",
      chainId: 108,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "ThunderCore",
        baseURL: "https://viewblock.io/thundercore",
      },
      connections: [
        {
          url: "https://mainnet-rpc.thundercore.com",
        },
        {
          url: "https://mainnet-rpc.thundertoken.net",
        },
      ],
      originalConnections: [
        {
          url: "https://mainnet-rpc.thundercore.com",
        },
        {
          url: "https://mainnet-rpc.thundertoken.net",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 128),
      name: "Huobi ECO Chain",
      shortName: "heco",
      currencySymbol: "HT",
      chainId: 128,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Hecoinfo",
        baseURL: "https://hecoinfo.com",
      },
      connections: [
        {
          url: "https://http-mainnet.hecochain.com",
        },
      ],
      originalConnections: [
        {
          url: "https://http-mainnet.hecochain.com",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 199),
      name: "BitTorrent Chain",
      shortName: "btt",
      currencySymbol: "BTT",
      chainId: 199,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "BTTCScan",
        baseURL: "https://scan.bt.io/#/",
      },
      connections: [
        {
          url: "https://rpc.bt.io/",
        },
        {
          url: "https://bttc.trongrid.io/",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.bt.io/",
        },
        {
          url: "https://bttc.trongrid.io/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 200),
      name: "Arbitrum on Gnosis",
      shortName: "aox",
      currencySymbol: "xDAI",
      chainId: 200,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "BlockScout",
        baseURL: "https://blockscout.com/xdai/arbitrum",
      },
      connections: [
        {
          url: "https://arbitrum.xdaichain.com/",
        },
      ],
      originalConnections: [
        {
          url: "https://arbitrum.xdaichain.com/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 246),
      name: "Energy Web Chain",
      shortName: "ewt",
      currencySymbol: "EWT",
      chainId: 246,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "BlockScout",
        baseURL: "https://explorer.energyweb.org",
      },
      connections: [
        {
          url: "https://rpc.energyweb.org",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.energyweb.org",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 288),
      name: "Boba Network",
      shortName: "boba",
      currencySymbol: "ETH",
      chainId: 288,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "BobaScan",
        baseURL: "https://bobascan.com",
      },
      connections: [
        {
          url: "https://mainnet.boba.network/",
        },
      ],
      originalConnections: [
        {
          url: "https://mainnet.boba.network/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 300),
      name: "Optimism on Gnosis",
      shortName: "ogc",
      currencySymbol: "xDAI",
      chainId: 300,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "BlockScout",
        baseURL: "https://blockscout.com/xdai/optimism",
      },
      connections: [
        {
          url: "https://optimism.gnosischain.com",
        },
      ],
      originalConnections: [
        {
          url: "https://optimism.gnosischain.com",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 314),
      name: "Filecoin",
      shortName: "filecoin",
      currencySymbol: "FIL",
      chainId: 314,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Filfox",
        baseURL: "https://filfox.info/en",
      },
      connections: [
        {
          url: "https://api.node.glif.io/",
        },
        {
          url: "https://api.node.glif.io/rpc/v0",
        },
      ],
      originalConnections: [
        {
          url: "https://api.node.glif.io/",
        },
        {
          url: "https://api.node.glif.io/rpc/v0",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 321),
      name: "KCC",
      shortName: "kcs",
      currencySymbol: "KCS",
      chainId: 321,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "KCC",
        baseURL: "https://explorer.kcc.io/en",
      },
      connections: [
        {
          url: "https://rpc-mainnet.kcc.network",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc-mainnet.kcc.network",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 361),
      name: "Theta",
      shortName: "theta",
      currencySymbol: "TFUEL",
      chainId: 361,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Theta",
        baseURL: "https://explorer.thetatoken.org",
      },
      connections: [
        {
          url: "https://eth-rpc-api.thetatoken.org/rpc",
        },
      ],
      originalConnections: [
        {
          url: "https://eth-rpc-api.thetatoken.org/rpc",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 592),
      name: "Astar",
      shortName: "astr",
      currencySymbol: "ASTR",
      chainId: 592,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "SubScan",
        baseURL: "https://astar.subscan.io",
      },
      connections: [
        {
          url: "https://evm.astar.network/",
        },
      ],
      originalConnections: [
        {
          url: "https://evm.astar.network/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 820),
      name: "Callisto",
      shortName: "clo",
      currencySymbol: "CLO",
      chainId: 820,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Calisto",
        baseURL: "https://explorer.callisto.network/",
      },
      connections: [
        {
          url: "https://rpc.callisto.network/",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.callisto.network/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 888),
      name: "Wanchain",
      shortName: "wan",
      currencySymbol: "WAN",
      chainId: 888,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "WanScan",
        baseURL: "https://wanscan.org/",
      },
      connections: [
        {
          url: "https://gwan-ssl.wandevs.org:56891/",
        },
      ],
      originalConnections: [
        {
          url: "https://gwan-ssl.wandevs.org:56891/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 1030),
      name: "Conflux eSpace",
      shortName: "Conflux eSpace",
      currencySymbol: "CFX",
      chainId: 1030,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Conflux Scan",
        baseURL: "https://evm.confluxscan.net",
      },
      connections: [
        {
          url: "https://evm.confluxrpc.com",
        },
      ],
      originalConnections: [
        {
          url: "https://evm.confluxrpc.com",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 1139),
      name: "MathChain",
      shortName: "MathChain",
      currencySymbol: "MATH",
      chainId: 1139,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Mathchain",
        baseURL: "https://explorer.mathchain.org",
      },
      connections: [
        {
          url: "https://mathchain-us.maiziqianbao.net/rpc",
        },
        {
          url: "https://mathchain-asia.maiziqianbao.net/rpc",
        },
      ],
      originalConnections: [
        {
          url: "https://mathchain-us.maiziqianbao.net/rpc",
        },
        {
          url: "https://mathchain-asia.maiziqianbao.net/rpc",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 1284),
      name: "Moonbeam",
      shortName: "mbeam",
      currencySymbol: "GLMR",
      chainId: 1284,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "MoonScan",
        baseURL: "https://moonbeam.moonscan.io",
      },
      connections: [
        {
          url: "https://rpc.api.moonbeam.network/",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.api.moonbeam.network/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 1285),
      name: "Moonriver",
      shortName: "mriver",
      currencySymbol: "MOVR",
      chainId: 1285,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "MoonScan",
        baseURL: "https://moonriver.moonscan.io",
      },
      connections: [
        {
          url: "https://rpc.api.moonriver.moonbeam.network/",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.api.moonriver.moonbeam.network/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 1294),
      name: "BobaBeam",
      shortName: "bobabeam",
      currencySymbol: "BOBA",
      chainId: 1294,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Bobabeam",
        baseURL: "https://blockexplorer.bobabeam.boba.network",
      },
      connections: [
        {
          url: "https://bobabeam.boba.network",
        },
      ],
      originalConnections: [
        {
          url: "https://bobabeam.boba.network",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 2000),
      name: "Dogechain",
      shortName: "dc",
      currencySymbol: "DOGE",
      chainId: 2000,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Dogechain",
        baseURL: "https://explorer.dogechain.dog",
      },
      connections: [
        {
          url: "https://rpc01.dogechain.dog/",
        },
        {
          url: "https://dogechain.ankr.com/",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc01.dogechain.dog/",
        },
        {
          url: "https://dogechain.ankr.com/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 2222),
      name: "Kava EVM",
      shortName: "kava",
      currencySymbol: "KAVA",
      chainId: 2222,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Kava",
        baseURL: "https://explorer.kava.io",
      },
      connections: [
        {
          url: "https://evm.kava.io",
        },
        {
          url: "https://evm2.kava.io",
        },
      ],
      originalConnections: [
        {
          url: "https://evm.kava.io",
        },
        {
          url: "https://evm2.kava.io",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 4689),
      name: "IoTeX Network",
      shortName: "iotex",
      currencySymbol: "IOTX",
      chainId: 4689,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "IoTeXScan",
        baseURL: "https://iotexscan.io",
      },
      connections: [
        {
          url: "iotex",
        },
        {
          url: "https://iotexrpc.com/",
        },
      ],
      originalConnections: [
        {
          url: "iotex",
        },
        {
          url: "https://iotexrpc.com/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 8217),
      name: "Klaytn",
      shortName: "cypress",
      currencySymbol: "KLAY",
      chainId: 8217,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "KlaytnScope",
        baseURL: "https://scope.klaytn.com",
      },
      connections: [
        {
          url: "https://public-node-api.klaytnapi.com/v1/cypress",
        },
      ],
      originalConnections: [
        {
          url: "https://public-node-api.klaytnapi.com/v1/cypress",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 10000),
      name: "Smart Bitcoin Cash",
      shortName: "smartbch",
      currencySymbol: "BCH",
      chainId: 10000,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "SmartScan",
        baseURL: "https://www.smartscan.cash/",
      },
      connections: [
        {
          url: "https://smartbch.greyh.at",
        },
        {
          url: "https://rpc-mainnet.smartbch.org",
        },
      ],
      originalConnections: [
        {
          url: "https://smartbch.greyh.at",
        },
        {
          url: "https://rpc-mainnet.smartbch.org",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 10001),
      name: "ETH-PoW",
      shortName: "ethw",
      currencySymbol: "ETHW",
      chainId: 10001,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "ETHWScan",
        baseURL: "https://mainnet.ethwscan.com/",
      },
      connections: [
        {
          url: "https://mainnet.ethereumpow.org/",
        },
      ],
      originalConnections: [
        {
          url: "https://mainnet.ethereumpow.org/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 32520),
      name: "Bitgert",
      shortName: "brise",
      currencySymbol: "BRISE",
      chainId: 32520,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "BriseScan",
        baseURL: "https://brisescan.com",
      },
      connections: [
        {
          url: "https://mainnet-rpc.brisescan.com",
        },
        {
          url: "https://chainrpc.com/",
        },
      ],
      originalConnections: [
        {
          url: "https://mainnet-rpc.brisescan.com",
        },
        {
          url: "https://chainrpc.com/",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 32659),
      name: "Fusion",
      shortName: "fsn",
      currencySymbol: "FSN",
      chainId: 32659,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "FSNEX",
        baseURL: "https://fsnex.com/",
      },
      connections: [
        {
          url: "https://fsn.dev/api",
        },
        {
          url: "https://mainnet.anyswap.exchange",
        },
      ],
      originalConnections: [
        {
          url: "https://fsn.dev/api",
        },
        {
          url: "https://mainnet.anyswap.exchange",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 42170),
      name: "Arbitrum Nova",
      shortName: "arb-nova",
      currencySymbol: "ETH",
      chainId: 42170,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Arbitrum Nova",
        baseURL: "https://nova-explorer.arbitrum.io",
      },
      connections: [
        {
          url: "https://nova.arbitrum.io/rpc",
        },
      ],
      originalConnections: [
        {
          url: "https://nova.arbitrum.io/rpc",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 42220),
      name: "Celo",
      shortName: "celo",
      currencySymbol: "CELO",
      chainId: 42220,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "CeloScan",
        baseURL: "https://celoscan.io",
      },
      connections: [
        {
          url: "https://forno.celo.org",
        },
      ],
      originalConnections: [
        {
          url: "https://forno.celo.org",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 42262),
      name: "Oasis Emerald",
      shortName: "emerald",
      currencySymbol: "ROSE",
      chainId: 42262,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Emerald ParaTime",
        baseURL: "https://explorer.emerald.oasis.dev/",
      },
      connections: [
        {
          url: "https://emerald.oasis.dev",
        },
      ],
      originalConnections: [
        {
          url: "https://emerald.oasis.dev",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 47805),
      name: "REI Network",
      shortName: "rei",
      currencySymbol: "REI",
      chainId: 47805,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "ReiScan",
        baseURL: "https://scan.rei.network",
      },
      connections: [
        {
          url: "https://rpc.rei.network",
        },
      ],
      originalConnections: [
        {
          url: "https://rpc.rei.network",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100001),
      name: "QuarkChain Shard 0",
      shortName: "qkc-s0",
      currencySymbol: "QKC",
      chainId: 100001,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S0",
        baseURL: "https://mainnet.quarkchain.io/0",
      },
      connections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39000",
        },
      ],
      originalConnections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39000",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100002),
      name: "QuarkChain Shard 1",
      shortName: "qkc-s1",
      currencySymbol: "QKC",
      chainId: 100002,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S1",
        baseURL: "https://mainnet.quarkchain.io/1",
      },
      connections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39001",
        },
      ],
      originalConnections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39001",
        },
      ],
    },

    {
      identifier: createNetworkIdentifier("evm", 100003),
      name: "QuarkChain Shard 2",
      shortName: "qkc-s2",
      currencySymbol: "QKC",
      chainId: 100003,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S2",
        baseURL: "https://mainnet.quarkchain.io/2",
      },
      connections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39002",
        },
      ],
      originalConnections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39002",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100004),
      name: "QuarkChain Shard 3",
      shortName: "qkc-s3",
      currencySymbol: "QKC",
      chainId: 100004,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S3",
        baseURL: "https://mainnet.quarkchain.io/3",
      },
      connections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39003",
        },
      ],
      originalConnections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39003",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100005),
      name: "QuarkChain Shard 4",
      shortName: "qkc-s4",
      currencySymbol: "QKC",
      chainId: 100005,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S4",
        baseURL: "https://mainnet.quarkchain.io/4",
      },
      connections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39004",
        },
      ],
      originalConnections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39004",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100006),
      name: "QuarkChain Shard 5",
      shortName: "qkc-s5",
      currencySymbol: "QKC",
      chainId: 100006,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S5",
        baseURL: "https://mainnet.quarkchain.io/5",
      },
      connections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39005",
        },
      ],
      originalConnections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39005",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100007),
      name: "QuarkChain Shard 6",
      shortName: "qkc-s6",
      currencySymbol: "QKC",
      chainId: 100007,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S6",
        baseURL: "https://mainnet.quarkchain.io/6",
      },
      connections: [
        {
          url: "qkc-s6",
        },
      ],
      originalConnections: [
        {
          url: "qkc-s6",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 100008),
      name: "QuarkChain Shard 7",
      shortName: "qkc-s7",
      currencySymbol: "QKC",
      chainId: 100008,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "QuarkChain-S7",
        baseURL: "https://mainnet.quarkchain.io/7",
      },
      connections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39007",
        },
      ],
      originalConnections: [
        {
          url: "http://eth-jrpc.mainnet.quarkchain.io:39007",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 210425),
      name: "PlatON",
      shortName: "platon",
      currencySymbol: "LAT",
      chainId: 210425,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "PlatONScan",
        baseURL: "https://scan.platon.network",
      },
      connections: [
        {
          url: "https://openapi2.platon.network/rpc",
        },
      ],
      originalConnections: [
        {
          url: "https://openapi2.platon.network/rpc",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 1313161554),
      name: "Aurora",
      shortName: "aurora",
      currencySymbol: "ETH",
      chainId: 1313161554,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "AuroraScan",
        baseURL: "https://aurorascan.dev",
      },
      connections: [
        {
          url: "https://mainnet.aurora.dev",
        },
      ],
      originalConnections: [
        {
          url: "https://mainnet.aurora.dev",
        },
      ],
    },
    {
      identifier: createNetworkIdentifier("evm", 1666600000),
      name: "Harmony Shard",
      shortName: "hmy-s0",
      currencySymbol: "ONE",
      chainId: 1666600000,
      chainType: "evm",
      deployment: "mainnet",
      disabled: true,
      chainExplorer: {
        name: "Harmony-S0",
        baseURL: "https://explorer.harmony.one",
      },
      connections: [
        {
          url: "https://api.harmony.one",
        },
        {
          url: "https://api.s0.t.hmny.io",
        },
      ],
      originalConnections: [
        {
          url: "https://api.harmony.one",
        },
        {
          url: "https://api.s0.t.hmny.io",
        },
      ],
    },
  ];
}
