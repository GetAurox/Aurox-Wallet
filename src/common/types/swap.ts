export type TokenSwapDirection = "from" | "to";

export type TokenSwapSlippageTolerance = number | "auto" | { custom?: number };

export interface TokenSwapRouteItem {
  img: { src?: string; alt?: string };
  symbol: string;
  name: string;
  protocol?: string;
  percentage?: number;
}

export type TokenSwapRoute = TokenSwapRouteItem[];
