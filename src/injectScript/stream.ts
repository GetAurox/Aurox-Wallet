import { WebSocketProvider } from "@ethersproject/providers";
import { TypedEmitter } from "tiny-typed-emitter";

import { EIP1193EmitterEvents, EIP1193Request } from "common/types";
import { formatChainId } from "common/utils";

import { ETHEREUM_MAINNET_CHAIN_ID, INFURA_ETHEREUM_MAINNET_WEBSOCKET_URL } from "common/config";

export class StreamProvider extends TypedEmitter<Pick<EIP1193EmitterEvents, "notification">> {
  static connection = new WebSocketProvider(INFURA_ETHEREUM_MAINNET_WEBSOCKET_URL);

  async handle(data: EIP1193Request, chainId: string | null) {
    const isMethodSupported = ["eth_subscribe", "eth_unsubscribe"].includes(data.method);

    if (!isMethodSupported) {
      return;
    }

    const isEthereumMainnet = chainId === formatChainId(ETHEREUM_MAINNET_CHAIN_ID);

    if (!isEthereumMainnet) {
      throw new Error(`Can not connect to web socket on chainId: ${chainId}`);
    }

    const result = await StreamProvider.connection.send(data.method, data.params as any);

    if (data.method === "eth_subscribe") {
      StreamProvider.connection.websocket.onmessage = (event: MessageEvent) => {
        this.emit("notification", { type: "notification", data: JSON.parse(event.data) });
      };
    } else {
      StreamProvider.connection.websocket.onmessage = null;
      StreamProvider.connection.websocket.close();
    }

    return result;
  }
}
