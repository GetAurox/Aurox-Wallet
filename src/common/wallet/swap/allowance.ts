import { MaxUint256 } from "@ethersproject/constants";

import { ETH_ADDRESS } from "common/config";
import { getEVMTransactionService } from "common/transactions";

import { downscaleAmountWithDecimals } from "ui/common/utils";

import { EVMProvider, ProviderManager } from "../Provider";

import { ERC20__factory } from "../typechain";

import { AllowanceCheck, ApprovalManagerParams, ApprovalRequest } from "./types";

export function getApprovalTransaction(params: ApprovalRequest) {
  const { amount, spender, tokenAddress, accountAddress } = params;

  const contractInterface = ERC20__factory.createInterface();

  const data = contractInterface.encodeFunctionData("approve", [spender, amount]);

  return {
    from: accountAddress,
    to: tokenAddress,
    data,
    value: "0x0",
  };
}

export async function getAllowance(params: AllowanceCheck) {
  const { network, accountAddress, tokenAddress, tokenDecimals, spender } = params;

  // Native tokens to not require approvals
  if (tokenAddress === ETH_ADDRESS) {
    return MaxUint256;
  }

  const { provider } = ProviderManager.getProvider(network) as EVMProvider;

  const tokenContract = ERC20__factory.connect(tokenAddress, provider);

  const allowanceBalance = await tokenContract.allowance(accountAddress, spender);

  return downscaleAmountWithDecimals(allowanceBalance.toString(), tokenDecimals);
}

export async function getApprovalManager(params: ApprovalManagerParams) {
  const { accountAddress, token, spender, amount, account, network, userBalance, gasOptions } = params;

  if (token.assetDefinition.type === "native") {
    return;
  }

  const allowance = await getAllowance({
    network,
    accountAddress,
    tokenAddress: token.assetDefinition.contractAddress,
    tokenDecimals: token.decimals,
    spender,
  });

  const needsApproval = Number(allowance) < Number(amount);

  if (!needsApproval) {
    return null;
  }

  const transaction = getApprovalTransaction({
    accountAddress,
    tokenAddress: token.assetDefinition.contractAddress,
    amount: MaxUint256,
    spender,
  });

  return await getEVMTransactionService({
    transaction,
    network,
    account,
    userBalance,
    gasOptions,
  });
}
