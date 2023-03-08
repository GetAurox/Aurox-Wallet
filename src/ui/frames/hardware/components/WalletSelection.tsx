import { useState, useEffect, useMemo } from "react";
import { v4 as uuid4 } from "uuid";
import maxBy from "lodash/maxBy";

import {
  Box,
  Stack,
  Button,
  Typography,
  Select,
  MenuItem,
  CircularProgress,
  SxProps,
  styled,
  typographyClasses,
  TypographyProps,
  Theme,
} from "@mui/material";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import SearchField from "ui/components/form/SearchField";

import { getHardwareAddressHandler, HdPath, TrezorHelpers } from "common/wallet";
import { HardwareSignerType } from "common/types";
import { Wallet } from "common/operations";

import { useAccountsOfType, useIsWalletUnlocked } from "ui/hooks";

import WalletModal from "./WalletsModal";
import WalletTable from "./WalletTable";

interface WalletSelectionProps {
  hardwareWallet: HardwareSignerType;

  handleReturn: () => void;
}

type TabOption = "availableWalletsTab" | "importedWalletsTab";

const Spinner = ({ sx }: { sx?: SxProps<Theme> }) => (
  <Box sx={{ width: "100%", display: "flex", justifyContent: "center", ...(sx ?? {}) }}>
    <CircularProgress size={50} sx={{ margin: "auto" }} />
  </Box>
);

const TabButton = styled(({ current, ...rest }: TypographyProps & { current?: boolean }) => <Typography {...rest} />)(
  ({ current, theme }) => ({
    [`&.${typographyClasses.root}`]: {
      color: current ? theme.palette.primary.main : theme.palette.text.secondary,
      borderBottom: `2px solid ${current ? theme.palette.primary.main : "transparent"}`,
      cursor: "pointer",
      padding: "8px 12px",
    },
  }),
);

const style = {
  select: {
    margin: "20px 0",
    height: "32px",
    borderRadius: "10px",
    background: (theme: Theme) => theme.palette.custom.grey["19"],
    border: "none !important",
  },
  selection: {
    borderBottom: 1,
    borderColor: "divider",
    mb: "20px",
    justifyContent: "space-between",
    fontSize: "14px",
    minWidth: "700px",
  },
  importButton: {
    ml: 1,
    height: "32px",
    width: "100px",
    fontSize: "14px",
  },
  loaderWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    mt: "200px",
  },
  availableWallets: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    mt: "100px",
  },
  loadMoreWrap: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    mt: "30px",
  },
  searchField: {
    inputBase: {
      height: "32px",
      fontSize: "14px",
    },
  },
};

function getDefaultHDPath(hardwareWallet: HardwareSignerType): HdPath {
  if (hardwareWallet === "ledger") return "Ledger Live";

  return "Bip44 Standard (e.g. Metamask, Trezor)";
}

const WalletSelection = ({ hardwareWallet, handleReturn }: WalletSelectionProps) => {
  const [hdPath, setHdPath] = useState<HdPath>(getDefaultHDPath(hardwareWallet));
  const [currentTab, setCurrentTab] = useState<TabOption>("availableWalletsTab");
  const [searchValue, setSearchValue] = useState("");
  const [deviceWallets, setDeviceWallets] = useState<Wallet.ImportHardwareSigner.Data[]>([]);
  const [selectedWallets, setSelectedWallets] = useState<Wallet.ImportHardwareSigner.Data[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isImported, setIsImported] = useState(false);
  const [error, setError] = useState("");

  const importedWallets = Object.values(useAccountsOfType("hardware") ?? {});

  const isUnlocked = useIsWalletUnlocked();

  const availableWallets = useMemo(() => {
    if (!importedWallets) return deviceWallets;

    return deviceWallets.filter(deviceWallet => !importedWallets.find(importedWallet => importedWallet.address === deviceWallet.address));
  }, [deviceWallets, importedWallets]);

  const loadMoreAddresses = async (path: HdPath) => {
    setError("");
    setIsLoadingMore(true);

    const lastWallet = maxBy(deviceWallets, "accountNumber");

    const startIndex = lastWallet ? lastWallet.accountNumber + 1 : 0;

    try {
      const details = await getHardwareAddressHandler(hardwareWallet, startIndex, path);

      setDeviceWallets(wallets => {
        wallets.push(...details);

        return wallets;
      });
    } catch (e) {
      setError(e?.message ?? "Error fetching more wallet details");
    }

    setIsLoadingMore(false);
  };

  const loadAndResetAddresses = async (path: HdPath) => {
    setError("");
    setIsLoading(true);

    try {
      const details = await getHardwareAddressHandler(hardwareWallet, 0, path);

      setDeviceWallets(details);
    } catch (e) {
      setError(e?.message ?? "Error loading wallet details");
    }

    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      // initialize the manifest
      if (hardwareWallet === "trezor") {
        TrezorHelpers.TrezorManifest.initialize();
      }
      // set a timeout for 15 seconds
      const timeout = setTimeout(() => setIsLoading(false), 15000);

      await loadAndResetAddresses(hdPath);

      return () => clearTimeout(timeout);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardwareWallet]);

  const returnSearchResult = (wallets: Wallet.ImportHardwareSigner.Data[]) => {
    if (!searchValue) return wallets;

    return wallets.filter(wallet => wallet.address.includes(searchValue));
  };

  const onClickCheck = (wallet: Wallet.ImportHardwareSigner.Data) => {
    const index = selectedWallets.indexOf(wallet);
    if (index === -1) {
      setSelectedWallets(prevState => [...prevState, wallet]);
    } else {
      setSelectedWallets(prevState => prevState.filter(thisWallet => thisWallet !== wallet));
    }
  };
  const onClickCheckAll = (list: Wallet.ImportHardwareSigner.Data[]) => {
    if (list.length !== selectedWallets.length) {
      setSelectedWallets(list);
    } else {
      setSelectedWallets([]);
    }
  };

  const onClickImport = async () => {
    for (const wallet of selectedWallets) {
      await Wallet.ImportHardwareSigner.perform({
        type: "hardware",
        hardwareType: hardwareWallet,
        address: wallet.address,
        accountNumber: wallet.accountNumber,
        alias: wallet.alias || `${hardwareWallet} account ${wallet.accountNumber}`,
        hidden: wallet.hidden,

        chainType: "evm",
        uuid: uuid4(),
        path: wallet.path,
      });
    }

    setSelectedWallets([]);
    setIsImported(true);
    setCurrentTab("importedWalletsTab");
  };

  const onClickTab = (tab: TabOption) => {
    setCurrentTab(tab);
  };

  const onChangeSearchValue = (value: string) => {
    setSearchValue(value);
  };

  const onSelectHdPath = async (newPath: HdPath) => {
    setHdPath(newPath);
    setSelectedWallets([]);
    await loadAndResetAddresses(newPath);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModalClick = () => {
    setIsModalOpen(false);
    setIsImported(false);
  };

  return (
    <Box maxWidth="1100px" width="100%" minWidth="700px" margin="auto" paddingX={5}>
      <Button onClick={handleReturn} startIcon={<ArrowBackIosIcon />} sx={{ marginY: "20px" }}>
        <Typography color="text.primary" fontWeight={500} fontSize="20px" sx={{ textTransform: "capitalize" }}>
          {hardwareWallet}
        </Typography>
      </Button>
      <Typography component="p" variant="headingSmall" my="10px">
        Select HD Path
      </Typography>

      {!isUnlocked && (
        <Typography color="red" fontWeight={500} fontSize="20px" lineHeight="24px" letterSpacing="0.15px" sx={{ marginY: "10px" }}>
          Account Locked
        </Typography>
      )}

      <Typography component="p" variant="medium" color="text.secondary" marginTop="20px">
        If you don&#39;t see the accounts you expect, try switching the HD path
      </Typography>
      <Select disableUnderline notched onChange={e => onSelectHdPath(e.target.value as HdPath)} defaultValue={hdPath} sx={style.select}>
        <MenuItem value="Ledger Live" key="Ledger Live">
          Ledger Live
        </MenuItem>
        <MenuItem value="Legacy (MEW / MyCrypto)" key="Legacy (MEW / MyCrypto)">
          Legacy (MEW / MyCrypto)
        </MenuItem>
        <MenuItem value="Bip44 Standard (e.g. Metamask, Trezor)" key="Bip44">
          Bip44 Standard (e.g. Metamask, Trezor)
        </MenuItem>
      </Select>
      <Box sx={{ width: "100%" }}>
        <Box display="flex" sx={style.selection}>
          <Box display="flex">
            <TabButton current={currentTab === "availableWalletsTab"} onClick={() => onClickTab("availableWalletsTab")}>
              Select an Account
            </TabButton>
            <TabButton current={currentTab === "importedWalletsTab"} onClick={() => onClickTab("importedWalletsTab")}>
              Imported
            </TabButton>
          </Box>
          <Box display="flex">
            <SearchField
              value={searchValue}
              sx={style.searchField}
              placeholder="Search by Address"
              onClear={() => onChangeSearchValue("")}
              onChange={e => onChangeSearchValue(e.target.value)}
            />
            {/* <Select
              label="Sort by"
              sx={{
                height: "32px",
                background: (theme: Theme) => theme.palette.custom.grey["19"],
                borderRadius: "10px",
                ml: 1,
                color: "white",
              }}
            >
              <MenuItem color="white" value="accending">
                Accending
              </MenuItem>
              <MenuItem color="white" value="descending">
                Descending
              </MenuItem>
            </Select> */}
            {currentTab === "availableWalletsTab" && (
              <Button
                size="small"
                color="primary"
                variant="contained"
                sx={style.importButton}
                onClick={openModal}
                disabled={selectedWallets.length === 0}
              >
                Import
              </Button>
            )}
          </Box>
        </Box>
        {isLoading && <Spinner sx={{ marginTop: "200px" }} />}
        {!isLoading && currentTab === "availableWalletsTab" && (
          <>
            <WalletTable
              wallets={returnSearchResult(availableWallets)}
              selectedWallets={selectedWallets}
              onClickCheckAll={() => onClickCheckAll(availableWallets)}
              onClickCheck={wallet => onClickCheck(wallet)}
            />
            {deviceWallets.length === 0 && (
              <Stack sx={{ width: "100%", alignItems: "center", justifyContent: "center", marginTop: "100px" }}>
                <Typography color="text.secondary" fontSize="24px" textAlign="center" marginBottom="20px">
                  No wallets detected
                </Typography>
                <Typography color="text.secondary" fontSize="16px" textAlign="center">
                  Please make sure your hardware wallet is connected
                </Typography>
                <Typography color="text.secondary" fontSize="16px" textAlign="center">
                  or
                </Typography>
                <Typography color="text.secondary" fontSize="16px" textAlign="center">
                  Please try switching the HD path
                </Typography>
                <Button variant="outlined" sx={{ width: "300px", marginTop: "50px" }} onClick={() => loadAndResetAddresses(hdPath)}>
                  Retry
                </Button>

                {error && (
                  <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Typography
                      color="red"
                      fontWeight={500}
                      fontSize="15px"
                      lineHeight="24px"
                      letterSpacing="0.15px"
                      sx={{ marginY: "10px" }}
                    >
                      {error}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
            {deviceWallets.length > 0 && isLoadingMore && <Spinner sx={{ marginTop: "50px", marginBottom: "50px" }} />}
            {deviceWallets.length > 0 && !isLoadingMore && (
              <Box sx={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "30px" }}>
                <Button variant="outlined" sx={{ width: "300px" }} onClick={() => loadMoreAddresses(hdPath)}>
                  Load more
                </Button>
              </Box>
            )}
          </>
        )}
        {!isLoading && currentTab === "importedWalletsTab" && (
          <WalletTable
            wallets={returnSearchResult(Object.values(importedWallets) ?? [])}
            selectedWallets={selectedWallets}
            onClickCheckAll={() => onClickCheckAll(availableWallets)}
            onClickCheck={wallet => onClickCheck(wallet)}
            isImportedWalletTab
          />
        )}
      </Box>
      <WalletModal
        open={isModalOpen}
        onCloseClick={handleCloseModalClick}
        selectedWallets={selectedWallets}
        onClickImport={onClickImport}
        setSelectedWallets={setSelectedWallets}
        isImported={isImported}
      />
    </Box>
  );
};

export default WalletSelection;
