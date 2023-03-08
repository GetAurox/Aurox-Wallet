import { TransitionGroup, CSSTransition } from "react-transition-group";
import { Routes, Route, useLocation } from "react-router-dom";
import { memo, lazy } from "react";

/* eslint-disable prettier/prettier */

const ChangePassword = lazy(() => import(/* webpackChunkName: "pages/settings/change-password" */ "ui/pages/settings/ChangePassword"));
const RevealMnemonic = lazy(() => import(/* webpackChunkName: "pages/settings/reveal-mnemonic" */ "ui/pages/settings/RevealMnemonic"));
// TODO: uncomment later
// const TokenApprovals = lazy(() => import(/* webpackChunkName: "pages/settings/token-approvals" */ "ui/pages/settings/TokenApprovals"));
const About = lazy(() => import(/* webpackChunkName: "pages/settings/about" */ "ui/pages/settings/About"));
const IdleTimeout = lazy(() => import(/* webpackChunkName: "pages/settings/idle-timeout" */ "ui/pages/settings/IdleTimeout"));
const Networks = lazy(() => import(/* webpackChunkName: "pages/settings/networks" */ "ui/pages/settings/Networks"));
const NetworkForm = lazy(() => import(/* webpackChunkName: "pages/settings/networks" */ "ui/pages/settings/Networks/NetworkForm"));
const NetworksSelection = lazy(() => import(/* webpackChunkName: "pages/settings/networks" */ "ui/pages/settings/Networks/NetworksSelection"));
const Testnet = lazy(() => import(/* webpackChunkName: "pages/settings/testnet" */ "ui/pages/settings/Testnet/Testnet"));
const TestnetForm = lazy(() => import(/* webpackChunkName: "pages/settings/testnet" */ "ui/pages/settings/Testnet/TestnetForm"));
const Security = lazy(() => import(/* webpackChunkName: "pages/settings/security" */ "ui/pages/settings/Security"));
const InviteFriend = lazy(() => import(/* webpackChunkName: "pages/settings/invite" */ "ui/pages/settings/InviteFriend"));
const ResetWallet = lazy(() => import(/* webpackChunkName: "pages/settings/reset-wallet" */ "ui/pages/settings/ResetWallet"));
const General = lazy(() => import(/* webpackChunkName: "pages/settings/general" */ "ui/pages/settings/General"));

const Connect = lazy(() => import(/* webpackChunkName: "pages/dapp/connect" */ "ui/pages/dapp/Connect"));

const AddToken = lazy(() => import(/* webpackChunkName: "pages/token/add-token" */ "ui/pages/token/AddToken"));
const AddTokenAccountChange = lazy(() => import(/* webpackChunkName: "pages/token/add-token/account-change" */ "ui/pages/token/AddToken/AccountChange"));
const TokenApproval = lazy(() => import(/* webpackChunkName: "pages/token/token-approval" */ "ui/pages/token/TokenApproval"));
const ManageTokens = lazy(() => import(/* webpackChunkName: "pages/token/manage-tokens" */ "ui/pages/token/ManageTokens"));
const ImportToken = lazy(() => import(/* webpackChunkName: "pages/token/import-token" */ "ui/pages/token/ImportToken"));
const Token = lazy(() => import(/* webpackChunkName: "pages/token/token" */ "ui/pages/token/Token"));

const TransactionToken = lazy(
  () => import(/* webpackChunkName: "pages/transaction/transaction-token" */ "ui/pages/transaction/TransactionToken")
);

const NFTCollection = lazy(() => import(/* webpackChunkName: "pages/nft/nft-collection" */ "ui/pages/nft/NFTCollection"));
const NFTToken = lazy(() => import(/* webpackChunkName: "pages/nft/nft-token" */ "ui/pages/nft/NFTToken"));

const ManageNFTs = lazy(() => import(/* webpackChunkName: "pages/nft/nft-collection" */ "ui/pages/nft/ManageNFTs"));
const NFTImport = lazy(() => import(/* webpackChunkName: "pages/nft/nft-token" */ "ui/pages/nft/NFTImport"));

const SetupWallet = lazy(() => import(/* webpackChunkName: "pages/flows/setup-wallet" */ "ui/pages/flows/SetupWallet"));
const Receive = lazy(() => import(/* webpackChunkName: "pages/flows/receive" */ "ui/pages/flows/Receive"));
const Login = lazy(() => import(/* webpackChunkName: "pages/flows/login" */ "ui/pages/flows/Login"));
// const Swap = lazy(() => import(/* webpackChunkName: "pages/flows/swap" */ "ui/pages/flows/Swap"));
const Send = lazy(() => import(/* webpackChunkName: "pages/flows/send" */ "ui/pages/flows/Send"));
const SendSelect = lazy(() => import(/* webpackChunkName: "pages/flows/send-select" */ "ui/pages/flows/SendSelect"));

const SendNFT = lazy(() => import(/* webpackChunkName: "pages/flows/send-nft" */ "ui/pages/flows/SendNFT"));
const AccountsAutoImport = lazy(
  () => import(/* webpackChunkName: "pages/flows/accounts-auto-import" */ "ui/pages/flows/AccountsAutoImport")
);

const WalletManageEditAccount = lazy(
  () => import(/* webpackChunkName: "pages/wallet/wallet-manage-edit-account" */ "ui/pages/wallet/WalletManageEditAccount")
);
const CreateNewAccount = lazy(() => import(/* webpackChunkName: "pages/wallet/create-new-account" */ "ui/pages/wallet/CreateNewAccount"));
const RevealPrivateKey = lazy(() => import(/* webpackChunkName: "pages/wallet/reveal-private-key" */ "ui/pages/wallet/RevealPrivateKey"));
const ImportAccount = lazy(() => import(/* webpackChunkName: "pages/wallet/import-account" */ "ui/pages/wallet/ImportAccount"));
const WalletManage = lazy(() => import(/* webpackChunkName: "pages/wallet/wallet-manage" */ "ui/pages/wallet/WalletManage"));

const OperationController = lazy(
  () => import(/* webpackChunkName: "pages/dapp/operations-controller" */ "ui/pages/dapp/OperationController")
);

const Library = lazy(() => import(/* webpackChunkName: "pages/misc/library" */ "ui/pages/misc/Library"));

/* eslint-enable prettier/prettier */

import RouteTransitionRoot from "ui/components/common/RouteTransitionRoot";
import LazyRoute from "ui/components/common/LazyRoute";

import PageNotFound from "ui/pages/PageNotFound";

import MainPage from "./components/MainPage";

export default memo(function RouterSchema() {
  const location = useLocation();

  return (
    <TransitionGroup component={null}>
      <CSSTransition key={location.key} classNames="page-fade" timeout={200}>
        <Routes location={location}>
          <Route element={<RouteTransitionRoot />}>
            <Route path="/reset-wallet" element={<LazyRoute Route={ResetWallet} />} />
            <Route path="/setup-wallet" element={<LazyRoute Route={SetupWallet} />} />
            <Route path="/login" element={<LazyRoute Route={Login} />} />
            <Route path="/about" element={<LazyRoute Route={About} />} />
            <Route path="/idle-timeout" element={<LazyRoute Route={IdleTimeout} />} />
            <Route path="/change-password" element={<LazyRoute Route={ChangePassword} />} />
            <Route path="/reveal-mnemonic" element={<LazyRoute Route={RevealMnemonic} />} />
            {/* TODO: uncomment later */}
            {/* <Route path="/token-approvals" element={<LazyRoute Route={TokenApprovals} />} /> */}
            <Route path="/connect" element={<LazyRoute Route={Connect} />} />
            <Route path="/receive/:pubkey" element={<LazyRoute Route={Receive} />} />
            <Route path="/create-account" element={<LazyRoute Route={CreateNewAccount} />} />
            <Route path="/import-account" element={<LazyRoute Route={ImportAccount} />} />
            <Route path="/add-token" element={<LazyRoute Route={AddToken} />} />
            <Route path="/add-token/account-change" element={<LazyRoute Route={AddTokenAccountChange} />} />
            <Route path="/token/global/:assetId" element={<LazyRoute Route={Token} />} />
            <Route path="/token/network-specific/:assetKey" element={<LazyRoute Route={Token} />} />
            {/* <Route path="/swap" element={<LazyRoute Route={Swap} />} /> */}
            <Route path="/send" element={<LazyRoute Route={Send} />} />
            <Route path="/send-select" element={<LazyRoute Route={SendSelect} />} />
            <Route path="/send-nft/:contractAddress/:tokenId" element={<LazyRoute Route={SendNFT} />} />
            <Route path="/accounts-auto-import" element={<LazyRoute Route={AccountsAutoImport} />} />
            <Route path="/manage-tokens" element={<LazyRoute Route={ManageTokens} />} />
            <Route path="/import-token" element={<LazyRoute Route={ImportToken} />} />
            <Route path="/operation-controller" element={<LazyRoute Route={OperationController} />} />
            <Route path="/networks" element={<LazyRoute Route={Networks} />} />
            <Route path="/networks/selection" element={<LazyRoute Route={NetworksSelection} />} />
            <Route path="/network/:networkIdentifier" element={<LazyRoute Route={NetworkForm} />} />
            <Route path="/network" element={<LazyRoute Route={NetworkForm} />} />
            <Route path="/security" element={<LazyRoute Route={Security} />} />
            <Route path="/invite" element={<LazyRoute Route={InviteFriend} />} />
            <Route path="/nfts/:slug" element={<LazyRoute Route={NFTCollection} />} />
            <Route path="/nft/:contractAddress/:tokenId" element={<LazyRoute Route={NFTToken} />} />
            <Route path="/manage-nfts" element={<LazyRoute Route={ManageNFTs} />} />
            <Route path="/import-nft" element={<LazyRoute Route={NFTImport} />} />
            <Route path="/testnet" element={<LazyRoute Route={TestnetForm} />} />
            <Route path="/testnets" element={<LazyRoute Route={Testnet} />} />
            <Route path="/general" element={<LazyRoute Route={General} />} />
            <Route path="/reveal-private-key/:id" element={<LazyRoute Route={RevealPrivateKey} />} />
            <Route path="/transactions/:txHash/details" element={<LazyRoute Route={TransactionToken} />} />
            <Route path="/manage" element={<LazyRoute Route={WalletManage} />} />
            <Route path="/manage/edit/:uuid" element={<LazyRoute Route={WalletManageEditAccount} />} />
            <Route path="/library" element={<LazyRoute Route={Library} />} />
            <Route path="/" element={<MainPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
});
