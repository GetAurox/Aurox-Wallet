import { Connection, OnChallengeHandler } from "autobahn";

import { REWARD_SYSTEM_CONNECTION_URL, REWARD_SYSTEM_CONNECTION_REALM, REWARD_SYSTEM_CONNECTION_NONCE } from "common/config";

export interface RewardSystemOptions {
  userId: string;
  onChallenge: OnChallengeHandler;
  referralLink: string | null;
}

export class RewardSystem {
  connection: Connection | null = null;
  userId: string | null = null;

  constructor({ userId, onChallenge, referralLink }: RewardSystemOptions) {
    this.connection = new Connection({
      url: REWARD_SYSTEM_CONNECTION_URL,
      realm: REWARD_SYSTEM_CONNECTION_REALM,
      authmethods: ["ethersign"],
      authextra: {
        authid: userId,
        nonce: REWARD_SYSTEM_CONNECTION_NONCE,
        referral_link: referralLink,
      },
      onchallenge: onChallenge,
    });

    this.userId = userId;
  }
}
