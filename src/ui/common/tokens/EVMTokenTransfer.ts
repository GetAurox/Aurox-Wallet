import { BigNumber } from "@ethersproject/bignumber";
import { Interface } from "@ethersproject/abi";
import { Zero } from "@ethersproject/constants";

import { AssetDefinition } from "common/types";

import { ERC20__factory } from "common/wallet/typechain/factories/ERC20__factory";
import { ERC721__factory } from "common/wallet/typechain/factories/ERC721__factory";

export interface EVMTokenTransferParams {
  assetDefinition: AssetDefinition;
  fromAddress: string;
  recipientAddress: string;
  amount: BigNumber;
  tokenId?: string;
}

export type EVMTokenTransfer = Omit<EVMTokenTransferParams, "assetDefinition"> & { contractAddress: string };

function getERC20TokenTransfer(params: EVMTokenTransfer) {
  const { fromAddress, contractAddress, recipientAddress, amount } = params;

  const contractInterface = new Interface(ERC20__factory.abi);

  const data = contractInterface.encodeFunctionData("transfer", [recipientAddress, amount]);

  return { from: fromAddress, to: contractAddress, value: Zero.toHexString(), data };
}

function getERC721TokenTransfer(params: EVMTokenTransfer) {
  const { fromAddress, contractAddress, recipientAddress, tokenId } = params;

  const contractInterface = ERC721__factory.createInterface();

  const data = contractInterface.encodeFunctionData("transferFrom", [fromAddress, recipientAddress, tokenId!]);

  return { from: fromAddress, to: contractAddress, value: Zero.toHexString(), data };
}

function getERC1155TokenTransfer(params: EVMTokenTransfer) {
  const { fromAddress, contractAddress, recipientAddress, tokenId, amount } = params;

  const abi = JSON.stringify(["function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data)"]);

  const contractInterface = new Interface(abi);

  const data = contractInterface.encodeFunctionData("safeTransferFrom", [
    fromAddress,
    recipientAddress,
    tokenId!,
    amount,
    Zero.toHexString(),
  ]);

  return { from: fromAddress, to: contractAddress, value: Zero.toHexString(), data };
}

function getNativeTokenTransfer(params: EVMTokenTransferParams) {
  const { fromAddress: from, recipientAddress: to, amount } = params;

  return { from, to, data: "0x", value: amount.toHexString() };
}

export function getEVMTokenTransfer(params: EVMTokenTransferParams) {
  const { assetDefinition, ...paramsWithoutAssetDefinition } = params;

  if (assetDefinition.type === "native") {
    return getNativeTokenTransfer(params);
  }

  const transferParams = { ...paramsWithoutAssetDefinition, contractAddress: assetDefinition.contractAddress };

  switch (assetDefinition.contractType) {
    case "ERC20":
      return getERC20TokenTransfer(transferParams);
    case "ERC721":
      return getERC721TokenTransfer(transferParams);
    case "ERC1155":
      return getERC1155TokenTransfer(transferParams);
  }
}
