import { ETH_ADDRESS, NETWORKS } from "common/config";

import { TokenDisplayWithTicker } from "ui/types";

import NetworkChip from "ui/components/common/NetworkChip";
import { collapseIdentifier } from "ui/common/utils";
import CopyToClipboard from "ui/components/clipboard/CopyToClipboard";
import { getBlockchainExplorerContractAddressLink } from "common/utils";
import { useNetworkGetter } from "ui/hooks";

const sxStyles = {
  chip: {
    width: "fit-content",
  },
};

export interface TokenNetworksProps {
  token: TokenDisplayWithTicker;
}

export default function TokenNetwork(props: TokenNetworksProps) {
  const { token } = props;

  const networkGetter = useNetworkGetter();

  const blockchainNetwork = networkGetter(token.networkIdentifier);

  const network = NETWORKS.find(network => network.chainId === token.networkDefinition.chainId);
  const contractAddress = token.assetDefinition.type === "native" ? ETH_ADDRESS : token.assetDefinition.contractAddress;

  const handleClick = () => {
    const link = getBlockchainExplorerContractAddressLink(contractAddress, blockchainNetwork?.chainExplorer?.baseURL ?? null);

    if (!link) {
      console.error("link does not exist");

      return;
    }

    window.open(link, "_blank");
  };

  if (!network) {
    return <></>;
  }

  return (
    <NetworkChip
      onClick={handleClick}
      sx={sxStyles.chip}
      clickable
      chainId={network.chainId}
      label={
        <>
          {network.name} ({collapseIdentifier(contractAddress)})
          <CopyToClipboard text={contractAddress} />
        </>
      }
    />
  );
}
