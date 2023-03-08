import { useHistoryPathParams } from "ui/common/history";

import TokenNetworkSpecificAsset from "./TokenNetworkSpecificAsset";
import TokenGlobalAsset from "./TokenGlobalAsset";
import TokenHeader from "./TokenHeader";

export default function Token() {
  const { assetId: assetIdStr, assetKey } = useHistoryPathParams<"assetId" | "assetKey">();

  if (assetKey) {
    return <TokenNetworkSpecificAsset assetKey={assetKey} />;
  }

  const assetId = Number(assetIdStr);

  if (Number.isFinite(assetId) && assetId >= 0) {
    return <TokenGlobalAsset assetId={assetId} />;
  }

  return <TokenHeader token={null} />;
}
