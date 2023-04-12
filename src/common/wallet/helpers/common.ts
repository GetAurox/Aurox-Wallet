import { ethers } from "ethers";

/**
 * This method takes in revert data coming from a contract call and decodes it to extract the string contents of the revert data.
 * @dev Extra handling implemented for erroneous error messages (error's without a provided message). These errors will return with a length less than 68 (more here: https://ethereum.stackexchange.com/questions/83528/how-can-i-get-the-revert-reason-of-a-call-in-solidity-so-that-i-can-use-it-in-th)
 * @param revertData The abi encoded revertData to decode
 * @returns The decoded revertData
 */
export function getRevertMessageFromRevertData(revertData: string) {
  if (revertData.length < 68) return "Reverted without message";

  try {
    // Decode the response data as a string, also slice the first 4 characters as this is the selector
    const [decodedValue] = ethers.utils.defaultAbiCoder.decode(["string"], ethers.utils.hexDataSlice(revertData, 4));

    return decodedValue;
  } catch (e) {
    // Some errors may be returned in weird formats and will fail the decoding
    return "Reverted without readable message";
  }
}
