import assert from "assert";

import isURL from "validator/lib/isURL";

import { getStringValuesFromObject } from "./objectInspection";

const data = {
  "contract": {
    "address": "0x3d9b4891566ac24878ae472477d01459ed34d35c",
  },
  "id": {
    "tokenId": "0x133e",
    "tokenMetadata": {
      "tokenType": "UNKNOWN",
    },
  },
  "title": "Nakapepes #4926",
  "description": "10,000 unique crypto pepes on the blockchain.",
  "tokenUri": {
    "gateway": "https://ipfs.io/ipfs/QmfTowrCgFSX4zHc6nxnMXkMoEEQBQvYLbcaN7eWjXatL6/4926",
    "raw": "ipfs://QmfTowrCgFSX4zHc6nxnMXkMoEEQBQvYLbcaN7eWjXatL6/4926",
  },
  "media": [
    {
      "gateway": "https://nft-cdn.alchemy.com/eth-mainnet/e248a600ce64cb5d65823b114808363b",
      "thumbnail": "https://res.cloudinary.com/alchemyapi/image/upload/thumbnailv2/eth-mainnet/e248a600ce64cb5d65823b114808363b",
      "raw": "ipfs://QmduWWaigJhaxSLSvQS4UhNf5UnoQ4xqfEZTbZxm6b6kSc/4926.png",
      "format": "png",
      "bytes": 10579,
    },
  ],
  "metadata": {
    "name": "Nakapepes #4926",
    "description": "10,000 unique crypto pepes on the blockchain.",
    "image": "ipfs://QmduWWaigJhaxSLSvQS4UhNf5UnoQ4xqfEZTbZxm6b6kSc/4926.png",
    "attributes": [
      {
        "trait_type": "Background",
        "value": "Background Blue",
      },
      {
        "trait_type": "Body",
        "value": "Brown",
      },
      {
        "trait_type": "Mouth",
        "value": "Small",
      },
      {
        "trait_type": "Clothes",
        "value": "Orange Vest",
      },
      {
        "trait_type": "Eyewear",
        "value": "Empty",
      },
      {
        "trait_type": "Hat",
        "value": "Black Cap",
      },
      {
        "trait_type": "Chain",
        "value": "Empty",
      },
      {
        "trait_type": "Cigarette",
        "value": "Empty",
      },
    ],
  },
  "timeLastUpdated": "2023-04-03T10:45:04.577Z",
  "contractMetadata": {
    "tokenType": "UNKNOWN",
    "contractDeployer": "0x66a718e3e65d6c9982ca7fc32b2f91960eeb0f45",
    "deployedBlockNumber": 16967208,
    "openSea": {},
  },
};

describe("Tests object inspection utility", () => {
  it("Gets all string values from an object", () => {
    const result = Array.from(getStringValuesFromObject(data));

    const urls = result.filter(value => isURL(value));

    assert(result.length === 33);
    assert(urls.length === 3);
  });
});
