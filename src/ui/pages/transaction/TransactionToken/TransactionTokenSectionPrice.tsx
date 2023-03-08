import { Box, Typography } from "@mui/material";

import { TransactionStatus } from "common/types";
import { formatPrice } from "ui/common/utils";

export interface TransactionTokenSectionPriceProps {
  amount: string | null;
  txCost: string | null;
  valueUSD: string | null;
  buyPrice: string | null;
  totalCost: string | null;
  status: TransactionStatus | null;
}

export default function TransactionTokenSectionPrice(props: TransactionTokenSectionPriceProps) {
  const { amount, buyPrice, txCost, totalCost, valueUSD, status } = props;

  const valueUSDNumber = Number(valueUSD);
  const hasValueUSD = valueUSD && !Number.isNaN(valueUSDNumber) && valueUSDNumber > 0;

  return (
    <>
      <Box component="section" display="grid" gridTemplateColumns="repeat(2, 1fr)" gridTemplateRows="auto" gap={1.5}>
        {amount && (
          <>
            <Typography variant="medium" color="text.secondary">
              Amount:
            </Typography>
            <Typography variant="medium" textAlign="right">
              {amount}
            </Typography>
          </>
        )}
        {hasValueUSD && (
          <>
            <Typography variant="medium" color="text.secondary">
              USD Value:
            </Typography>
            <Typography variant="medium" textAlign="right">
              ${formatPrice(valueUSD)}
            </Typography>
          </>
        )}
        {buyPrice && (
          <>
            <Typography variant="medium" color="text.secondary">
              Buy Price:
            </Typography>
            <Typography variant="medium" textAlign="right">
              ${buyPrice}
            </Typography>
          </>
        )}
        {txCost && (
          <>
            <Typography variant="medium" color="text.secondary">
              Network Fee:
            </Typography>
            <Typography variant="medium" textAlign="right">
              {status !== "pending" ? `$${txCost}` : "Pending"}
            </Typography>
          </>
        )}
        {totalCost && (
          <>
            <Typography variant="medium" color="text.secondary">
              Total Cost:
            </Typography>
            <Typography variant="medium" textAlign="right">
              ${totalCost}
            </Typography>
          </>
        )}
      </Box>
    </>
  );
}
