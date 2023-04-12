import { ChangeEvent, ReactNode, useState } from "react";

import { Button, Stack, Box, Typography, IconButton } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import RepeatOnIcon from "@mui/icons-material/RepeatOn";

import { BlockchainNetwork } from "common/types";
import { networkNativeCurrencyData } from "common/config";

import { useAddressIsContract, useNativeTokenMarketTicker } from "ui/hooks";
import { isDomainName, isEthereumAddress } from "ui/common/validators";
import { TokenDisplayWithTicker } from "ui/types";
import { formatAmount } from "ui/common/utils";
import { EVMFeeManager } from "ui/common/fee";

import TokenAmountSelector from "ui/components/entity/token/TokenAmountSelector";
import ApproximateFee from "ui/components/flows/feeSelection/ApproximateFee";
import CurrentNetworkInfo from "ui/components/flows/info/CurrentNetworkInfo";
// import MemoInput from "ui/components/flows/info/MemoInput";
import FormField from "ui/components/form/FormField";
import ErrorText from "ui/components/form/ErrorText";

import WalletSelectorSendModal from "../WalletSelectorSendModal";

export interface StageSetupProps {
  selectedToken: TokenDisplayWithTicker;
  selectedTokenNetwork: BlockchainNetwork | null;
  recipient: string;
  onRecipientChange: (recipient: string) => void;
  resolvingAddress?: boolean;
  recipientAddress: string;
  resolvingDomain?: boolean;
  recipientDomain?: string | null;
  contractAsRecipientAccepted: boolean;
  amount: string;
  onAmountChange: (amount: string) => void;
  exceedsBalance: boolean;
  // memo: string;
  // onMemoChange: (memo: string) => void;
  feeManager: EVMFeeManager | null;
  onPreview: () => void;
  onWarning: () => void;
  error: string | null;
  notEnoughFunds: boolean;
  stepButtonDisabled: boolean;
}

export default function StageSetup(props: StageSetupProps) {
  const {
    selectedToken,
    selectedTokenNetwork,
    recipient,
    onRecipientChange,
    resolvingAddress,
    recipientAddress,
    resolvingDomain,
    recipientDomain,
    contractAsRecipientAccepted,
    amount,
    onAmountChange,
    exceedsBalance,
    // memo,
    // onMemoChange,
    feeManager,
    onPreview,
    onWarning,
    error,
    notEnoughFunds,
    stepButtonDisabled,
  } = props;

  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);

  const { addressIsContract: recipientIsContract } = useAddressIsContract(
    isEthereumAddress(recipientAddress) ? recipientAddress : null,
    selectedTokenNetwork?.identifier ?? null,
  );

  const nativeToken = useNativeTokenMarketTicker(selectedToken.networkIdentifier);

  const nativeCurrencySymbol = networkNativeCurrencyData[selectedToken.networkIdentifier]?.symbol ?? "ETH";

  const stepButtonHandler = recipientIsContract && !contractAsRecipientAccepted ? onWarning : onPreview;

  const handleRecipientChange = (event: ChangeEvent<HTMLInputElement>) => {
    onRecipientChange(event.target.value);
  };

  const handleWalletSelectorOpen = () => {
    setIsWalletSelectorOpen(true);
  };

  const handleWalletSelectorClose = () => {
    setIsWalletSelectorOpen(false);
  };

  const handleWalletSelectorSelect = (address: string) => {
    onRecipientChange(address);
    handleWalletSelectorClose();
  };

  let recipientResolvingResult: ReactNode = null;

  if (recipient) {
    if (isEthereumAddress(recipient) && !!recipientDomain && !resolvingDomain) {
      recipientResolvingResult = (
        <Typography variant="medium" mt="9px" color="text.secondary">
          {recipientDomain}
        </Typography>
      );
    } else if (isDomainName(recipient) && !resolvingAddress) {
      if (!!recipientAddress && recipientAddress !== recipient) {
        recipientResolvingResult = (
          <Typography variant="medium" mt="9px" color="text.secondary">
            {recipientAddress}
          </Typography>
        );
      } else {
        recipientResolvingResult = (
          <Stack mt="9px" direction="row" alignItems="center" columnGap={0.5}>
            <WarningIcon fontSize="small" color="warning" />
            <Typography variant="medium" color="warning.main">
              Invalid recipient
            </Typography>
          </Stack>
        );
      }
    }
  }

  const recipientInputRender = (
    <Box mt="17px">
      <FormField
        label="Recipient Address"
        placeholder="Enter recipient address"
        name="recipient"
        autoComplete="off"
        value={recipient}
        onChange={handleRecipientChange}
        endAdornment={
          <IconButton onClick={handleWalletSelectorOpen}>
            <RepeatOnIcon color="primary" />
          </IconButton>
        }
      />
      {recipientResolvingResult}
    </Box>
  );

  const feePrice = Number(feeManager?.feePriceInNativeCurrency) * Number(nativeToken?.priceUSD);
  const normalizedBalance = !selectedToken.balance ? "0" : selectedToken.balance;
  const normalizedPrice = !selectedToken.priceUSD ? "0" : selectedToken.priceUSD;
  const formattedBalance = formatAmount(normalizedBalance);

  const amountInputRender = (
    <>
      <Stack mt={3.125} mb="7px" direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="medium">Amount</Typography>
        <Typography variant="medium" color="text.secondary">
          Balance: {formattedBalance} {selectedToken.symbol}
        </Typography>
      </Stack>
      <TokenAmountSelector
        currency={selectedToken.symbol}
        decimals={selectedToken.decimals}
        selectedTokenType={selectedToken.assetDefinition.type}
        amount={amount}
        balance={normalizedBalance}
        feePrice={feePrice}
        price={normalizedPrice}
        onChange={onAmountChange}
        error={exceedsBalance}
        errorText={exceedsBalance ? `Amount must not exceed balance (${formattedBalance} ${selectedToken.symbol})` : undefined}
      />
    </>
  );

  return (
    <>
      <Stack width={1} px={2}>
        {recipientInputRender}
        {amountInputRender}
        {/* <MemoInput memo={memo} onChange={onMemoChange} /> */}
        <CurrentNetworkInfo networkName={selectedTokenNetwork?.name} />
      </Stack>
      <Box flexGrow={1} />
      <ApproximateFee fee={feePrice} />
      <ErrorText error={error} mt={1} justifyContent="center" />
      {notEnoughFunds && (
        <ErrorText error={`You do not have enough ${nativeCurrencySymbol} to pay for the network fee`} mt={1} justifyContent="center" />
      )}
      <Button sx={{ mt: "19px", mx: 2, mb: 2 }} variant="contained" onClick={stepButtonHandler} disabled={stepButtonDisabled}>
        Preview
      </Button>
      <WalletSelectorSendModal open={isWalletSelectorOpen} onSelect={handleWalletSelectorSelect} onClose={handleWalletSelectorClose} />
    </>
  );
}
