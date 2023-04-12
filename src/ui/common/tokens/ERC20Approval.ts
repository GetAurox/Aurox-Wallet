import { BigNumber, ethers } from "ethers";

import { ERC20__factory } from "common/wallet/typechain";

export interface ERC20ApprovalParams {
  fromAddress: string;
  tokenAddress: string;
  spenderAddress: string;
  allowance: BigNumber;
}

export const isInfinite = (amount: BigNumber) => amount.eq(ethers.constants.MaxUint256);

export function getERC20Approval(params: ERC20ApprovalParams) {
  const { fromAddress, tokenAddress, spenderAddress, allowance } = params;

  const contractInterface = new ethers.utils.Interface(ERC20__factory.abi);

  const data = contractInterface.encodeFunctionData("approve", [spenderAddress, allowance]);

  return { from: fromAddress, to: tokenAddress, value: ethers.constants.HashZero, data };
}

export function decodeERC20Approval(data: string) {
  const contractInterface = new ethers.utils.Interface(ERC20__factory.abi);

  const [spenderAddress, allowance] = contractInterface.decodeFunctionData("approve", data);

  return { spenderAddress, allowance };
}
