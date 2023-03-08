import { LinkProps, Stack } from "@mui/material";

import CopyableLink from "ui/components/clipboard/CopyableLink";

const linkProps: LinkProps = { noWrap: true, underline: "hover" };

export interface TokenLinksProps {
  links: string[];
}

export default function TokenLinks(props: TokenLinksProps) {
  const { links } = props;

  return (
    <Stack rowGap={1}>
      {links.map((link, index) => (
        <CopyableLink key={index} text={link} link={link} linkProps={linkProps} justifyContent="" disableCollapseIdentifier />
      ))}
    </Stack>
  );
}
