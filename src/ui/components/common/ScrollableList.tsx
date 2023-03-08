import { useEffect, useRef } from "react";
import noop from "lodash/noop";
import InfiniteLoader from "react-window-infinite-loader";
import { FixedSizeList, ListChildComponentProps, ListOnScrollProps } from "react-window";

export interface ScrollableListProps {
  items: any[];
  loadMore: () => void;
  hasNextPage: boolean;
  rowHeight: number;
  rowWidth: number | string;
  itemSize: number;
  isNextPageLoading: boolean;
  threshold?: number;
  onScrollingChanged?: (value: boolean) => void;
  scrollToIndex?: number;
  children: (props: ListChildComponentProps<any>) => JSX.Element;
}

export default function ScrollableList(props: ScrollableListProps) {
  const {
    items,
    loadMore,
    hasNextPage,
    rowWidth,
    rowHeight,
    itemSize,
    isNextPageLoading,
    onScrollingChanged,
    scrollToIndex = 0,
    threshold = 5,
    children,
  } = props;

  const itemCount = hasNextPage ? items.length + 1 : items.length;

  const loadMoreItems = isNextPageLoading ? noop : loadMore;

  const scrollFlagRef = useRef(false);

  const listRef = useRef<FixedSizeList<any> | null>(null);

  const handleOnScroll = (props: ListOnScrollProps) => {
    const flag = props.scrollOffset === 0;
    if (onScrollingChanged && flag !== scrollFlagRef.current) {
      onScrollingChanged(flag);
      scrollFlagRef.current = flag;
    }
  };

  useEffect(() => {
    if (scrollToIndex > 0) {
      listRef.current?.scrollToItem(scrollToIndex, "center");
    }
  }, [scrollToIndex, listRef]);

  return (
    <InfiniteLoader
      isItemLoaded={index => !hasNextPage || index < items.length}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
      threshold={threshold}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          height={rowHeight}
          width={rowWidth}
          itemCount={itemCount}
          itemSize={itemSize}
          onItemsRendered={onItemsRendered}
          ref={list => {
            ref(list);
            listRef.current = list;
          }}
          onScroll={handleOnScroll}
        >
          {props => children(props)}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
