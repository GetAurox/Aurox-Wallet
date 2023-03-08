export interface PhishingWarningOverlayData {
  host: string;
  timestamp: number;
}

export type PhishingInputType = "current" | "accumulated";

export type PhishingRequest = Record<PhishingInputType, string>;

export type PhishingResponse = Record<PhishingInputType, { hasMnemonic: boolean; hasPrivateKey: boolean }>;
