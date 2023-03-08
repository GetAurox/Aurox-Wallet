import { Typography, Box } from "@mui/material";

import { IconMoneyTransfer } from "ui/components/icons";

const sxStyles = {
  icon: {
    width: "63px",
    height: "101px",
  },

  typography: {
    lineHeight: "24px",
    textAlign: "center",
    letterSpacing: "0.15px",
  },
};

export interface EmptyListProps {
  text: string;
}

export default function EmptyList(props: EmptyListProps) {
  const { text } = props;

  return (
    <Box
      gap="19px"
      mt={2}
      mb={2}
      flexGrow={1}
      display="flex"
      component="section"
      alignItems="center"
      color="text.primary"
      flexDirection="column"
      justifyContent="center"
    >
      <IconMoneyTransfer viewBox="0 0 63 101" style={sxStyles.icon} />
      <Typography sx={sxStyles.typography}>{text}</Typography>
    </Box>
  );
}
