import { BigNumber, ethers } from "ethers";
import { Fragment, useState } from "react";

import { ArrowRightAltRounded, ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Box, Collapse, IconButton, Stack, Typography } from "@mui/material";

import { ArgumentDetails, ReadableTransaction } from "common/types";
import { getTimeInMilliseconds } from "common/utils";
import { collapseIdentifier } from "ui/common/utils";

import TransactionAddressDisplay from "ui/components/entity/transaction/TransactionAddressDisplay";
import IconExpandMore from "ui/components/styled/IconExpandMore";

import InfoTooltip from "../info/InfoTooltip";

export interface TransactionDataTabProps {
  transaction: ReadableTransaction | undefined | null;
  networkIdentifier: string;
}

export default function TransactionDataTab(props: TransactionDataTabProps) {
  const { transaction, networkIdentifier } = props;

  const [collapsed, setCollapsed] = useState(true);

  const toggleCollapse = () => setCollapsed(value => !value);

  const argumentField = (argumentDetails: ArgumentDetails) => {
    if (argumentDetails.type === "bytes[]") {
      // TODO: this value is NOT compatible with ArgumentDetails[], it will crash on this branch @nikola
      // ALSO! the collapse state will be shared between this and the entire transaction, please properly test before commiting
      return (
        <Box key={argumentDetails.name} mt={1}>
          {argumentFields(argumentDetails.value)}
        </Box>
      );
    }

    if (argumentDetails.type === "tuple") {
      return argumentDetails.value.map((value: any) => argumentField(value));
    }

    const value = argumentDetails.value?.toString() ?? "Unknown";

    let formattedValue = (
      <Stack key={argumentDetails.name} mt={1} direction="row" justifyItems="center">
        <Typography variant="medium" textAlign="right">
          {argumentDetails.value != null ? collapseIdentifier(value) : "Unknown"}
        </Typography>
        {argumentDetails.value != null && value.length > 8 && <InfoTooltip variant="info">{value}</InfoTooltip>}
      </Stack>
    );

    if (argumentDetails.type === "address[]") {
      const linkGroup = argumentDetails.value.map((address: string, index: number) => {
        const link = <TransactionAddressDisplay networkIdentifier={networkIdentifier} contractAddress={address} />;

        if (index === argumentDetails.value.length - 1) return link;

        return (
          <Fragment key={argumentDetails.name}>
            {link} <ArrowRightAltRounded />
          </Fragment>
        );
      });

      formattedValue = (
        <Stack flexDirection="row" alignItems="center">
          {linkGroup}
        </Stack>
      );
    } else if (argumentDetails.type === "uint256") {
      const now = Date.now();

      // Convert to milliseconds
      const assumedDate = Number(argumentDetails.value) * 1000;

      const allowedDifferenceInHours = getTimeInMilliseconds({ unit: "hour", amount: 2 });

      if (Math.abs(assumedDate - now) < allowedDifferenceInHours) {
        const parsedDate = new Date(assumedDate);

        const formattedDate = `${parsedDate.toLocaleDateString()} ${parsedDate.toLocaleTimeString()}`;

        formattedValue = (
          <Typography variant="medium" textAlign="right">
            {formattedDate}
          </Typography>
        );
      } else if (BigNumber.isBigNumber(argumentDetails.value) && BigNumber.from(argumentDetails.value).eq(ethers.constants.MaxUint256)) {
        formattedValue = (
          <Typography variant="medium" textAlign="right">
            Infinite
          </Typography>
        );
      }
    }

    if (argumentDetails.type === "address") {
      formattedValue = <TransactionAddressDisplay networkIdentifier={networkIdentifier} contractAddress={argumentDetails.value} />;
    }

    return (
      <Stack key={argumentDetails.name} flexDirection="row" justifyContent="space-between" alignItems="center" mt={1.2}>
        <Typography variant="medium" textAlign="left" color="text.secondary" sx={{ textTransform: "capitalize" }}>
          {argumentDetails.name ?? argumentDetails.type}
        </Typography>
        {formattedValue}
      </Stack>
    );
  };

  const argumentFields = (transaction: ReadableTransaction) => {
    const boxes = transaction.arguments.map(argument => argumentField(argument));

    return (
      <>
        <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
          <Typography variant="medium" sx={{ textTransform: "capitalize" }}>
            {transaction.name}
          </Typography>
          <IconButton onClick={toggleCollapse}>{<IconExpandMore expand={collapsed} Icon={ExpandMoreIcon} />}</IconButton>
        </Stack>
        <Collapse in={collapsed}>
          <Box mr={0.2} ml={0.2} width="100%">
            {boxes}
          </Box>
        </Collapse>
      </>
    );
  };

  if (!transaction) {
    return <Box m={2}>Details not available</Box>;
  }

  return <Box m={2}>{argumentFields(transaction)}</Box>;
}
