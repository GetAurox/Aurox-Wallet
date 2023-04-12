import axios from "axios";
import isURL from "validator/lib/isURL";

import { alchemyNftAPISupportedChains } from "common/config";
import { Alchemy } from "common/types";
import { getStringValuesFromObject, getTimeInMilliseconds } from "common/utils";

export async function getNFTMetadata(contractAddress: string, tokenId: string, chainId: number) {
  const tokenUriTimeoutInMs = getTimeInMilliseconds({ unit: "second", amount: 5 });

  const query = `?contractAddress=${contractAddress}&tokenId=${tokenId}&tokenUriTimeoutInMs=${tokenUriTimeoutInMs}&refreshCache=true`;

  const nftClient = axios.create({
    baseURL: alchemyNftAPISupportedChains[chainId],
    headers: { "Content-Type": "application/json" },
  });

  const { data } = await nftClient.get<Alchemy.NFTMetadata>("/getNFTMetadata" + query);

  return data;
}

export async function getNFTNameAndSymbol(contractAddress: string, tokenId: string, chainId: number) {
  const nftDetails = await getNFTMetadata(contractAddress, tokenId, chainId);

  const url = Array.from(getStringValuesFromObject(nftDetails)).find(value => isURL(value) && !value.includes("ipfs"));

  const name = nftDetails.metadata.name || nftDetails.title || nftDetails.contractMetadata.name || nftDetails.contractMetadata.symbol;

  return { name, url };
}
