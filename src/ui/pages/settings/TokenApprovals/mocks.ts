import { TokenApprovalItem } from "common/types";

export const mockItems: TokenApprovalItem[] = [
  {
    id: 1,
    shortName: "URUS",
    fullName: "URUS but long",
    amount: "-1",
    approvedSpender: "Balancer",
    address: "0x00000",
    contractAddress: "0x2dsaf7y",
  },
  {
    id: 2,
    shortName: "BTC",
    fullName: "BTC but long",
    amount: "100.432423",
    approvedSpender: "COW Protocol",
    address: "0x11111",
    contractAddress: "0x123dfs",
  },
  {
    id: 3,
    shortName: "ETH",
    fullName: "ETH but long",
    amount: "10000000",
    approvedSpender: "Uniswap",
    address: "0x22222",
    contractAddress: "0x423fsda",
  },
  {
    id: 4,
    shortName: "DAI",
    fullName: "DAI but long",
    amount: "-1",
    approvedSpender: "DeFi",
    address: "0x3333333",
    contractAddress: "0x4sadf2342",
  },
];
