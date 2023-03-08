import { dialogContentClasses, List } from "@mui/material";

import { getBlockchainExplorerContractAddressLink } from "common/utils";

import { useEnabledNetworks } from "ui/hooks";
import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";

import ListItem from "../common/CommonListItem";
import DialogBase from "../common/DialogBase";

import { IconOpenLink } from "../icons";

const sxStyles = {
  dialogContent: {
    [`&.${dialogContentClasses.root}`]: {
      px: 0,
    },
  },
  listItem: {
    startIcon: {
      "&.MuiListItemIcon-root": {
        ml: 1.5,
      },
    },
    endIcon: {
      "&.MuiListItemIcon-root": {
        mr: 1.5,
      },
    },
  },
};

export interface BlockchainExplorerModalProps {
  open: boolean;
  onClose: () => void;
  contractAddress: string;
}

export default function BlockchainExplorerModal(props: BlockchainExplorerModalProps) {
  const { open, onClose, contractAddress } = props;

  const networks = useEnabledNetworks() ?? [];

  const handleClick = (baseURL: string | null) => () => {
    const link = getBlockchainExplorerContractAddressLink(contractAddress, baseURL);

    if (!link) {
      console.error("link does not exist");

      return;
    }

    window.open(link, "_blank");
  };

  return (
    <DialogBase
      open={open}
      onClose={onClose}
      title="Select Blockchain Explorer"
      sxContent={sxStyles.dialogContent}
      content={
        <List disablePadding>
          {networks.map((network, index) => (
            <ListItem
              spacing={1.5}
              sx={sxStyles.listItem}
              dividerVariant="middle"
              id={network.identifier}
              key={network.identifier}
              endIcon={<IconOpenLink />}
              divider={networks.length !== index + 1}
              startIcon={<NetworkAvatar network={network} />}
              primaryLabel={network.chainExplorer?.name ?? network.name}
              onClick={handleClick(network.chainExplorer?.baseURL ?? null)}
            />
          ))}
        </List>
      }
    />
  );
}
