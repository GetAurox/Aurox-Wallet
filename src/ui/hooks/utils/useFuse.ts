import { ChangeEvent, useCallback, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import Fuse from "fuse.js";

export interface UseFuseOptions extends Fuse.IFuseOptions<unknown> {
  matchAllOnEmptyQuery: boolean;
  limit?: number;
}

export function useFuse<T>(list: T[], options: UseFuseOptions) {
  const [query, setQuery] = useState("");

  const { limit, matchAllOnEmptyQuery, ...fuseOptions } = options;

  const fuse = useMemo(() => new Fuse<T>(list, { threshold: 0.0, ...fuseOptions }), [list, fuseOptions]);

  const fuzzyResults = useMemo<{ item: T; refIndex: number }[]>(() => {
    if (!query && matchAllOnEmptyQuery) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const indexes = fuse.getIndex() as any;

      return indexes.docs.slice(0, limit).map((item: T, refIndex: number) => ({ item, refIndex }));
    }

    return fuse.search(query, { limit: limit ?? list.length });
  }, [fuse, limit, list.length, matchAllOnEmptyQuery, query]);

  const updateQuery = useMemo(() => debounce(setQuery, 100), []);

  const onSearch = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => setQuery(event.target.value.trim()),
    [setQuery],
  );

  return {
    fuzzyResults,
    onSearch,
    query,
    updateQuery,
  };
}
