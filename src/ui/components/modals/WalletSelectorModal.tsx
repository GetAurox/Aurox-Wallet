import {
  Button,
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  styled,
  IconButton,
  iconButtonClasses,
  DialogContent as MuiDialogContent,
  dialogClasses,
  DialogTitleProps,
  dialogTitleClasses,
  dialogContentClasses,
  Stack,
  Box,
  Theme,
  Typography,
} from "@mui/material";

import { BASE_DIALOG_HEIGHT_OFFSET, DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

import { IconClose, IconAuroxCircle, IconMetaMaskFox } from "ui/components/icons";

const Dialog = styled(MuiDialog)(({ theme }) => ({
  [`& .${dialogClasses.paper}`]: {
    margin: 16,
    height: "auto",
    borderRadius: 10,
    background: theme.palette.background.paper,
    maxWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
    minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
    maxHeight: `calc(100% - ${BASE_DIALOG_HEIGHT_OFFSET}px)`,
  },
}));

const DialogTitle = styled((props: DialogTitleProps) => <MuiDialogTitle {...props} />)({
  [`&.${dialogTitleClasses.root}`]: {
    padding: "12px 47px 0px 47px",
  },
});

const DialogContent = styled(MuiDialogContent)({
  [`&.${dialogContentClasses.root}`]: {
    rowGap: 12,
    display: "flex",
    flexDirection: "column",
    padding: "34px 24px 24px 24px",
  },
});

const CloseButton = styled(IconButton)({
  [`&.${iconButtonClasses.root}`]: {
    top: 12,
    right: 12,
    padding: 0,
    borderRadius: 0,
    position: "absolute",
  },
});

const sxStyles = {
  auroxWalletButton: {
    px: 1.5,
    rowGap: 1.5,
    display: "flex",
    alignItems: "start",
    color: "text.primary",
    flexDirection: "column",
    borderColor: (theme: Theme) => theme.palette.custom.grey["25"],
  },
  metamaskWalletButton: {
    color: "text.primary",
    justifyContent: "start",
    borderColor: (theme: Theme) => theme.palette.custom.grey["25"],
  },
  benefitList: {
    listStyleType: "circle",
    listStylePosition: "inside",
    textAlign: "left",
    paddingInlineStart: "10px",
  },
};

export interface WalletSelectorModalProps {
  open: boolean;
  onAuroxProviderSelect: () => void;
  onOtherProviderSelect: () => void;
}

export default function WalletSelectorModal(props: WalletSelectorModalProps) {
  const { open, onOtherProviderSelect, onAuroxProviderSelect } = props;

  return (
    <Dialog open={open}>
      <DialogTitle component="section" typography="inherit">
        <CloseButton disableRipple color="primary" onClick={onAuroxProviderSelect}>
          <IconClose />
        </CloseButton>
        <Typography variant="headingSmall" textAlign="center" lineHeight="28px">
          Please select the wallet you want to connect with.
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Button variant="outlined" sx={sxStyles.auroxWalletButton} onClick={onAuroxProviderSelect}>
          <Box display="flex" gap={1}>
            <IconAuroxCircle display="inline-block" />
            <Typography variant="large" display="inline-block">
              Aurox Wallet
            </Typography>
          </Box>
          <Stack rowGap={1} component="ul" sx={sxStyles.benefitList}>
            <Typography variant="small" component="li">
              Protect your funds from scam contracts
            </Typography>
            <Typography variant="small" component="li">
              Intuitive and powerful user experience
            </Typography>
            <Typography variant="small" component="li">
              Earn rewards for simply using Aurox wallet
            </Typography>
            <Typography variant="small" component="li">
              Full data analytics for your tokens and portfolio
            </Typography>
          </Stack>
        </Button>
        <Button startIcon={<IconMetaMaskFox />} variant="outlined" sx={sxStyles.metamaskWalletButton} onClick={onOtherProviderSelect}>
          <Typography variant="large">MetaMask</Typography>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
