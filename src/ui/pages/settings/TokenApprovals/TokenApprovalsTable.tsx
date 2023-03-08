import { useMemo } from "react";

import { Error as ErrorIcon } from "@mui/icons-material";
import { Theme, Button, Link, Stack, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { TokenApprovalItem } from "common/types";
import { ethereumMainnetNetworkIdentifier } from "common/config";

import { formatAbbreviated } from "ui/common/utils";
import { useNetworkBlockchainExplorerLinkResolver } from "ui/hooks";

const sxStyles = {
  revokeButton: {
    "&.MuiButton-sizeSmall": {
      "&:hover": {
        border: "none",
        color: "common.white",
        backgroundColor: "error.main",
      },
    },
  },
  errorIcon: {
    fontSize: "14px",
  },
  dataGrid: {
    "&.MuiDataGrid-root": {
      mt: "17px",
      border: "none",
      borderTop: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
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

export interface TokenApprovalsTableProps {
  onRevoke: (value: string) => void;
  items: TokenApprovalItem[];
}

export default function TokenApprovalsTable(props: TokenApprovalsTableProps) {
  const { onRevoke, items } = props;

  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(ethereumMainnetNetworkIdentifier);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        width: 90,
        field: "shortName",
        sortable: false,
        headerName: "Token",
      },
      {
        width: 90,
        field: "amount",
        sortable: false,
        headerName: "Amount",
        renderCell: (params: GridRenderCellParams<string>) => {
          const isUnlimited = Number(params.value) === -1;

          return (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography color={isUnlimited ? "error" : "text.primary"} fontSize="12px" lineHeight="16px" letterSpacing="0.15px">
                {isUnlimited ? "Unlimited" : formatAbbreviated(params.value ?? "")}
              </Typography>
              {isUnlimited && (
                <Tooltip
                  title={
                    <Typography variant="medium" textAlign="left">
                      Warning: This decentralized application has unlimited approval for this token. This could be a security risk.
                    </Typography>
                  }
                >
                  <ErrorIcon sx={sxStyles.errorIcon} color="error" />
                </Tooltip>
              )}
            </Stack>
          );
        },
      },
      {
        flex: 1,
        type: "string",
        sortable: false,
        field: "approvedSpender",
        headerName: "Approved Spender",
        renderCell: (params: GridRenderCellParams<string>) => {
          const link = getContractAddressExplorerLink(params.row.address);
          return (
            <Link
              noWrap
              fontSize="12px"
              target="_blank"
              textAlign="left"
              disabled={!link}
              lineHeight="16px"
              letterSpacing="0.15px"
              href={link ?? undefined}
              rel="noopener noreferrer"
              component={link ? "a" : "button"}
            >
              {params.value}
            </Link>
          );
        },
      },
      {
        width: 90,
        headerName: "",
        field: "revoke",
        sortable: false,
        renderCell: (params: GridRenderCellParams<string>) => (
          <Button
            size="small"
            variant="outlined"
            sx={sxStyles.revokeButton}
            tabIndex={params.hasFocus ? 0 : -1}
            onClick={() => onRevoke(params.row.token)}
          >
            Revoke
          </Button>
        ),
      },
    ],
    [getContractAddressExplorerLink, onRevoke],
  );

  return <DataGrid rowHeight={44} headerHeight={44} hideFooter sx={sxStyles.dataGrid} rows={items} columns={columns} disableColumnMenu />;
}
