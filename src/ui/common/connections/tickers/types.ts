import { TypedEmitter } from "tiny-typed-emitter";

export interface TickerData {
  price: number;
  low24H: number;
  high24H: number;
  volume24H: number;
  change24H: number;
  change24HPercent: number;
}

export interface Tickers {
  [pairId: number]: TickerData;
}

export interface ImperativeTickerEvents {
  "change": () => void;
  "change-price": () => void;
  "change-low24H": () => void;
  "change-high24H": () => void;
  "change-volume24H": () => void;
  "change-change24H": () => void;
  "change-change24HPercent": () => void;
}

export interface ImperativeTicker {
  pairId: number;
  current: TickerData;
  events: TypedEmitter<ImperativeTickerEvents>;
}
