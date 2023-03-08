import { useState, useCallback, useEffect, ChangeEvent, MouseEvent } from "react";

import { Box, Button, Grid, Stack, Typography } from "@mui/material";

import { CheckboxField } from "ui/frames/onboarding/components";

export interface RecoveryPhraseProps {
  mnemonics: string[];
  onSubmit: () => void;
}

type ClipboardStatus = "done" | "failed" | null;

function textFromStatus(status: ClipboardStatus) {
  switch (status) {
    case "done":
      return "Copied";
    case "failed":
      return "Failed";
    default:
      return "Copy phrase to clipboard";
  }
}

function colorFromStatus(status: ClipboardStatus) {
  switch (status) {
    case "done":
      return "success";
    case "failed":
      return "error";
    default:
      return "primary";
  }
}

export function RecoveryPhrase(props: RecoveryPhraseProps) {
  const { mnemonics, onSubmit } = props;

  const [checked, setChecked] = useState(false);

  const [status, setStatus] = useState<ClipboardStatus>(null);

  const handleOnSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  const handleCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const handleCopyToClipboard = (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    navigator.clipboard.writeText(mnemonics.join(" ")).then(
      () => {
        setStatus("done");
      },
      () => {
        setStatus("failed");
      },
    );
  };

  useEffect(() => {
    if (status) {
      const timeout = window.setTimeout(() => {
        setStatus(null);
      }, 1000);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [status]);

  return (
    <>
      <Typography component="h3" mt={3} variant="h200-bs">
        Secret recovery phrase
      </Typography>
      <Typography color="txt600" mb={3} mt="4px" variant="p400-xl">
        Write down or copy these 12 words in the correct order and save them somewhere safe. Never share your recovery phrase
      </Typography>
      <Grid container spacing={2}>
        {mnemonics.map((phrase, i) => (
          <Grid key={phrase} item xs={4}>
            <Box bgcolor="bg800" borderRadius={1} display="inline-flex" gap={1} px="12px" py="4px">
              <Typography color="txt600" component="span" variant="btn210-bs">
                {i + 1}
              </Typography>
              <Typography component="span" variant="btn205-bs">
                {phrase}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Button sx={{ mt: 5 }} fullWidth variant="outlined" onClick={handleCopyToClipboard} color={colorFromStatus(status)}>
        {textFromStatus(status)}
      </Button>

      <Stack>
        <Box bgcolor="rgba(255, 184, 119, 0.2)" borderRadius="16px" mb={2} mt={5} p={2} width="100%">
          <CheckboxField
            label="I understand that if I lose my recovery phrase there is no way to recover my wallet."
            name="confirm"
            onChange={handleCheckbox}
          />
        </Box>
        <Button disabled={!checked} fullWidth type="submit" variant="contained" onClick={handleOnSubmit}>
          Continue
        </Button>
      </Stack>
    </>
  );
}
