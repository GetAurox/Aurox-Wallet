import { memo, ReactNode, SyntheticEvent, useState } from "react";

import { Box, Collapse, Stack, Tab, Tabs, Theme, Typography } from "@mui/material";

import { DApp as DAppEvents } from "common/events";
import { decodeTransaction } from "common/utils";
import { Password } from "common/operations";
import { Operation } from "common/types";

import useAnalytics from "ui/common/analytics";

import { useAccountByUUID, useDocumentTitle } from "ui/hooks";

import ExpandButton from "ui/components/styled/ExpandButton";
import IconExpandMore from "ui/components/styled/IconExpandMore";
import DefaultControls from "ui/components/controls/DefaultControls";
import AccountManageItem from "ui/components/entity/account/AccountManageItem";
import { TransactionDataTab, TransactionHexTab } from "ui/components/transactions";

import { TransactionConfirmation } from "./TransactionConfirmation";

const sxStyles = {
  tabs: {
    "& .MuiTab-root": {
      fontSize: "13px",
      lineHeight: (theme: Theme) => theme.typography.pxToRem(16),
      letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
      fontWeight: 500,
    },
  },
};

export interface TransactionPageWrapperProps {
  operation: Operation & { operationType: "transact" };
  activeSubmit: boolean;
  requirePassword: boolean;
  submitText?: string;
  errorComponent?: ReactNode;
  children: ReactNode;
  handleOnSubmit: () => void;
}

export default memo(function TransactionPageWrapper(props: TransactionPageWrapperProps) {
  const { handleOnSubmit, operation, requirePassword, submitText, children, errorComponent, activeSubmit } = props;

  const [collapsed, setCollapsed] = useState(false);

  const account = useAccountByUUID(operation.accountUUID);
  const address = operation.transactionPayload.from;

  const { trackButtonClicked } = useAnalytics();

  useDocumentTitle("Submit Transaction");

  const [memo, setMemo] = useState("");
  const [mainTab, setMainTab] = useState(0);

  const [validPassword, setValidPassword] = useState(false);
  const [checkboxConfirmed, setCheckboxConfirmed] = useState(false);

  const [touched, setTouched] = useState(false);

  const networkIdentifier = operation.networkIdentifier;
  const decodedTransaction = decodeTransaction(operation);

  const rejectTransaction = () => {
    DAppEvents.TransactionRequestResponded.broadcast(operation.id, null);

    trackButtonClicked("Rejected Transaction");
  };

  const handleMainTab = (event: SyntheticEvent, newTab: number) => {
    setMainTab(newTab);
  };

  const handleClickMoreOptions = () => {
    setCollapsed(!collapsed);
  };

  const handleMemo = (value: string) => {
    setMemo(value);
  };

  const handleOnPassword = async (password: string) => {
    const { valid } = await Password.ProbePassword.perform(password);

    setValidPassword(valid);
  };

  const handleOnCheckbox = (value: boolean) => {
    setCheckboxConfirmed(value);
  };

  const handleSubmit = () => {
    setTouched(true);

    if ((requirePassword && validPassword && checkboxConfirmed) || !requirePassword) {
      handleOnSubmit();

      trackButtonClicked("Submitted Transaction");
    }
  };

  const tabs = (
    <>
      <Tabs value={mainTab} sx={sxStyles.tabs} onChange={handleMainTab} variant="fullWidth">
        {/*<Tab label="Memo" />*/}
        <Tab label="Data" />
        <Tab label="Hex" />
      </Tabs>

      {/*{mainTab === 0 && (
        <TransactionDetailsTab
          setMemo={handleMemo}
          memo={memo}
        />
      )}*/}
      {mainTab === 0 && <TransactionDataTab transaction={decodedTransaction} networkIdentifier={networkIdentifier} />}
      {mainTab === 1 && <TransactionHexTab signature={decodedTransaction.signature} calldata={operation.transactionPayload.data} />}
    </>
  );

  const moreOptions = (
    <>
      <ExpandButton
        variant="text"
        sx={{ mt: 3, mx: "auto", mb: 2 }}
        endIcon={<IconExpandMore expand={collapsed} aria-expanded={collapsed} aria-label="More options" />}
        onClick={handleClickMoreOptions}
      >
        More Options
      </ExpandButton>
      <Collapse in={collapsed}>
        <Box mr={-2} ml={-2} mb={2}>
          {tabs}
        </Box>
      </Collapse>
    </>
  );

  return (
    <>
      <Stack p={2}>
        {errorComponent}
        <Stack mt={2} mb="27px" gap={1}>
          <Typography variant="medium">Account Used</Typography>
          {address && account && (
            <AccountManageItem account={account} addressDisplay={address} key={address} hideActionButtons hideNextIcon skipIsActive />
          )}
        </Stack>
        {children}
        {requirePassword && (
          <TransactionConfirmation
            onPassword={handleOnPassword}
            onCheckbox={handleOnCheckbox}
            validPassword={validPassword}
            validCheckbox={checkboxConfirmed}
            touched={touched}
          />
        )}
        {moreOptions}
      </Stack>
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
