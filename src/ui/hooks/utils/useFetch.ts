import { useState, useEffect, DependencyList } from "react";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";

export interface FetchProps extends AxiosRequestConfig {
  refetchInterval?: number;
  shouldSkip?: boolean;
}

export function useFetch<T>(props: FetchProps, deps?: DependencyList) {
  const { refetchInterval, shouldSkip, ...axiosConfig } = props;
  const [response, setResponse] = useState<AxiosResponse<T>>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let mounted = true;
    let intervalId: number;

    const fetch = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const data = typeof axiosConfig.data === "function" ? axiosConfig.data() : axiosConfig.data;

        const response: AxiosResponse<T> = await axios({ ...axiosConfig, data });

        if (mounted) setResponse(response);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (!shouldSkip) {
      fetch();

      if (mounted && typeof refetchInterval === "number") {
        intervalId = window.setInterval(fetch, refetchInterval);
      }
    }

    return () => {
      mounted = false;

      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { response, loading, error };
}
