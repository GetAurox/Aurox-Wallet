import noop from "lodash/noop";

import { Alert, Typography } from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

import ErrorText from "ui/components/form/ErrorText";
import NFTContractInfo from "ui/components/entity/nft/NFTContractInfo";

import NetworkFee from "../feeSelection/NetworkFee";

import TransactionPageWrapper from "./TransactionPageWrapper";

const sxStyle = {
  alert: {
    "&.MuiAlert-outlined": {
      borderRadius: 2.5,
      padding: "3px 10px 3px 10px",
      bgcolor: "rgba(242, 72, 64, 0.2)",
    },
  },
};

export interface NFTApprovalAllProps {
  operation: any;
}

export default function NFTApprovalAll(props: NFTApprovalAllProps) {
  const { operation } = props;

  const hasEnoughFunds = false;
  const transactionManager = {
    feeManager: null,
  };
  const nativeCurrencySymbol = "ETH";

  return (
    <TransactionPageWrapper
      activeSubmit
      operation={operation}
      requirePassword={false}
      submitText="Sign Transaction"
      handleOnSubmit={noop}
      errorComponent={
        <Alert sx={sxStyle.alert} severity="error" variant="outlined" icon={<ReportProblemIcon color="error" />}>
          <Typography color="error">
            This contract is requesting a potentially dangerous permission which can withdrawal all NFTs in this collection. Only trust
            known contracts and websites with this approval method.
          </Typography>
        </Alert>
      }
    >
      <NFTContractInfo
        action="SetApprovalForAll"
        protocol={{ text: "https://app.uniswap.org", icon: undefined }}
        contractAddress="0x8saddhkasdf243"
        nft={{ name: "Forgotten Runes Wizards Cult", standard: "ERC20", icon: undefined, address: "0x7233khsadfasdfas" }}
      />

      <NetworkFee networkIdentifier={operation.networkIdentifier} feeManager={transactionManager?.feeManager ?? null} />
      {!hasEnoughFunds && (
        <ErrorText error={`You do not have enough ${nativeCurrencySymbol} to pay for the network fee`} mt={1} justifyContent="center" />
      )}
    </TransactionPageWrapper>
  );
}
