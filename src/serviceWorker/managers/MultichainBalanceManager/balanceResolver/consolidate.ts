import { MultichainBalanceResolutionQuery, MultichainBalanceResolver } from "./types";
import {
  isNetworkSupportedForEVMLeecherResolver,
  createEVMChainERC20BalanceOfResolver,
  createEVMLeecherResolver,
} from "./targetedResolvers";

export function consolidateNetworkBalanceResolvers(query: MultichainBalanceResolutionQuery): MultichainBalanceResolver[] {
  const { accountAddress, assetIdentifiers, network } = query;

  if (network.chainType === "evm") {
    if (isNetworkSupportedForEVMLeecherResolver(network)) {
      return [
        { resolver: createEVMLeecherResolver(network, accountAddress), resolverType: "leecher" },
        { resolver: createEVMChainERC20BalanceOfResolver(network, accountAddress, assetIdentifiers), resolverType: "rpc" },
      ];
    }

    return [{ resolver: createEVMChainERC20BalanceOfResolver(network, accountAddress, assetIdentifiers), resolverType: "rpc" }];
  }

  return [];
}
