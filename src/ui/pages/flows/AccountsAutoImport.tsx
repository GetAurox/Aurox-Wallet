import { useEffect, useState, useCallback, ChangeEvent } from "react";

import { Box, Theme, List, Stack, Button, IconButton, CircularProgress, Link, Typography } from "@mui/material";

import { Wallet } from "common/operations";
import { ethereumMainnetNetworkIdentifier } from "common/config";

import { useAccountsAutoImportContext } from "ui/common/accountsAutoImport";
import { collapseIdentifier } from "ui/common/utils";
import { useGoHome } from "ui/common/history";
import { useAccountsOfType, useNetworkBlockchainExplorerLinkResolver } from "ui/hooks";

import NotificationModal from "ui/components/modals/NotificationModal";
import FixedPanel from "ui/components/layout/misc/FixedPanel";
import { IconEdit, IconOk } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import FormField from "ui/components/form/FormField";

export default function AccountsAutoImport() {
  const goHome = useGoHome();

  const { started, finished, notified, setNotified } = useAccountsAutoImportContext();

  const loading = started && !finished;

  const mnemonicAccounts = useAccountsOfType("mnemonic");

  const [editingAccountUUID, setEditingAccountUUID] = useState<string | null>(null);

  const editingAccount = mnemonicAccounts !== null && editingAccountUUID !== null ? mnemonicAccounts[editingAccountUUID] ?? null : null;

  const [alias, setAlias] = useState("");

  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(ethereumMainnetNetworkIdentifier);

  const createHandleEditAccount = (accountUUID: string) => () => {
    setEditingAccountUUID(accountUUID);
  };

  const handleNotified = useCallback(() => {
    setNotified(true);
  }, [setNotified]);

  const handleAliasChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setAlias(event.target.value);
  };

  const handleSave = useCallback(async () => {
    if (editingAccountUUID && alias) {
      await Wallet.SetAlias.perform(editingAccountUUID, alias.trim());

      setEditingAccountUUID(null);

      goHome();
    }
  }, [goHome, editingAccountUUID, alias]);

  const headerBackClick = () => {
    setEditingAccountUUID(null);

    goHome();
  };

  useEffect(() => {
    setAlias(editingAccount?.alias ?? "");
  }, [editingAccount]);

  if (editingAccount) {
    return (
      <>
        <Header title="Edit Name" onBackClick={headerBackClick} />
        <Box flex={1} px={2} pb={2}>
          <FormField label="Name" onChange={handleAliasChange} value={alias} />
        </Box>
        <Box px={2} pb={2}>
          <Button variant="contained" fullWidth onClick={handleSave} disabled={!alias.trim() || alias.trim() === editingAccount.alias}>
            Save
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <Stack flex={1} p={2} pt="25px">
        <Typography variant="headingSmall" mb={0.75} align="center">
          {finished ? "Finished Importing Accounts" : "Recovery Mnemonic Was Successfully Imported"}
        </Typography>
        <Typography variant="medium" mb={1.125} align="center" color="text.secondary">
          {finished
            ? "EVM limitations prevents us from accurately detecting all accounts. If there’s any accounts missing, you will be able to create them from the wallet manage screen."
            : "We will try to find all accounts that are attached to this recovery phrase. It may take a few minutes. You can click the minimize button to have this process complete in the background."}
        </Typography>
        {mnemonicAccounts && (
          <List sx={{ mx: -2, listStyle: "none" }}>
            {Object.entries(mnemonicAccounts).map(([accountUUID, account]) => {
              const link = getContractAddressExplorerLink(account.addresses.evm);

              return (
                <Stack
                  key={accountUUID}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  p={2}
                  borderBottom={(theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`}
                >
                  <Stack direction="row" alignItems="center">
                    <Typography variant="medium" sx={{ overflow: "hidden", maxWidth: 200, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      {account.alias}
                    </Typography>
                    {finished && (
                      <IconButton sx={{ ml: 0.5, p: 0.5 }} disableRipple onClick={createHandleEditAccount(accountUUID)}>
                        <IconEdit color="primary" />
                      </IconButton>
                    )}
                  </Stack>
                  <Link
                    target="_blank"
                    color="primary"
                    disabled={!link}
                    underline="hover"
                    href={link ?? undefined}
                    component={link ? "a" : "button"}
                  >
                    {collapseIdentifier(account.addresses.evm)}
                  </Link>
                </Stack>
              );
            })}
          </List>
        )}
      </Stack>
      <FixedPanel variant="bottom" disablePortal>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          p={2}
          bgcolor="background.paper"
          borderRadius="10px 10px 0 0"
        >
          {loading ? (
            <>
              <Button variant="outlined" onClick={headerBackClick} sx={{ flex: 1 }}>
                Minimize Screen
              </Button>
              <Button variant="contained" sx={{ flex: 1 }}>
                <CircularProgress color="inherit" size={20} />
              </Button>
            </>
          ) : (
            <Button variant="contained" onClick={headerBackClick} sx={{ flex: 1 }}>
              Continue
            </Button>
          )}
        </Stack>
      </FixedPanel>
      <NotificationModal
        show={finished && !notified}
        image={<IconOk />}
        title="Import of Sub-Wallets is Finished"
        description="It may not be all wallets."
        onClick={handleNotified}
      />
    </>
  );
}
