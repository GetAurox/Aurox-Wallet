import { Stack, Box, Link, Typography } from "@mui/material";

import { useNetworkBlockchainExplorerLinkResolver } from "ui/hooks";

import { IconStatusWarning, IconLink } from "../../icons";
import CopyToClipboard from "../../clipboard/CopyToClipboard";

const sxStyles = {
  copyToClipboard: {
    icon: {
      width: 24,
      height: 24,
    },
    iconButton: { ml: 1 },
  },
};

export interface WarningStageProps {
  recipient: string;
  networkIdentifier?: string;
}

export default function WarningStage(props: WarningStageProps) {
  const { recipient, networkIdentifier = "" } = props;

  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(networkIdentifier);

  const link = getContractAddressExplorerLink(recipient) ?? undefined;

  return (
    <>
      <Typography variant="headingMedium" mt={1.5} fontSize={24} lineHeight={32 / 24} align="center">
        Warning
      </Typography>
      <Stack direction="row" mt="15px" spacing={1}>
        <Box flexGrow={0} flexShrink={0}>
          <IconStatusWarning />
        </Box>
        <Typography variant="large" flexGrow={1} flexShrink={1}>
          You&apos;re about to send funds to a contract address. Please double check to make sure the wallet address below is correct
        </Typography>
      </Stack>
      <Stack mt={3.75} spacing={0.75}>
        <Typography variant="medium" color="text.secondary">
          Address you&apos;re sending to:
        </Typography>
        <Link
          href={link}
          rel="noopener"
          target="_blank"
          color="primary"
          textAlign="left"
          component={link ? "a" : "button"}
          underline={link ? "hover" : "none"}
          sx={{ wordBreak: "break-all", cursor: link ? "pointer" : "default" }}
        >
          <Typography variant="large" display="flex" alignItems="baseline" columnGap={1}>
            <Box>
              <IconLink />
            </Box>
            <Box>
              {recipient}
              <CopyToClipboard sx={sxStyles.copyToClipboard} text={recipient} />
            </Box>
          </Typography>
        </Link>
      </Stack>
    </>
  );
}
