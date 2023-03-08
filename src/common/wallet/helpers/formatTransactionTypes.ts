import { TransactionRequest } from "common/types";
import {
  OmitAuxillaryTransactionProps,
  EthereumAccountTransaction,
  EthereumAccountETHTransaction,
  EthereumAccountTokenTransfer,
  EthereumContractMethod,
} from "ui/types";

function getFormattedTransaction(
  details: OmitAuxillaryTransactionProps<EthereumAccountTransaction>,
  request: TransactionRequest,
  method: EthereumContractMethod,
): OmitAuxillaryTransactionProps<EthereumAccountETHTransaction> {
  return {
    ...(request as TransactionRequest),
    __typename: "EthereumAccountETHTransaction",
    nonce: (request as TransactionRequest).nonce,
    accountAddress: details.accountAddress,
    approvals: [],
    deposits: [],
    withdrawals: [],
    transfers: [],
    swaps: [],
    txFrom: details.accountAddress,
    txTo: (details as EthereumAccountTokenTransfer).txTo ?? "",
    valueUSD: (details as EthereumAccountTokenTransfer).valueUSD ?? "0",
    side: "sender",
    method,
    methodID: method.id,
    secondSideAddress: (details as EthereumAccountTokenTransfer).secondSideAddress ?? "",
  };
}

interface FormatEVMTransaction {
  type: "evm";
  request: TransactionRequest;
  details: OmitAuxillaryTransactionProps<EthereumAccountTransaction> & { method: EthereumContractMethod };
}

export type FormatDetails = FormatEVMTransaction;

export function getTransactionDetailsWithEstimate(
  transactionDetails: FormatDetails,
): OmitAuxillaryTransactionProps<EthereumAccountETHTransaction> {
  return {
    ...transactionDetails.details,
    ...getFormattedTransaction(transactionDetails.details, transactionDetails.request, transactionDetails.details.method),
  };
}
