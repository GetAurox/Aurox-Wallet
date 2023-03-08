import { ChangeEvent, memo, useCallback, useState, ClipboardEvent } from "react";

import { Box, Button } from "@mui/material";

import { validateMnemonicsValueLength, validateMnemonicsValueWordlist, mnemonicsFromString } from "common/bip39";

import { useBlockingRequest } from "ui/hooks";
import { FlowStep, FlowStepHeader, FlowStepBody, FlowStepActions } from "ui/components/layout/flow";
import ErrorText from "ui/components/form/ErrorText";
import TextField from "ui/components/form/TextField";

const sanitizeInput = (value: string) => value.toLowerCase().trim().split(/[\s]+/g).join(" ");

export interface ImportRecoveryPhraseProps {
  onWalletAccepted: (name: string, mnemonics: string[]) => void;
}

export default memo(function ImportRecoveryPhrase(props: ImportRecoveryPhraseProps) {
  const { onWalletAccepted } = props;

  const [name, setName] = useState("");
  const [mnemonicsValue, setMnemonicsValue] = useState("");

  const [wordlistInvalid, setWordlistInvalid] = useState(false);

  useBlockingRequest();

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => setName(event.target.value), []);
  const handleNameClear = useCallback(() => setName(""), []);

  const handleRecoveryPhraseChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setMnemonicsValue(event.target.value);
    setWordlistInvalid(false);
  }, []);

  const handleRecoveryPhrasePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const pasteValue = event.clipboardData.getData("text");
    const sanitizedPasteValue = sanitizeInput(pasteValue);

    setMnemonicsValue(sanitizedPasteValue);
    setWordlistInvalid(false);
  };

  const handleResetClick = () => {
    setMnemonicsValue("");
    setWordlistInvalid(false);
  };

  const handleImportClick = () => {
    const sanitizedMnemonicsValue = sanitizeInput(mnemonicsValue);

    if (!validateMnemonicsValueWordlist(sanitizedMnemonicsValue)) {
      setWordlistInvalid(true);
    } else {
      onWalletAccepted(name, mnemonicsFromString(sanitizedMnemonicsValue));
    }
  };

  const validLength = validateMnemonicsValueLength(mnemonicsValue);

  return (
    <FlowStep>
      <FlowStepHeader title="Import via Recovery Phrase" />
      <FlowStepBody>
        <TextField
          autoFocus
          value={name}
          label="Wallet Name"
          onClear={handleNameClear}
          onChange={handleNameChange}
          placeholder="Enter Wallet Name"
        />
        <Box mt={3}>
          <TextField
            rows={8}
            multiline
            autoComplete="off"
            value={mnemonicsValue}
            label="Recovery Phrase"
            error={wordlistInvalid}
            placeholder="Enter Recovery Phrase"
            onPaste={handleRecoveryPhrasePaste}
            onChange={handleRecoveryPhraseChange}
            helper="Enter a valid Recovery Phrase separated by spaces."
          />
        </Box>
      </FlowStepBody>
      <FlowStepActions>
        <ErrorText error={wordlistInvalid ? "Invalid Recovery Phrase. Try Again" : null} />
        {wordlistInvalid && (
          <Button sx={{ mb: 1.5 }} variant="outlined" color="primary" onClick={handleResetClick}>
            Reset
          </Button>
        )}
        <Button variant="contained" disabled={!validLength || wordlistInvalid} onClick={handleImportClick}>
          Import
        </Button>
      </FlowStepActions>
    </FlowStep>
  );
});
