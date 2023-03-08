import { Divider, Tooltip, ListItem, ListItemButton, ListItemAvatar, ListItemText, tooltipClasses, Typography } from "@mui/material";
import { InfoOutlined as InfoOutlinedIcon } from "@mui/icons-material";

import { useImperativeTicker } from "ui/common/connections";
import { formatAbbreviated } from "ui/common/utils";

import { GraphQLMarketsAPICoin } from "ui/types";

import TokenAvatar from "ui/components/common/TokenAvatar";

import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";

import TooltipContent from "./TooltipContent";
import IconButtonFavorites from "./IconButtonFavorites";
import ListItemTextTicker from "./ListItemTextTicker";

const sxStyles = {
  favoriteButton: {
    p: 0,
  },
  listItemText: {
    display: "grid",
    gap: "2px",
  },
  listItemAvatar: {
    minWidth: 40,
  },
  listItemButton: {
    pl: 1,
    py: "13px",
    columnGap: 1,
    maxHeight: BASIC_LIST_ITEM_HEIGHT,
    display: "flex",
  },
  mCap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  tooltip: {
    [`& .${tooltipClasses.tooltip}`]: {
      py: 1,
      pr: 2,
      pl: 0.5,
      margin: 0,
      borderRadius: 2.5,
    },
  },
  tooltipIcon: {
    ml: 0.5,
  },
  blinker: {
    top: 8,
    right: 2,
  },
  divider: {
    height: 0,
  },
};

export interface MarketTokenListItemProps {
  token: GraphQLMarketsAPICoin;
  onClick: () => void;
}

export default function MarketTokenListItem(props: MarketTokenListItemProps) {
  const { token, onClick } = props;

  const pairId = token?.tokens?.filter(item => item.pairId > 0)[0]?.pairId || null;

  const ticker = useImperativeTicker(pairId);

  return (
    <>
      <ListItem disablePadding alignItems="center">
        <ListItemButton sx={sxStyles.listItemButton} onClick={onClick}>
          <IconButtonFavorites assetId={token.tokens?.[0]?.assetId} />
          <Typography variant="medium" lineHeight="24px" fontWeight={500} letterSpacing="0.1px" mr={1}>
            {token.r}
          </Typography>
          <ListItemAvatar sx={sxStyles.listItemAvatar}>
            <TokenAvatar tokenIconSize={36} src={token.i?.c ?? undefined} alt={token.fn} />
          </ListItemAvatar>

          <ListItemText
            disableTypography
            sx={sxStyles.listItemText}
            primary={
              <Typography variant="large" maxWidth="9ch" noWrap fontWeight={500} lineHeight="20px">
                {token.sn}
              </Typography>
            }
            secondary={
              <Typography variant="medium" color="text.secondary">
                {token.fn}
              </Typography>
            }
          />
          <ListItemText
            disableTypography
            sx={sxStyles.listItemText}
            primary={<ListItemTextTicker ticker={ticker} />}
            secondary={
              <Typography variant="medium" textAlign="right" color="text.secondary" sx={sxStyles.mCap}>
                MCap ${formatAbbreviated(token.mc)}
                <Tooltip
                  placement="top"
                  PopperProps={{ sx: sxStyles.tooltip }}
                  title={<TooltipContent volume={token.v24} supply={token.ts} />}
                >
                  <InfoOutlinedIcon fontSize="small" sx={sxStyles.tooltipIcon} />
                </Tooltip>
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>
      <Divider component="li" sx={sxStyles.divider} variant="middle" />
    </>
  );
}
