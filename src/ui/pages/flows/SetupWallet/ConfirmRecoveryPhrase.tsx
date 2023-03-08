import { ChangeEvent, memo, useMemo, useState } from "react";
import shuffle from "lodash/shuffle";
import isEqual from "lodash/isEqual";

import { Typography, Button } from "@mui/material";

import { useBlockingRequest } from "ui/hooks";

import { FlowStep, FlowStepHeader, FlowStepBody, FlowStepActions } from "ui/components/layout/flow";
import { BIP39PhraseBox, BIP39Phrase } from "ui/components/bip39";
import ErrorText from "ui/components/form/ErrorText";
import TextField from "ui/components/form/TextField";

export interface ConfirmRecoveryPhraseProps {
  mnemonics: string[] | null;
  onComplete: (name: string) => void;
}

export default memo(function ConfirmRecoveryPhrase(props: ConfirmRecoveryPhraseProps) {
  const { mnemonics, onComplete } = props;

  const [name, setName] = useState("");

  const [recoveredMnemonics, setRecoveredMnemonics] = useState<string[]>([]);

  const shuffledMnemonics = useMemo(() => shuffle(mnemonics), [mnemonics]);

  const valid = useMemo(() => isEqual(mnemonics, recoveredMnemonics), [mnemonics, recoveredMnemonics]);

  useBlockingRequest();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleNameClear = () => setName("");

  const handleResetClick = () => setRecoveredMnemonics([]);

  const handleCompleteClick = () => onComplete(name);

  const createHandleMnemonicClearClick = (phrase: string) => () => {
    setRecoveredMnemonics(mnemonics => mnemonics.filter(mnemonic => mnemonic !== phrase));
  };

  const createHandleMnemonicAddClick = (phrase: string) => () => {
    setRecoveredMnemonics(mnemonics => [...mnemonics, phrase]);
  };

  if (!mnemonics) {
    return null;
  }

  const showError = recoveredMnemonics.length === mnemonics.length && !valid;

  return (
    <FlowStep>
      <FlowStepHeader title="Confirm Recovery Phrase" pb={0} />
      <FlowStepBody>
        <Typography variant="body2" mb={3}>
          Click on the words in the correct order to confirm your recovery phrase.
        </Typography>
        <TextField label="Wallet Name" placeholder="Enter Wallet Name" value={name} onChange={handleNameChange} onClear={handleNameClear} />
        <Typography variant="body2" mt={3} color={showError ? "#f24840" : undefined}>
          Recovery Phrase
        </Typography>
        <BIP39PhraseBox minHeight={184} mt={1} error={showError}>
          {recoveredMnemonics.length === 0 && (
            <Typography variant="body1" color="text.secondary" width="100%">
              Enter Recovery Phrase
            </Typography>
          )}
          {recoveredMnemonics.map((phrase, index) => (
            <BIP39Phrase key={index} ordinal={index + 1} phrase={phrase} onClick={createHandleMnemonicClearClick(phrase)} />
          ))}
        </BIP39PhraseBox>
        <Typography variant="caption" color="text.secondary" mt={1.5}>
          Tap the words
        </Typography>
        <BIP39PhraseBox disableFixedRows bgcolor="transparent" border="none">
          {shuffledMnemonics.map((phrase, index) => (
            <BIP39Phrase
              key={index}
              phrase={phrase}
              onClick={recoveredMnemonics.includes(phrase) ? undefined : createHandleMnemonicAddClick(phrase)}
              phantom={recoveredMnemonics.includes(phrase)}
            />
          ))}
        </BIP39PhraseBox>
      </FlowStepBody>
      <FlowStepActions>
        <ErrorText error={showError ? "Invalid Recovery Phrase. Try Again" : null} mb={3} alignSelf="center" />
        {showError && (
          <Button sx={{ mb: 1.5 }} variant="outlined" color="primary" onClick={handleResetClick}>
            Reset
          </Button>
        )}
        <Button variant="contained" color="primary" disabled={!valid} onClick={handleCompleteClick}>
          Complete
        </Button>
      </FlowStepActions>
    </FlowStep>
  );
});
