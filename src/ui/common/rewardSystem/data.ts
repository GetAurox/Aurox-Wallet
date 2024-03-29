import {
  IconCoinToss,
  IconCoinTossGray,
  IconDailyCalendar,
  IconDailyCalendarGray,
  IconDiscord,
  IconDiscordGray,
  IconDiscordHighest,
  IconDiscordHighestGray,
  IconDiscordLevelTwo,
  IconDiscordLevelTwoGray,
  IconGift,
  IconGiftGray,
  IconInvite,
  IconInviteAurox,
  IconInviteAuroxGray,
  IconInviteGray,
  IconPeople,
  IconPeopleGray,
  IconRewardsSwap,
  IconSaleTag,
  IconSaleTagGray,
  IconSendCoin,
  IconSendCoinGray,
  IconSendNFT,
  IconSendNFTGray,
  IconSwapGray,
  IconTickets,
  IconTicketsGray,
} from "ui/components/icons";

import { RewardLevelData } from "./types";

export const BENEFITS_DATA = [
  {
    Icon: IconDiscord,
    IconGray: IconDiscordGray,
    title: "Access to Aurox Discord",
    level: ["green"],
  },
  {
    Icon: IconInvite,
    IconGray: IconInviteGray,
    title: "VIP Invites To Aurox Society Events",
    level: ["diamond"],
  },
  {
    Icon: IconTickets,
    IconGray: IconTicketsGray,
    title: "VIP Tickets + Flights to Crypto Conferences",
    level: ["diamond", "platinum"],
  },
  {
    Icon: IconPeople,
    IconGray: IconPeopleGray,
    title: "GA Crypto Conference Tickets",
    level: ["gold"],
  },
  {
    Icon: IconInviteAurox,
    IconGray: IconInviteAuroxGray,
    title: "GA Invites to Aurox Society Events",
    level: ["diamond", "platinum", "gold", "black"],
  },
  {
    Icon: IconDiscordHighest,
    IconGray: IconDiscordHighestGray,
    title: "Highest level access to Aurox Discord",
    level: ["diamond", "platinum", "gold", "black"],
  },
  {
    Icon: IconSaleTag,
    IconGray: IconSaleTagGray,
    title: "IDO pre-sale airdrops",
    level: ["diamond", "platinum", "gold", "black", "gray"],
  },
  {
    Icon: IconCoinToss,
    IconGray: IconCoinTossGray,
    title: "NFT whitelist entries",
    level: ["diamond", "platinum", "gold", "black", "blue", "gray"],
  },
  {
    Icon: IconGift,
    IconGray: IconGiftGray,
    title: "$25,000 in monthly giveaways and prizes",
    level: ["yellow"],
  },
  {
    Icon: IconGift,
    IconGray: IconGiftGray,
    title: "$50,000 in monthly giveaways and prizes",
    level: ["diamond", "platinum", "gold", "black", "orange", "blue", "gray"],
  },
  {
    Icon: IconDiscordLevelTwo,
    IconGray: IconDiscordLevelTwoGray,
    title: "Level 2 Access to Aurox Discord",
    level: ["gray", "yellow", "orange", "blue"],
  },
];

export const POINTS_DATA = [
  {
    Icon: IconDailyCalendar,
    IconGray: IconDailyCalendarGray,
    title: "Daily entry bonus",
    content: ["Get [b]10 points[/b]"],
  },
  {
    Icon: IconSendCoin,
    IconGray: IconSendCoinGray,
    title: "Send a token with Aurox Wallet",
    content: ["[b]1 point[/b] per dollar sent", "Maximum of [b]100 points[/b] per transaction", "Capped at [b]5000 points[/b] per month"],
  },
  {
    Icon: IconRewardsSwap,
    IconGray: IconSwapGray,
    title: "Execute in-wallet swap",
    content: ["[b]1 point[/b] per dollar sent", "Maximum of [b]10000 points[/b] per month"],
  },
  {
    Icon: IconSendNFT,
    IconGray: IconSendNFTGray,
    title: "Send an NFT with Aurox Wallet",
    content: ["Get [b]50 points[/b]"],
  },
];

export const MULTIPLIER_DATA = [
  {
    Icon: IconSendCoin,
    IconGray: IconSendCoinGray,
    title: "Hold Aurox Token",
    content: [
      "Earn [b]1.5x[/b] normal points by holding [b]50 Aurox Tokens[/b] in your wallet",
      "Tokens can be held in any of your imported wallets",
    ],
  },
];

export const MORE_INFO_LINKS = [
  {
    title: "How It Works",
    url: "https://docs.getaurox.com/product-docs/aurox-ecosystem/aurox-ecosystem/aurox-wallet/wallet-rewards",
  },
  {
    title: "Program Terms",
    url: "https://docs.getaurox.com/product-docs/aurox-ecosystem/aurox-ecosystem/aurox-wallet/wallet-rewards/program-terms",
  },
];

export const REWARD_LEVELS_STATIC_DATA: RewardLevelData[] = [
  {
    identity: "white",
    title: "White",
    subTitle: "0/2,000",
    pointsToUnlock: 2000,
    levelSize: 2000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/white.png", disabled: "assets/rewards/white-locked.png" },
  },
  {
    identity: "green",
    title: "Green",
    subTitle: "0/4,000",
    pointsToUnlock: 6000,
    levelSize: 4000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/green.png", disabled: "assets/rewards/green-locked.png" },
  },
  {
    identity: "yellow",
    title: "Yellow",
    subTitle: "0/8,000",
    pointsToUnlock: 14000,
    levelSize: 8000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/yellow.png", disabled: "assets/rewards/yellow-locked.png" },
  },
  {
    identity: "orange",
    title: "Orange",
    subTitle: "0/16,000",
    pointsToUnlock: 30000,
    levelSize: 16000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/orange.png", disabled: "assets/rewards/orange-locked.png" },
  },
  {
    identity: "blue",
    title: "Blue",
    subTitle: "0/32,000",
    pointsToUnlock: 62000,
    levelSize: 32000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/blue.png", disabled: "assets/rewards/blue-locked.png" },
  },
  {
    identity: "gray",
    title: "Gray",
    subTitle: "0/64,000",
    pointsToUnlock: 126000,
    levelSize: 64000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/gray.png", disabled: "assets/rewards/gray-locked.png" },
  },
  {
    identity: "black",
    title: "Black",
    subTitle: "0/128,000",
    pointsToUnlock: 254000,
    levelSize: 128000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/black.png", disabled: "assets/rewards/black-locked.png" },
  },
  {
    identity: "gold",
    title: "Gold",
    subTitle: "0/256,000",
    pointsToUnlock: 510000,
    levelSize: 256000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/gold.png", disabled: "assets/rewards/gold-locked.png" },
  },
  {
    identity: "platinum",
    title: "Platinum",
    subTitle: "0/512,000",
    pointsToUnlock: 1022000,
    levelSize: 512000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/platinum.png", disabled: "assets/rewards/platinum-locked.png" },
  },
  {
    identity: "diamond",
    title: "Diamond",
    subTitle: "0/1,024,000",
    pointsToUnlock: 2046000,
    levelSize: 1024000,
    isLocked: true,
    progress: 0,
    iconSrc: { normal: "assets/rewards/diamond.png", disabled: "assets/rewards/diamond-locked.png" },
  },
];
