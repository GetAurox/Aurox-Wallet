import noop from "lodash/noop";

import ContractAlertStatus from "ui/components/common/ContractAlertStatus";
import NFTContractInfo from "ui/components/entity/nft/NFTContractInfo";
import ErrorText from "ui/components/form/ErrorText";

import NetworkFeeV2 from "../feeSelection/NetworkFeeV2";

import TransactionPageWrapper from "./TransactionPageWrapper";

export interface NFTApprovalProps {
  operation: any;
}

export default function NFTApproval(props: NFTApprovalProps) {
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
      errorComponent={<ContractAlertStatus status={null} />}
    >
      <NFTContractInfo
        action="Approve"
        protocol={{ text: "https://app.uniswap.org", icon: undefined }}
        contractAddress="0x8saddhkasdf243"
        nft={{ name: "Forgotten Runes Wizards Cult", standard: "ERC20", icon: undefined, address: "0x7233khsadfasdfas" }}
      />

      <NetworkFeeV2 networkIdentifier={operation.networkIdentifier} feeManager={transactionManager?.feeManager ?? null} />
      {!hasEnoughFunds && (
        <ErrorText error={`You do not have enough ${nativeCurrencySymbol} to pay for the network fee`} mt={1} justifyContent="center" />
      )}
    </TransactionPageWrapper>
  );
}
