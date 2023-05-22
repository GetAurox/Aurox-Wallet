import { List } from "@mui/material";

import { IconArrow } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import CommonListItem from "ui/components/common/CommonListItem";
import DefaultControls from "ui/components/controls/DefaultControls";
import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";

import { useEnabledNetworks, useOrderedNetworks } from "ui/hooks";
import { useHistoryGoBack, useHistoryPush } from "ui/common/history";

export default function NetworksEnabled() {
  const networks = useEnabledNetworks() ?? [];

  const orderedNetworks = useOrderedNetworks(networks);

  const push = useHistoryPush();
  const goBack = useHistoryGoBack();

  const handleAddNetwork = () => {
    push("/networks/selection");
  };

  const handleItemClick = (networkIdentifier: string) => () => {
    push(`/network/${networkIdentifier}`);
  };

  return (
    <>
      <Header title="Active Networks" onBackClick={goBack} />
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
      <DefaultControls primary="Add / Remove Networks" onPrimary={handleAddNetwork} />
    </>
  );
}
