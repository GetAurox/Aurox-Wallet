import { MultichainBalanceResolutionQuery, MultichainBalanceResolver } from "./types";
import {
  isNetworkSupportedForEVMLeecherResolver,
  createEVMChainERC20BalanceOfResolver,
  createEVMLeecherResolver,
  createEVMChainERC721BalanceOfResolver,
  createEVMChainERC1155BalanceOfResolver,
} from "./targetedResolvers";

export function consolidateNetworkBalanceResolvers(query: MultichainBalanceResolutionQuery): MultichainBalanceResolver[] {
  const { accountAddress, assetIdentifiers, assets, network } = query;

  if (network.chainType === "evm") {
    if (isNetworkSupportedForEVMLeecherResolver(network)) {
      return [
        { resolver: createEVMLeecherResolver(network, accountAddress), resolverType: "leecher" },
        {
          resolver: createEVMChainERC20BalanceOfResolver(network, accountAddress, assetIdentifiers),
          resolverType: "rpc",
        },
        {
          resolver: createEVMChainERC721BalanceOfResolver(network, accountAddress, assets),
          resolverType: "rpc",
        },
        {
          resolver: createEVMChainERC1155BalanceOfResolver(network, accountAddress, assets),
          resolverType: "rpc",
        },
      ];
    }

    return [
      {
        resolver: createEVMChainERC20BalanceOfResolver(network, accountAddress, assetIdentifiers),
        resolverType: "rpc",
      },
      {
        resolver: createEVMChainERC721BalanceOfResolver(network, accountAddress, assets),
        resolverType: "rpc",
      },
      {
        resolver: createEVMChainERC1155BalanceOfResolver(network, accountAddress, assets),
        resolverType: "rpc",
      },
    ];
  }

  return [];
}
