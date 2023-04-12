export interface ConnectionPlugPopover {
  show: boolean;
  open: boolean;
  isInitial: boolean;
}

export interface GasPresetValues {
  baseFee?: number;
  gasLimit?: number;
  gasPrice?: number;
  priorityFee?: number;
}

export interface GasPresetSettings {
  enabled: boolean;
  low?: GasPresetValues;
  medium?: GasPresetValues;
  high?: GasPresetValues;
}
