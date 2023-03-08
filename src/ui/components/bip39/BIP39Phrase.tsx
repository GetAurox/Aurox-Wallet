import { memo } from "react";

import { Box, SxProps } from "@mui/material";

export interface BIP39PhraseProps {
  phrase: string;
  ordinal?: number;
  onClick?: () => void;
  phantom?: boolean;
}

export default memo(function BIP39Phrase(props: BIP39PhraseProps) {
  const { phrase, ordinal, onClick, phantom } = props;

  const sxStyles: SxProps = {
    userSelect: "none",
    cursor: onClick ? "pointer" : "default",
    ":hover": {
      backgroundColor: onClick ? "rgba(255,255,255,0.12)" : "transparent",
    },
  };

  if (phantom) {
    return (
      <Box sx={sxStyles} border="dashed 1px #fff" borderRadius="8px" px={1} py={0.5} m={0.5} color="transparent">
        {typeof ordinal === "number" && <Box component="span">{ordinal} </Box>}
        {phrase}
      </Box>
    );
  }

  return (
    <Box sx={sxStyles} whiteSpace="nowrap" border="solid 1px #fff" borderRadius="8px" px={1} py={0.5} m={0.5} onClick={onClick}>
      {typeof ordinal === "number" && (
        <Box component="span" color="#A7B3BE">
          {ordinal}{" "}
        </Box>
      )}
      {phrase}
    </Box>
  );
});
