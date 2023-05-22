import { useMemo, useState } from "react";
import isEqual from "lodash/isEqual";

import { Box, Button, List, Stack, Typography } from "@mui/material";

import { Network } from "common/operations";
import { BlockchainNetwork } from "common/types";

import { useFuse, useNetworks, useOrderedNetworks } from "ui/hooks";
import { useHistoryGoBack, useHistoryPush } from "ui/common/history";

import Search from "ui/components/common/Search";
import Header from "ui/components/layout/misc/Header";
import DialogBase from "ui/components/common/DialogBase";
import DefaultControls from "ui/components/controls/DefaultControls";
import NetworksSelectionItem from "ui/components/entity/network/NetworksSelectionItem";

export default function NetworksSelection() {
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  const networks = useNetworks() ?? [];

  const enabledNetworkIdentifiers = networks.filter(network => !network.disabled).map(networks => networks.identifier);

  const [selected, setSelected] = useState<string[]>(enabledNetworkIdentifiers);

  const { fuzzyResults, onSearch } = useFuse<BlockchainNetwork>(networks, {
    keys: ["name", "chainId"],
    matchAllOnEmptyQuery: true,
  });

  const memoFuzzyResults = useMemo(() => fuzzyResults.map(item => item.item), [fuzzyResults]);

  const orderedNetworks = useOrderedNetworks(memoFuzzyResults);

  const push = useHistoryPush();
  const goBack = useHistoryGoBack();

  const handleSave = async () => {
    for (const networkToUpdate of networks) {
      const disabled = !selected.includes(networkToUpdate.identifier);

      const isChanged = networkToUpdate.disabled !== disabled;

      if (isChanged) {
        await Network.ModifyNetwork.perform(networkToUpdate.identifier, { disabled });
      }
    }

    goBack();
  };

  const handleAdd = () => {
    push("/network");
  };

  const handleItemClick = (clickedNetworkIdentifier: string) => {
    setSelected(prevSelected => {
      if (prevSelected.includes(clickedNetworkIdentifier)) {
        if (prevSelected.length === 1) {
          handleInfoDialogOpen();

          return prevSelected;
        }

        return prevSelected.filter(networkIdentifier => networkIdentifier !== clickedNetworkIdentifier);
      } else {
        return [...prevSelected, clickedNetworkIdentifier];
      }
    });
  };

  const handleInfoDialogClose = () => {
    setIsInfoDialogOpen(false);
  };

  const handleInfoDialogOpen = () => {
    setIsInfoDialogOpen(true);
  };

  return (
    <>
      <Header title="Manage Networks" onBackClick={goBack} />
      <Stack rowGap={1}>
        <Box mx={2}>
          <Search fullWidth onChange={onSearch} />
        </Box>
        <List disablePadding>
          {orderedNetworks.map((network, index) => {
            return (
              <NetworksSelectionItem
                network={network}
                key={network.identifier}
                onClick={handleItemClick}
                divider={orderedNetworks.length !== index + 1}
                selected={selected.includes(network.identifier)}
              />
            );
          })}
        </List>
        <DefaultControls
          primary="Save"
          onPrimary={handleSave}
          disabledPrimary={selected.length < 1 || isEqual(enabledNetworkIdentifiers, selected)}
          secondary="Add Custom Network"
          onSecondary={handleAdd}
        />
      </Stack>
      <DialogBase
        title={
          <Typography variant="headingSmall" maxWidth={255} lineHeight="28px" textAlign="center">
            Sorry, but at least one network must be selected.
          </Typography>
        }
        onClose={handleInfoDialogClose}
        open={isInfoDialogOpen}
        actions={
          <Button fullWidth variant="contained" onClick={handleInfoDialogClose} disabled={selected.length < 1}>
            OK
          </Button>
        }
      />
    </>
  );
}
