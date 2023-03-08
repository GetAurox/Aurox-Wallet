import { useMemo } from "react";

import { Alert } from "@mui/material";

import { ETH_ADDRESS } from "common/config";
import { applyTokenAssetVisibilityRules, createAssetKey, createNetworkIdentifier, getAssetIdentifierFromDefinition } from "common/utils";

import { useActiveAccountFlatTokenBalances, useTokensDisplayWithTickers, useMarketTokensByAssetId } from "ui/hooks";

import TokenGlobalAssetView from "./TokenGlobalAssetView";
import TokenHeader from "./TokenHeader";

const sxStyles = {
  alert: {
    borderRadius: "10px",
    margin: 2,
  },
};

export interface TokenGlobalAssetProps {
  assetId: number;
}

export default function TokenGlobalAsset(props: TokenGlobalAssetProps) {
  const { assetId } = props;

  const balances = useActiveAccountFlatTokenBalances();

  const tokensForDisplay = useTokensDisplayWithTickers(balances);

  const { loading, tokens: tokensByAssetId } = useMarketTokensByAssetId(assetId);

  const pairIds = tokensByAssetId.map(token => token.pairId);

  const visibleTokenBalances = useMemo(
    () => tokensForDisplay.filter(applyTokenAssetVisibilityRules).filter(item => pairIds.includes(item.pairId ?? 0)),
    [pairIds, tokensForDisplay],
  );

  const contractAddress = tokensByAssetId?.[0]?.address || null;
  const chainId = tokensByAssetId?.[0]?.chainId || null;

  if (!loading && (contractAddress === null || chainId === null)) {
    return <TokenHeader token={null} />;
  }

  let assetIdentifier = null;

  if (contractAddress === ETH_ADDRESS) {
    assetIdentifier = getAssetIdentifierFromDefinition({ type: "native" });
  } else if (contractAddress) {
    assetIdentifier = getAssetIdentifierFromDefinition({ type: "contract", contractType: "ERC20", contractAddress });
  }

  const assetKey = assetIdentifier && createAssetKey(createNetworkIdentifier("evm", Number(chainId)), assetIdentifier);

  return (
    <>
      {loading && (
        <Alert sx={sxStyles.alert} severity="info">
          Loading
        </Alert>
      )}

      {!loading && assetKey && <TokenGlobalAssetView assetKey={assetKey} balances={visibleTokenBalances} />}
    </>
  );
}
