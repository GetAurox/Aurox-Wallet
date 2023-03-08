import produce from "immer";

import { AssetDefinition } from "common/types";

import { AccountTransactionsAPIArguments } from "ui/types";

/**
 * @param apiArguments object with GraphQL API parameters
 * @returns  returns string formated for graphQL arguments in query
 * @example { timeRange: {start: 1234, end: 555 }, txHash: "txHash1"}
 * converts to
 * 'timeRange: {start: 1234, end: 555}, txHash: "txHash1"'
 */
export function stringifyAPIArguments(apiArguments: AccountTransactionsAPIArguments) {
  // API needs txType passed as array of enums instead of array of strings
  const txType = apiArguments.txType;

  delete apiArguments.txType;

  const stringified = JSON.stringify(apiArguments);

  const withoutQuotes = stringified.substring(1, stringified.length - 1).replace(/"([^"]+)":/g, "$1:");

  return `${withoutQuotes}${txType ? `${withoutQuotes.length > 0 ? "," : ""}txType:[${txType.join(",")}]` : ""}`;
}

function fulfillArgumentsWithDefinition(apiArguments: AccountTransactionsAPIArguments | null, assetDefinition: AssetDefinition) {
  return produce(apiArguments || {}, draft => {
    if (assetDefinition.type === "native") {
      if (!draft.txType) draft.txType = [];

      if (!draft.txType.includes("native")) {
        draft.txType.push("native");
      }
    } else {
      if (!draft.tokenAddress) draft.tokenAddress = [];

      apiArguments = { tokenAddress: [assetDefinition.contractAddress] };

      if (!draft.tokenAddress.includes(assetDefinition.contractAddress)) {
        draft.tokenAddress.push(assetDefinition.contractAddress);
      }
    }
  });
}

export function assetsDefinitionsToAPIArguments(assetDefinitions?: AssetDefinition[] | null): AccountTransactionsAPIArguments | null {
  if (!assetDefinitions) return null;

  let apiArguments: AccountTransactionsAPIArguments | null = null;

  for (const assetDefinition of assetDefinitions) {
    apiArguments = fulfillArgumentsWithDefinition(apiArguments, assetDefinition);
  }

  return apiArguments;
}
