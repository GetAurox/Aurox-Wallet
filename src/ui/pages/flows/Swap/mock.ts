import sample from "lodash/sample";
import random from "lodash/random";

import { TokenSwapRoute } from "common/types";
import { TokenDisplay } from "ui/types";

export const mockTxHash = "0x123";
export const submittingTransaction = false;

const mockCoins = [
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/162.svg" }, symbol: "ETH", name: "Ethereum" },
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/197.svg" }, symbol: "DAI", name: "DAI" },
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/242.svg" }, symbol: "MATIC", name: "MATIC" },
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/178.svg" }, symbol: "AAVE", name: "AAVE" },
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/175.svg" }, symbol: "WBTC", name: "Wrapped Bitcoin" },
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/172.svg" }, symbol: "USDC", name: "USD Coin" },
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/280.svg" }, symbol: "MANA", name: "MANA" },
  { img: { src: "https://storage.googleapis.com/aurox-coin-icons/color/164.svg" }, symbol: "USDT", name: "USD Tether" },
];

const mockProtocols = ["Uniswap V2", "Uniswap V3", "Defi Swap"];

export function getSwapRoute(from: TokenDisplay, to: TokenDisplay) {
  const iterations = Math.round(random(2, 8));
  const route: TokenSwapRoute = [
    {
      img: from.img,
      symbol: from.symbol,
      name: from.name,
    },
  ];

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const randomCoin = sample(mockCoins);

    if (randomCoin) {
      route.push({
        ...randomCoin,
        protocol: sample(mockProtocols),
        percentage: random(10, 100),
      });
    }
  }

  return route.concat([
    {
      img: to.img,
      symbol: to.symbol,
      name: to.name,
      protocol: sample(mockProtocols),
      percentage: random(10, 100),
    },
  ]);
}
