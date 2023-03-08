import PersistentWebsocketConnection from "@aurox/persistent-websocket-connection";

import { TICKER_WEBSOCKET_URL } from "common/config";

import { TickerData, Tickers } from "./types";

function transformDataItem(price: string, change24H: string, high24H: string, low24H: string, volume24H: string): TickerData {
  const previous24HPrice = Number(price) - Number(change24H);

  return {
    price: Number(price),
    low24H: Number(low24H),
    high24H: Number(high24H),
    volume24H: Number(volume24H),
    change24H: Number(change24H),
    change24HPercent: previous24HPrice === 0 ? 0 : (Number(change24H) / Number(previous24HPrice)) * 100,
  };
}

export interface TickerServiceConnectionOptions {
  getCurrentPairIds: () => number[];
  onPatch: (data: Tickers) => void;
}

export class TickerServiceConnection {
  private connection: PersistentWebsocketConnection;
  private onPatch: (data: Tickers) => void;

  public get isConnected() {
    return this.connection.isConnected;
  }

  public get isConnecting() {
    return this.connection.isConnecting;
  }

  constructor(options: TickerServiceConnectionOptions) {
    this.onPatch = options.onPatch;

    function handleConnectionEstablished(send: (data: any) => void) {
      const pairIds = options.getCurrentPairIds();

      if (pairIds.length > 0) {
        send(JSON.stringify({ action: "subscribe", pairIds }));
      }
    }

    this.connection = new PersistentWebsocketConnection({
      url: TICKER_WEBSOCKET_URL,
      onData: this.handleData,
      onReconnect: handleConnectionEstablished,
      onInitialConnectionEstablished: handleConnectionEstablished,
      pingPong: {
        enabled: true,
        heartbeatDebounce: 5000,
        toleranceTimeout: 4000,
      },
      keepAlive: { enabled: true, interval: 5000 },
    });
  }

  private handleData = (data: any) => {
    const rows = String(data).split("\n");

    if (rows.length > 0) {
      const result: Tickers = {};

      for (const row of rows) {
        const parts = row.split(",");

        const [pairId, price, change24H, high24H, low24H, volume24H] = parts;

        result[Number(pairId)] = transformDataItem(price, change24H, high24H, low24H, volume24H);
      }

      this.onPatch(result);
    }
  };

  public applyAction = (action: "subscribe" | "unsubscribe", pairIds: number[]) => {
    if (this.connection.isConnected) {
      this.connection.send(JSON.stringify({ action, pairIds }));
    }
  };

  public stop() {
    this.connection.stop();
  }
}
