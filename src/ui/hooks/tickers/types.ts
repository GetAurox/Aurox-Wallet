export interface TokenTickerData {
  pairId: number | null;
  assetId: number | null;
  priceUSD: string | null;
  priceChange24HPercent: string | null;
  priceUSDChange24H: string | null;
  volumeUSD24H: string | null;
  img: {
    /**
     * used to pass directly to <img> alt
     */
    alt?: string;
    /**
     * used to pass directly to <img> src
     */
    src?: string;
  };
}
