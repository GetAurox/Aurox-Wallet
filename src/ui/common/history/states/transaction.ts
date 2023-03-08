import { useHistoryState } from "../hooks";

export function createTransactionHistorySearchState(search: string) {
  return { transactionSearch: search };
}

export function useTransactionHistorySearch(initialValue: string) {
  return useHistoryState<string>("transactionSearch", initialValue);
}
