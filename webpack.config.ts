import { resolve, join } from "path";
import { createHash } from "crypto";

import { EnvironmentPlugin, IgnorePlugin, Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import compact from "lodash/compact";
import orderBy from "lodash/orderBy";

import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import CircularDependencyPlugin from "circular-dependency-plugin";
import ForkTsCheckerPlugin from "fork-ts-checker-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";
import ReactRefreshTypeScript from "react-refresh-typescript";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import DotenvPlugin from "dotenv-webpack";

const ROOT_FOLDER = resolve(__dirname);
const SRC_FOLDER = join(ROOT_FOLDER, "src");

const SERVICE_WORKER_FOLDER = join(SRC_FOLDER, "serviceWorker");
const CONTENT_SCRIPT_FOLDER = join(SRC_FOLDER, "contentScript");
const INJECT_SCRIPT_FOLDER = join(SRC_FOLDER, "injectScript");
const PHISHING_FOLDER = join(SRC_FOLDER, "phishing");
const TWITTER_SCRIPT_FOLDER = join(SRC_FOLDER, "twitterScript");

const FRAMES_FOLDER = join(SRC_FOLDER, "ui", "frames");

const POPUP_FOLDER = join(FRAMES_FOLDER, "popup");
const HARDWARE_FOLDER = join(FRAMES_FOLDER, "hardware");
const CONNECT_FOLDER = join(FRAMES_FOLDER, "connect");
const ONBOARDING_FOLDER = join(FRAMES_FOLDER, "onboarding");
const Expanded_FOLDER = join(FRAMES_FOLDER, "expanded");

const DIST_FOLDER = join(ROOT_FOLDER, "dist");

export interface WebpackEnvOptions {
  production?: boolean;
  mock?: boolean;
  analyze?: boolean;
}

export default (options?: WebpackEnvOptions) => {
  const { production = false, mock = false, analyze = false } = options ?? {};

  const commonConfiguration: WebpackConfiguration = {
    mode: production ? "production" : "development",
    output: { filename: "[name].js", path: DIST_FOLDER },
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      modules: ["./src", "node_modules"],
    },
  };

  const getCommonPlugins = () => [
    new NodePolyfillPlugin({ excludeAliases: ["console"] }),
    new IgnorePlugin({ contextRegExp: /bip39(\/|\\)src$/, resourceRegExp: /^\.\/wordlists\/(?!english\.json).*$/ }),
    new IgnorePlugin({ contextRegExp: /moment$/, resourceRegExp: /^\.\/locale$/ }),
    new ForkTsCheckerPlugin({ typescript: { configFile: join(ROOT_FOLDER, "tsconfig.json") } }),
    new CircularDependencyPlugin({ exclude: /node_modules/, allowAsyncCycles: false }),
    new DotenvPlugin({ safe: true }),
  ];

  const frameEntries = {
    popup: join(POPUP_FOLDER, "index.tsx"),
    hardware: join(HARDWARE_FOLDER, "index.tsx"),
    connect: join(CONNECT_FOLDER, "index.tsx"),
    onboarding: join(ONBOARDING_FOLDER, "index.tsx"),
    expanded: join(Expanded_FOLDER, "index.tsx"),
  };

  const scriptEntries = {
    service_worker: join(SERVICE_WORKER_FOLDER, "index.ts"),
    content_script: join(CONTENT_SCRIPT_FOLDER, "index.ts"),
    inject_script: join(INJECT_SCRIPT_FOLDER, "index.ts"),
    twitter_script: join(TWITTER_SCRIPT_FOLDER, "index.ts"),
    phishing: join(PHISHING_FOLDER, "index.ts"),
  };

  const excludeOtherFrameChunks = (target: keyof typeof frameEntries) => Object.keys(frameEntries).filter(frame => frame !== target);

  return compact<WebpackConfiguration & { devServer?: WebpackDevServerConfiguration }>([
    {
      ...commonConfiguration,
      name: "frames",
      devtool: production ? "source-map" : mock ? "eval-source-map" : "inline-source-map",
      entry: frameEntries,
      plugins: compact([
        ...getCommonPlugins(),
        new HtmlWebpackPlugin({
          mock,
          title: mock ? "Mocked Aurox Wallet" : "Aurox Wallet",
          rootStyle: mock ? "styles/mock.css" : "styles/popup.css",
          excludeChunks: excludeOtherFrameChunks("popup"),
          filename: mock ? "index.html" : "popup.html",
          template: "html.hbs",
        }),
        new HtmlWebpackPlugin({
          title: "Aurox Wallet Hardware Connector",
          rootStyle: "styles/hardware.css",
          excludeChunks: excludeOtherFrameChunks("hardware"),
          filename: "hardware.html",
          template: "html.hbs",
        }),
        new HtmlWebpackPlugin({
          title: "Aurox Wallet DApp Connect Prompt",
          rootStyle: "styles/connect.css",
          excludeChunks: excludeOtherFrameChunks("connect"),
          filename: "connect.html",
          template: "html.hbs",
        }),
        new HtmlWebpackPlugin({
          title: "Aurox Wallet OnBoarding",
          rootStyle: "styles/onboarding.css",
          excludeChunks: excludeOtherFrameChunks("onboarding"),
          filename: "onboarding.html",
          template: "html.hbs",
          isOnboarding: true,
        }),
        new HtmlWebpackPlugin({
          title: "Aurox Wallet Portfolio",
          rootStyle: "styles/expanded.css",
          excludeChunks: excludeOtherFrameChunks("expanded"),
          filename: "expanded.html",
          template: "html.hbs",
        }),
        new EnvironmentPlugin({ MOCK_EXTENSION_API: String(mock) }),
        new CopyWebpackPlugin({ patterns: [{ from: "static" }] }),
        new CopyWebpackPlugin({ patterns: [{ from: "node_modules/@trezor/connect-web/lib/webextension/trezor-content-script.js" }] }),
        new CopyWebpackPlugin({ patterns: [{ from: "node_modules/@trezor/connect-web/lib/webextension/trezor-usb-permissions.js" }] }),
        new BundleAnalyzerPlugin({
          analyzerMode: !analyze ? "disabled" : production ? "static" : "server",
          analyzerPort: 8888,
          defaultSizes: "stat",
        }),
        !production && mock && new ReactRefreshWebpackPlugin(),
      ]),
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: [
              {
                loader: "ts-loader",
                options: {
                  getCustomTransformers: () => ({ before: !production && mock ? [ReactRefreshTypeScript()] : [] }),
                  transpileOnly: !production,
                },
              },
            ],
          },
          { test: /\.css$/i, use: ["style-loader", "css-loader", "postcss-loader"] },
          { test: /\.svg$/i, issuer: /\.[jt]sx?$/, use: ["@svgr/webpack"] },
          { test: /\.hbs$/, loader: "handlebars-loader" },
        ],
      },
      optimization: {
        runtimeChunk: "single",
        splitChunks: {
          chunks: "all",
          minChunks: 2,
          cacheGroups: {
            vendorsInitial: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors/initial",
              chunks: "initial",
              minChunks: 2,
              reuseExistingChunk: true,
            },
            vendorsAsync: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any, chunks: { name: string }[]) {
                const chunkNames = orderBy(chunks.map(item => item.name.replace(/[\\/]/g, "-")));

                const concatinatedChunkNames = chunkNames.join("__");

                const hash = createHash("sha256").update(concatinatedChunkNames).digest("hex");

                const truncatedHash = hash.substring(0, 8);

                return `vendors/async/${truncatedHash}`;
              },
              chunks: "async",
              minChunks: 2,
              reuseExistingChunk: true,
            },
            commonInitial: {
              test: /[\\/]src[\\/]/,
              name: "common/initial",
              chunks: "initial",
              minChunks: 2,
              reuseExistingChunk: true,
            },
            commonAsync: {
              test: /[\\/]src[\\/]/,
              name(module: any, chunks: { name: string }[]) {
                const chunkNames = orderBy(chunks.map(item => item.name.replace(/[\\/]/g, "-")));

                const concatinatedChunkNames = chunkNames.join("__");

                const hash = createHash("sha256").update(concatinatedChunkNames).digest("hex");

                const truncatedHash = hash.substring(0, 8);

                return `common/async/${truncatedHash}`;
              },
              chunks: "async",
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      },
      devServer: {
        open: true,
        historyApiFallback: true,
        hot: true,
        compress: true,
      },
    },
    !mock && {
      ...commonConfiguration,
      name: "scripts",
      devtool: production ? "source-map" : "inline-source-map",
      entry: scriptEntries,
      plugins: [
        ...getCommonPlugins(),
        new BundleAnalyzerPlugin({
          analyzerMode: !analyze ? "disabled" : production ? "static" : "server",
          analyzerPort: 8889,
          defaultSizes: "stat",
        }),
      ],
      module: {
        rules: [{ test: /\.tsx?$/, use: [{ loader: "ts-loader", options: { transpileOnly: true, experimentalWatchApi: true } }] }],
      },
      optimization: { splitChunks: false },
    },
  ]);
};
