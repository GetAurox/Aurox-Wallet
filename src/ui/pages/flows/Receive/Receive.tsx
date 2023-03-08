import { QRCodeCanvas } from "qrcode.react";
import { useRef } from "react";

import { Box, Button, Typography, Stack } from "@mui/material";

import { useActiveAccount } from "ui/hooks";
import { useHistoryGoBack, useHistoryPathParams } from "ui/common/history";

import Header from "ui/components/layout/misc/Header";

export default function Receive() {
  const goBack = useHistoryGoBack();
  const activeAccount = useActiveAccount();

  const { pubkey } = useHistoryPathParams<"pubkey">();

  const handleCopyAddress = () => {
    if (!("clipboard" in navigator)) return;
    navigator.clipboard.writeText(pubkey ?? "");
  };

  const canvasRef = useRef<HTMLElement>();

  const handleSaveQRCode = async () => {
    const canvas = document.getElementById("qr") as HTMLCanvasElement;
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download = `${pubkey}.png`;

    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
  };

  return (
    <>
      <Header title="Receive" onBackClick={goBack} />

      <Box flex={1} display="flex" flexDirection="column" p={2} alignItems="center">
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
          <Typography color="text.primary" fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" paddingY={3}>
            Receive Tokens
          </Typography>
          <Box p="5px" bgcolor="white" borderRadius="14px" marginBottom={3} ref={canvasRef}>
            <QRCodeCanvas value={pubkey ?? ""} size={200} includeMargin id="qr" />
          </Box>
          <Typography color="text.primary" fontWeight={500} fontSize="20px" lineHeight="32px" letterSpacing="0.18px">
            {activeAccount?.alias ? `${activeAccount.alias} Address` : " Address My Public Address"}
          </Typography>
          <Typography color="text.primary" width="90vw" textAlign="center" fontSize="16px" sx={{ wordWrap: "break-word" }}>
            {pubkey}
          </Typography>
        </Box>
        <Box flexGrow={1} />
        <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={1.5} width="100%">
          <Button variant="contained" onClick={handleCopyAddress} sx={{ flex: 1, whiteSpace: "nowrap" }}>
            Copy Address
          </Button>
          <Button variant="contained" onClick={handleSaveQRCode} sx={{ flex: 1, whiteSpace: "nowrap" }}>
            Copy QR-code
          </Button>
        </Stack>
      </Box>
    </>
  );
}
