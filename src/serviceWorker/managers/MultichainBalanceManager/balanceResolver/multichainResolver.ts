import { MultichainBalanceResolutionOperator, MultichainBalanceResolutionQuery } from "./types";
import { consolidateNetworkBalanceResolvers } from "./consolidate";

export async function resolveMultichainBalances(
  queries: MultichainBalanceResolutionQuery[],
  operator: MultichainBalanceResolutionOperator,
) {
  const tasks: Promise<void>[] = [];

  for (const query of queries) {
    const resolvers = consolidateNetworkBalanceResolvers(query);

    const task = async () => {
      for (const { resolverType, resolver } of resolvers) {
        try {
          const result = await resolver(operator.signal);

          if (operator.signal?.aborted) break;

          operator.applyUpdate(query.network.identifier, result, resolverType);
        } catch (error) {
          if (!operator.signal?.aborted) {
            operator.reportError(query, error);
          }
        }
      }
    };

    tasks.push(task());
  }

  await Promise.allSettled(tasks);
}
