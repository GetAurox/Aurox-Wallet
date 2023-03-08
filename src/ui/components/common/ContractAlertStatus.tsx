import { Stack, Typography } from "@mui/material";
import { memo } from "react";

import InfoTooltip from "ui/components/info/InfoTooltip";
import type { InfoTooltipVariant } from "ui/components/info/InfoTooltip";

import { defaultTheme } from "ui/common/theme";

import AlertStatus from "./AlertStatus";

export interface ContractAlertStatusProps {
  status: "white" | "yellow" | "red" | "black" | null | undefined;
}

const tooltip = (variant: InfoTooltipVariant) => (
  <InfoTooltip variant={variant}>
    <Typography fontSize="14px">
      Aurox constantly monitors contract addresses across all blockchains. Below is how we tag specific addresses:
    </Typography>
    <Stack mt={0.5} component="ul" rowGap={0.5} sx={{ listStyleType: "circle", listStylePosition: "inside" }}>
      <Typography component="li" fontSize="12px" color={defaultTheme.palette.custom.green["54"]}>
        Green: Whitelisted contracts that belong to reputable companies in cryptocurrency.
      </Typography>
      <Typography component="li" fontSize="12px" color={defaultTheme.palette.custom.yellow["50"]}>
        Yellow: Open source contracts which are usually safe, but have yet to be added to our whitelist. These contracts might be new or
        belong to emerging companies.
      </Typography>
      <Typography component="li" fontSize="12px" color={defaultTheme.palette.custom.orange["50"]}>
        Orange: Closed source contracts which are potentially dangerous and not part of our whitelist. These contracts could be new, but
        proceed with caution if you decide to transact with them.
      </Typography>
      <Typography component="li" fontSize="12px" color={defaultTheme.palette.custom.red["60"]}>
        Red: These contract addresses have been flagged as known scams or hacks. Avoid transacting with them unless you know what you're
        doing
      </Typography>
    </Stack>
  </InfoTooltip>
);

export default memo(function ContractAlertStatus(props: ContractAlertStatusProps) {
  const { status } = props;

  if (status === "white") {
    return (
      <AlertStatus
        success
        successText={<>This contract address is on our whitelist and belongs to a reputable dApp. {tooltip("success")}</>}
      />
    );
  }

  if (status === "yellow") {
    return (
      <AlertStatus
        warning
        warningText={
          <>
            This contract address is <strong>open source</strong> but is <strong>not on our whitelist</strong>. It is potentially safe, but
            please be careful.
            {tooltip("warning")}
          </>
        }
      />
    );
  }

  if (status === "red") {
    return (
      <AlertStatus
        warning
        severe
        warningText={
          <>
            This contract address is <strong>not open source</strong> and is <strong>not on our whitelist</strong>. Please be careful
            transacting with it.
            {tooltip("severeWarning")}
          </>
        }
      />
    );
  }

  if (status === "black") {
    return (
      <AlertStatus
        error
        errorText={
          <>
            This contract address is on our <strong>blacklisted and dangerous</strong>. Please avoid transacting with it.
            {tooltip("error")}
          </>
        }
      />
    );
  }

  if (status === null) {
    return (
      <AlertStatus
        warning
        warningText="We're unable to verify whether this contract is safe or dangerous. This blockchain might not be supported by our smart contract monitoring yet"
      />
    );
  }

  return <></>;
});
