import { ReactNode, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import makeStyles from "@mui/styles/makeStyles";

import { Button, Alert, AlertColor, AlertTitle, Theme } from "@mui/material";

import { IconStatusError, IconStatusSevereWarning, IconStatusSuccess, IconStatusWarning } from "ui/components/icons";

const useStyles = makeStyles((theme: Theme) => ({
  alert: {
    "&.MuiAlert-outlined": {
      borderRadius: 10,
      padding: "3px 10px 3px 10px",
      "&Success": {
        border: "1px solid",
        borderColor: theme.palette.success.main,
        background: "rgba(84, 192, 110, 0.2)",
      },
      "&Warning": {
        border: "1px solid",
        color: (props: AlertStatusProps) => (props.severe ? theme.palette.custom.orange["50"] : theme.palette.warning.main),
        borderColor: (props: AlertStatusProps) => (props.severe ? theme.palette.custom.orange["50"] : theme.palette.warning.main),
        background: (props: AlertStatusProps) => (props.severe ? "rgba(240, 144, 85, 0.2)" : "rgba(246, 192, 9, 0.2)"),
      },
      "&Error": {
        border: "1px solid",
        borderColor: theme.palette.error.main,
        background: "rgba(242, 72, 64, 0.2)",
      },
    },
  },
}));

export type AlertStatusProps = Partial<{
  loading: boolean;
  loadingText: ReactNode;
  error: boolean;
  errorText: ReactNode;
  warning: boolean;
  warningText: ReactNode;
  info: boolean;
  infoText: ReactNode;
  success: boolean;
  successText: ReactNode;
  children: ReactNode;
  buttonNavigate?: "back" | "refresh";
  title: string | ReactNode;
  showButton: boolean;
  severe: boolean;
  onButtonClick: () => void;
}>;

export default function AlertStatus(props: AlertStatusProps) {
  const {
    loading,
    loadingText,
    error,
    errorText,
    warning,
    warningText,
    info,
    infoText,
    success,
    successText,
    children,
    buttonNavigate = "back",
    showButton,
    severe,
    title,
    onButtonClick,
  } = props;

  const classes = useStyles(props);

  const navigate = useNavigate();

  const handleBackButtonClicked = useCallback(() => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(buttonNavigate === "refresh" ? 0 : -1);
    }
  }, [buttonNavigate, navigate, onButtonClick]);

  const getAlert = (severity: AlertColor, text: ReactNode, title?: string | ReactNode) => {
    return (
      <Alert
        severity={severity}
        variant="outlined"
        iconMapping={{
          success: <IconStatusSuccess />,
          error: <IconStatusError />,
          warning: severe ? <IconStatusSevereWarning /> : <IconStatusWarning />,
        }}
        className={classes.alert}
      >
        {text}
        {showButton && (
          <AlertTitle>
            {title}{" "}
            <Button variant="outlined" color={severity} sx={{ display: "block", mt: 1.5 }} size="small" onClick={handleBackButtonClicked}>
              {buttonNavigate === "refresh" ? "Refresh" : "Back"}
            </Button>
          </AlertTitle>
        )}
      </Alert>
    );
  };

  if (error) {
    return getAlert("error", errorText, title || "Error");
  }

  if (warning) {
    return getAlert("warning", warningText, title || "Warning");
  }

  if (loading) {
    return getAlert("info", loadingText);
  }

  if (info) {
    return getAlert("info", infoText);
  }

  if (success) {
    return getAlert("success", successText);
  }

  if (children) {
    return <>{children}</>;
  }

  return <></>;
}
