import { useEffect, useState } from "react";
import produce from "immer";

import { Box, Button, Stack, Theme, Typography } from "@mui/material";

import { BlockchainNetwork } from "common/types";

import { useHistoryGoBack, useHistoryPush } from "ui/common/history";

import { useLocalUserPreferences, useNetworkGetter, useTestnetNetworks } from "ui/hooks";

import { IconPlus } from "ui/components/icons";
import Switcher from "ui/components/form/Switcher";
import Header from "ui/components/layout/misc/Header";
import FixedPanel from "ui/components/layout/misc/FixedPanel";
import FormSelect, { SelectItem } from "ui/components/form/FormSelect";
import NetworkSelectModal from "ui/components/modals/NetworkSelectModal";

export default function Testnet() {
  const push = useHistoryPush();
  const goBack = useHistoryGoBack();

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const [networkModalOpen, setNetworkModalOpen] = useState(false);

  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork | null>(null);

  const [networkOptions, setNetworkOptions] = useState<SelectItem[]>([]);

  const networks = useTestnetNetworks();

  const networkGetter = useNetworkGetter();

  useEffect(() => {
    if (networks) {
      const options = networks.map(network => ({ value: network.identifier, label: network.name }));

      const network = networks.find(network => network.identifier === userPreferences.testnet?.networkIdentifier);

      setNetworkOptions(options);

      if (network) {
        setSelectedNetwork(network);
      }
    }
  }, [networks, userPreferences.testnet]);

  const handleSave = () => {
    setUserPreferences(
      produce(draft => {
        draft.testnet = {
          enabled: !draft.testnet?.enabled,
          networkIdentifier: selectedNetwork?.identifier,
        };
      }),
    );
  };

  const toggleNetworkModal = () => {
    setNetworkModalOpen(value => !value);
  };

  const handleSelectNetwork = (networkIdentifier: string) => {
    const newNetwork = networkGetter(networkIdentifier);

    setSelectedNetwork(newNetwork);
  };

  const handleAdd = () => {
    push("/testnet");
  };

  return (
    <>
      <Header title="Testnet Mode" onBackClick={goBack} />
      <Box mx={2}>
        <Stack direction="row" alignItems="center" mt={3}>
          <Box>
            <Typography variant="large" fontWeight={500}>
              Enable
            </Typography>
            <Typography variant="small">
              By enabling Testnet mode, the wallet will only connect to the defined testnet work in the dropdown below and no other network.
            </Typography>
          </Box>
          <Switcher defaultChecked={userPreferences.testnet?.enabled} />
        </Stack>

        {networks && selectedNetwork && (
          <Box my={3}>
            <FormSelect
              open={false}
              onClick={toggleNetworkModal}
              value={selectedNetwork?.identifier}
              label="Test Network"
              items={networkOptions}
            />
          </Box>
        )}

        <Stack direction="row" justifyContent="center">
          <Button variant="text" onClick={handleAdd}>
            <Typography variant="large" sx={{ color: (theme: Theme) => theme.palette.custom.blue["58"], display: "flex" }}>
              <IconPlus /> Add a Network
            </Typography>
          </Button>
        </Stack>
      </Box>

      <FixedPanel
        p={2}
        disablePortal
        display="flex"
        columnGap={1.5}
        direction="row"
        variant="bottom"
        alignItems="center"
        spacerSx={{ mt: 2 }}
      >
        <Button variant="contained" fullWidth onClick={handleSave} sx={{ flex: 1 }}>
          Save
        </Button>
      </FixedPanel>

      {selectedNetwork && (
        <NetworkSelectModal
          open={networkModalOpen}
          selectedNetworkIdentifier={selectedNetwork?.identifier}
          onNetworkSelect={handleSelectNetwork}
          onClose={toggleNetworkModal}
          networks={networks ?? []}
        />
      )}
    </>
  );
}
