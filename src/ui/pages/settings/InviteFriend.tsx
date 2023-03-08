import { MouseEvent, useState } from "react";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, CircularProgress, Link, Stack, Theme, Typography } from "@mui/material";
import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";

import { useHistoryGoBack } from "ui/common/history";
import { useRewardSystemRefereesCount, useRewardSystemReferralLink } from "ui/common/rewardSystem";

import { Flow, FlowStep, FlowStepBody, FlowStepHeader } from "ui/components/layout/flow";

const sxStyles = {
  dataGrid: {
    "&.MuiDataGrid-root": {
      mt: "17px",
      border: "none",
      borderTop: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
      borderLeft: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
    },
    "& .MuiDataGrid-columnHeaders": {
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      backgroundColor: "#1A1E28",
      borderBottom: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
    },
    "& .MuiDataGrid-columnHeader": {
      minHeight: "44px",
      maxHeight: "44px",
      borderRight: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
    },
    "& .MuiDataGrid-columnHeadersInner": {
      minHeight: "44px",
      maxHeight: "44px",
    },

    "& .MuiDataGrid-columnHeaderTitle": {
      fontWeight: 400,
      fontSize: "12px",
      textAlign: "left",
      lineHeight: "16px",
      letterSpacing: "0.15px",
      color: "text.secondary",
      whiteSpace: "break-spaces",
    },
    "& .MuiDataGrid-cell": {
      px: 1,
      borderRight: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
      borderBottom: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
    },
    "& .MuiDataGrid-columnSeparator": {
      visibility: "hidden",
    },
  },
};

const columns: GridColDef[] = [
  { field: "tier", headerName: "Tier", flex: 1, sortable: false },
  { field: "referral_number", headerName: "Number of referrals", flex: 1, sortable: false },
];

type ClipboardStatus = "done" | "failed" | null;

function textFromStatus(status: ClipboardStatus) {
  switch (status) {
    case "done":
      return "Copied";
    case "failed":
      return "Failed";
    default:
      return "Copy";
  }
}

function colorFromStatus(status: ClipboardStatus) {
  switch (status) {
    case "done":
      return "success";
    case "failed":
      return "error";
    default:
      return "primary";
  }
}

export default function InviteFriend() {
  const [status, setStatus] = useState<ClipboardStatus>(null);

  const goBack = useHistoryGoBack();

  const referralLink = useRewardSystemReferralLink();
  const refereesCount = useRewardSystemRefereesCount();

  const handleCopyToClipboard = (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    navigator.clipboard.writeText(referralLink ?? "").then(
      () => {
        setStatus("done");
      },
      () => {
        setStatus("failed");
      },
    );
  };

  const rows = [
    { id: 1, tier: "Tier 1", referral_number: refereesCount ?? 0 },
    { id: 2, tier: "Tier 2", referral_number: "Tracking Coming Soon" },
    { id: 3, tier: "Tier 3", referral_number: "Tracking Coming Soon" },
  ];

  return (
    <Flow title="Invite a Friend" hideCloseButton onBack={goBack}>
      <FlowStep>
        <FlowStepHeader title="Your Invitation Link" pb={0} />
        <FlowStepBody>
          {!referralLink && <CircularProgress />}
          {referralLink && (
            <>
              <Typography variant="large" mb={3}>
                {referralLink}
              </Typography>
              <Button variant="contained" fullWidth onClick={handleCopyToClipboard} color={colorFromStatus(status)}>
                <ContentCopyIcon />
                {textFromStatus(status)}
              </Button>

              <Stack height="194px">
                <DataGrid
                  hideFooter
                  rows={rows}
                  rowHeight={44}
                  headerHeight={44}
                  columns={columns}
                  disableColumnMenu
                  sx={sxStyles.dataGrid}
                />
              </Stack>

              <Box mb={3} mt={3}>
                <Typography variant="large" mb={3}>
                  We created the Aurox Wallet to make web3 easier and safer for the masses. Help us spread the word and we&apos;ll share our
                  revenue with you!{" "}
                </Typography>

                <Typography variant="large" mb={3}>
                  Use the link above to refer users to download and use the Aurox Wallet. If the user you refer generates our company
                  revenue, we&apos;ll share up to 50% of the revenue with you.{" "}
                </Typography>

                <Typography variant="large" mb={3}>
                  The referral system is a tiered system to help both you and our company gain massive adoption as quickly as possible.{" "}
                  <Link
                    underline="none"
                    href="https://docs.getaurox.com/product-docs/aurox-ecosystem/aurox-ecosystem/aurox-wallet/referral-system"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Click here to learn more
                  </Link>{" "}
                  about the referral system.{" "}
                </Typography>

                <Typography variant="large" mb={3}>
                  Note: This panel will soon be updated to include additional statistics such as tier 2/3 and revenue.
                </Typography>
              </Box>
            </>
          )}
        </FlowStepBody>
      </FlowStep>
    </Flow>
  );
}
