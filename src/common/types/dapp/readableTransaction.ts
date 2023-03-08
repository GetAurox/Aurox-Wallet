export interface ArgumentDetails {
  name: string;

  type: string;

  value: any;
}

export interface ReadableTransaction {
  name: string;

  sighash: string | null;

  signature: string | null;

  arguments: ArgumentDetails[];
}
