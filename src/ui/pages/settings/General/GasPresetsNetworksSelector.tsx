import { List } from "@mui/material";

import { IconArrow } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import CommonListItem from "ui/components/common/CommonListItem";
import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";

import { useEnabledNetworks, useOrderedNetworks } from "ui/hooks";
import { useHistoryGoBack, useHistoryPush } from "ui/common/history";

export default function GasPresetsNetworksSelector() {
  const networks = useEnabledNetworks() ?? [];

  const orderedNetworks = useOrderedNetworks(networks);

  const push = useHistoryPush();
  const goBack = useHistoryGoBack();

  const handleItemClick = (networkIdentifier: string) => () => {
    push(`/general/gas-presets/${networkIdentifier}`);
  };

  return (
    <>
      <Header title="Gas Presets" onBackClick={goBack} />
      <List disablePadding>
        {orderedNetworks.map((network, index) => (
          <CommonListItem
            spacing={1.5}
            dividerVariant="middle"
            endIcon={<IconArrow />}
            onClick={handleItemClick(network.identifier)}
            primaryLabel={network.name}
            key={network.name + network.chainId}
            divider={orderedNetworks.length !== index + 1}
            startIcon={<NetworkAvatar network={network} />}
          />
        ))}
      </List>
    </>
  );
}
