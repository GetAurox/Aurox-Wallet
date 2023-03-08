import { memo } from "react";

import { Typography, Button } from "@mui/material";

import { FlowStep, FlowStepHeader, FlowStepBody, FlowStepActions } from "ui/components/layout/flow";
import { BIP39PhraseBox, BIP39Phrase } from "ui/components/bip39";

import { useBlockingRequest } from "ui/hooks";

export interface ViewRecoveryPhraseProps {
  mnemonics: string[] | null;
  onNext: () => void;
}

export default memo(function ViewRecoveryPhrase(props: ViewRecoveryPhraseProps) {
  const { mnemonics, onNext } = props;

  useBlockingRequest();

  if (!mnemonics) {
    return null;
  }

  return (
    <FlowStep>
      <FlowStepHeader title="Secret Recovery Phrase" pb={0} />
      <FlowStepBody>
        <Typography variant="body2">
          Write down or copy these 12 words in the right order and save them somewhere safe. Never share your Recovery Phrase.
        </Typography>
        <Typography variant="body2" mt={3}>
          Recovery Phrase
        </Typography>
        <BIP39PhraseBox mt={1}>
          {mnemonics.map((phrase, index) => (
            <BIP39Phrase key={index} ordinal={index + 1} phrase={phrase} />
          ))}
        </BIP39PhraseBox>
      </FlowStepBody>
      <FlowStepActions>
        <Button color="primary" variant="contained" fullWidth onClick={onNext}>
          Next
        </Button>
      </FlowStepActions>
    </FlowStep>
  );
});
