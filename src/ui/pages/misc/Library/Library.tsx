import { useState, useCallback, ChangeEvent } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { useTheme } from "@mui/material/styles";

import { Tab, Box, List, Link, Tabs, Button, BoxProps, Checkbox, Typography, TypographyProps, Divider } from "@mui/material";

import { autoLockValues, ETHEREUM_MAINNET_CHAIN_ID, NETWORKS } from "common/config";

import { mapTokenTransactionsToTokenTransactionRenderData } from "ui/common/transactions";

import TokenTransactionListItem from "ui/components/entity/transaction/TokenTransactionListItem";
import EqualWidthSplitColumns from "ui/components/layout/misc/EqualWidthSplitColumns";
import ConfirmationModal from "ui/components/modals/ConfirmationModal";
import CopyToClipboard from "ui/components/clipboard/CopyToClipboard";
import TokenIdentity from "ui/components/entity/token/TokenIdentity";
import CommonListItem from "ui/components/common/CommonListItem";
import CopyableLink from "ui/components/clipboard/CopyableLink";
import CheckboxField from "ui/components/form/CheckboxField";
import PasswordField from "ui/components/form/PasswordField";
import NetworkChip from "ui/components/common/NetworkChip";
import SearchField from "ui/components/form/SearchField";
import Header from "ui/components/layout/misc/Header";
import FormField from "ui/components/form/FormField";
import InfoPair from "ui/components/info/InfoPair";
import Search from "ui/components/common/Search";

import {
  IconArrow,
  IconCheck,
  IconBinance,
  IconPolygon,
  IconRadioOn,
  IconEthereum,
  IconRadioOff,
  IconDebitCard,
  IconBankAccount,
} from "ui/components/icons";
import { EthereumAccountTransaction } from "ui/types";

const useStyles = makeStyles(() => ({
  iconLarge: {
    width: 36,
  },
  iconMedium: {
    width: 24,
  },
}));

type ShowcaseBoxProps = BoxProps;

const ShowcaseBox = ({ children, ...boxProps }: ShowcaseBoxProps) => {
  return (
    <Box padding={2} display="flex" alignItems="center" flexDirection="column" {...boxProps}>
      {children}
    </Box>
  );
};

type ShowcaseTitleProps = TypographyProps;

const ShowcaseTitle = ({ children, ...otherProps }: ShowcaseTitleProps) => {
  return (
    <Typography variant="h6" margin="0 0 12px" color="text.primary" {...otherProps}>
      {children}
    </Typography>
  );
};

const autoLockDefault = autoLockValues[2].value;

const tags = [
  { value: "Bitcoin", label: "Bitcoin" },
  { value: "BTC", label: "BTC" },
  { value: "Electric Capital Portfolio", label: "Electric Capital Portfolio" },
  { value: "State Channel", label: "State Channel" },
];

export const Library = () => {
  const classes = useStyles();

  const theme = useTheme();

  const [password, setPassword] = useState("qWertyui1");
  const [confirmPassword, setConfirmPassword] = useState("Qwertyui1");
  const [search, setSearch] = useState("");
  const [recoveryPhrase, setRecoveryPhrase] = useState("flag side crater senior problem canyon pulse warrior style ritual robot toy");
  const [autoLock, setAutoLock] = useState(autoLockDefault);
  const [network, setNetwork] = useState("ethereum");
  const [coinPageTab, setCoinPageTab] = useState(0);
  const [marketPageTab, setMarketPageTab] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(true);

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handlePasswordClear = () => {
    setPassword("");
  };

  const handleConfirmPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(event.target.value);
  };

  const handleConfirmPasswordClear = () => {
    setConfirmPassword("");
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const handleSearchProcess = useCallback(() => {
    (window as any).alert(search);
  }, [search]);

  const handleSearchClear = () => {
    setSearch("");
  };

  const handleRecoveryPhraseChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRecoveryPhrase(event.target.value);
  };

  const handleShowConfirmModal = () => {
    setShowConfirmModal(value => !value);
  };

  return (
    <>
      <ShowcaseBox>
        <ShowcaseTitle>Buttons</ShowcaseTitle>
        <Button variant="contained" fullWidth>
          Create a New Wallet
        </Button>
        <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
          Import Wallet
        </Button>
        <Button variant="contained" disabled fullWidth sx={{ mt: 2 }}>
          Create a New Password
        </Button>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Form elements</ShowcaseTitle>
        <PasswordField
          label="New Password"
          placeholder="Enter password"
          visibilityControl
          defaultShowPassword
          value={password}
          onChange={handlePasswordChange}
          onClear={handlePasswordClear}
        />
        <Box mt={2} sx={{ width: "100%" }}>
          <PasswordField
            label="Confirm Password"
            placeholder="Enter password"
            visibilityControl
            defaultShowPassword
            error={password !== confirmPassword}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onClear={handleConfirmPasswordClear}
          />
        </Box>
        <Box mt={2} sx={{ width: "100%" }}>
          <FormField
            label="Recovery Phrase"
            placeholder="Recovery Phrase"
            multiline
            rows={8}
            value={recoveryPhrase}
            onChange={handleRecoveryPhraseChange}
            helper="Enter 12 or 24 words separated by spaces."
          />
        </Box>
        <Box mt={2} sx={{ width: "100%" }}>
          <SearchField
            placeholder="Search"
            value={search}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            onSearch={handleSearchProcess}
          />
        </Box>
        <Box mt={2} sx={{ width: "100%" }}>
          <CheckboxField label="I understand that Aurox can't recover this password for me." />
        </Box>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>List items</ShowcaseTitle>
        <List sx={{ width: "100%" }}>
          {autoLockValues.map(autolockItem => (
            <CommonListItem
              key={autolockItem.value}
              selected={autoLock === autolockItem.value}
              onClick={() => setAutoLock(autolockItem.value)}
              primaryLabel={autolockItem.label}
              startIcon={autoLock === autolockItem.value ? <IconRadioOn /> : <IconRadioOff />}
            />
          ))}
        </List>
        <List sx={{ width: "100%", mt: 2 }}>
          <CommonListItem primaryLabel="Recovery Phrase" endIcon={<IconArrow />} />
          <CommonListItem primaryLabel="Private Key" endIcon={<IconArrow />} />
        </List>
        <List sx={{ width: "100%", mt: 2 }}>
          <CommonListItem
            primaryLabel="Ethereum"
            startIcon={<IconEthereum className={classes.iconLarge} />}
            endIcon={network === "ethereum" && <IconCheck />}
            onClick={() => setNetwork("ethereum")}
            selected={network === "ethereum"}
          />
          <CommonListItem
            primaryLabel="Binance Smart Chain"
            startIcon={<IconBinance className={classes.iconLarge} />}
            endIcon={network === "binance" && <IconCheck />}
            onClick={() => setNetwork("binance")}
            selected={network === "binance"}
          />
          <CommonListItem
            primaryLabel="Polygon"
            startIcon={<IconPolygon className={classes.iconLarge} />}
            endIcon={network === "polygon" && <IconCheck />}
            onClick={() => setNetwork("polygon")}
            selected={network === "polygon"}
          />
        </List>
        <List sx={{ width: "100%", mt: 2 }}>
          <CommonListItem primaryLabel="Debit Card" secondaryLabel="Use any Visa or Master Card debit card" startIcon={<IconDebitCard />} />
          <CommonListItem primaryLabel="Bank Account" secondaryLabel="Invest large amounts" startIcon={<IconBankAccount />} />
        </List>
        <List sx={{ width: "100%", mt: 2 }}>
          <CommonListItem primaryLabel="Ethereum" startIcon={<IconEthereum className={classes.iconMedium} />} endIcon={<IconArrow />} />
          <CommonListItem
            primaryLabel="Binance Smart Chain"
            startIcon={<IconBinance className={classes.iconMedium} />}
            endIcon={<IconArrow />}
          />
          <CommonListItem primaryLabel="Polygon" startIcon={<IconPolygon className={classes.iconMedium} />} endIcon={<IconArrow />} />
        </List>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Chips</ShowcaseTitle>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            my: -0.5,
            mx: -0.25,
          }}
        >
          {NETWORKS.map(networkItem => (
            <NetworkChip
              key={networkItem.chainId}
              chainId={networkItem.chainId}
              label={networkItem.name}
              disabled={networkItem.chainId !== ETHEREUM_MAINNET_CHAIN_ID}
              onClick={() => (window as any).alert(networkItem.chainId)}
              sx={{ my: 0.5, mx: 0.25 }}
            />
          ))}
        </Box>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Stats</ShowcaseTitle>
        <Box sx={{ width: "100%" }}>
          <EqualWidthSplitColumns
            left={
              <>
                <InfoPair caption="Max Supply" value="21 million BTC" />
                <InfoPair caption="Market Cap" value="$1.1 trillion" />
                <InfoPair caption="Circulation supply" value="19 million BTC" />
              </>
            }
            right={
              <>
                <InfoPair caption="Fully Diluted MCap" value="$1.1 trillion" />
                <InfoPair caption="Total Value Locked" value="19 million" />
                <InfoPair caption="Total Holders" value="39,632.064" />
              </>
            }
          />
        </Box>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Copy to clipboard</ShowcaseTitle>
        <Box sx={{ width: "100%" }}>
          <Link href="https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" target="_blank">
            0xc02a...6cc2
          </Link>
          <Box component="span" ml={0.5}>
            <CopyToClipboard text="https://etherscan.io/address/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" />
          </Box>
        </Box>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Tabs</ShowcaseTitle>
        <Box sx={{ width: "100%" }}>
          <Tabs value={coinPageTab} onChange={(event, newTab) => setCoinPageTab(newTab)} variant="fullWidth">
            <Tab label="My Holdings" />
            <Tab label="Transactions" />
          </Tabs>
          {coinPageTab === 0 && <Box sx={{ color: theme.palette.text.primary }}>My Holdings</Box>}
          {coinPageTab === 1 && <Box sx={{ color: theme.palette.text.primary }}>Transactions</Box>}
        </Box>
        <Box mt={2} sx={{ width: "100%" }}>
          <Tabs value={marketPageTab} onChange={(event, newTab) => setMarketPageTab(newTab)} variant="fullWidth">
            <Tab label="Coins" />
            <Tab label="NFTs" />
          </Tabs>
          {marketPageTab === 0 && <Box sx={{ color: theme.palette.text.primary }}>Coins</Box>}
          {marketPageTab === 1 && <Box sx={{ color: theme.palette.text.primary }}>NFTs</Box>}
        </Box>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Copyable Link</ShowcaseTitle>
        <CopyableLink text="go to Google" link="https://www.google.com" />
      </ShowcaseBox>

      <ShowcaseBox alignItems="inherit">
        <ShowcaseTitle textAlign="center">Header</ShowcaseTitle>
        <Header
          title="This is title"
          onBackClick={() => alert("on Back Click triggerd")}
          onCloseClick={() => alert("on Close Click triggerd")}
        />
      </ShowcaseBox>

      <ShowcaseBox>
        <ShowcaseTitle>Checkbox</ShowcaseTitle>
        <Checkbox />
      </ShowcaseBox>

      <ShowcaseBox>
        <ShowcaseTitle>Search</ShowcaseTitle>
        <ShowcaseTitle variant="subtitle1">Normal Width</ShowcaseTitle>
        <Search />
        <ShowcaseTitle variant="subtitle1">Full Width</ShowcaseTitle>
        <Search fullWidth />
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Transactions Item Coin</ShowcaseTitle>
        <ShowcaseTitle variant="subtitle1">With Status Done</ShowcaseTitle>
        <TokenTransactionListItem
          item={
            mapTokenTransactionsToTokenTransactionRenderData([
              {
                __typename: "EthereumAccountETHTransaction",
                methodID: "0x0",
                txIndex: 53,
                fee: "0.0024",
                value: "1.03",
                failed: false,
                side: "receiver",
                valueUSD: "374.9033",
                blockNumber: 10847482,
                timestamp: 1599918414,
                accountAddress: "0x31a243599D6d3c6Bc81460d5ca9538e8b6Dd2762",
                secondSideAddress: "0x44F86B87611743b41cB4b73eF8C5249b53Aa65A9",
                txHash: "0xe9a8dd44a997db857bdcf386c8a2702b9e42740e412ba6f52c39175f7574c8a6",
                networkIdentifier: "evm::1",
              } as EthereumAccountTransaction & { networkIdentifier: string },
            ])[0]
          }
        />
        <ShowcaseTitle variant="subtitle1">With Status Failed</ShowcaseTitle>
        <TokenTransactionListItem
          item={
            mapTokenTransactionsToTokenTransactionRenderData([
              {
                __typename: "EthereumAccountETHTransaction",
                methodID: "0x0",
                txIndex: 53,
                fee: "0.0024",
                value: "1.03",
                failed: true,
                side: "receiver",
                valueUSD: "374.9033",
                blockNumber: 10847482,
                timestamp: 1599918414,
                accountAddress: "0x31a243599D6d3c6Bc81460d5ca9538e8b6Dd2762",
                secondSideAddress: "0x44F86B87611743b41cB4b73eF8C5249b53Aa65A9",
                txHash: "0xe9a8dd44a997db857bdcf386c8a2702b9e42740e412ba6f52c39175f7574c8a6",
                networkIdentifier: "evm::1",
              } as EthereumAccountTransaction & { networkIdentifier: string },
            ])[0]
          }
        />
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Confirm Modal</ShowcaseTitle>
        <Button variant="contained" fullWidth onClick={handleShowConfirmModal}>
          Show Confirm Modal
        </Button>
        <ConfirmationModal
          show={showConfirmModal}
          title="Test Confirm"
          description="Description Confirm"
          onCancel={handleShowConfirmModal}
          onConfirm={handleShowConfirmModal}
          fullWidth={true}
        />
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Typography</ShowcaseTitle>
        <Typography variant="small">
          TypoSmall: fz{"12px"} lh{"16px"} lsp{"0.4px"}
        </Typography>
        <Typography variant="medium">
          TypoMedium: fz{"14px"} lh{"20px"} lsp{"0.25px"}
        </Typography>
        <Typography variant="large">
          TypoLarge: fz{"16px"} lh{"24px"} lsp{"0.5px"}
        </Typography>
        <Typography variant="headingSmall">
          TypoHeadingSmall: fw{500} fz{"20px"} lh{"24px"} lsp{"0.15px"}
        </Typography>
        <Typography variant="headingMedium">
          TypoHeadingMedium: fw{500} fz{"28px"} lh{"36px"} lsp{"0.18px"}
        </Typography>
      </ShowcaseBox>
      <ShowcaseBox>
        <ShowcaseTitle>Token Identity</ShowcaseTitle>
        <TokenIdentity
          primary="BTC"
          src="https://storage.googleapis.com/aurox-coin-icons/color/161.svg"
          alt="BTC"
          networkIdentifier="evm::1"
          spacing={1}
        />
        <Divider sx={{ height: 0 }} />
        <TokenIdentity
          primary="BTC"
          primaryVariant="small"
          src="https://storage.googleapis.com/aurox-coin-icons/color/161.svg"
          alt="BTC"
          iconVariant="medium"
          spacing={1}
        />
        <Divider sx={{ height: 0 }} />
        <TokenIdentity
          primary="BTC"
          primaryVariant="large"
          src="https://storage.googleapis.com/aurox-coin-icons/color/161.svg"
          alt="BTC"
          iconVariant="x-large"
          spacing={1}
        />
        <Divider sx={{ height: 0 }} />
        <TokenIdentity
          primary="BTC"
          primaryVariant="medium"
          src="https://storage.googleapis.com/aurox-coin-icons/color/161.svg"
          alt="BTC"
          iconVariant="large"
          networkIdentifier="evm::1"
          spacing={1.5}
        />
        <Divider sx={{ height: 0 }} />
        <TokenIdentity
          primary="BTC"
          primaryVariant="medium"
          secondary="X-Chain Swapping Coming Soon"
          disabled
          src="https://storage.googleapis.com/aurox-coin-icons/color/161.svg"
          alt="BTC"
          iconVariant="large"
          networkIdentifier="evm::1"
          spacing={1.5}
        />
      </ShowcaseBox>
    </>
  );
};

export default Library;
