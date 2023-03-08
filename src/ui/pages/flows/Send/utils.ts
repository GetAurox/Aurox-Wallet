import { ETH_ADDRESS } from "common/config";

import { EthereumToken, TokenDisplay } from "ui/types";

// TODO: these types really need to be refactored so that they don't vary consistently across the app
export function convertTokenToEthereumToken(token: TokenDisplay): EthereumToken {
  return {
    address: token.assetDefinition.type === "native" ? ETH_ADDRESS : token.assetDefinition.contractAddress,
    decimals: token.decimals,
    contractType: "ERC20",
    symbol: token.symbol,
    name: token.name,
  };
}
