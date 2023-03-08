import produce from "immer";

import { Theme, Box, Button, IconButton, Typography, Modal, ModalProps } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import FormField from "ui/components/form/FormField";

import { collapseIdentifier } from "ui/common/utils";
import { Wallet } from "common/operations";

const style = {
  modalBox: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "580px",
    padding: "30px 130px",
    position: "relative",
    transform: "translate(-50%, -50%)",
    left: "50%",
    top: "30%",
    bgcolor: "background.paper",
    borderRadius: "12px",
  },
  closeBtn: {
    position: "absolute",
    right: "17px",
    top: "17px",
  },
  heading: {
    color: "text.primary",
    fontSize: "20px",
    width: "210px",
    marginBottom: "10px",
    textAlign: "center",
  },
  subHeading: {
    color: "text.primary",
    fontSize: "14px",
    marginBottom: "15px",
    textAlign: "center",
  },
  importBtn: {
    height: "44px",
    width: "100%",
  },
};

interface WalletModalProps extends Omit<ModalProps, "children"> {
  onCloseClick: () => void;
  selectedWallets: Wallet.ImportHardwareSigner.Data[];
  setSelectedWallets: (setter: (wallets: Wallet.ImportHardwareSigner.Data[]) => Wallet.ImportHardwareSigner.Data[]) => void;
  onClickImport: () => void;
  isImported?: boolean;
}

const WalletModal = ({ onCloseClick, selectedWallets, setSelectedWallets, onClickImport, isImported, ...modalProps }: WalletModalProps) => {
  const onChangeAlias = (idx: number, alias: string) => {
    setSelectedWallets(
      produce(draft => {
        draft[idx].alias = alias;
      }),
    );
  };

  const handleDone = () => {
    window.close();
  };

  return (
    <Modal {...modalProps}>
      <Box sx={style.modalBox}>
        <IconButton onClick={onCloseClick} sx={style.closeBtn}>
          <CloseIcon fontSize="medium" sx={{ color: "primary.main" }} />
        </IconButton>
        {isImported ? (
          <Typography sx={style.heading}>Account{selectedWallets.length > 1 ? "s" : ""} Successfully Imported</Typography>
        ) : (
          <>
            <Typography sx={style.heading}>The selected wallets will be imported</Typography>
            <Typography sx={style.subHeading}>You can add names for them.</Typography>
          </>
        )}

        {!isImported && (
          <Box sx={{ marginBottom: "20px", width: "100%", mixWidth: "380px" }}>
            <Box
              display="flex"
              sx={{ borderBottom: (theme: Theme) => `1px solid ${theme.palette.custom.grey["25"]}`, marginBottom: "16px" }}
            >
              <Typography sx={{ width: "180px", color: "text.secondary" }}>Address</Typography>
              <Typography sx={{ width: "200px", color: "text.secondary" }}>Name</Typography>
            </Box>
            {selectedWallets.map((wallet, idx) => (
              <Box display="flex" key={wallet.address} sx={{ marginBottom: "18px", alignItems: "center" }}>
                <Typography sx={{ width: "180px", color: "primary.main" }}>{collapseIdentifier(wallet.address)}</Typography>
                <Box sx={{ width: "200px" }}>
                  <FormField placeholder="Enter Name" onChange={e => onChangeAlias(idx, e.target.value)} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Button onClick={isImported ? handleDone : onClickImport} variant="contained" sx={style.importBtn}>
          {isImported ? "Done" : "Import"}
        </Button>
      </Box>
    </Modal>
  );
};

export default WalletModal;
