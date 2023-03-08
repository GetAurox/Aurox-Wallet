import { Stack, Typography } from "@mui/material";

import { useNSResolveDomainFromAddress } from "ui/hooks";

export interface FromAndToDetailsProps {
  from?: string;
  to: string;
}

export default function FromAndToDetails(props: FromAndToDetailsProps) {
  const { from, to } = props;

  const { domain: domainFrom, loading: loadingDomainFrom } = useNSResolveDomainFromAddress({ address: from });
  const { domain: domainTo, loading: loadingDomainTo } = useNSResolveDomainFromAddress({ address: to });

  let domainFromRender = "";

  if (domainFrom && !loadingDomainFrom) {
    domainFromRender = ` (${domainFrom})`;
  }

  let domainToRender = "";

  if (domainTo && !loadingDomainTo) {
    domainToRender = ` (${domainTo})`;
  }

  return (
    <>
      <Stack mt="17px">
        <Typography variant="medium" color="text.secondary">
          From{domainFromRender}
        </Typography>
        <Typography variant="large" mt={0.75} sx={{ wordBreak: "break-all" }}>
          {from}
        </Typography>
      </Stack>
      <Stack mt="14px">
        <Typography variant="medium" color="text.secondary">
          To{domainToRender}
        </Typography>
        <Typography variant="large" mt={0.75} sx={{ wordBreak: "break-all" }}>
          {to}
        </Typography>
      </Stack>
    </>
  );
}
