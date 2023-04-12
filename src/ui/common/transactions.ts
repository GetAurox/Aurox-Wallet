import { ethers } from "ethers";
import { Interface } from "@ethersproject/abi";

import moment from "moment";
import orderBy from "lodash/orderBy";
import minBy from "lodash/minBy";

import {
  EVMTransactionEntry,
  EVMTransactionStatus,
  TokenTransaction,
  TokenTransactionDetails,
  TokenTransactionSide,
  TransactionStatus,
} from "common/types";
import { networkNativeCurrencyData } from "common/config";
import { ERC20__factory } from "common/wallet/typechain";
import { ERC721__factory } from "common/wallet/typechain/factories/ERC721__factory";

import { EthereumAccountETHTransaction, EthereumAccountNFTTransfer, EthereumAccountTransaction } from "ui/types";
import { formatValueUSD, formatPrice, formatAmount, ONE_HUNDRED_MILLIONS } from "ui/common/utils";

const txTokenListFormatDate = "MMM D";
const txTokenFormatDate = "h:mm A [on] MMM D, YYYY";

function getRecipientAddressFromData(data: string): string | null {
  const functionHash = data.slice(2, 10);

  if (!functionHash) {
    return null;
  }

  const ERC1155_abi = JSON.stringify([
    "function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data)",
  ]);

  const functionHashToContractInterface: Record<string, Interface> = {
    "a9059cbb": new Interface(ERC20__factory.abi),
    "23b872dd": ERC721__factory.createInterface(),
    "f242432a": new Interface(ERC1155_abi),
    "9e5f9dc2": new Interface(ERC1155_abi),
  };

  const functionHashToFunctionName: Record<string, string> = {
    "a9059cbb": "transfer",
    "23b872dd": "transferFrom",
    "f242432a": "safeTransferFrom",
    "9e5f9dc2": "safeBatchTransferFrom",
  };

  const functionName = functionHashToFunctionName[functionHash];
  const contractInterface = functionHashToContractInterface[functionHash];

  if (!functionName || !contractInterface) {
    return null;
  }

  const result = contractInterface.decodeFunctionData(functionName, data);

  return functionName === "transfer" ? result[0] : result[1];
}

export const sideTitles: Record<TokenTransactionSide, string> = {
  sender: "Sent",
  swap: "Swapped",
  receiver: "Received",
};

const ethSideTitles = {
  sender: "Sent",
  receiver: "Received",
};

function mapTransactionStatus(status: EVMTransactionStatus): TransactionStatus {
  switch (status) {
    case EVMTransactionStatus.Failed:
      return "failed";
    case EVMTransactionStatus.Pending:
      return "pending";
    case EVMTransactionStatus.Timeout:
      return "timeout";
    case EVMTransactionStatus.Replaced:
      return "replaced";
    case EVMTransactionStatus.Completed:
      return "completed";
    case EVMTransactionStatus.Cancelled:
      return "cancelled";
    default:
      throw new Error("Unknown transaction status");
  }
}

function getNFTTransactionTitle(tx: EthereumAccountNFTTransfer & { networkIdentifier: string }) {
  switch (tx.transaction.type) {
    case "approve":
      const isRevoking = Number(tx.transaction.value) === 0;

      return `${isRevoking ? "Revoked" : "Approved"} ${tx.token.symbol}`;

    case "contract_execution":
      return `dApp Interaction ${tx.transaction.method?.name ? `(${tx.transaction.method.name})` : ""}`;

    case "deposit":
      return `${tx.side ? sideTitles[tx.side] : "Deposited"} ${tx.token.symbol}`;

    case "multicall":
      return `dApp Interaction ${tx.transaction.method?.name ? `(${tx.transaction.method?.name})` : ""}`;

    case "native":
      return tx.transaction.methodID === "0x0"
        ? `${ethSideTitles[tx.side]} ${networkNativeCurrencyData[tx.networkIdentifier]?.symbol ?? "ETH"}`
        : `dApp Interaction ${tx.transaction.method?.shortName ? "(" + tx.transaction.method.shortName + ")" : ""}`;

    case "swap":
      return `Swapped ${tx.transaction.outputToken.token.symbol} to ${tx.transaction.inputToken.token.symbol}`;

    case "transfer":
      const transferSide = tx.transaction.side || tx.side;

      return `${transferSide ? sideTitles[transferSide] : "Transferred"} ${tx.token.symbol}`;

    case "withdraw":
      return `${tx.side ? sideTitles[tx.side] : "Withdrew"} ${tx.token.symbol}`;

    default:
      throw new Error("Unknown NFT transaction");
  }
}

function resolveTransactionStatus(transaction: EthereumAccountETHTransaction | EthereumAccountNFTTransfer | EVMTransactionEntry): {
  status: TransactionStatus;
} {
  if (!("__typename" in transaction)) {
    return { status: mapTransactionStatus(transaction.status) };
  }

  if (transaction["__typename"] === "EthereumAccountNFTTransfer") {
    return { status: transaction.transaction.failed ? "failed" : "completed" };
  }

  return { status: transaction.failed ? "failed" : "completed" };
}

export function mapTokenTransactionsToTokenTransactionRenderData(
  txs: ((EthereumAccountTransaction & { networkIdentifier: string }) | EVMTransactionEntry)[],
): TokenTransaction[] {
  const pending: TokenTransaction[] = [];
  const others: TokenTransaction[] = [];

  for (const tx of txs) {
    let baseProps: Omit<TokenTransaction, "title"> | null = null;
    const timestamp = tx.timestamp * 1000;
    const date = timestamp ? moment(timestamp).format(txTokenListFormatDate) : "---";

    if (!("__typename" in tx) || tx.__typename === "EthereumAccountNFTTransfer") {
      baseProps = {
        ...resolveTransactionStatus(tx),
        date,
        timestamp,
        txHash: tx.txHash,
        nonce: tx.transaction?.nonce,
        networkIdentifier: tx.networkIdentifier,
        isCached: true,
      };
    } else {
      if ("transaction" in tx) {
        baseProps = {
          ...resolveTransactionStatus(tx.transaction),
          date,
          timestamp,
          txHash: tx.txHash,
          valueUSD: tx.transaction.valueUSD,
          nonce: tx.transaction.nonce,
          networkIdentifier: tx.networkIdentifier,
        };
      } else {
        baseProps = {
          ...resolveTransactionStatus(tx),
          date,
          timestamp,
          txHash: tx.txHash,
          valueUSD: tx.valueUSD,
          nonce: tx.nonce,
          networkIdentifier: tx.networkIdentifier,
        };
      }
    }

    const result = baseProps.status === "pending" ? pending : others;

    if (!("__typename" in tx)) {
      let title = "RPC Transaction";

      if (baseProps.status === "cancelled" || baseProps.status === "replaced") {
        title = `${title} (${baseProps.status})`;
      }

      const transactionsWithSameNonce = txs.filter(cache => !("__typename" in cache) && cache.transaction.nonce === tx.transaction.nonce);

      if (transactionsWithSameNonce.length > 1) {
        if (baseProps.status === "pending" || baseProps.status === "completed") {
          const discardedTransaction = minBy(transactionsWithSameNonce, tx => tx.timestamp);

          if (discardedTransaction) {
            const reducedHash = `...${discardedTransaction.txHash.slice(-4)}`;

            title = `Replacement for ${reducedHash}`;
          }
        }
      }

      result.push({
        ...baseProps,
        title,
        valueUSD: null,
      });
    } else {
      switch (tx.__typename) {
        case "EthereumAccountETHTransaction": {
          const { valueUSD, methodID } = tx;

          result.push({
            ...baseProps,
            tokenAddress: tx.inputToken?.token.address,
            title:
              tx.methodID === "0x0"
                ? `${ethSideTitles[tx.side]} ${networkNativeCurrencyData[tx.networkIdentifier]?.symbol ?? "ETH"}`
                : `dApp Interaction ${tx.method?.shortName ? "(" + tx.method.shortName + ")" : ""}`,
            valueUSD: methodID === "0x0" && valueUSD ? formatValueUSD(valueUSD, { mantissa: 2, optionalMantissa: false }) : null,
          });

          break;
        }
        case "EthereumAccountTokenApproval": {
          const isRevoking = Number(tx.value) === 0;

          result.push({
            ...baseProps,
            tokenAddress: tx.token.address,
            title: `${isRevoking ? "Revoked" : "Approved"} ${tx.token.symbol}`,
            valueUSD: tx.valueUSD ? formatValueUSD(tx.valueUSD, { mantissa: 2, optionalMantissa: false }) : null,
          });

          break;
        }
        case "EthereumAccountTokenSwap": {
          const { soldToken, receivedToken } = tx;

          result.push({
            ...baseProps,
            tokenAddress: receivedToken.token.address,
            title: `Swapped ${soldToken.token.symbol} to ${receivedToken.token.symbol}`,
            valueUSD: receivedToken.valueUSD ? formatValueUSD(receivedToken.valueUSD, { mantissa: 2, optionalMantissa: false }) : null,
          });

          break;
        }
        case "EthereumAccountTokenTransfer": {
          const { token, valueUSD } = tx;
          const transferSide = tx.transaction.side || tx.side;

          result.push({
            ...baseProps,
            tokenAddress: token.address,
            title: `${transferSide ? sideTitles[transferSide] : "Transferred"} ${token.symbol}`,
            valueUSD: valueUSD ? formatValueUSD(valueUSD, { mantissa: 2, optionalMantissa: false }) : null,
          });

          break;
        }
        case "EthereumAccountTokenDeposit": {
          const { token, transaction, valueUSD } = tx;

          result.push({
            ...baseProps,
            tokenAddress: token.address,
            title: `${transaction.side ? sideTitles[transaction.side] : "Deposited"} ${token.symbol}`,
            valueUSD: valueUSD ? formatValueUSD(valueUSD, { mantissa: 2, optionalMantissa: false }) : null,
          });

          break;
        }
        case "EthereumAccountTokenWithdrawal": {
          const { token, transaction, valueUSD } = tx;

          result.push({
            ...baseProps,
            tokenAddress: token.address,
            valueUSD: valueUSD ? formatValueUSD(valueUSD, { mantissa: 2, optionalMantissa: false }) : null,
            title: `${transaction.side ? sideTitles[transaction.side] : "Withdrew"} ${token.symbol}`,
          });

          break;
        }
        case "EthereumDAPPInteraction": {
          const { transaction } = tx;

          result.push({
            ...baseProps,
            title: `dApp Interaction (${transaction.method.name})`,
          });
          break;
        }
        case "EthereumAccountNFTTransfer": {
          const { transaction } = tx;
          const title = getNFTTransactionTitle(tx);

          result.push({
            ...baseProps,
            title,
            tokenAddress: tx.tokenAddress,
            valueUSD: transaction.valueUSD ? formatValueUSD(transaction.valueUSD, { mantissa: 2, optionalMantissa: false }) : null,
          });
          break;
        }
        default:
          throw new Error(`Missing handler for ${(tx as any).__typename}`);
      }
    }
  }

  return [...orderBy(pending, ["timestamp"], ["desc"]), ...orderBy(others, ["timestamp"], ["desc"])];
}

export function mapTokenTransactionToTokenTransactionDetails(
  tx: (EthereumAccountTransaction & { networkIdentifier: string }) | EVMTransactionEntry,
): TokenTransactionDetails {
  const defaultCoin = {
    txHash: "",
    accountAddress: "",
    secondSideAddress: "",
  };
  let result = defaultCoin as TokenTransactionDetails;

  const hasProperties = Object.getOwnPropertyNames(tx).length !== 0;

  if (!hasProperties) {
    return result;
  }

  const timestamp = tx.timestamp * 1000;
  const date = timestamp ? moment(timestamp).format(txTokenFormatDate) : "---";

  if (!("__typename" in tx)) {
    const gasLimitHexString = tx.transaction.gasLimit._hex;
    const gasLimit = Number(gasLimitHexString).toString();

    let gasPriceSource = { _isBigNumber: true, _hex: "0x0" };

    if (tx.transaction.gasPrice) {
      gasPriceSource = tx.transaction.gasPrice;
    }

    if (tx.transaction.maxFeePerGas) {
      gasPriceSource = tx.transaction.maxFeePerGas;
    }

    const recipientAddress = getRecipientAddressFromData(tx.transaction.data);

    const gasPriceHexString = gasPriceSource._hex;
    const gasPriceWEI = Number(gasPriceHexString ?? 0) ?? 0;
    const gasPrice = ethers.utils.formatUnits(gasPriceWEI, "gwei");

    result = {
      ...resolveTransactionStatus(tx),
      txHash: tx.txHash,
      nonce: tx.transaction.nonce,
      buyPrice: null,
      totalCost: null,
      side: "sender",
      accountAddress: tx.transaction.from,
      secondSideAddress: recipientAddress ?? tx.transaction.to ?? tx.receipt?.to ?? "",
      txCost: null,
      timestamp,
      gasLimit,
      amount: null,
      date,
      gasPrice,
      valueUSD: null,
      title: "RPC Transaction",
      networkIdentifier: tx.networkIdentifier,
      isCached: true,
    };
  } else {
    let gasPriceString = "0";

    if ("gasPrice" in tx) {
      gasPriceString = tx.gasPrice;
    }

    if ("transaction" in tx && "gasPrice" in tx.transaction) {
      gasPriceString = tx.transaction.gasPrice?.toString() ?? "0";
    }

    const gasPriceETH = ethers.utils.parseEther(gasPriceString);
    const gasPrice = ethers.utils.formatUnits(gasPriceETH, "gwei");

    switch (tx.__typename) {
      case "EthereumAccountETHTransaction": {
        const { side, txTo, txFrom, value, txHash, method, feeUSD, methodID, gasLimit, nonce, valueUSD } = tx;

        result = {
          side,
          txHash,
          gasLimit,
          nonce: nonce,
          buyPrice: null,
          txCost: feeUSD,
          totalCost: null,
          accountAddress: txTo === null ? txFrom : side === "receiver" ? txTo : txFrom,
          timestamp,
          ...resolveTransactionStatus(tx),
          secondSideAddress: txTo === null ? "" : side === "receiver" ? txFrom : txTo,
          gasPrice,
          date,
          amount: methodID === "0x0" ? `${value} ${networkNativeCurrencyData[tx.networkIdentifier]?.symbol ?? "ETH"}` : null,
          valueUSD: methodID === "0x0" && valueUSD ? valueUSD : null,
          title:
            methodID === "0x0"
              ? `${sideTitles[side]} ${networkNativeCurrencyData[tx.networkIdentifier]?.symbol ?? "ETH"}`
              : `dApp Interaction (${method?.shortName ?? methodID})`,
          networkIdentifier: tx.networkIdentifier,
        };
        break;
      }
      case "EthereumAccountTokenApproval": {
        const { token, txHash, spender, owner, value, transaction } = tx;

        let approvalAmount: string | null = "Unknown";
        const isRevoking = Number(value) === 0;

        if (isRevoking) {
          approvalAmount = null;
        } else {
          approvalAmount =
            Number(value) === -1 || Number(value) >= ONE_HUNDRED_MILLIONS ? "Unlimited approval" : `${formatAmount(value)} ${token.symbol}`;
        }

        result = {
          txHash,
          nonce: transaction.nonce,
          valueUSD: null,
          buyPrice: null,
          totalCost: null,
          accountAddress: owner,
          txCost: transaction.feeUSD,
          secondSideAddress: spender,
          timestamp,
          gasLimit: transaction.gasLimit,
          ...resolveTransactionStatus(transaction),
          title: `Token ${isRevoking ? "Revoke" : "Approval"} - ${token.symbol}`,
          date,
          gasPrice,
          amount: approvalAmount,
          networkIdentifier: tx.networkIdentifier,
        };
        break;
      }
      case "EthereumAccountTokenSwap": {
        const { txHash, soldToken, receivedToken, accountAddress, transaction } = tx;

        const buyPrice = Number(soldToken.valueUSD) / Number(receivedToken.valueUSD);

        result = {
          txHash,
          side: "swap",
          valueUSD: null,
          nonce: transaction.nonce,
          accountAddress,
          txCost: transaction.feeUSD,
          timestamp,
          gasLimit: transaction.gasLimit,
          symbol: receivedToken.token.symbol,
          ...resolveTransactionStatus(transaction),
          secondSideAddress: receivedToken.accountAddress ?? transaction.txTo ?? "",
          date,
          gasPrice,
          buyPrice: transaction.valueUSD ? formatPrice(buyPrice) : null,
          amount: `${receivedToken.value} ${receivedToken.token.symbol}`,
          title: `Swapped ${soldToken.token.symbol} to ${receivedToken.token.symbol}`,
          totalCost: soldToken.valueUSD && transaction.feeUSD ? (Number(soldToken.valueUSD) + Number(transaction.feeUSD)).toString() : null,
          networkIdentifier: tx.networkIdentifier,
        };
        break;
      }
      case "EthereumAccountTokenTransfer": {
        const { txHash, side, token, value, transaction } = tx;

        result = {
          side,
          txHash,
          nonce: transaction.nonce,
          buyPrice: null,
          totalCost: null,
          accountAddress: side === "receiver" ? (tx as any).to : (tx as any)?.from,
          secondSideAddress: side === "receiver" ? (tx as any).from : (tx as any)?.to,
          txCost: (transaction as EthereumAccountETHTransaction)?.feeUSD ?? "0",
          timestamp,
          gasLimit: transaction.gasLimit,
          amount: `${value} ${token.symbol}`,
          ...resolveTransactionStatus(transaction),
          date,
          gasPrice,
          valueUSD: side && transaction.valueUSD ? transaction.valueUSD : null,
          title: `${side ? sideTitles[side] : "Token Transfer - "} ${token.symbol}`,
          networkIdentifier: tx.networkIdentifier,
        };
        break;
      }
      case "EthereumAccountTokenDeposit": {
        const { txHash, token, value, transaction } = tx;

        result = {
          txHash,
          nonce: transaction.nonce,
          buyPrice: null,
          totalCost: null,
          side: transaction.side,
          txCost: transaction.feeUSD,
          timestamp,
          gasLimit: transaction.gasLimit,
          amount: `${value} ${token.symbol}`,
          accountAddress: transaction.txFrom,
          title: `Token Deposit - ${token.symbol}`,
          ...resolveTransactionStatus(transaction),
          secondSideAddress: transaction.txTo ?? "",
          date,
          valueUSD: transaction.valueUSD ? transaction.valueUSD : null,
          gasPrice,
          networkIdentifier: tx.networkIdentifier,
        };
        break;
      }
      case "EthereumAccountTokenWithdrawal": {
        const { txHash, timestamp, token, value, transaction } = tx;

        result = {
          txHash,
          nonce: transaction.nonce,
          buyPrice: null,
          totalCost: null,
          side: transaction.side,
          txCost: transaction.feeUSD,
          timestamp,
          gasLimit: transaction.gasLimit,
          amount: `${value} ${token.symbol}`,
          accountAddress: transaction.txFrom,
          ...resolveTransactionStatus(transaction),
          secondSideAddress: transaction.txTo ?? "",
          title: `Token Withdrawal - ${token.symbol}`,
          date,
          valueUSD: transaction.valueUSD ? transaction.valueUSD : null,
          gasPrice,
          networkIdentifier: tx.networkIdentifier,
        };
        break;
      }
      case "EthereumDAPPInteraction": {
        const { txHash, timestamp, transaction } = tx;

        result = {
          txHash,
          nonce: transaction.nonce,
          buyPrice: null,
          totalCost: null,
          side: transaction.side,
          txCost: transaction.feeUSD,
          timestamp,
          gasLimit: transaction.gasLimit,
          accountAddress: transaction.txFrom,
          ...resolveTransactionStatus(transaction),
          secondSideAddress: transaction.txTo ?? "",
          title: `dApp Interaction (${transaction.method.name})`,
          date,
          valueUSD: transaction.valueUSD ? formatValueUSD(transaction.valueUSD) : null,
          gasPrice,
          // @TODO: This will need to be implemented when we decode DAPP transactions properly
          amount: "0",
          networkIdentifier: tx.networkIdentifier,
        };
        break;
      }
    }
  }

  return result;
}
