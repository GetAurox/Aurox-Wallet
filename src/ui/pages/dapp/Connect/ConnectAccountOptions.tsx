import { ReactNode } from "react";

import { Box, Chip, Stack, SxProps, Theme, Typography } from "@mui/material";

import { ConsolidatedAccountInfo } from "common/types";

import { formatPrice, mixSx } from "ui/common/utils";
import { useAccountPortfolioUSDValue, useNSResolveDomainFromAddress, useVisibleTokensDisplayWithTickers } from "ui/hooks";

import CopyableText from "ui/components/clipboard/CopyableText";
import TokenIconDisplay from "ui/components/entity/token/TokenIconDisplay";

import { IconRadioOn, IconRadioOff } from "ui/components/icons";

const sxStyles = {
  root: {
    width: 1,
    pt: 1.5,
    pr: 2,
    pb: 2,
    pl: 1.5,
    border: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
    borderRadius: "10px",
  },
  selected: {
    borderColor: (theme: Theme) => theme.palette.primary.main,
  },
  main: {
    overflow: "hidden",
    whiteSpace: "nowrap",
    justifyContent: "space-between",
    mb: "2px",
  },
  alias: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 24 / 16,
    textOverflow: "ellipsis",
  },
  balance: {
    flexGrow: 0,
    flexShrink: 0,
    ml: 1,
    fontSize: 16,
    lineHeight: 24 / 16,
  },
  typeLabel: {
    fontSize: "12px",
    textTransform: "capitalize",
  },
};

export interface ConnectAccountOptionsProps {
  account: ConsolidatedAccountInfo;
  selected?: boolean;
  onSelect?: (uuid: string) => void;
  sx?: SxProps<Theme>;
}

export default function ConnectAccountOptions(props: ConnectAccountOptionsProps) {
  const { account, selected, onSelect, sx } = props;

  const tokens = useVisibleTokensDisplayWithTickers(account.uuid);

  const portfolioUSDValue = useAccountPortfolioUSDValue(account.uuid);

  const { domain, loading: loadingDomain } = useNSResolveDomainFromAddress({ address: account.address });

  const handleClick = () => {
    onSelect?.(account.uuid);
  };

  let domainRender: ReactNode = null;
  let typeLabel: string | null = null;

  if (account.type === "private-key") {
    typeLabel = "imported";
  } else if (account.type === "hardware") {
    typeLabel = account.type;
  }

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
    <Stack direction="row" onClick={handleClick} sx={mixSx(sxStyles.root, selected ? sxStyles.selected : undefined, sx)}>
      {typeof selected === "boolean" && <Box mr={1}>{selected ? <IconRadioOn /> : <IconRadioOff />}</Box>}
      <Stack flex={1}>
        <Stack direction="row" sx={sxStyles.main}>
          <Stack direction="row" alignItems="center" columnGap={1}>
            <Typography variant="headingSmall" sx={sxStyles.alias}>
              {account.alias}
            </Typography>
            {typeLabel && <Chip size="small" sx={sxStyles.typeLabel} label={typeLabel} />}
          </Stack>
          <Typography variant="headingSmall" sx={sxStyles.balance}>
            ${formatPrice(portfolioUSDValue ?? 0)}
          </Typography>
        </Stack>
        <CopyableText text={account.address} />
        {domainRender}
        {tokens && <TokenIconDisplay tokens={tokens} mb={0} />}
      </Stack>
    </Stack>
  );
}
