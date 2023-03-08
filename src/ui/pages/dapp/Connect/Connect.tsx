import { useMemo, useState } from "react";

import { DApp as DAppOps } from "common/operations";
import { DApp as DAppEvents } from "common/events";

import { ConsolidatedAccountInfo, OperationConnect } from "common/types";

import { useActiveAccount, useCurrentTabDomain, useDocumentTitle } from "ui/hooks";

import ConnectLoading from "ui/components/common/LoadingScreen";

import useScavengerHuntMnemonic from "ui/hooks/misc/useScavengerHuntMnemonic";

import WalletSelectorModal from "ui/components/modals/WalletSelectorModal";

import { useHistoryState } from "ui/common/history";

import ConnectPermission from "./ConnectPermission";
import ConnectSelect from "./ConnectSelect";
import { ConnectMnemonic } from "./ConnectMnemonic";

export interface ConnectProps {
  operation: OperationConnect;
}

export default function Connect(props: ConnectProps) {
  const { operation } = props;

  const { tabId } = operation;

  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<ConsolidatedAccountInfo | null>(null);
  const [networkIdentifier, setNetworkIdentifier] = useState<string | null>(null);
  const [stage, setStage] = useState<"connect" | "permission" | "mnemonic">("connect");
  const [considerOtherProvider, setConsiderOtherProvider] = useState(operation.considerOtherProvider);

  const activeAccount = useActiveAccount();

  const tabDomain = useCurrentTabDomain();

  const [alreadyConsidered] = useHistoryState<boolean | null>("alreadyConsidered", null);

  const handleNext = (account: ConsolidatedAccountInfo, networkIdentifier: string) => {
    setNetworkIdentifier(networkIdentifier);
    setAccount(account);
    setStage("permission");
  };

  const handleBack = () => setStage("connect");

  const domain = useMemo(() => {
    return operation.domain || tabDomain;
  }, [operation.domain, tabDomain]);

  const { mnemonic } = useScavengerHuntMnemonic(activeAccount, domain || "");

  useDocumentTitle(`Connect to ${domain ?? "DApp"}`);

  const rejectConnection = () => {
    if (domain) {
      DAppEvents.TransactionRequestResponded.broadcast(operation.id, null);
    }
  };

  const acceptConnection = () => {
    setLoading(true);

    if (account && networkIdentifier && domain) {
      const connectionInformation = {
        accountUUID: account.uuid,
        networkIdentifier,
      };

      const shouldKeepPopup = mnemonic !== null;

      DAppEvents.TransactionRequestResponded.broadcast(operation.id, connectionInformation, shouldKeepPopup);

      setTimeout(() => {
        setLoading(false);

        if (shouldKeepPopup) {
          setStage("mnemonic");
        }
      }, 1000);
    }
  };

  const auroxProviderSelected = async () => {
    if (!domain) return;

    await DAppOps.ChangeConnectionPolicy.perform({ considerOtherProvider: false, isDefaultProvider: true, tabId, domain });

    setConsiderOtherProvider(false);
  };

  const otherProviderSelected = async () => {
    if (!domain) return;

    await DAppOps.ChangeConnectionPolicy.perform({ considerOtherProvider: true, isDefaultProvider: false, tabId, domain });

    DAppEvents.TransactionRequestResponded.broadcast(operation.id, { accountUUID: "", networkIdentifier: "" });
  };

  const closeWindow = async () => {
    await DAppOps.RemovePopup.perform();
  };

  return (
    <>
      {loading && <ConnectLoading text="Connecting..." />}
      {stage === "connect" && !loading && (
        <ConnectSelect
          preferredNetworkIdentifier={operation.preferredNetworkIdentifier}
          onConnectionRejected={rejectConnection}
          domain={domain}
          onNext={handleNext}
        />
      )}
      {stage === "permission" && !loading && account && (
        <ConnectPermission onBack={handleBack} onConnectionAccepted={acceptConnection} accountUUID={account.uuid} />
      )}
      {stage === "mnemonic" && !loading && account && <ConnectMnemonic onSubmit={closeWindow} mnemonic={mnemonic} />}
      <WalletSelectorModal
        open={considerOtherProvider && !alreadyConsidered}
        onAuroxProviderSelect={auroxProviderSelected}
        onOtherProviderSelect={otherProviderSelected}
      />
    </>
  );
}
