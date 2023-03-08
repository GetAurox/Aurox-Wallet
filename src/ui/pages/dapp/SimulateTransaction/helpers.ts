/**
 * Returns token row direction: either funds are added to the wallet or subtracted or notifying approving/spending
 *
 * @param transaction transaction "from" and "to"
 * @param event event "from" and "to"
 * @returns token row type: `in`, `out` or undefined
 */

export function getTokenRowType(transaction: { from: string; to: string }, event: { from: string; to: string }): "in" | "out" | undefined {
  return transaction.from.toLowerCase() === event.from.toLowerCase()
    ? "out"
    : transaction.from.toLowerCase() === event.to.toLowerCase()
    ? "in"
    : undefined;
}
