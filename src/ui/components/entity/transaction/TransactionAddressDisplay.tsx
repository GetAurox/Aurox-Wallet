import { Link, Stack, Typography } from "@mui/material";

import { createAssetKey, getAssetIdentifierFromDefinition } from "common/utils";

import { useNetworkBlockchainExplorerLinkResolver, useTokenAssetDisplay } from "ui/hooks";
import { collapseIdentifier } from "ui/common/utils";

import CopyableText from "ui/components/clipboard/CopyableText";
import TokenAvatar from "ui/components/common/TokenAvatar";

export interface TransactionAddressDisplayProps {
  networkIdentifier: string;
  contractAddress: string;
}

export default function TransactionAddressDisplay(props: TransactionAddressDisplayProps) {
  const { networkIdentifier, contractAddress } = props;

  const assetIdentifier = getAssetIdentifierFromDefinition({ type: "contract", contractType: "ERC20", contractAddress });

  const { img, symbol } = useTokenAssetDisplay(createAssetKey(networkIdentifier, assetIdentifier));

  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(networkIdentifier);

  const link = getContractAddressExplorerLink(contractAddress);

  if (symbol) {
    return (
      <Stack flexDirection="row" alignItems="center">
        <Stack flexDirection="row" justifyContent="end" alignItems="center">
          <TokenAvatar {...img} networkIdentifier={networkIdentifier} tokenIconSize={24} networkIconSize={10} />
        </Stack>
        {link && (
          <Link href={link} underline="none" target="_blank" ml={0.5} fontSize="14px">
            {symbol}
          </Link>
        )}
        {!link && <Typography variant="medium">{symbol}</Typography>}
      </Stack>
    );
  }

  if (!link) {
    return <CopyableText text={contractAddress} />;
  }

  return (
    <Link href={link} underline="none" target="_blank" fontSize="14px">
      {collapseIdentifier(contractAddress)}
    </Link>
  );
}
