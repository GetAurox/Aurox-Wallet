import { OneTimeCampaignId, OneTimeEvent, PublishableEvent, SubscribableEvent, Procedure } from "./types";

export const ONE_TIME_CAMPAIGN_IDS: OneTimeCampaignId[] = [
  "password_created",
  "username_created",
  "add_wallet",
  "wallet_manage_clicked",
  "transactions_tab_viewed",
  "transaction_viewed",
  "view_market_overview",
  "coin_searched",
  "coin_tag_click",
  "coin_viewed",
  "market_tag_click",
  "coin_favorited",
  "news_feed_viewed",
  "news_article_viewed",
  "news_article_searched",
  "news_tag_clicked",
  "nft_view",
];

export const ONE_TIME_EVENTS: OneTimeEvent[] = [
  "aurox.my.password_created",
  "aurox.my.username_created",
  "aurox.my.wallet_added",
  "aurox.my.wallet_manage_clicked",
  "aurox.my.transaction_tab_viewed",
  "aurox.my.transaction_details_viewed",
  "aurox.my.market_overview_viewed",
  "aurox.my.coin_searched",
  "aurox.my.market_tag_clicked",
  "aurox.my.coin_tag_clicked",
  "aurox.my.coin_viewed",
  "aurox.my.news_feed_viewed",
  "aurox.my.news_article_viewed",
  "aurox.my.news_article_searched",
  "aurox.my.news_tag_clicked",
  "aurox.my.coin_favorited",
  "aurox.my.nft_viewed",
];

export const PUBLISHABLE_EVENTS: PublishableEvent[] = [
  ...ONE_TIME_EVENTS,
  "aurox.my.d_app_transaction_made",
  "aurox.my.favorites_sorted",
  "aurox.my.market_overview_sorted",
  "aurox.my.nft_collection_viewed",
  "aurox.my.nft_favorited",
  "aurox.my.nft_searched",
  "aurox.my.nft_tag_clicked",
  "aurox.my.two_factor_auth_set_up",
  "aurox.my.wallet_linked_to_d_app",
  "aurox.my.welcome_page_passed",
  "aurox.my.token_transaction",
];
export const SUBSCRIBABLE_EVENTS: SubscribableEvent[] = ["aurox.my.reward"];
export const PROCEDURES: Procedure[] = [
  "aurox.crypto.get_ethereum_message_address", // get an ethereum address from a signed message
  "aurox.crypto.verify_ethereum_message", // verify signed ethereum message
  "aurox.my.get_level", // get current user level
  "aurox.my.get_levels", // get all available levels
  "aurox.my.get_points", // get amount of reward points user has
  "aurox.my.get_rewards", // get a list of rewards user has ever got
  "aurox.my.get_referees_count", // get amount of users referred by user
];

export const ONE_TIME_CAMPAIGN_ID_EVENT_MAPPING: Record<OneTimeCampaignId, OneTimeEvent> = {
  "password_created": "aurox.my.password_created",
  "username_created": "aurox.my.username_created",
  "add_wallet": "aurox.my.wallet_added",
  "wallet_manage_clicked": "aurox.my.wallet_manage_clicked",
  "transactions_tab_viewed": "aurox.my.transaction_tab_viewed",
  "transaction_viewed": "aurox.my.transaction_details_viewed",
  "view_market_overview": "aurox.my.market_overview_viewed",
  "coin_searched": "aurox.my.coin_searched",
  "coin_tag_click": "aurox.my.coin_tag_clicked",
  "coin_viewed": "aurox.my.coin_viewed",
  "market_tag_click": "aurox.my.market_tag_clicked",
  "coin_favorited": "aurox.my.coin_favorited",
  "news_feed_viewed": "aurox.my.news_feed_viewed",
  "news_article_viewed": "aurox.my.news_article_viewed",
  "news_article_searched": "aurox.my.news_article_searched",
  "news_tag_clicked": "aurox.my.news_tag_clicked",
  "nft_view": "aurox.my.nft_viewed",
};
