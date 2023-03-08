import { AssetDefinition, EVMSupportedTokenContractType } from "common/types";

import { NFTMetadata } from "./account";

import { DistributiveOmit } from "./common";

export interface AccountTransactionsAPIArguments {
  timeRange?: TimeRangeInput;
  txHash?: string[];
  tokenAddress?: string[];
  limit?: number;
  txType?: TransactionType[];
}

export interface AccountNFTTransactionsAPIArguments {
  timeRange?: TimeRangeInput;
  txHash?: string[];
  tokenAddress?: string[];
}

export type EthereumAccountTokenContractType = "ERC20" | "ERC721" | "ERC1155";

export type AccountTransactionsTokenDefinitions = Record<string, AssetDefinition[] | null>;

export type TransferSide = "sender" | "receiver";
export type TradeAction = "buy" | "sell";

export type TimeRangeInput = {
  start: number;
  end: number;
};

export type TransactionType = "native" | "transfer" | "approve" | "multicall" | "swap" | "deposit" | "withdraw" | "contract_execution";

export type EthereumAccountTransferredToken = {
  accountAddress: string;
  // The account address.

  token: EthereumToken;
  // The transferred token details.

  value: string;
  // The amount of transferred tokens.

  valueUSD: string | null;
  // The value of transferred tokens in USD.
};

export type EthereumContractMethod = {
  /** The Method ID, this is derived as the first 4 bytes of the Keccak hash of the ASCII form of the method signature. */
  id: string;
  /** The method signature with argument names. */
  signature: string;
  /** The method name. */
  name: string;
  /** Short and simplified name of the method. */
  shortName: string;
};

export type EthereumToken = {
  /** The token contract address. */
  address: string;
  /** The token name. */
  name: string;
  /** The token symbol. */
  symbol: string;
  /** The number of decimals of the token. */
  decimals: number;
  /** The recognized contract standard of the token. */
  contractType: "unknown" | EVMSupportedTokenContractType;
};

interface EthereumAccountTransactionCommonProps {
  /** The account address. */
  accountAddress: string;
  /** Timestamp of the transaction. */
  timestamp: number;
  blockNumber: number;
  txIndex: number;
  txHash: string;
}

export interface EthereumAccountETHTransaction extends EthereumAccountTransactionCommonProps {
  __typename: "EthereumAccountETHTransaction";
  /** Indicates that transaction failed during execution. */
  failed: boolean;
  /** The number of transactions made by the sender prior to this one. */
  nonce: number;
  /** The transaction type. */
  type: TransactionType;
  /** The contract address created, if the transaction was a contract creation, otherwise null. */
  contractAddress: string | null;
  /** Address of the sender. */
  txFrom: string;
  /** Address of the receiver. null if it's a contract creation transaction. */
  txTo: string | null;
  /** The address of second side of the transaction. */
  secondSideAddress: string;
  /** Side of transaction of this account. */
  side: TransferSide;
  /** The transaction fee. */
  fee: string;
  /** The transaction fee in USD. */
  feeUSD: string | null;
  /** The limit of gas for this transaction. */
  gasLimit: string;
  /** The amount of gas used to process this transaction. */
  gasUsed: string;
  /** Gas price in ETH. */
  gasPrice: string;
  /** Gas price in USD. */
  gasPriceUSD: string | null;
  /** The transaction value in native ETH. */
  value: string;
  /** The transaction value is USD. */
  valueUSD: string | null;
  /** The method ID called in this transaction. */
  methodID: string;
  /** Called method information. */
  method: EthereumContractMethod;
  /** The transaction input token. */
  inputToken: EthereumAccountTransferredToken;
  /** The transaction output token. */
  outputToken: EthereumAccountTransferredToken;
  /** List of Approval events in the transaction. */
  approvals: EthereumAccountTokenApproval[];
  /** List of Transfer events in the transaction. */
  transfers: EthereumAccountTokenTransfer[];
  /** List of Swap events in the transaction. */
  swaps: EthereumAccountTokenSwap[];
  /** List of Deposit events in the transaction. */
  deposits: EthereumAccountTokenDeposit[];
  /** List of Withdrawal events in the transaction. */
  withdrawals: EthereumAccountTokenWithdrawal[];
}

export interface EthereumAccountTokenApproval extends EthereumAccountTransactionCommonProps {
  __typename: "EthereumAccountTokenApproval";
  /** The transaction of this event. */
  transaction: EthereumAccountETHTransaction;
  /** The token information. */
  token: EthereumToken;
  /** The owner address of tokens. */
  owner: string;
  /** The spender address. */
  spender: string;
  /** Approved amount of tokens. */
  value: string;
  /** The value of approved tokens in USD. */
  valueUSD: string | null;
  logIndex: number;
}

export interface EthereumAccountTokenTransfer extends EthereumAccountTransactionCommonProps {
  __typename: "EthereumAccountTokenTransfer";
  /** The transaction of this event. */
  transaction: EthereumAccountETHTransaction;
  /** The token contract address. */
  tokenAddress: string;
  /** The token contract standard/type. */
  tokenContractType: EthereumAccountTokenContractType;
  /** The token information. */
  token: EthereumToken;
  /** Address of the sender. */
  txFrom: string;
  /** Address of the receiver. */
  txTo: string;
  /** The address of second side of the transaction. */
  secondSideAddress: string;
  /** Side of transaction of this account. */
  side: TransferSide;
  /** Number of transferred tokens. */
  value: string;
  /** The value of transferred tokens in USD. */
  valueUSD: string | null;
  /** The ERC token balance of the account after this transaction. */
  balance: string;
  /** The value of ERC token balance of the account in USD after this transaction. */
  balanceUSD: string | null;
  logIndex: number;
}

export interface EthereumAccountTokenSwap extends EthereumAccountTransactionCommonProps {
  __typename: "EthereumAccountTokenSwap";
  /** The transaction of this event. */
  transaction: EthereumAccountETHTransaction;
  /** The pair address. */
  pairAddress?: string;
  /** The sold token details. */
  soldToken: EthereumAccountTransferredToken;
  /** The received token details. */
  receivedToken: EthereumAccountTransferredToken;
  logIndex: number;
}

export interface EthereumAccountTokenDeposit extends EthereumAccountTransactionCommonProps {
  __typename: "EthereumAccountTokenDeposit";
  /** The transaction of this event. */
  transaction: EthereumAccountETHTransaction;
  /** The wrapped token contract address. */
  tokenAddress: string;
  /** The wrapped token information. */
  token: EthereumToken;
  /** Number of transferred tokens. */
  value: string;
  /** The value of transferred tokens in USD. */
  valueUSD: string | null;
  /** The ETH balance of the account after this transaction. */
  ETHBalance: string;
  /** The value of ETH balance of the account in USD after this transaction. */
  ETHBalanceUSD: string | null;
  /** The wrapped ERC token balance of the account after this transaction. */
  tokenBalance: string;
  /** The value of wrapped ERC token balance of the account in USD after this transaction. */
  tokenBalanceUSD: string | null;
  logIndex: number;
}

export interface EthereumAccountTokenWithdrawal extends EthereumAccountTransactionCommonProps {
  __typename: "EthereumAccountTokenWithdrawal";
  /** The transaction of this event. */
  transaction: EthereumAccountETHTransaction;
  /** The wrapped token contract address. */
  tokenAddress: string;
  /** The wrapped token information. */
  token: EthereumToken;
  /** Amount of withdrawn ETH tokens. */
  value: string;
  /** The value of withdrawn tokens in USD. */
  valueUSD: string | null;
  /** The ETH balance of the account after this transaction. */
  ETHBalance: string;
  /** The value of ETH balance of the account in USD after this transaction. */
  ETHBalanceUSD: string | null;
  /** The wrapped ERC token balance of the account after this transaction. */
  tokenBalance: string;
  /** The value of wrapped ERC token balance of the account in USD after this transaction. */
  tokenBalanceUSD: string | null;
  logIndex: number;
}

export interface EthereumDAPPInteraction extends EthereumAccountTransactionCommonProps {
  __typename: "EthereumDAPPInteraction";
  /** The transaction of this event. */
  transaction: EthereumAccountETHTransaction;
  logIndex: number;
}

export type EthereumAccountTransaction =
  | EthereumAccountETHTransaction
  | EthereumAccountTokenApproval
  | EthereumAccountTokenTransfer
  | EthereumAccountTokenSwap
  | EthereumAccountTokenDeposit
  | EthereumAccountTokenWithdrawal
  | EthereumDAPPInteraction
  | EthereumAccountNFTTransfer;

export interface GraphQLEthereumAccountAllTransactionsResponse {
  data: {
    ethereum: {
      account: {
        transactions: {
          all: EthereumAccountTransaction[];
          nftTransfers: EthereumAccountNFTTransfer[];
        };
      };
    };
  };
}

type AuxillaryTransactionProps =
  | "failed"
  | "timestamp"
  | "blockNumber"
  | "contractAddress"
  | "gasUsed"
  | "gasPrice"
  | "gasPriceUSD"
  | "txIndex"
  | "logIndex"
  | "fee"
  | "feeUSD"
  | "balance"
  | "balanceUSD"
  | "txHash"
  | "inputToken"
  | "outputToken"
  | "transaction"
  | "type";

export type OmitAuxillaryTransactionProps<T> = DistributiveOmit<T, AuxillaryTransactionProps>;

export type BigNumberTyped = { type: "BigNumber"; hex: string };

export type EthereumAccountNFTContractType = "ERC721" | "ERC1155";

export type EthereumAccountNFTAmount = {
  /**
   * The NFT token identifier.
   */
  tokenId: number;

  /**
   * The NFT token amount.
   */
  amount: number;

  /**
   * The NFT metadata information.
   */
  metadata: NFTMetadata;
};

export interface EthereumAccountNFTTransfer {
  __typename: "EthereumAccountNFTTransfer";
  /**
   * The account address.
   */
  accountAddress: string;

  /**
   * Timestamp of the event.
   */
  timestamp: number;

  /**
   * The transaction of this event.
   */
  transaction: EthereumAccountETHTransaction;

  /**
   * The token contract address.
   */
  tokenAddress: string;

  /**
   * The token contract standard/type.
   */
  tokenContractType: EthereumAccountNFTContractType;

  /**
   * The token information.
   */
  token: EthereumToken;

  /**
   * Address of the sender.
   */
  from: string;

  /**
   * Address of the receiver.
   */
  to: string;

  /**
   * The address of second side of the transaction.
   */
  secondSideAddress: string;

  /**
   * Side of transaction of this account.
   */
  side: TransferSide;

  /**
   * List of transferred tokens.
   */
  nftTokens: EthereumAccountNFTAmount[];

  blockNumber: number;
  txIndex: number;
  logIndex: number;
  txHash: string;
}
