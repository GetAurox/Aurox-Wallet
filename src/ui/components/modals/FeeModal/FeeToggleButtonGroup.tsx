import { styled, ToggleButtonGroup, toggleButtonGroupClasses } from "@mui/material";

const FeeToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`&.${toggleButtonGroupClasses.root}`]: {
    padding: theme.spacing(0.5),
    borderRadius: 9,
    background: "#2E3751",

    [`& .${toggleButtonGroupClasses.grouped}:not(:last-of-type)`]: {
      borderTopRightRadius: 7,
      borderBottomRightRadius: 7,
    },
    [`& .${toggleButtonGroupClasses.grouped}:not(:first-of-type)`]: {
      marginLeft: 4,
      borderLeft: "none",
      borderTopLeftRadius: 7,
      borderBottomLeftRadius: 7,
    },
  },
}));

export default FeeToggleButtonGroup;
