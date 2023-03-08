import { ReactNode } from "react";

import { Box, List, Stack, Typography } from "@mui/material";

import { Icon } from "./Icon";

type ValidationCaptionItemProps = {
  isValid?: boolean;
  text: ReactNode;
  touched?: boolean;
};

export function ValidationCriterionItem({ isValid = false, text, touched = false }: ValidationCaptionItemProps) {
  return (
    <Stack alignItems="center" color={touched ? (isValid ? "success100" : "error100") : "bg600"} direction="row" minHeight="24px">
      <Box display="inline-flex" mr={1}>
        <Icon name={isValid ? "16px-tick-solid" : "16px-cross-solid"} size="small" />
      </Box>
      <Typography component="span" variant="input-label200-bs">
        {text}
      </Typography>
    </Stack>
  );
}

export type ValidationCaptionProps = {
  touched: boolean;
  requirements: { value: boolean; label: string }[];
};

export function ValidationCriterion({ requirements, touched }: ValidationCaptionProps) {
  return (
    <List>
      {requirements && (
        <>
          {requirements.map((requirement, index) => (
            <ValidationCriterionItem key={index} isValid={requirement.value} text={requirement.label} touched={touched} />
          ))}
        </>
      )}
    </List>
  );
}
