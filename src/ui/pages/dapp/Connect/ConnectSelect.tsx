import { useCallback, useEffect, useState } from "react";

import { Box } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { useConsolidatedAccountsInfo, useNetworkGetter, useEnabledNetworks } from "ui/hooks";
import { BlockchainNetwork, ConsolidatedAccountInfo } from "common/types";
import { Wallet } from "common/operations";

import NetworkSelectModal from "ui/components/modals/NetworkSelectModal";
import FormSelect, { SelectItem } from "ui/components/form/FormSelect";
import DefaultControls from "ui/components/controls/DefaultControls";

import InfoTooltip from "ui/components/info/InfoTooltip";
import AlertStatus from "ui/components/common/AlertStatus";

import { checkIfDomainIsNew } from "common/api";

import ConnectAccountOptions from "./ConnectAccountOptions";

const useStyles = makeStyles({
  dropdown: {
    cursor: "pointer",
  },
});

export interface ConnectSelectProps {
  onConnectionRejected: () => void;
  domain: string | null;
  onNext: (account: ConsolidatedAccountInfo, networkIdentifier: string) => void;
  preferredNetworkIdentifier?: string;
}

export default function ConnectSelect(props: ConnectSelectProps) {
  const { onNext, onConnectionRejected, preferredNetworkIdentifier, domain } = props;

  const classes = useStyles();

  const [networkModalOpen, setNetworkModalOpen] = useState(false);
  const [selectedAccountUUID, setSelectedAccountUUID] = useState("");
  const [networkOptions, setNetworkOptions] = useState<SelectItem[]>([]);
  const [isDomainNew, setIsDomainNew] = useState(false);

  const accounts = useConsolidatedAccountsInfo("evm");
  const networks = useEnabledNetworks();

  const [selectedNetwork, setSelectedNetwork] = useState<BlockchainNetwork | null>(null);

  const networkGetter = useNetworkGetter();

  useEffect(() => {
    if (networks) {
      const options = networks.map(network => ({ value: network.identifier, label: network.name }));

      setNetworkOptions(options);

      const initialNetwork = networkGetter(preferredNetworkIdentifier) ?? networks[0];

      setSelectedNetwork(initialNetwork);
    }
  }, [networks, networkGetter, preferredNetworkIdentifier]);

  useEffect(() => {
    if (!domain) {
      return;
    }

    const checkDomain = async () => {
      try {
        if (domain) {
          const response = await checkIfDomainIsNew(domain);

          setIsDomainNew(response);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkDomain();
  }, [domain]);

  const openNetworkModal = () => {
    setNetworkModalOpen(true);
  };

  const closeNetworkModal = () => {
    setNetworkModalOpen(false);
  };

  const handleSelectAccount = (uuid: string) => {
    Wallet.SwitchAccount.perform(uuid);

    setSelectedAccountUUID(uuid);
  };

  const handleSelectNetwork = (networkIdentifier: string) => {
    const newNetwork = networkGetter(networkIdentifier);

    setSelectedNetwork(newNetwork);
  };

  const submit = () => {
    if (!accounts || !selectedNetwork) return;

    const account = accounts.find(x => x.uuid === selectedAccountUUID);

    if (account) {
      onNext(account, selectedNetwork.identifier);
    }
  };

  const getAccountOptions = useCallback(() => {
    if (!accounts) return;

    return accounts.map(account => (
      <ConnectAccountOptions
        key={account.uuid}
        account={account}
        selected={account.uuid === selectedAccountUUID}
        onSelect={handleSelectAccount}
        sx={{ mb: 1.5 }}
      />
    ));
  }, [selectedAccountUUID, accounts]);

  return (
    <>
      {isDomainNew && (
        <Box my={1.5}>
          <AlertStatus
            error
            errorText={
              <>
                This domain was recently registered. Please make sure you are connecting to the right website.{" "}
                <InfoTooltip variant="error">
                  Aurox Wallet checks if a domain was registered less than 3 months ago. Most scammers and hackers will register new domains
                  as old ones get flagged. It’s possible the dApp you’re interacting with is new, but please proceed with caution.
                </InfoTooltip>
              </>
            }
          />
        </Box>
      )}
      {networks && selectedNetwork && (
        <Box mt={3} mb="27px" mx={2}>
          <FormSelect
            open={false}
            onClick={openNetworkModal}
            selectClassName={classes.dropdown}
            selectWrapClassName={classes.dropdown}
            value={selectedNetwork.identifier}
            label="Select Network"
            items={networkOptions as SelectItem[]}
          />
        </Box>
      )}

      <Box mx={2}>{getAccountOptions()}</Box>

      <DefaultControls
        primary="Next"
        disabledPrimary={!selectedAccountUUID || !selectedNetwork?.identifier}
        onPrimary={submit}
        onSecondary={onConnectionRejected}
      />

      {selectedNetwork && (
        <NetworkSelectModal
          open={networkModalOpen}
          selectedNetworkIdentifier={selectedNetwork?.identifier}
          onNetworkSelect={handleSelectNetwork}
          onClose={closeNetworkModal}
          networks={networks ?? []}
        />
      )}
    </>
  );
}
