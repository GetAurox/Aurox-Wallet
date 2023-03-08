export interface DAppPermissions {
  accountUUID: string;
  networkIdentifier: string;
}

export interface DAppTabConnection extends DAppPermissions {
  domain: string;
  tabId: number;
}
