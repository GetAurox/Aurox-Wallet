import { CSSProperties, SyntheticEvent, useEffect, useMemo, useState } from "react";

import { Stack, Tab, Tabs } from "@mui/material";

import { useActiveAccount, useActiveAccountFlatNFTBalances, useNetworkByIdentifier } from "ui/hooks";
import { useHistoryGoBack, useHistoryPathParams, useHistoryPush } from "ui/common/history";

import AlertStatus from "ui/components/common/AlertStatus";
import DefaultControls from "ui/components/controls/DefaultControls";
import TransactionNFTList from "ui/components/entity/transaction/TransactionNFTList";
import { useNFTInformation } from "ui/hooks/misc/useNFTInformation";
import { EthereumAccountNFT } from "ui/types";

import { createAssetKey, getAccountAddressForChainType, getAssetIdentifierFromDefinition } from "common/utils";

import { ImportedAsset } from "common/operations";

import { BlockchainNetwork, SupportedNFTContractType } from "common/types";

import { ImportedAssetUpdateNFT } from "serviceWorker/managers";

import NFTTokenCard from "./NFTTokenCard";
import NFTTokenInfo from "./NFTTokenInfo";

const sxStyles = {
  tabs: {
    mt: -1,
  },
  tab: {
    fontWeight: 500,
    fontSize: "13px",
    lineHeight: "16px",
    textTransform: "none",
    letterSpacing: "0.25px",
    color: "text.secondary",
    borderBottom: "1px solid #ffffff1f",
  },
};

const listStyle: CSSProperties = {
  overflow: "hidden",
};

export default function NFTToken() {
  const [tabValue, setTabValue] = useState(0);

  const push = useHistoryPush();
  const goBack = useHistoryGoBack();
  const {
    contractAddress = "",
    tokenId = "",
    networkIdentifier = "",
  } = useHistoryPathParams<"contractAddress" | "tokenId" | "networkIdentifier">();

  const account = useActiveAccount();

  const chainType = account?.type === "private-key" ? account.chainType : "evm";

  const accountAddress = account ? getAccountAddressForChainType(account, chainType) : null;

  const network = useNetworkByIdentifier(networkIdentifier);

  const { tokenInformation, loading, error } = useNFTInformation(contractAddress, accountAddress, tokenId, network?.identifier || "");

  const balances = useActiveAccountFlatNFTBalances();

  useEffect(() => {
    const updateImportAsset = async (
      network: BlockchainNetwork,
      name: string,
      image: string | null,
      contractType: SupportedNFTContractType,
      accountAddress: string,
    ) => {
      const assetIdentifier = getAssetIdentifierFromDefinition({
        type: "nft",
        contractType: contractType,
        contractAddress,
        tokenId,
      });

      const key = createAssetKey(networkIdentifier, assetIdentifier);

      const updatedAsset: ImportedAssetUpdateNFT = [
        key,
        "nft",
        {
          name,
          verified: !!String(name).trim(),
          metadata: {
            tokenId,
            image,
            updatedAt: Date.now(),
            accountAddress,
          },
        },
      ];

      await ImportedAsset.UpdateImportedNFTAsset.perform(updatedAsset);
    };

    if (
      network &&
      tokenInformation?.metadata?.image &&
      tokenInformation?.metadata?.name &&
      tokenInformation?.contractType &&
      accountAddress
    ) {
      updateImportAsset(
        network,
        tokenInformation.metadata.name,
        tokenInformation.metadata.image,
        tokenInformation.contractType,
        accountAddress,
      );
    }
  }, [tokenInformation, network, tokenId, account, accountAddress, contractAddress, networkIdentifier]);

  const nft: EthereumAccountNFT | null = useMemo(() => {
    const balance = balances.find(item => item.contractAddress === contractAddress && item.tokenId === tokenId);

    return accountAddress
      ? {
          accountAddress: accountAddress,
          tokenAddress: contractAddress,
          tokenContractType: tokenInformation?.contractType || "ERC721",
          token: {
            address: contractAddress,
            name: tokenInformation?.metadata?.name || balance?.name || "",
            symbol: "",
            decimals: 0,
            contractType: tokenInformation?.contractType || "unknown",
          },
          tokenId: tokenId,
          metadata: {
            id: tokenInformation?.metadata?.owner + "-" + tokenInformation?.metadata?.name,
            name: tokenInformation?.metadata?.name || balance?.name || "",
            contractName: "",
            contractSymbol: "",
            contractOwner: "",
            collectionName: "",
            collectionSlug: "",
            ownerUsername: "",
            ownerAddress: tokenInformation?.metadata?.owner || "",
            creatorUsername: "",
            creatorAddress: "",
            description: tokenInformation?.metadata?.description || "",
            imageUrl: tokenInformation?.metadata?.image || balance?.metadata.image || "",
            traits: [],
            collectionVerified: "",
          },
          timestamp: 0,
          blockNumber: 0,
          txIndex: 0,
          logIndex: 0,
        }
      : null;
  }, [
    accountAddress,
    balances,
    contractAddress,
    tokenId,
    tokenInformation?.contractType,
    tokenInformation?.metadata?.description,
    tokenInformation?.metadata?.image,
    tokenInformation?.metadata?.name,
    tokenInformation?.metadata?.owner,
  ]);

  const handleTabChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTransfer = () => {
    push(`/send-nft/${networkIdentifier}/${contractAddress}/${tokenId}`);
  };

  const isInfo = nft && tabValue === 0;
  const isTransactions = nft ? tabValue === 1 : tabValue === 0;

  if (!loading && error) {
    return <AlertStatus error errorText={error} showButton onButtonClick={goBack} />;
  }

  if (loading && !error) {
    return <AlertStatus loading loadingText="Loading NFT, please wait..." />;
  }

  return (
    <Stack>
      <NFTTokenCard nft={nft} networkIdentifier={networkIdentifier} />
      <Tabs variant="fullWidth" value={tabValue} onChange={handleTabChange} sx={sxStyles.tabs}>
        {nft && <Tab tabIndex={0} sx={sxStyles.tab} label="General" />}
        <Tab tabIndex={nft ? 1 : 0} sx={sxStyles.tab} label="Transactions" />
      </Tabs>
      {isInfo && (
        <>
          <NFTTokenInfo nft={nft} />
          <DefaultControls onPrimary={handleTransfer} primary="Transfer" />
        </>
      )}
      {isTransactions && <TransactionNFTList nft={nft} account={account} style={listStyle} networkIdentifier={networkIdentifier} />}
    </Stack>
  );
}
