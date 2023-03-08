import { Checkbox as MuiCheckbox, CheckboxProps } from "@mui/material";

import { IconCheckbox, IconCheckboxBorder } from "ui/components/icons";

export type { CheckboxProps };

export default function Checkbox(props: CheckboxProps) {
  return <MuiCheckbox icon={<IconCheckboxBorder />} checkedIcon={<IconCheckbox />} {...props} />;
}
