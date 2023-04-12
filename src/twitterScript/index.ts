import axios, { AxiosResponse } from "axios";
import { loadUserPreferencesFromLocalArea } from "common/storage";

interface Coin {
  shortName: string;
  priceChange24HPercent: number;
}

interface ResponsePayload {
  data: {
    market: Record<Coin["shortName"], Coin>;
  };
}

const greenArrowUpSVG = chrome.runtime.getURL("assets/twitter/green_arrow_up.svg");
const redArrowDownSVG = chrome.runtime.getURL("assets/twitter/red_arrow_down.svg");

const hashTagsToCapture = ["bitcoin", "btc", "ethereum", "eth", "bnb", "bnbchain", "matic", "polygon", "avax", "avalanche"] as const;

function constructQuery(coinsSymbols: string[]) {
  const coinQueries = coinsSymbols.map(symbol => `${symbol}: coin(id: "${symbol}") { shortName, priceChange24HPercent }`);

  return `{
    market {
      ${coinQueries.join("\n")}
    }
  }`;
}

async function fetchPriceChange24HPercent(query: string) {
  const response: AxiosResponse<ResponsePayload> = await axios({
    method: "POST",
    baseURL: "https://api.blockchain.getaurox.com/v1/ethereum/graphql",
    data: {
      query,
    },
  });

  return response.data;
}

function extractHashTagFromTextContent(textContent: string) {
  return textContent
    .replace(/(\(.*\))/, "")
    .replace("#", "")
    .trim()
    .toLowerCase();
}

function isPriceChangeAlreadyDisplayed(link: HTMLAnchorElement) {
  return link.innerHTML.includes(greenArrowUpSVG) || link.innerHTML.includes(redArrowDownSVG);
}

function isPriceChangeDifferent(link: HTMLAnchorElement, coinPriceChange: number) {
  const priceChange = getPriceChangeFromTextContent(link.textContent || "");

  if (!priceChange) {
    return true;
  }

  return formatPriceChange(priceChange) !== coinPriceChange;
}

function formatPriceChange(priceChange: number) {
  return Math.round((Number(priceChange) + Number.EPSILON) * 100) / 100;
}

function appendPriceChangeToLink(link: HTMLAnchorElement, coinPriceChange: number) {
  link.innerHTML = `${link.innerHTML} (<img width="12" height="12" src="${
    coinPriceChange < 0 ? redArrowDownSVG : greenArrowUpSVG
  }" />${Math.abs(coinPriceChange)}%)`;
}

function updatePriceChangeInLink(link: HTMLAnchorElement, coinPriceChange: number) {
  link.innerHTML = link.innerHTML.replace(
    /(\(.*\))/,
    `(<img width="12" height="12" src="${coinPriceChange < 0 ? redArrowDownSVG : greenArrowUpSVG}" />${Math.abs(coinPriceChange)}%)`,
  );
}

function getCoinBySymbol(coins: Record<Coin["shortName"], Coin>, symbol: string): Coin | undefined {
  return coins[symbol];
}

function getCoinsSymbolsFromCashtagLinks(cashtagLinks: HTMLAnchorElement[]) {
  return new Set(cashtagLinks.map(link => getCoinSymbolFromCashtag(link.textContent || "")));
}

function getCoinsSymbolsFromHashtagLinks(hashtagLinks: HTMLAnchorElement[]) {
  return new Set(hashtagLinks.map(link => getCoinSymbolFromHashtag(link.textContent || "")));
}

function mapBTCtoWBTC(coinsSymbols: Set<string>) {
  return Array.from(coinsSymbols).map(symbol => (symbol.toLowerCase() === "btc" ? "WBTC" : symbol));
}

function getCoinSymbolFromCashtag(cashtag: string) {
  return cashtag
    .replace(/(\(.*\))/, "")
    .replace("$", "")
    .trim()
    .toUpperCase();
}

function getCoinSymbolFromHashtag(textContent: string) {
  const hashtag = extractHashTagFromTextContent(textContent);

  const map = {
    bitcoin: "BTC",
    btc: "BTC",
    ethereum: "ETH",
    eth: "ETH",
    bnb: "BNB",
    bnbchain: "BNB",
    matic: "MATIC",
    polygon: "MATIC",
    avax: "AVAX",
    avalanche: "AVAX",
  };

  return map[hashtag as keyof typeof map];
}

function getPriceChangeFromTextContent(textContent: string) {
  const priceChange = textContent.match(/(\(.*\))/);

  if (!priceChange) {
    return null;
  }

  return Number(priceChange[0].replace(/[^0-9.-]+/g, ""));
}

function getCashtagElements(): HTMLAnchorElement[] {
  return Array.from(document.querySelectorAll("a[href*='=cashtag_click']"));
}

function getAllHashtagElements(): HTMLAnchorElement[] {
  return Array.from(document.querySelectorAll("a[href*='=hashtag_click']"));
}

function getHashTagLinksToUpdate(hashtagLinks: HTMLAnchorElement[]): HTMLAnchorElement[] {
  return hashtagLinks.filter(link => {
    if (!link?.textContent) {
      return false;
    }

    return hashTagsToCapture.includes(extractHashTagFromTextContent(link.textContent) as typeof hashTagsToCapture[number]);
  });
}

async function applyPriceChangesToCashTagLinks(cashtagLinks: HTMLAnchorElement[], coins: Record<Coin["shortName"], Coin>) {
  for (const link of cashtagLinks) {
    if (!link.textContent) continue;

    let coinSymbol = getCoinSymbolFromCashtag(link.textContent);

    if (coinSymbol.toLowerCase() === "btc") {
      coinSymbol = "WBTC";
    }

    const coin = getCoinBySymbol(coins, coinSymbol);

    if (!coin) continue;

    const coinPriceChange = formatPriceChange(coin.priceChange24HPercent);

    if (coinPriceChange == null) continue;

    if (isPriceChangeAlreadyDisplayed(link)) {
      if (isPriceChangeDifferent(link, coinPriceChange)) {
        updatePriceChangeInLink(link, coinPriceChange);
      }
      continue;
    }

    appendPriceChangeToLink(link, coinPriceChange);
  }
}

async function applyPriceChangesToHashtagLinks(hashtagLinks: HTMLAnchorElement[], coins: Record<Coin["shortName"], Coin>) {
  for (const link of hashtagLinks) {
    if (!link.textContent) continue;

    let coinSymbol = getCoinSymbolFromHashtag(link.textContent);

    if (coinSymbol.toLowerCase() === "btc") {
      coinSymbol = "WBTC";
    }

    const coin = getCoinBySymbol(coins, coinSymbol);

    if (!coin) continue;

    const coinPriceChange = formatPriceChange(coin.priceChange24HPercent);

    if (coinPriceChange == null) continue;

    if (isPriceChangeAlreadyDisplayed(link)) {
      if (isPriceChangeDifferent(link, coinPriceChange)) {
        updatePriceChangeInLink(link, coinPriceChange);
      }

      continue;
    }

    appendPriceChangeToLink(link, coinPriceChange);
  }
}

async function updateTagLinks() {
  const cashtagLinks = getCashtagElements();

  const allHashtagLinks = getAllHashtagElements();

  const hashtagLinksToUpdate = getHashTagLinksToUpdate(allHashtagLinks);

  if (!cashtagLinks.length && !hashtagLinksToUpdate.length) return;

  const coinsSymbolsFromCashTagLinks = getCoinsSymbolsFromCashtagLinks(cashtagLinks);

  const coinsSymbolsFromHashtagLinks = getCoinsSymbolsFromHashtagLinks(hashtagLinksToUpdate);

  const coinsSymbols = new Set([...coinsSymbolsFromCashTagLinks, ...coinsSymbolsFromHashtagLinks]);

  const coinsSymbolsMapped = mapBTCtoWBTC(coinsSymbols);

  const query = constructQuery(coinsSymbolsMapped);

  const response = await fetchPriceChange24HPercent(query);

  applyPriceChangesToCashTagLinks(cashtagLinks, response.data.market);
  applyPriceChangesToHashtagLinks(hashtagLinksToUpdate, response.data.market);
}

function setupDocumentObserver() {
  let intervalId: NodeJS.Timer | null = null;

  const documentObserver = new MutationObserver(async () => {
    const userPreferences = await loadUserPreferencesFromLocalArea();

    if (intervalId && !userPreferences?.general?.twitterScript) {
      clearInterval(intervalId);
      intervalId = null;
    }

    if (intervalId === null && userPreferences?.general?.twitterScript) {
      intervalId = setInterval(updateTagLinks, 2000);
    }
  });

  documentObserver.observe(document, { childList: true, subtree: true });
}

setupDocumentObserver();
