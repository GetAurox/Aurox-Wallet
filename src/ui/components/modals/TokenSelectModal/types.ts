import { TokenSwapDirection } from "common/types";

import { TokenDisplayWithTicker } from "ui/types";

export interface TokenSelectModalProps {
  direction: TokenSwapDirection;
  onClose: () => void;
  onTokenSelect: (token: TokenDisplayWithTicker) => void;
  selectedTokenKey?: string | null;
  excludeTokenKey?: string | null;
  selectedNetworkIdentifier?: string | null;
}

export interface TokenSelectViewState {
  offset: number;
  search: string;
  limit: number;
}
