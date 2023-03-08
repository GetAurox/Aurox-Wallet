import { Box, List, listClasses, ListItem, listItemClasses, ListItemText, Theme, Typography } from "@mui/material";

import { useConsolidatedAccountsInfo } from "ui/hooks";

import DefaultControls from "ui/components/controls/DefaultControls";

import ConnectAccountOptions from "./ConnectAccountOptions";

const sxStyles = {
  list: {
    [`&.${listClasses.root}`]: {
      p: 0,
    },
  },
  listItem: {
    [`&.${listItemClasses.root}`]: {
      pt: "13px",
      pb: "11px",
      px: 0,
    },
    "& + &": {
      borderTop: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
    },
  },
  connectAccountOptions: {
    mb: "25px",
  },
};

export interface ConnectPermissionProps {
  accountUUID: string;
  onBack: () => void;
  onConnectionAccepted: () => void;
}

const dappPermissions = [
  { title: "Get Wallet Address", description: "The dApp can get your public wallet address" },
  { title: "View Account Balance", description: "The dApp can query your wallet balance" },
  { title: "See Recent Activity", description: "The dApp can see your recent wallet transactions" },
  { title: "Suggest Transactions to Submit", description: "the dApp can suggest transactions to submit" },
];

export default function ConnectPermission(props: ConnectPermissionProps) {
  const { accountUUID, onBack, onConnectionAccepted } = props;

  const accounts = useConsolidatedAccountsInfo("evm");
  const account = accounts?.find(account => account.uuid === accountUUID);

  return (
    <>
      <Box mx={2}>
        <Typography variant="headingSmall" component="h5" mt={3} mb="15px">
          Connect with:
        </Typography>
        {account && <ConnectAccountOptions account={account} sx={sxStyles.connectAccountOptions} />}
        <Typography variant="headingSmall" component="h5" mb="3px">
          Allow this site to:
        </Typography>
        <List sx={sxStyles.list}>
          {dappPermissions.map(dappPermission => (
            <ListItem key={dappPermission.title} sx={sxStyles.listItem}>
              <ListItemText
                disableTypography
                primary={
                  <Typography component="h6" variant="large" fontWeight={500} lineHeight={20 / 16}>
                    {dappPermission.title}
                  </Typography>
                }
                secondary={<Typography variant="medium">{dappPermission.description}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <DefaultControls primary="Connect" onPrimary={onConnectionAccepted} secondary="Back" onSecondary={onBack} />
    </>
  );
}
