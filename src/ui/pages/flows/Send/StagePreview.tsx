import { ethers } from "ethers";
import { useMemo } from "react";
import Decimal from "decimal.js";

import { Theme, Button, Stack, Box, Divider, Typography } from "@mui/material";

import { getAccountAddressForChainType } from "common/utils";
import { AccountInfo } from "common/types";

import { EVMFeeStrategy } from "ui/common/fee";
import { formatAmount } from "ui/common/utils";

import FromAndToDetails from "ui/components/flows/info/FromAndToDetailsInfo";
import ErrorText from "ui/components/form/ErrorText";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFee";
import AlertStatus from "ui/components/common/AlertStatus";

import { TokenDisplayWithTicker } from "ui/types";
import { useNativeTokenMarketTicker, useNetworkByIdentifier } from "ui/hooks";

export interface StagePreviewProps {
  selectedToken: TokenDisplayWithTicker;
  activeAccount: AccountInfo | null;
  recipientAddress: string;
  amount: string;
  feeManager: EVMFeeStrategy | null;
  onCompleted: () => void;
  error: string | null;
  stepButtonDisabled: boolean;
  notification?: string | null;
}

export default function StagePreview(props: StagePreviewProps) {
  const { selectedToken, activeAccount, recipientAddress, amount, feeManager, onCompleted, error, stepButtonDisabled, notification } =
    props;

  const normalizedAmount = !amount.trim() ? "0" : amount;
  const normalizedPrice = !selectedToken.priceUSD ? "0" : selectedToken.priceUSD;

  const amountValue = new Decimal(normalizedAmount).times(new Decimal(normalizedPrice)).toNumber();

  const network = useNetworkByIdentifier(selectedToken.networkIdentifier);

  const nativeTokenPrice = useNativeTokenMarketTicker(selectedToken.networkIdentifier);

  const amountOutputRender = (
    <Stack mt="17px" direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="medium" color="text.secondary">
        Send:
      </Typography>
      <Typography variant="medium">
        {formatAmount(amount)} {selectedToken.symbol}
        {amountValue > 0 && ` ($${formatAmount(amountValue)})`}
      </Typography>
    </Stack>
  );

  const totalRender = useMemo(() => {
    if (!feeManager?.feePriceInNativeCurrency) return;

    const totalTransactionCost = feeManager.feePriceInNativeCurrency + Number(ethers.utils.formatEther(feeManager.transactionValue));

    const priceUSD = totalTransactionCost * Number(nativeTokenPrice.priceUSD);

    const totalValue = priceUSD ? `$${formatAmount(priceUSD)}` : `${totalTransactionCost} ${network?.currencySymbol}`;

    return (
      <Stack mt="17px" direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="medium" color="text.secondary">
          Total Cost:
        </Typography>
        <Typography variant="medium">~{totalValue}</Typography>
      </Stack>
    );
  }, [feeManager, nativeTokenPrice.priceUSD, network?.currencySymbol]);

  return (
    <>
      <Stack width={1} px={2}>
        <FromAndToDetails from={getAccountAddressForChainType(activeAccount as AccountInfo, "evm")} to={recipientAddress} />
        <Divider sx={{ mt: 2.25, borderColor: (theme: Theme) => theme.palette.custom.grey["19"] }} />
        {amountOutputRender}
        {<NetworkFee networkIdentifier={selectedToken?.networkIdentifier} feeManager={feeManager} />}
        <Divider sx={{ mt: "18px", borderColor: (theme: Theme) => theme.palette.custom.grey["19"] }} />
        {totalRender}
      </Stack>
      <Box flexGrow={1} />
      <ErrorText error={error} mt={1} justifyContent="center" />
      {notification && (
        <Stack mx={2}>
          <AlertStatus info infoText={notification} />
        </Stack>
      )}
      <Button sx={{ mt: "19px", mx: 2, mb: 2 }} variant="contained" onClick={onCompleted} disabled={stepButtonDisabled}>
        Confirm and Send
      </Button>
    </>
  );
}
