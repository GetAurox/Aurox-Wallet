import orderBy from "lodash/orderBy";

export function orderByBalance<T extends { balanceUSDValue?: string | null }>(items: T[]): T[] {
  return orderBy(items, item => (item.balanceUSDValue ? Number(item.balanceUSDValue) : 0), "desc");
}
