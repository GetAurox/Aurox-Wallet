import { Stack } from "@mui/material";

import { Wallet } from "common/operations";
import { AccountInfo } from "common/types";

import { useHistoryGoBack } from "ui/common/history";
import { useAccountsVisibleOrdered, useActiveAccountUUID } from "ui/hooks";

import Header from "ui/components/layout/misc/Header";

import AccountListItem from "./AccountListItem";

export default function AccountChange() {
  const goBack = useHistoryGoBack();

  const accounts = useAccountsVisibleOrdered(false);

  const activeAccountUUID = useActiveAccountUUID();

  const handleItemClick = async (account: AccountInfo) => {
    await Wallet.SwitchAccount.perform(account.uuid);

    goBack();
  };

  return (
    <>
      <Header title="Change Wallet" onBackClick={goBack} />
      <Stack component="ul" rowGap={1.5} px={2} mt={1.5}>
        {accounts?.map(account => (
          <AccountListItem
            arrow
            account={account}
            key={account.uuid}
            onClick={handleItemClick}
            isActive={activeAccountUUID === account.uuid}
          />
        ))}
      </Stack>
    </>
  );
}
