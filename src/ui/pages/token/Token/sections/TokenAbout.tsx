import { useState, MouseEvent } from "react";
import * as DOMPurify from "dompurify";

import { Collapse, Link, Typography } from "@mui/material";

import { TOKEN_PAGE_EXPAND_DESCRIPTION_THRESHOLD_SYMBOLS } from "common/config";

const sxStyles = {
  link: {
    mt: "-2px",
    width: "fit-content",
  },
};

export interface TokenAboutProps {
  description: string;
}

export default function TokenAbout(props: TokenAboutProps) {
  const { description } = props;

  const [expanded, setExpanded] = useState(false);

  const toggleExpand = (event: MouseEvent<any>) => {
    event.preventDefault();

    setExpanded(prevState => !prevState);
  };

  DOMPurify.addHook("afterSanitizeAttributes", function (node) {
    if ("target" in node) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener");
      node.setAttribute("style", "text-decoration: underline");
    }
  });

  const sanitizedDescription = DOMPurify.sanitize(description, { USE_PROFILES: { html: true } });

  return (
    <>
      <Collapse in={expanded} timeout="auto" collapsedSize={120}>
        <Typography variant="large" dangerouslySetInnerHTML={{ "__html": sanitizedDescription }} />
      </Collapse>
      {description.length > TOKEN_PAGE_EXPAND_DESCRIPTION_THRESHOLD_SYMBOLS && (
        <Link sx={sxStyles.link} alignSelf="end" onClick={toggleExpand} underline="hover" component="button">
          {expanded ? "Show less" : "Show more"}
        </Link>
      )}
    </>
  );
}
