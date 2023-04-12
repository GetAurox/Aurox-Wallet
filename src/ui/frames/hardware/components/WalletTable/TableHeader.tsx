import { Checkbox, Box, Typography, Stack } from "@mui/material";

const sxStyles = {
  root: {
    width: "100%",
    minWidth: "720px",
    alignItems: "center",
    marginBottom: "8px",
    height: "42px",
    flexDirection: "row",
  },
  row: {
    marginLeft: "15px",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
  },
  offset: {
    width: "45px",
  },
};

export interface TableHeaderProps {
  onClickCheckAll: () => void;
  isAllChecked: boolean;
  isImportedWalletTab?: boolean;
}

export default function TableHeader(props: TableHeaderProps) {
  const { onClickCheckAll, isAllChecked, isImportedWalletTab = false } = props;

  return (
    <Stack sx={sxStyles.root}>
      {!isImportedWalletTab ? <Checkbox checked={isAllChecked} onChange={onClickCheckAll} /> : <Box sx={sxStyles.offset} />}
      <Stack sx={sxStyles.row}>
        <Box width="140px">
          <Typography color="text.secondary">Address</Typography>
        </Box>
        {isImportedWalletTab && (
          <Box width="130px">
            <Typography align="center" color="text.secondary">
              Name
            </Typography>
          </Box>
        )}
        <Box width="170px">
          <Typography align="center" color="text.secondary">
            Amount
          </Typography>
        </Box>
        <Box width="188px">
          <Typography align="center" color="text.secondary">
            Coins
          </Typography>
        </Box>
        <Box width="188px">
          <Typography align="center" color="text.secondary">
            Explorers
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
