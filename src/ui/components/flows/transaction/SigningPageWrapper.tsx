import { memo, ReactNode } from "react";

import { Box, Typography } from "@mui/material";

import { DApp as DAppEvents } from "common/events";
import { Operation } from "common/types";

import { useActiveAccount, useActiveAccountNetworkAddress, useDocumentTitle } from "ui/hooks";

import DefaultControls from "ui/components/controls/DefaultControls";
import AccountManageItem from "ui/components/entity/account/AccountManageItem";
import useAnalytics from "ui/common/analytics";

export interface SigningPageWrapperProps {
  operation: Operation;
  activeSubmit: boolean;
  submitText?: string;
  errorComponent?: ReactNode;
  children: ReactNode;
  handleOnSubmit: () => void;
}

export default memo(function SigningPageWrapper(props: SigningPageWrapperProps) {
  const { handleOnSubmit, operation, submitText, children, errorComponent, activeSubmit } = props;

  const account = useActiveAccount();
  const address = useActiveAccountNetworkAddress();

  const { trackButtonClicked } = useAnalytics();

  useDocumentTitle("Sign Transaction");

  const rejectTransaction = () => {
    DAppEvents.TransactionRequestResponded.broadcast(operation.id, null);

    trackButtonClicked("Rejected Transaction");
  };

  const handleSubmit = () => {
    trackButtonClicked("Submitted Transaction");

    handleOnSubmit();
  };

  return (
    <>
      <Box p={2}>
        {errorComponent}
        <Box component="section" mb="27px">
          <Typography variant="medium" mt={2} mb="7px">
            Account Used
          </Typography>
          {address && account && (
            <AccountManageItem account={account} addressDisplay={address} key={address} hideActionButtons hideNextIcon skipIsActive />
          )}
        </Box>
        {children}
      </Box>
      <DefaultControls
        primary={submitText ?? "Submit Transaction"}
        secondary="Reject"
        disabledPrimary={!activeSubmit}
        onPrimary={handleSubmit}
        onSecondary={rejectTransaction}
      />
    </>
  );
});
