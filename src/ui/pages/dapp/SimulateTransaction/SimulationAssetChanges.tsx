import { Fragment, ReactNode } from "react";

import { AssetChanges, Metadata } from "pocket-universe-js";

import { Box } from "@mui/material";

import { ethereumMainnetNetworkIdentifier, networkNativeCurrencyData } from "common/config";

import AlertStatus from "ui/components/common/AlertStatus";

import { getTokenRowType } from "./helpers";
import {
  erc1155IsTransferSingle,
  erc1155IsTransferBatch,
  erc1155IsApprovalForAll,
  erc20IsTransfer,
  erc20IsApproval,
  erc721IsTransfer,
  erc721IsApproval,
  erc721IsApprovalForAll,
  erc721IsConsecutiveTransfer,
} from "./guards";

import SimulationTokenRow from "./SimulationTokenRow";

export interface SimulationAssetChangesProps {
  from: string;
  to: string;
  assetChanges: AssetChanges;
  metadata?: Metadata;
}

export default function SimulationAssetChanges(props: SimulationAssetChangesProps) {
  const { from, to, assetChanges, metadata } = props;

  const nodes: ReactNode[] = [];

  let skipChangesBeingMadeWarning = false;
  let changesBeingMadeWarningText = "Changes being made in this transaction";

  if (assetChanges.erc20) {
    for (const [contractAddress, ERC20Events] of Object.entries(assetChanges.erc20)) {
      const meta = metadata?.erc20[contractAddress];
      const decimals = meta?.decimals ?? null;
      const name = meta?.symbol ?? "ERC20 Token";
      const image = meta?.logo ?? "";

      // If "approval" comes with "transfer", ignore it completely
      let skipApprovalIfTransferExists = false;

      for (const ERC20Event of ERC20Events) {
        if (erc20IsTransfer(ERC20Event)) {
          skipApprovalIfTransferExists = true;

          nodes.push(
            <SimulationTokenRow
              key={`transfer_ERC20_${contractAddress}`}
              amount={ERC20Event.transfer.amount}
              decimals={decimals}
              name={name}
              image={image}
              type={getTokenRowType({ from, to }, ERC20Event.transfer)}
            />,
          );
        } else if (erc20IsApproval(ERC20Event) && !skipApprovalIfTransferExists) {
          changesBeingMadeWarningText = "This contract is requesting approval for the token below";

          nodes.push(
            <SimulationTokenRow
              key={`approval_ERC20_${contractAddress}`}
              amount={ERC20Event.approval.amount}
              skipAmountSign
              decimals={decimals}
              name={name}
              image={image}
              type={getTokenRowType({ from, to }, ERC20Event.approval)}
            />,
          );
        }
      }
    }
  }

  if (assetChanges.erc1155) {
    for (const [contractAddress, ERC1155Events] of Object.entries(assetChanges.erc1155)) {
      const meta = metadata?.nft[contractAddress];
      const decimals = 0;

      for (const ERC1155Event of ERC1155Events) {
        if (erc1155IsTransferSingle(ERC1155Event)) {
          const name = meta?.nfts[ERC1155Event.transferSingle.id]?.name || meta?.contract?.name || "Unknown ERC-1155 Token";
          const image = meta?.nfts[ERC1155Event.transferSingle.id]?.image_url || meta?.contract?.image_url || undefined;
          const key = `transferSingle_ERC1155_${contractAddress}_${ERC1155Event.transferSingle.id as string}`;

          nodes.push(
            <SimulationTokenRow
              key={key}
              amount={ERC1155Event.transferSingle.value}
              decimals={decimals}
              name={name}
              image={image}
              type={getTokenRowType({ from, to }, ERC1155Event.transferSingle)}
            />,
          );
        } else if (erc1155IsTransferBatch(ERC1155Event)) {
          for (let idx = 0; idx < ERC1155Event.transferBatch.id.length; idx += 1) {
            const name = meta?.nfts[ERC1155Event.transferBatch.id[idx]]?.name || meta?.contract?.name || "Unknown ERC-1155 Token";
            const image = meta?.nfts[ERC1155Event.transferBatch.id[idx]]?.image_url || meta?.contract?.image_url || undefined;
            const key = `transferBatch_ERC1155_${contractAddress}_${ERC1155Event.transferBatch.id[idx] as string}`;

            nodes.push(
              <SimulationTokenRow
                key={key}
                amount={ERC1155Event.transferBatch.value[idx] ?? null}
                decimals={decimals}
                name={name}
                image={image}
                type={getTokenRowType({ from, to }, ERC1155Event.transferBatch)}
              />,
            );
          }
        } else if (erc1155IsApprovalForAll(ERC1155Event)) {
          const name = meta?.contract?.name || "Unknown ERC-1155 Token";
          const image = meta?.contract?.image_url || undefined;
          const key = `approvalForAll_ERC1155_${contractAddress}`;

          skipChangesBeingMadeWarning = true;

          nodes.push(
            <Fragment key={key}>
              <AlertStatus
                error
                errorText={
                  <>
                    This dApp is requesting permission to withdraw NFTs from the collection below. This type of transaction{" "}
                    <strong>can be</strong> dangerous in certain cases. Make sure you are connected to a trusted dApp, such as OpenSea
                  </>
                }
              />
              <SimulationTokenRow amount={null} decimals={null} name={name} image={image} />
            </Fragment>,
          );
        }
      }
    }
  }

  if (assetChanges.erc721) {
    for (const [contractAddress, ERC721Events] of Object.entries(assetChanges.erc721)) {
      const meta = metadata?.nft[contractAddress];
      const decimals = 0;

      for (const ERC721Event of ERC721Events) {
        if (erc721IsTransfer(ERC721Event)) {
          const name = meta?.nfts[ERC721Event.transfer.id]?.name || meta?.contract?.name || "Unknown ERC-721 Token";
          const image = meta?.nfts[ERC721Event.transfer.id]?.image_url || meta?.contract?.image_url || undefined;
          const key = `transfer_ERC721_${contractAddress}_${ERC721Event.transfer.id as string}`;

          nodes.push(
            <SimulationTokenRow
              key={key}
              amount="0x1"
              decimals={decimals}
              name={name}
              image={image}
              type={getTokenRowType({ from, to }, ERC721Event.transfer)}
            />,
          );
        } else if (erc721IsApproval(ERC721Event)) {
          const name = meta?.nfts[ERC721Event.approval.id]?.name || meta?.contract?.name || "Unknown ERC-721 Token";
          const image = meta?.nfts[ERC721Event.approval.id]?.image_url || meta?.contract?.image_url || undefined;
          const key = `approval_ERC721_${contractAddress}_${ERC721Event.approval.id as string}`;

          changesBeingMadeWarningText = "This contract is requesting approval for the NFT below";

          nodes.push(
            <SimulationTokenRow
              key={key}
              amount="0x1"
              skipAmountSign
              decimals={decimals}
              name={name}
              image={image}
              type={getTokenRowType({ from, to }, ERC721Event.approval)}
            />,
          );
        } else if (erc721IsApprovalForAll(ERC721Event)) {
          const name = meta?.contract?.name || "Unknown ERC-721 Token";
          const image = meta?.contract?.image_url || undefined;
          const key = `approvalForAll_ERC721_${contractAddress}`;

          skipChangesBeingMadeWarning = true;

          nodes.push(
            <Fragment key={key}>
              <AlertStatus
                error
                errorText={
                  <>
                    This dApp is requesting permission to withdraw NFTs from the collection below. This type of transaction{" "}
                    <strong>can be</strong> dangerous in certain cases. Make sure you are connected to a trusted dApp, such as OpenSea
                  </>
                }
              />
              <SimulationTokenRow amount={null} decimals={null} name={name} image={image} />
            </Fragment>,
          );
        } else if (erc721IsConsecutiveTransfer(ERC721Event)) {
          for (const nft in meta?.nfts) {
            const name = meta?.nfts[nft]?.name || meta?.contract?.name || "Unknown ERC-721 Token";
            const image = meta?.nfts[nft]?.image_url || meta?.contract?.image_url || undefined;
            const key = `consecutiveTransfer_ERC721_${contractAddress}_${nft}`;

            nodes.push(
              <SimulationTokenRow
                key={key}
                amount="0x1"
                decimals={decimals}
                name={name}
                image={image}
                type={getTokenRowType({ from, to }, ERC721Event.consecutiveTransfer)}
              />,
            );
          }
        }
      }
    }
  }

  if (assetChanges.native) {
    for (let index = 0; index < assetChanges.native.length; index += 1) {
      const transfer = assetChanges.native[index];
      const amount = transfer.amount;
      const type = getTokenRowType({ from, to }, transfer);
      const { symbol, decimals, icons } = networkNativeCurrencyData[ethereumMainnetNetworkIdentifier];

      nodes.push(
        <SimulationTokenRow
          key={`nativeTransfer_${index}`}
          amount={amount}
          decimals={decimals}
          name={symbol}
          image={icons.color}
          type={type}
        />,
      );
    }
  }

  if (!skipChangesBeingMadeWarning) {
    nodes.unshift(
      <Box width={1} mb="10px">
        <AlertStatus warning warningText={changesBeingMadeWarningText} />
      </Box>,
    );
  }

  return <>{nodes}</>;
}
