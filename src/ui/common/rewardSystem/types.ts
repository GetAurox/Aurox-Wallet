export type Level = {
  name: string;
  reward_points_to_unlock: number;
  reward_points_when_reached: number;
};

export type Reward = {
  date_time: string;
  campaign: {
    id: string;
    title: string;
    event_name?: string | null;
  };
  points: number;
};

export type OneTimeCampaignId =
  | "password_created"
  | "username_created"
  | "add_wallet"
  | "wallet_manage_clicked"
  | "transactions_tab_viewed"
  | "transaction_viewed"
  | "view_market_overview"
  | "coin_searched"
  | "coin_tag_click"
  | "coin_viewed"
  | "market_tag_click"
  | "coin_favorited"
  | "news_feed_viewed"
  | "news_article_viewed"
  | "news_article_searched"
  | "news_tag_clicked"
  | "nft_view";

export type OneTimeEvent =
  | "aurox.my.password_created"
  | "aurox.my.username_created"
  | "aurox.my.wallet_added"
  | "aurox.my.wallet_manage_clicked"
  | "aurox.my.transaction_tab_viewed"
  | "aurox.my.transaction_details_viewed"
  | "aurox.my.market_overview_viewed"
  | "aurox.my.coin_searched"
  | "aurox.my.market_tag_clicked"
  | "aurox.my.coin_tag_clicked"
  | "aurox.my.coin_viewed"
  | "aurox.my.news_feed_viewed"
  | "aurox.my.news_article_viewed"
  | "aurox.my.news_article_searched"
  | "aurox.my.news_tag_clicked"
  | "aurox.my.coin_favorited"
  | "aurox.my.nft_viewed";

export type PublishableEvent =
  | OneTimeEvent
  | "aurox.my.d_app_transaction_made"
  | "aurox.my.favorites_sorted"
  | "aurox.my.market_overview_sorted"
  | "aurox.my.nft_collection_viewed"
  | "aurox.my.nft_favorited"
  | "aurox.my.nft_searched"
  | "aurox.my.nft_tag_clicked"
  | "aurox.my.two_factor_auth_set_up"
  | "aurox.my.wallet_linked_to_d_app"
  | "aurox.my.welcome_page_passed"
  | "aurox.my.token_transaction";

export type SubscribableEvent = "aurox.my.reward";

export type ProcedureResponseMap = {
  "aurox.my.get_level": { args: any[]; kwargs: { level: Level } };
  "aurox.my.get_levels": { args: any[]; kwargs: { levels: Level[] } };
  "aurox.my.get_points": { args: any[]; kwargs: { points: number } };
  "aurox.my.get_referees_count": {
    args: any[];
    kwargs: { tier1_referees_count: number; tier2_referees_count: number; tier3_referees_count: number };
  };
  "aurox.my.get_rewards": {
    args: any[];
    kwargs: {
      rewards: Reward[];
    };
  };
  "aurox.crypto.get_ethereum_message_address": {
    args: any[];
    kwargs: {
      address: string | null;
    };
  };
  "aurox.crypto.verify_ethereum_message": {
    args: any[];
    kwargs: {
      verified: boolean;
    };
  };
  "aurox.my.get_referral_link": {
    args: any[];
    kwargs: {
      referral_link: string;
    };
  };
};

export type Procedure = keyof ProcedureResponseMap;

export type ProcedureResponse = ProcedureResponseMap[keyof ProcedureResponseMap];

export type ProcedureResponseTypeFromProcedure<P extends Procedure> = ProcedureResponseMap[P];

export type LevelIdentity = "white" | "green" | "yellow" | "orange" | "blue" | "gray" | "black" | "gold" | "platinum" | "diamond";

export interface RewardLevelData {
  identity: LevelIdentity;
  title: string;
  subTitle: string;
  /** minimum absolute reward points needed to unlock level */
  pointsToUnlock: number;
  /** relative number of points of a level */
  levelSize: number;
  isLocked: boolean;
  progress: number;
  iconSrc: { normal: string; disabled: string };
}
