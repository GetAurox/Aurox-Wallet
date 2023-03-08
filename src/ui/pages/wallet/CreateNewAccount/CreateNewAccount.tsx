import { ChangeEvent, useCallback, useState } from "react";

import { Box, Button } from "@mui/material";

import { Wallet } from "common/operations";

import { useAccountAliasGenerator, useBlockingRequest } from "ui/hooks";
import { useHistoryGoBack, useGoHome } from "ui/common/history";

import Success from "ui/components/layout/misc/Success";
import FormField from "ui/components/form/FormField";
import Header from "ui/components/layout/misc/Header";

export default function CreateNewAccount() {
  const goBack = useHistoryGoBack();
  const goHome = useGoHome();

  const [generatedAccountName, setGeneratedAccountName] = useState("");

  const [name, setName] = useState("");
  const [completed, setCompleted] = useState(false);

  useBlockingRequest();

  const accountAliasGenerator = useAccountAliasGenerator();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleCompleteClick = useCallback(async () => {
    const enteredOrGeneratedName = name.trim() ? name : accountAliasGenerator();

    await Wallet.CreateNewMnemonicAccounts.perform([{ alias: enteredOrGeneratedName }]);

    setCompleted(true);
    setGeneratedAccountName(enteredOrGeneratedName);
  }, [accountAliasGenerator, name]);

  if (completed) {
    return (
      <Success heading="Complete" onButtonClick={goHome} subheading={`Your wallet "${generatedAccountName}" was successfully created.`} />
    );
  }

  return (
    <>
      <Header title="Create a New Wallet" onBackClick={goBack} />
      <Box flex={1} display="flex" flexDirection="column" p={2}>
        <FormField label="Wallet Name" placeholder="Enter Wallet Name" value={name} onChange={handleNameChange} />
        <Box flexGrow={1} />
        <Button variant="contained" onClick={handleCompleteClick}>
          Complete
        </Button>
      </Box>
    </>
  );
}
