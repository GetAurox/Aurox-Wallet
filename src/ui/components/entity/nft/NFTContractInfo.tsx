import { Avatar, Box, Card, CardContent, cardContentClasses, Stack, Typography } from "@mui/material";

import { collapseIdentifier } from "ui/common/utils";

import CopyableText from "ui/components/clipboard/CopyableText";

const sxStyles = {
  card: {
    mt: "7px",
    borderRadius: "10px",
    bgcolor: "transparent",
  },
  cardContent: {
    p: 1.5,
    [`&.${cardContentClasses.root}:last-child`]: {
      pb: 1.5,
    },
  },
  protocolAvatar: {
    width: 20,
    height: 20,
  },
  nftAvatar: {
    width: 36,
    height: 36,
    borderRadius: 2,
  },
};

export interface NFTContractInfoProps {
  action: string;
  protocol: {
    text: string;
    icon?: string;
  };
  contractAddress: string;
  nft: {
    standard: string;
    name: string;
    address: string;
    icon?: string;
  };
}

export default function NFTContractInfo(props: NFTContractInfoProps) {
  const { action, protocol, contractAddress, nft } = props;

  return (
    <Box>
      <Typography variant="medium">Contract Info</Typography>
      <Card variant="outlined" sx={sxStyles.card}>
        <CardContent sx={sxStyles.cardContent}>
          <Stack rowGap="6px">
            <Stack direction="row" columnGap={0.5} alignItems="center">
              <Typography variant="medium" color="text.secondary">
                Protocol:
              </Typography>
              <Avatar src={protocol.icon} sx={sxStyles.protocolAvatar} />
              <Typography variant="medium">{protocol.text}</Typography>
            </Stack>

            <Stack direction="row" columnGap={0.5}>
              <Typography variant="medium" color="text.secondary">
                Action:
              </Typography>
              <Typography variant="medium">{action}</Typography>
            </Stack>

            <Stack direction="row" columnGap={0.5}>
              <Typography variant="medium" color="text.secondary">
                Contract:
              </Typography>
              <CopyableText text={contractAddress} />
            </Stack>

            <Stack direction="row" alignItems="center" columnGap={1} mt="5px">
              <Avatar sx={sxStyles.nftAvatar} variant="rounded" src={nft.icon} />
              <Stack>
                <Typography variant="medium">{nft.name}</Typography>
                <Typography variant="medium" color="text.secondary">
                  {nft.standard}{" "}
                  <Typography variant="medium" component="span" color="primary">
                    ({collapseIdentifier(nft.address)})
                  </Typography>
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
