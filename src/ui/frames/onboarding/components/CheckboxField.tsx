import * as React from "react";

import { Stack, Typography } from "@mui/material";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 8,
  width: 20,
  height: 20,
  border: `2px solid ${theme.palette.warning100}`,
}));

const BpCheckedIcon = styled(BpIcon)(({ theme }) => ({
  backgroundColor: theme.palette.warning100,
  "&:before": {
    display: "block",
    width: 16,
    height: 16,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23121B2F'/%3E%3C/svg%3E\")",
    // eslint-disable-next-line quotes
    content: '""',
  },
}));

export function CheckboxField(props: CheckboxProps & { label?: string }) {
  return (
    <Stack alignItems="start" component="label" direction="row">
      <Checkbox checkedIcon={<BpCheckedIcon />} color="default" disableRipple icon={<BpIcon />} {...props} />
      <Typography color="warning100" component="span" variant="input-label200-bs">
        {props.label}
      </Typography>
    </Stack>
  );
}
