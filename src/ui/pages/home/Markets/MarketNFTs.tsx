import { memo, useCallback, useState } from "react";
import { ListChildComponentProps } from "react-window";

import { useHistoryPush } from "ui/common/history";
import { GraphQLMarketsNFTToken } from "ui/types";
import { useNFTTokens } from "ui/hooks";

import NFTTokenRow from "ui/components/entity/nft/NFTTokenRow";
import AlertStatus from "ui/components/common/AlertStatus";
import NotFound from "ui/components/common/NotFound";
import ScrollableList from "ui/components/common/ScrollableList";

const DEFAULT_NFTS_PER_PAGE = 20;
const ROW_HEIGHT = 111;
const ROW_WIDTH = "100%";

const NFT_ASSETS = "bored-ape-kennel-club,rtfkt-nike-cryptokicks,boredapeyachtclub";

export interface MarketNFTsProps {
  onScroll: (value: boolean) => void;
}

export default memo(function MarketNFTs({ onScroll }: MarketNFTsProps) {
  const [offset, setOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const push = useHistoryPush();

  const { NFTTokens, loading, error, hasNextResults } = useNFTTokens(NFT_ASSETS, offset);

  const handleLoadMore = useCallback(() => {
    setOffset(p => p + DEFAULT_NFTS_PER_PAGE);
  }, []);

  const handleNFTTokenRowClick = (token: GraphQLMarketsNFTToken) => {
    push(`/nfts/${token.collectionSlug}`);
  };

  const handleOnScroll = (value: boolean) => {
    if (value !== isVisible) {
      setIsVisible(value);
      onScroll(value);
    }
  };

  const notFound = NFTTokens?.length === 0 && !loading && <NotFound height="50vh" />;

  const status = <AlertStatus loading={loading} loadingText="Loading..." error={!loading && !!error} errorText={error} />;

  const renderNFTTokenRow = ({ index, style }: ListChildComponentProps) => {
    const loading = index === NFTTokens.length;

    if (loading) {
      return <div style={style}>{status}</div>;
    }

    const token = NFTTokens[index] || null;

    if (token) {
      return (
        <div style={style}>
          <NFTTokenRow key={token.id} token={token} index={index + 1} onClick={handleNFTTokenRowClick} />
        </div>
      );
    }

    return <div style={style}>{status}</div>;
  };

  return (
    <>
      {NFTTokens.length > 0 && (
        <ScrollableList
          items={NFTTokens}
          loadMore={handleLoadMore}
          hasNextPage={hasNextResults}
          listHeight={document.body.clientHeight}
          listWidth={ROW_WIDTH}
          itemSize={ROW_HEIGHT}
          isNextPageLoading={loading}
          onScrollingChanged={handleOnScroll}
        >
          {renderNFTTokenRow}
        </ScrollableList>
      )}
      {notFound}
    </>
  );
});
