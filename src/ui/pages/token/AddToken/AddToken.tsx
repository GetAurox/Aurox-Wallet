import { Fragment, useState } from "react";

import { Box, Button, buttonClasses, Divider, List, Stack, Typography } from "@mui/material";

import { useActiveAccount } from "ui/hooks";
import { TokenDisplayWithTicker } from "ui/types";
import { useHistoryGoBack, useHistoryPush } from "ui/common/history";

import Header from "ui/components/layout/misc/Header";
import InfoTooltip from "ui/components/info/InfoTooltip";
import AlertStatus from "ui/components/common/AlertStatus";
import CheckboxField from "ui/components/form/CheckboxField";
import DefaultControls from "ui/components/controls/DefaultControls";

import AccountListItem from "./AccountListItem";
import TokenListItem from "./TokenListItem";
import TokenAddedWarning from "./TokenAddedWarning";

const mockTokens: TokenDisplayWithTicker[] = [
  {
    "key": "evm::43114||native",
    "networkIdentifier": "evm::43114",
    "assetIdentifier": "native",
    "assetDefinition": {
      "type": "native",
    },
    "networkDefinition": {
      "chainType": "evm",
      "chainId": 43114,
    },
    "balance": "3.982989973173246016",
    "balanceUSDValue": "72.93",
    "symbol": "AVAX",
    "name": "AVAX",
    "decimals": 18,
    "verified": true,
    "visibility": "force-show",
    "autoImported": true,
    "img": {
      "alt": "AVAX",
      "src": "https://storage.googleapis.com/aurox-coin-icons/color/198.svg",
    },
    "pairId": 21332,
    "priceUSD": "18.31",
    "priceChange24HPercent": "-0.7588075880758809",
    "priceUSDChange24H": "-0.14",
    "volumeUSD24H": "1591991.44",
  },
  {
    "key": "evm::56||contract::ERC20::0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
    "networkIdentifier": "evm::56",
    "assetIdentifier": "contract::ERC20::0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
    "assetDefinition": {
      "type": "contract",
      "contractType": "ERC20",
      "contractAddress": "0xc6dddb5bc6e61e0841c54f3e723ae1f3a807260b",
    },
    "networkDefinition": {
      "chainType": "evm",
      "chainId": 56,
    },
    "balance": "0.500001521753768499",
    "balanceUSDValue": "2.61",
    "symbol": "URUS",
    "name": "Aurox Token",
    "decimals": 18,
    "verified": true,
    "visibility": "default",
    "autoImported": true,
    "img": {
      "alt": "URUS",
      "src": "https://storage.googleapis.com/aurox-coin-icons/color/6231.svg",
    },
    "pairId": 222578,
    "priceUSD": "5.227633",
    "priceChange24HPercent": "1.3812",
    "priceUSDChange24H": "0.071218",
    "volumeUSD24H": "26400.722474",
  },
];

const sxStyles = {
  checkboxField: {
    root: {
      mt: "17px",
    },
    checkbox: {
      "&.MuiCheckbox-root": {
        width: "26px",
      },
    },
  },
  list: {
    mt: "3px",
    listStyleType: "none",
  },
  divider: {
    height: 0,
  },
  changeButton: {
    [`&.${buttonClasses.sizeMedium}`]: {
      padding: 0,
      borderRadius: 1,
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0.25px",
      minWidth: "fit-content",
    },
  },
};

export default function AddToken() {
  const [addToAllWallets, setAddToAllWallets] = useState(false);
  const [AlreadyAdded, setAlreadyAdded] = useState(false);

  const goBack = useHistoryGoBack();
  const push = useHistoryPush();
  const account = useActiveAccount();

  const handleAddCoin = () => {
    //  TODO: Nikola
    setAlreadyAdded(true);
  };

  const handleCancel = () => {
    // TODO: Nikola
    goBack();
  };

  const handleTokenClick = () => {
    // TODO: Nikola
  };

  const toggleAddToAllWallets = () => {
    setAddToAllWallets(prevState => !prevState);
  };

  const handleChange = () => {
    push("/add-token/account-change");
  };

  const handleWarningClose = () => {
    setAlreadyAdded(false);
  };

  if (AlreadyAdded) {
    return <TokenAddedWarning onClose={handleWarningClose} />;
  }

  return (
    <>
      <Header title="Add Coin to Wallet" />
      <Box mx={2} my={1}>
        <AlertStatus
          warning
          warningText={
            <>
              This action will edit tokens that are already listed in your wallet, which can be used to phish you. Only approve if you are
              certain that you mean to change what these tokens represent.
              <InfoTooltip variant="warning">
                <Typography>Lore ipsum</Typography>
              </InfoTooltip>
            </>
          }
        />
      </Box>
      <Stack mt="13px" rowGap={3.5}>
        <Typography variant="headingSmall" maxWidth={248} textAlign="center" alignSelf="center">
          Would you like to import these tokens?
        </Typography>
        <Stack px={2}>
          <Stack mb="7px" flexDirection="row" alignItems="center" justifyContent="space-between" mt={1}>
            <Typography variant="headingSmall">Selected Wallet</Typography>
            <Button sx={sxStyles.changeButton} color="primary" onClick={handleChange}>
              Change
            </Button>
          </Stack>
          {account && <AccountListItem isActive account={account} />}
          <CheckboxField
            label={<Typography variant="medium">Add coin to all wallets</Typography>}
            value={addToAllWallets}
            sx={sxStyles.checkboxField}
            onChange={toggleAddToAllWallets}
          />
        </Stack>
        <Stack>
          <Typography variant="headingSmall" ml={2}>
            Coins
          </Typography>
          <List sx={sxStyles.list}>
            {mockTokens.map((token, index) => (
              <Fragment key={token.key}>
                <TokenListItem token={token} onClick={handleTokenClick} />
                {index !== mockTokens.length - 1 && <Divider variant="middle" component="li" sx={sxStyles.divider} />}
              </Fragment>
            ))}
          </List>
        </Stack>
      </Stack>

      <DefaultControls primary="Add Coin" onPrimary={handleAddCoin} onSecondary={handleCancel} />
    </>
  );
}
