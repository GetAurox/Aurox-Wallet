import PersistentWebsocketConnection from "@aurox/persistent-websocket-connection";
import { OHLCVDataItem } from "@aurox/ohlcv-helpers";

import { STREAMER_OHLCV_BASE_URL } from "common/config";

export interface OHLCVServiceConnectionOptions {
  getCurrentPairIds: () => number[];
  onUpdate: (pairId: number, update: OHLCVDataItem) => void;
}

export class OHLCVServiceConnection {
  private connection: PersistentWebsocketConnection;
  private onUpdate: (pairId: number, update: OHLCVDataItem) => void;

  public get isConnected() {
    return this.connection.isConnected;
  }

  public get isConnecting() {
    return this.connection.isConnecting;
  }

  constructor(options: OHLCVServiceConnectionOptions) {
    this.onUpdate = options.onUpdate;

    function handleConnectionEstablished(send: (data: any) => void) {
      const pairIds = options.getCurrentPairIds();

      if (pairIds.length > 0) {
        send(JSON.stringify({ action: "subscribe", pairIds }));
      }
    }

    this.connection = new PersistentWebsocketConnection({
      url: STREAMER_OHLCV_BASE_URL,
      onData: this.handleData,
      onReconnect: send => {
        handleConnectionEstablished(send);
      },
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
    const [update, ...rest] = String(data).split("\n");

    if (update === "error") {
      console.error("OHLCV streamer returned an error: ", rest.join("\n"));

      return;
    }

    const [pairIdStr, timeUnitStartStr, timeOpenStr, timeCloseStr, openStr, highStr, lowStr, closeStr, volumeStr] = update.split(",");

    this.onUpdate(Number(pairIdStr), {
      timeUnitStart: Number(timeUnitStartStr),
      timeOpen: Number(timeOpenStr),
      timeClose: Number(timeCloseStr),
      open: Number(openStr),
      high: Number(highStr),
      close: Number(closeStr),
      low: Number(lowStr),
      volume: Number(volumeStr),
    });
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
