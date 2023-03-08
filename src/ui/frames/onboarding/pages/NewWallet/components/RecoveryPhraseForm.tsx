import { useCallback, useEffect, useState } from "react";
import isEqual from "lodash/isEqual";

import { Alert, Box, Button, Grid, Link as MuiLink, Typography } from "@mui/material";

import { Icon, ValidationCriterionItem } from "ui/frames/onboarding/components";

import { useTimeCounter } from "ui/hooks";

import { Phrase } from "./Phrase";

export interface RecoveryPhraseFormProps {
  mnemonics: string[];
  onSubmit: () => void;
  disableSubmitButton: boolean;
  onRecoveryReady: (ready: boolean) => void;
}

export function RecoveryPhraseForm(props: RecoveryPhraseFormProps) {
  const { mnemonics, onSubmit, disableSubmitButton, onRecoveryReady } = props;

  const [positionPhrase, setPositionPhrase] = useState<string[]>([]);
  const [shuffledPhrases, setShuffledPhrases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { set, finished } = useTimeCounter();

  const handleOnSubmit = useCallback(() => {
    setIsSubmitting(true);
    onSubmit();
  }, [onSubmit]);

  useEffect(() => {
    if (positionPhrase.length === mnemonics.length) {
      if (!isEqual(mnemonics, positionPhrase)) {
        setError("Invalid recovery phrase.");
      } else {
        setValid(true);
      }
    }
  }, [mnemonics, positionPhrase]);

  useEffect(() => {
    setShuffledPhrases([...mnemonics].sort(() => 0.5 - Math.random()));
  }, [mnemonics]);

  useEffect(() => {
    onRecoveryReady(valid);
  }, [onRecoveryReady, valid]);

  useEffect(() => {
    if (isSubmitting) {
      set(5);
    }
  }, [isSubmitting, set]);

  useEffect(() => {
    if (finished) {
      setIsSubmitting(false);
    }
  }, [finished, set]);

  return (
    <>
      <Typography component="h3" mt={3} variant="h200-bs">
        Confirm recovery phrase
      </Typography>
      <Typography color="txt600" mb={3} mt="4px" variant="p400-xl">
        Click on the words in the correct order to confirm your recovery phrase
      </Typography>

      <Box>
        <Grid container minHeight="192px" spacing={2}>
          {(shuffledPhrases || []).map(phrase => (
            <Grid key={phrase} item xs={4}>
              <Phrase
                phrase={phrase}
                position={positionPhrase.findIndex(item => item === phrase) + 1}
                setPositionPhrase={setPositionPhrase}
              />
            </Grid>
          ))}
        </Grid>
        {error && (
          <Box mt={2}>
            <ValidationCriterionItem
              text={
                <>
                  {error}{" "}
                  <MuiLink
                    color="error100"
                    component="button"
                    style={{ cursor: "pointer" }}
                    type="button"
                    variant="p400-xl"
                    onClick={() => {
                      setPositionPhrase([]);
                      setError(null);
                    }}
                  >
                    Try again
                  </MuiLink>
                </>
              }
              touched
            />
          </Box>
        )}

        <Box mb={2} mt={6} width="100%">
          <Alert icon={<Icon name="24px-warning" />} severity="warning">
            Keep your recovery phrase in a safe place and don&apos;t share it with anyone!
          </Alert>
        </Box>
        <Button
          disabled={!valid || disableSubmitButton || isSubmitting}
          fullWidth
          type="submit"
          variant="contained"
          onClick={handleOnSubmit}
        >
          Complete
        </Button>
      </Box>
    </>
  );
}
