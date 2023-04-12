export interface SimulationRequest {
  system: string;
  network: string;
  transactions: Transaction[];
}

export interface Transaction {
  to: string;
  from: string;
  gas: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  value: number;
  input: string;
}

export interface SimulationResponse {
  status: string;
  simulatedBlockNumber: number;
  transactions: Transaction[];
  internalTransactions: InternalTransaction[][];
  netBalanceChanges: NetBalanceChange[][];
  error: any[];
  simDetails: SimDetails;
  serverVersion: string;
  system: string;
  network: string;
  gasUsed: number[];
  contractCall: ContractCall2[];
}

export interface InternalTransaction {
  type: string;
  from: string;
  to: string;
  input: string;
  gas: number;
  gasUsed: number;
  value: string;
  contractCall?: ContractCall;
}

export interface ContractCall {
  methodName: string;
  params: any;
  contractAddress: string;
  contractType: string;
  contractAlias?: string;
  contractDecimals?: number;
  contractName?: string;
  decimalValue?: string;
}

export interface NetBalanceChange {
  address: string;
  balanceChanges: BalanceChange[];
}

export interface BalanceChange {
  delta: string;
  asset: Asset;
  breakdown: Breakdown[];
}

export interface Asset {
  type: string;
  symbol: string;
  contractAddress?: string;
}

export interface Breakdown {
  counterparty: string;
  amount: string;
}

export interface SimDetails {
  blockNumber: number;
  performanceProfile: PerformanceProfile;
  e2eMs: number;
}

export interface PerformanceProfile {
  breakdown: Breakdown2[];
}

export interface Breakdown2 {
  label: string;
  timeStamp: string;
}

export interface ContractCall2 {
  status: string;
  value: Value | null;
}

export interface Value {
  methodName: string;
  params: any;
  contractAddress: string;
  contractType?: string;
  contractAlias?: string;
  contractDecimals?: number;
  contractName?: string;
}
