export type GasUpdateOptions = { updateRate: "once" } | { updateRate: "periodic"; frequency: number };

export interface ConnectionPlugPopover {
  show: boolean;
  open: boolean;
  isInitial: boolean;
}

export interface GasPresetValues {
  baseFee?: string;
  gasLimit?: string;
  gasPrice?: string;
  priorityFee?: string;
}

export interface GasPresetSettings {
  enabled: boolean;
  low?: GasPresetValues;
  medium?: GasPresetValues;
  high?: GasPresetValues;
}

export interface GasOptions {
  updateOptions?: GasUpdateOptions;
  presets?: GasPresetSettings;
}
