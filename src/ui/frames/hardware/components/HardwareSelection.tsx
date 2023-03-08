import { useLayoutEffect, useState } from "react";

import { styled, Button, ButtonProps, buttonClasses, Typography, Stack, Link } from "@mui/material";

import { HardwareSignerType } from "common/types";
import { APP_ZOOM } from "common/manifest";

import { IconHWLedger, IconHWTrezor } from "ui/components/icons";

const HardwareButton = styled(({ selected, ...rest }: ButtonProps & { selected?: boolean }) => <Button {...rest} />)(
  ({ selected, theme }) => ({
    [`&.${buttonClasses.root}`]: {
      width: "200px",
      height: "52px",
      marginBottom: "12px",
      background: theme.palette.custom.grey["19"],
      color: theme.palette.custom.white["100"],
      borderRadius: "12px",
      border: selected ? `1px solid ${theme.palette.primary.main}` : "none",
    },
    [`&.${buttonClasses.disabled}`]: {
      background: theme.palette.custom.grey["15"],
      color: theme.palette.custom.grey["19"],
    },
  }),
);

const sxStyles = {
  button: {
    m: "30px 0",
    width: "320px",
    height: "44px",
    fontSize: "16px",
    lineHeight: "24px",
  },
  list: {
    listStyleType: "decimal",
    listStylePosition: "inside",
    counterReset: "ol-counter",
  },
  listItem: {
    counterIncrement: "ol-counter",
    color: "text.secondary",
    justifyContent: "center",
    "&::before": {
      content: "counter(ol-counter) '.'",
      fontSize: "14px",
      marginRight: "4px",
    },
  },
};

const HardwareSelection = ({ onClickContinue }: { onClickContinue: (selection: HardwareSignerType) => void }) => {
  const [selection, setSelection] = useState<HardwareSignerType | null>(null);

  const createSelectionHandle = (select: HardwareSignerType) => () => {
    setSelection(select === selection ? null : select);
  };

  const handleContinue = () => {
    if (selection) {
      onClickContinue(selection);
    }
  };

  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--app-zoom", "1");

    return () => {
      document.documentElement.style.setProperty("--app-zoom", APP_ZOOM.toString());
    };
  }, []);

  return (
    <Stack alignItems="center" justifyContent="center" height="inherit">
      <Typography variant="headingSmall" width="300px" align="center" mb="9px">
        Link a Hardware Wallet
      </Typography>
      <Typography color="text.secondary" fontSize="14px" fontWeight={400} my="19px" textAlign="center">
        Select a Hardware Wallet you would like to link to the Aurox Wallet <br />
      </Typography>
      <Stack>
        <HardwareButton selected={selection === "ledger"} onClick={createSelectionHandle("ledger")}>
          <IconHWLedger />
        </HardwareButton>
        <HardwareButton selected={selection === "trezor"} onClick={createSelectionHandle("trezor")}>
          <IconHWTrezor />
        </HardwareButton>
      </Stack>
      <Button variant="contained" sx={sxStyles.button} onClick={handleContinue} disabled={!selection}>
        Continue
      </Button>
      <Link fontSize="14px" target="_blank" rel="noopener noreferrer" href="https://docs.getaurox.com/product-docs/aurox-wallet-guides">
        Need help?
      </Link>
    </Stack>
  );
};

export default HardwareSelection;
