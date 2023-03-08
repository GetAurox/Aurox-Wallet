import { useCallback } from "react";

import { Box, Typography } from "@mui/material";

export interface PhraseProps {
  phrase: string;
  position: number;
  setPositionPhrase: (state: (data: string[]) => string[]) => void;
}

export function Phrase(props: PhraseProps) {
  const { phrase, position, setPositionPhrase } = props;
  const handleClick = useCallback(() => {
    setPositionPhrase(prev => {
      if (position !== 0) {
        return prev.filter(item => item !== phrase);
      }
      return [...prev, phrase];
    });
  }, [setPositionPhrase, position, phrase]);

  return (
    <Box
      bgcolor={position !== 0 ? "primary900" : "bg800"}
      borderRadius={1}
      display="inline-flex"
      gap={1}
      height={32}
      px="12px"
      py="4px"
      onClick={handleClick}
      sx={{ cursor: "pointer" }}
    >
      {position !== 0 && (
        <Typography color="#ffffff51" component="span" variant="btn210-bs">
          {position}
        </Typography>
      )}
      <Typography component="span" variant="btn205-bs">
        {phrase}
      </Typography>
    </Box>
  );
}
