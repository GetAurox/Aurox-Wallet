import { Link } from "react-router-dom";

import { Stack, Alert, AlertProps, Typography } from "@mui/material";

export interface AlertWithLinkProps extends AlertProps {
  linkLabel?: string;
  linkHref: string;
}

const sxStyles = {
  py: 1,
  px: 1.5,
  borderRadius: "10px",
  ["&.MuiAlert-outlined"]: {
    "&Error": {
      borderColor: "error.main",
      backgroundColor: "rgba(242, 72, 64, 0.2)",
      color: "error.main",
    },
    "&Warning": {
      borderColor: "warning.main",
      backgroundColor: "rgba(246, 192, 9, 0.2)",
      color: "warning.main",
    },
    "&Success": {
      borderColor: "success.main",
      backgroundColor: "rgba(84, 192, 110, 0.2)",
      color: "success.main",
    },
  },
  ["& .MuiAlert-message"]: {
    width: "100%",
    p: 0,
  },
};

export default function AlertWithLink(props: AlertWithLinkProps) {
  const { severity, linkLabel, linkHref, children, sx, ...rest } = props;

  return (
    <Alert elevation={0} severity={severity} variant="outlined" icon={false} sx={{ ...sxStyles, ...sx }} {...rest}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {children}
        <Link to={linkHref}>
          <Typography variant="medium" color="primary">
            {linkLabel ?? "View"}
          </Typography>
        </Link>
      </Stack>
    </Alert>
  );
}
