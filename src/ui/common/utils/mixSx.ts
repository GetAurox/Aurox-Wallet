import compact from "lodash/compact";

import { SxProps, Theme } from "@mui/material";

/**
 * Merges array of SxProps
 */
export function mixSx(...sxProps: (SxProps<Theme> | false | undefined)[]): SxProps<Theme> | undefined {
  const validItems = compact(sxProps);

  if (validItems.length === 0) return;

  if (validItems.length === 1) return validItems[0];

  const result: Exclude<SxProps<Theme>, ReadonlyArray<any>>[] = [];

  for (const value of validItems) {
    if (Array.isArray(value)) {
      result.push(...value);
    } else {
      result.push(value as typeof result[0]);
    }
  }

  return result;
}
