import { MouseEvent, ReactNode } from "react";

import { Box, Stack, Theme, Button, ListItem, ListItemText, ListItemIcon, ListItemButton, Typography, Chip } from "@mui/material";

import { AccountInfo } from "common/types";

import { useHistoryPush } from "ui/common/history";
import { formatPrice } from "ui/common/utils";
import {
  useActiveAccountUUID,
  useNSResolveDomainFromAddress,
  useAccountPortfolioUSDValue,
  useVisibleTokensDisplayWithTickers,
} from "ui/hooks";

import CopyableText from "ui/components/clipboard/CopyableText";
import { IconArrow, IconWalletConnected } from "ui/components/icons";
import TokenIconDisplay from "ui/components/entity/token/TokenIconDisplay";

const sxStyles = {
  listItemButton: {
    pt: 1.5,
    pr: 2,
    pb: 2,
    pl: 1.5,
  },
  actionButtons: {
    "&.MuiButtonBase-root": {
      fontSize: "14px",
      minWidth: "fit-content",
      lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
      letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
    },
    "&.MuiButton-sizeMedium": {
      padding: 0,
      borderRadius: 1,
    },
  },
  icon: {
    "& > svg > path": {
      stroke: (theme: Theme) => theme.palette.custom.grey["19"],
    },
  },
  iconActive: {
    "& > svg > path": {
      stroke: (theme: Theme) => theme.palette.primary.main,
    },
  },
  typeLabel: {
    fontSize: "12px",
    textTransform: "capitalize",
  },
};

export interface AccountManageItemProps {
  account: AccountInfo;
  isConnected?: boolean;
  addressDisplay: string;
  hideNextIcon?: boolean;
  skipIsActive?: boolean;
  hideActionButtons?: boolean;
  onHide?: (account: AccountInfo) => void;
  onClick?: (account: AccountInfo) => void;
}

export default function AccountManageItem(props: AccountManageItemProps) {
  const {
    onHide,
    onClick,
    account,
    addressDisplay,
    isConnected = false,
    skipIsActive = false,
    hideNextIcon = false,
    hideActionButtons = false,
  } = props;

  const push = useHistoryPush();

  const activeAccountUUID = useActiveAccountUUID();

  const handleItemClick = async (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    event.stopPropagation();

    onClick?.(account);
  };

  const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    push(`/manage/edit/${account.uuid}`);
  };

  const toggleHidden = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    onHide?.(account);
  };

  const isActive = account.uuid === activeAccountUUID && !skipIsActive;

  const tokens = useVisibleTokensDisplayWithTickers(account.uuid);

  const portfolioUSDValue = useAccountPortfolioUSDValue(account.uuid);

  const { domain, loading: loadingDomain } = useNSResolveDomainFromAddress({ address: addressDisplay });

  let typeLabel: string | null = null;

  if (account.type === "private-key" || (account.type === "mnemonic" && account?.imported)) {
    typeLabel = "imported";
  } else if (account.type === "hardware") {
    typeLabel = account.hardwareType;
  }

  let domainRender: ReactNode = null;

  if (domain && !loadingDomain) {
    domainRender = (
      <Typography variant="medium" color="text.secondary">
        (
        <Typography component="span" maxWidth={150} overflow="hidden" textOverflow="ellipsis" title={domain}>
          {domain}
        </Typography>
        )
      </Typography>
    );
  }

  return (
    <>
      <ListItem
        disablePadding
        sx={{
          border: "1px solid",
          borderRadius: "10px",
          borderColor: (theme: Theme) => `${isActive ? theme.palette.primary.main : theme.palette.custom.grey["19"]}`,
        }}
      >
        <ListItemButton role={undefined} onClick={handleItemClick} dense sx={sxStyles.listItemButton}>
          <ListItemText
            disableTypography
            primary={
              <>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" columnGap={0.5} mb="2px">
                    <Typography noWrap fontSize={16} lineHeight={24 / 16} variant="headingSmall">
                      {account.alias}
                    </Typography>
                    {isConnected && <IconWalletConnected />}
                  </Stack>
                  {typeLabel && <Chip size="small" sx={{ ...sxStyles.typeLabel, mr: hideNextIcon ? 0 : -3 }} label={typeLabel} />}
                </Stack>
                <CopyableText text={addressDisplay} />
                {domainRender}
                <Typography display="block" variant="headingSmall" mt={0.5} fontSize={14} lineHeight={20 / 14} letterSpacing="0.1px">
                  {portfolioUSDValue ? `$${formatPrice(portfolioUSDValue)}` : ""}
                </Typography>
                <TokenIconDisplay tokens={tokens} mb={0} />
              </>
            }
            secondary={
              <Box mt={1.5}>
                {!hideActionButtons && (
                  <Stack direction="row" gap={2}>
                    <Button color="primary" variant="text" sx={sxStyles.actionButtons} onClick={handleEdit}>
                      Edit
                    </Button>
                    <Button color="inherit" variant="text" sx={sxStyles.actionButtons} onClick={toggleHidden}>
                      {account.hidden ? "Unhide" : "Hide"}
                    </Button>
                  </Stack>
                )}
              </Box>
            }
          />
          {!hideNextIcon && (
            <ListItemIcon sx={isActive ? sxStyles.iconActive : sxStyles.icon}>
              <IconArrow />
            </ListItemIcon>
          )}
        </ListItemButton>
      </ListItem>
    </>
  );
}
