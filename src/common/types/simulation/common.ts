export type SupportedSimulator = "alchemy" | "pocketuniverse" | "blocknative";
export type Direction = "in" | "out";
export type ContractType = "erc20" | "erc721" | "erc1155" | "native" | "unknown";

export interface BalanceChange {
  amount: string;
  decimalAmount: number;
  direction: Direction;
  contractType: ContractType;
  contractAddress: string;
  contractSymbol?: string;
  contractName?: string;
  contractMethod?: string;
  tokenLogoURL?: string;
  tokenId?: string | null;
  contractDecimals?: number | null;
}

export type Result =
  | {
      success: true;
      simulator: SupportedSimulator;
      balanceChanges: BalanceChange[][];
      gasUsed: number[];
    }
  | {
      success: false;
      simulator: SupportedSimulator;
      error: string;
    };
