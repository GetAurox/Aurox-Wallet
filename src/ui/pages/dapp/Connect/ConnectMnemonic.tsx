import { Button, Box, Stack, Typography } from "@mui/material";

const sxStyles = {
  box: {
    margin: "65px 44px 0 44px",
    textAlign: "center",
  },
  button: {
    position: "fixed",
    bottom: "20px",
    width: "390px",
    mx: 2,
  },
};

export interface ConnectMnemonicProps {
  onSubmit: () => void;
  mnemonic: string | null;
}

export function ConnectMnemonic(props: ConnectMnemonicProps) {
  const { onSubmit, mnemonic } = props;

  const handleOnSubmit = () => {
    onSubmit();
  };

  return (
    <>
      <Box sx={sxStyles.box}>
        <Typography variant="large">Congratulations, you found one of the mnemonics!</Typography>
        <Typography variant="large" mt={6}>
          {mnemonic}
        </Typography>
      </Box>

      <Stack sx={sxStyles.button}>
        <Button variant="contained" onClick={handleOnSubmit}>
          Okay
        </Button>
      </Stack>
    </>
  );
}
