import { ReactNode } from "react";

import makeStyles from "@mui/styles/makeStyles";

import { Box, List, ListItem, ListItemText, Typography, Theme, Avatar, Stack } from "@mui/material";

import { getFavicon } from "ui/common/utils";

import CopyableText from "ui/components/clipboard/CopyableText";

const useStyles = makeStyles((theme: Theme) => ({
  list: {
    border: `1px solid ${theme.palette.custom.grey["19"]}`,
    borderRadius: "10px",
    width: "100%",

    "& li": {
      "& .MuiTypography-root": {
        fontSize: "14px",
        lineHeight: theme.typography.pxToRem(20),
        fontWeight: 400,
        letterSpacing: theme.typography.pxToRem(0.25),
      },

      "& .MuiListItemText-secondary": {
        marginLeft: "3.5rem",
        fontSize: "12px",
        letterSpacing: theme.typography.pxToRem(0.4),
        lineHeight: theme.typography.pxToRem(16),
      },

      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: "11px",
      marginTop: "5px",
    },
  },
}));

export interface TokenContractInfoProps {
  dappUrl: string;
  actionType: string;
  contractAddress: string;
  children?: ReactNode;
}

export default function TokenContractInfo(props: TokenContractInfoProps) {
  const classes = useStyles();
  const { dappUrl, actionType, contractAddress, children } = props;

  const iconUrl = getFavicon(dappUrl, 64);

  const dappDetails = (
    <Stack alignItems="center" flexDirection="row">
      <Typography mr={0.5}>Protocol:</Typography>
      <Avatar src={iconUrl} sx={{ width: "16px", height: "16px" }} />
      <Typography>{dappUrl}</Typography>
    </Stack>
  );

  const dappContractDetails = (
    <Stack flexDirection="row" alignItems="center">
      <Typography mr={1}>Contract:</Typography>
      <CopyableText text={contractAddress} />
    </Stack>
  );

  return (
    <Box>
      <Typography variant="medium" mt={2}>
        Contract Info
      </Typography>
      <Box mt="6px">
        <List className={classes.list} dense>
          <ListItem>
            <ListItemText disableTypography primary={dappDetails} />
          </ListItem>
          <ListItem>
            <ListItemText disableTypography primary={<Typography variant="inherit">Action: {actionType} </Typography>} />
          </ListItem>
          <ListItem>
            <ListItemText disableTypography primary={dappContractDetails} />
          </ListItem>
          <ListItem>{children}</ListItem>
        </List>
      </Box>
    </Box>
  );
}
