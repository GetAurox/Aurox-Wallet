import { Children, ReactNode, Fragment } from "react";
import chunk from "lodash/chunk";

import { SystemProps } from "@mui/system";
import { Theme, Box } from "@mui/material";

export interface BIP39PhraseBoxProps extends SystemProps {
  disableFixedRows?: boolean;
  error?: boolean;
  children?: ReactNode;
}

export default function BIP39PhraseBox(props: BIP39PhraseBoxProps) {
  const { disableFixedRows, error, children, ...system } = props;

  if (disableFixedRows) {
    return (
      <Box
        bgcolor={(theme: Theme) => theme.palette.custom.grey["19"]}
        borderRadius="14px"
        border={(theme: Theme) => `${error ? theme.palette.error.main : theme.palette.custom.grey["19"]} 1px solid`}
        display="flex"
        flexWrap="wrap"
        alignContent="center"
        justifyContent="center"
        p={1}
        {...system}
      >
        {children}
      </Box>
    );
  }

  const rows = chunk(Children.toArray(children), 3);

  return (
    <Box
      bgcolor={(theme: Theme) => theme.palette.custom.grey["19"]}
      borderRadius="14px"
      border={(theme: Theme) => `${error ? theme.palette.error.main : theme.palette.custom.grey["19"]} 1px solid`}
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      p={1}
      {...system}
    >
      {rows.map((row, rowIndex) => (
        <Box key={rowIndex} display="flex" justifyContent="center">
          {row.map((item, itemIndex) => (
            <Fragment key={itemIndex}>{item}</Fragment>
          ))}
        </Box>
      ))}
    </Box>
  );
}
