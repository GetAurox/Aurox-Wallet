export type UNSDomainRecordType = `crypto.${string}.address` | `crypto.${string}.version.${string}.address`;

export interface UNSDomainResponse {
  meta: {
    domain: string | null;
    owner: string | null;
    resolver: string | null;
    registry: string | null;
    blockchain: string | null;
    networkId: number | null;
    reverse: boolean;
  };
  records: Record<UNSDomainRecordType, string>;
}
