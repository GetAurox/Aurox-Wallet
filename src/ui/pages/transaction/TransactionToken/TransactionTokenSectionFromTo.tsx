import { ReactNode } from "react";

import { Divider, Box, Typography } from "@mui/material";

import { useNSResolveDomainFromAddress } from "ui/hooks";

const sxStyles = {
  text: {
    wordBreak: "break-word",
  },
};

export interface TransactionTokenSectionFromToProps {
  from: string;
  to: string;
}

export default function TransactionTokenSectionFromTo(props: TransactionTokenSectionFromToProps) {
  const { from, to } = props;

  const { domain: domainFrom, loading: loadingDomainFrom } = useNSResolveDomainFromAddress({ address: from });
  const { domain: domainTo, loading: loadingDomainTo } = useNSResolveDomainFromAddress({ address: to });

  let domainFromRender: ReactNode = null;

  if (domainFrom && !loadingDomainFrom) {
    domainFromRender = (
      <Typography variant="medium" color="text.secondary">
        (
        <Typography component="span" maxWidth={150} overflow="hidden" textOverflow="ellipsis" title={domainFrom}>
          {domainFrom}
        </Typography>
        )
      </Typography>
    );
  }

  let domainToRender: ReactNode = null;

  if (domainTo && !loadingDomainTo) {
    domainToRender = (
      <Typography variant="medium" color="text.secondary">
        (
        <Typography component="span" maxWidth={150} overflow="hidden" textOverflow="ellipsis" title={domainTo}>
          {domainTo}
        </Typography>
        )
      </Typography>
    );
  }

  return (
    <>
      <Box display="grid" component="section" gridTemplateRows="auto" gridTemplateColumns="1fr" gap={0.75}>
        {from && (
          <>
            <Typography variant="medium" color="text.secondary">
              From
            </Typography>
            <Typography variant="medium" sx={sxStyles.text}>
              {from}
            </Typography>
            {domainFromRender}
          </>
        )}
        {to && (
          <>
            <Typography variant="medium" mt={1} color="text.secondary">
              To
            </Typography>
            <Typography variant="medium" sx={sxStyles.text}>
              {to}
            </Typography>
            {domainToRender}
          </>
        )}
      </Box>
      <Divider />
    </>
  );
}
