import { memo, useState } from "react";

import { Grid } from "@mui/material";

import { ETH_ADDRESS, NETWORKS } from "common/config";

import { TokenDisplayWithTicker } from "ui/types";

import NetworkChip from "ui/components/common/NetworkChip";
import { collapseIdentifier } from "ui/common/utils";
import CopyToClipboard from "ui/components/clipboard/CopyToClipboard";
import BlockchainExplorerModal from "ui/components/modals/BlockchainExplorerModal";

export interface TokenNetworksProps {
  token: TokenDisplayWithTicker;
}

export default memo(function TokenNetworks(props: TokenNetworksProps) {
  const { token } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <Grid container rowGap={1} columnGap={0.5}>
      {NETWORKS.map(network => {
        // TODO: once the contractAddress mapping is integrated this should be properly implemented
        const enabled = token.networkDefinition.chainId === network.chainId && Number(token.balance) > 0;

        const address = token.assetDefinition.type === "native" ? ETH_ADDRESS : token.assetDefinition.contractAddress;

        return (
          <>
            <Grid item key={network.chainId}>
              <NetworkChip
                onClick={handleOpen}
                clickable
                chainId={network.chainId}
                label={
                  enabled ? (
                    <>
                      {network.name} ({collapseIdentifier(address)})
                      <CopyToClipboard text={address} />
                    </>
                  ) : (
                    network.name
                  )
                }
                disabled={!enabled}
              />
            </Grid>
            <BlockchainExplorerModal contractAddress={address} open={isModalOpen} onClose={handleClose} />
          </>
        );
      })}
    </Grid>
  );
});
