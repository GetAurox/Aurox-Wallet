import { memo } from "react";

import { useHistoryPush } from "ui/common/history";
import { GraphQLMarketsNFTToken } from "ui/types";
import { useNFTTokens } from "ui/hooks";

import NFTTokenRow from "ui/components/entity/nft/NFTTokenRow";
import AlertStatus from "ui/components/common/AlertStatus";

export interface NFTCollectionTokenListProps {
  slug: string;
}

export default memo(function NFTCollectionTokenList(props: NFTCollectionTokenListProps) {
  const { slug } = props;

  const { NFTTokens, loading, error } = useNFTTokens(slug, 0);

  const push = useHistoryPush();

  const handleOnClick = (token: GraphQLMarketsNFTToken) => {
    push(`/nfts/${token.contractAddress}/${token.tokenId}`);
  };

  return (
    <>
      <AlertStatus loading={loading} loadingText="Loading..." error={!loading && !!error} errorText={error} />
      {NFTTokens.map((token, idx) => (
        <NFTTokenRow token={token} key={idx} onClick={handleOnClick} />
      ))}
    </>
  );
});
