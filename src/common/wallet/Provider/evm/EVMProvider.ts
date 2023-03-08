import { ethers, logger } from "ethers";

import { DEFAULT_DECIMALS, ETH_ADDRESS } from "common/config";
import { BlockchainNetwork, ProviderClass } from "common/types";
import { ERC20__factory } from "common/wallet/typechain";

import { EthereumToken } from "ui/types";

import { JsonRPCProviderWithRetry } from "./JsonRPCProviderWithRetry";

function getMethodSelector(functionName: string) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(functionName)).slice(0, 10);
}

function safelyParseStringOrBytes32(value: string) {
  if (ethers.utils.isHexString(value, 32)) {
    return ethers.utils.parseBytes32String(value);
  }

  // Otherwise the value will be a hexstring and needs to be converted to a UTF-8 string
  const utf8String = ethers.utils.toUtf8String(value);

  // After conversion oftentimes there are a number of special characters that remain; \x00, this regex removes them. There are also spaces injected at the start of string that are trimmed
  return utf8String.replace(/[^a-zA-Z0-9. ]/g, "").trim();
}

/**
 * Simple class override so that it fits the outlined ProviderClass interface. Extending the InfuraProvider class so that this provider can be used as normal through Signer classes that utilize it
 */
export class EVMProvider implements ProviderClass<"evm"> {
  public chainType: "evm" = "evm";
  public readonly network: BlockchainNetwork;
  public readonly provider: JsonRPCProviderWithRetry;

  constructor(network: BlockchainNetwork) {
    this.network = network;
    this.provider = new JsonRPCProviderWithRetry(network);
  }

  getUrl(): ethers.utils.ConnectionInfo {
    return {
      url: this.network.connections[0].url,
      allowGzip: true,
    };
  }

  getHasMulticallSupport() {
    return this.provider.multicallContractAddress !== null;
  }

  async getNetworkFeeData(): Promise<{ baseFee: string }> {
    const block = await this.provider.getBlock("latest");

    if (!block.baseFeePerGas) throw new Error("Missing required fee data from provider");

    return {
      baseFee: block.baseFeePerGas.toString(),
    };
  }

  async getTokenBalance(tokenAddress: string, addressOfUser: string): Promise<string> {
    if (tokenAddress === ETH_ADDRESS) {
      const parsedBalance = ethers.utils.formatEther(await this.provider.getBalance(addressOfUser));

      return parsedBalance;
    }

    const token = ERC20__factory.connect(tokenAddress, this.provider);

    const [userBalance, decimals] = await Promise.all([token.balanceOf(addressOfUser), token.decimals()]);

    return ethers.utils.formatUnits(userBalance, decimals);
  }

  async ethCallHelper<T>(params: { data: string; to: string } | string, responseParser?: (value: any) => T): Promise<T> {
    const response = await this.provider.send("eth_call", [params, "latest"]);

    if (responseParser) return responseParser(response);

    return response;
  }

  async getTokenDetails(tokenAddress: string): Promise<EthereumToken> {
    if (tokenAddress === ETH_ADDRESS) {
      return {
        contractType: "ERC20",
        address: ETH_ADDRESS,
        decimals: DEFAULT_DECIMALS,
        name: "Ethereum",
        symbol: "ETH",
      };
    }

    const token = ERC20__factory.connect(tokenAddress, this.provider);

    const [decimals, name, symbol] = await Promise.all([
      token.decimals(),
      this.ethCallHelper({ data: getMethodSelector("name()"), to: tokenAddress }, safelyParseStringOrBytes32),
      this.ethCallHelper({ data: getMethodSelector("symbol()"), to: tokenAddress }, safelyParseStringOrBytes32),
    ]);

    return {
      contractType: "ERC20",
      address: tokenAddress,
      decimals,
      name,
      symbol,
    };
  }

  /**
   * Returns the contract code of address as of the blockTag block height. If there is no contract currently deployed, the result is 0x.
   * https://docs.ethers.io/v5/api/providers/provider/#Provider-getCode
   */
  async getCode(address: string): Promise<string> {
    return await this.provider.getCode(address, "latest");
  }

  getSigner(address?: string): ethers.providers.JsonRpcSigner {
    return logger.throwError("API provider does not support signing", ethers.utils.Logger.errors.UNSUPPORTED_OPERATION, {
      operation: "getSigner",
    });
  }

  /**
   * Lookup name from ENS
   * @param address
   */
  async lookupAddress(address: string): Promise<string | null> {
    return this.provider.lookupAddress(address);
  }

  /**
   * Resolve address from ENS name
   * @param name
   */
  async resolveName(name: string): Promise<string | null> {
    return await this.provider.resolveName(name);
  }

  async getTransaction(txHash: string) {
    return await this.provider.getTransaction(txHash);
  }

  async getTransactionReceipt(txHash: string) {
    return await this.provider.getTransactionReceipt(txHash);
  }
}
