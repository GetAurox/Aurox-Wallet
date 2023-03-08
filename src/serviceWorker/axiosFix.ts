import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from "axios";

// Based on https://github.com/vespaiach/axios-fetch-adapter

// These helper methods are internal to axios. Therefore, there are no typescript definitions for them
// This is why we have opted for require syntax
const settle = require("axios/lib/core/settle");
const buildURL = require("axios/lib/helpers/buildURL");
const buildFullPath = require("axios/lib/core/buildFullPath");

async function fetchAdapter(config: AxiosRequestConfig): Promise<AxiosResponse<any, any>> {
  const request = createRequest(config);

  const promiseChain = [getResponse(request, config)];

  let timer;

  if (config.timeout && config.timeout > 0) {
    promiseChain.push(
      new Promise(resolve => {
        timer = setTimeout(() => {
          const message = config.timeoutErrorMessage ? config.timeoutErrorMessage : "timeout of " + config.timeout + "ms exceeded";

          resolve(new AxiosError(message, "ECONNABORTED", config, request));
        }, config.timeout);
      }),
    );
  }

  const data = await Promise.race(promiseChain);

  clearTimeout(timer);

  return new Promise((resolve, reject) => {
    if (data instanceof Error) {
      reject(data);
    } else {
      settle(resolve, reject, data);
    }
  });
}

async function getResponse(request: RequestInfo, config: AxiosRequestConfig): Promise<AxiosResponse<any, any> | Error> {
  try {
    const fetchResponse = await fetch(request);

    const response = {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: new Headers(fetchResponse.headers) as any,
      config: config,
      request,
    } as AxiosResponse<any, any>;

    if (fetchResponse.status >= 200 && fetchResponse.status !== 204) {
      switch (config.responseType) {
        case "arraybuffer":
          response.data = await fetchResponse.arrayBuffer();
          break;
        case "blob":
          response.data = await fetchResponse.blob();
          break;
        case "json":
          response.data = await fetchResponse.json();
          break;
        default:
          response.data = await fetchResponse.text();
          break;
      }
    }

    return response;
  } catch (error) {
    const axiosError = new AxiosError("Network Error", "ERR_NETWORK", config, request);

    axiosError.cause = error;

    return axiosError;
  }
}

/**
 * This function will create a Request object based on configuration's axios
 */
function createRequest(config: AxiosRequestConfig) {
  const headers = new Headers(config.headers as any);

  // HTTP basic authentication
  if (config.auth) {
    const username = config.auth.username || "";
    const password = config.auth.password ? decodeURI(encodeURIComponent(config.auth.password)) : "";
    headers.set("Authorization", `Basic ${btoa(username + ":" + password)}`);
  }

  const method = (config.method || "get").toUpperCase();

  const options: RequestInit = {
    headers: headers,
    method,
  };

  if (method !== "GET" && method !== "HEAD") {
    options.body = config.data;
  }

  if (config.signal) {
    options.signal = config.signal;
  }

  // This config is similar to XHR’s withCredentials flag, but with three available values instead of two.
  // So if withCredentials is not set, default value 'same-origin' will be used
  if (config.withCredentials) {
    options.credentials = config.withCredentials ? "include" : "omit";
  }

  const fullPath = buildFullPath(config.baseURL, config.url);
  const url = buildURL(fullPath, config.params, config.paramsSerializer);

  // Expected browser to throw error if there is any wrong configuration value
  return new Request(url, options);
}

if (process.env.MOCK_EXTENSION_API !== "true") {
  axios.defaults.adapter = fetchAdapter;
}
