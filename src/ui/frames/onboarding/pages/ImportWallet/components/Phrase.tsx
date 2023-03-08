import { ChangeEvent, ClipboardEvent, useState } from "react";
import { mnemonicsFromString, validateMnemonicsValueLength, validateMnemonicsValueWordlist } from "common/bip39";

import { Box, Button, Grid, Typography } from "@mui/material";

import { TextField } from "ui/frames/onboarding/components";

const sanitizeInput = (value: string) => value.toLowerCase().trim().split(/[\s]+/g).join(" ");

export interface PhraseFormProps {
  onSubmit: (name: string, mnemonics: string[]) => void;
  disableSubmitButton: boolean;
}

export function Phrase(props: PhraseFormProps) {
  const { onSubmit, disableSubmitButton } = props;

  const [name, setName] = useState("");
  const [phrases, setPhrases] = useState("");
  const [wordlistInvalid, setWordlistInvalid] = useState(false);

  const handleNameOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };
  const handlePhrasesOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhrases(event.target.value);
    setWordlistInvalid(false);
  };

  const handleOnSubmit = () => {
    const sanitizedMnemonicsValue = sanitizeInput(phrases);

    if (!validateMnemonicsValueWordlist(sanitizedMnemonicsValue)) {
      setWordlistInvalid(true);
    } else {
      onSubmit(name, mnemonicsFromString(sanitizedMnemonicsValue));
    }
  };

  const handleRecoveryPhrasePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const pasteValue = event.clipboardData.getData("text");
    const sanitizedPasteValue = sanitizeInput(pasteValue);

    setPhrases(sanitizedPasteValue);
    setWordlistInvalid(false);
  };

  const validLength = validateMnemonicsValueLength(phrases);

  const phrasesError = phrases.length > 0 && wordlistInvalid ? "Invalid phrases" : null;

  return (
    <>
      <Typography component="h3" mt={3} variant="h200-bs">
        Enter your wallet details
      </Typography>

      <Box mt={4}>
        <Grid container gap={2} gridRow={1}>
          <TextField fullWidth name="walletName" placeholder="Wallet Name" value={name} onChange={handleNameOnChange} />
          <TextField
            fullWidth
            minRows={4}
            multiline
            name="phrases"
            placeholder="Recovery Phrase"
            value={phrases}
            caption={phrasesError}
            onPaste={handleRecoveryPhrasePaste}
            onChange={handlePhrasesOnChange}
          />

          <Typography color="txt600" mt={1} variant="p400-xl">
            Enter a valid recovery phrase separated by spaces
          </Typography>

          <Button
            disabled={!validLength || wordlistInvalid || name == "" || disableSubmitButton}
            fullWidth
            type="submit"
            variant="contained"
            onClick={handleOnSubmit}
          >
            Continue
          </Button>
        </Grid>
      </Box>
    </>
  );
}
