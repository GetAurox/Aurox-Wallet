import { ChangeEvent } from "react";

import { Typography, Dialog, Divider, Button, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

const sxStyles = {
  root: {
    "& .MuiDialog-paper": {
      margin: "20px",
      width: "90%",
      minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      borderRadius: "10px",
      height: "initial",
      padding: "12px",
    },
  },
  title: {
    textAlign: "center",
    fontWeight: 500,
    fontSize: "20px",
    lineHeight: "24px",
  },
  formLabel: {
    padding: "16px 5px",
  },
};

export type VisibilityFilter = "show-all" | "show-visible" | "show-hidden";

export interface ManageTokenFilterDialogProps {
  open: boolean;
  onClose: () => void;
  visibilityFilter: VisibilityFilter;
  setVisibilityFilter: (value: VisibilityFilter) => void;
}

export default function ManageTokenFilterDialog(props: ManageTokenFilterDialogProps) {
  const { open, onClose, visibilityFilter, setVisibilityFilter } = props;

  const handleVisibilityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setVisibilityFilter(event.target.value as VisibilityFilter);
  };

  return (
    <Dialog open={open} sx={sxStyles.root}>
      <Typography sx={sxStyles.title}>Filter Based on Status</Typography>
      <RadioGroup value={visibilityFilter} onChange={handleVisibilityChange}>
        <FormControlLabel value="show-all" control={<Radio />} label="No Filter" sx={sxStyles.formLabel} />
        <Divider />
        <FormControlLabel value="show-visible" control={<Radio />} label="Active" sx={sxStyles.formLabel} />
        <Divider />
        <FormControlLabel value="show-hidden" control={<Radio />} label="Inactive" sx={sxStyles.formLabel} />
      </RadioGroup>
      <Button variant="contained" onClick={onClose}>
        Submit
      </Button>
    </Dialog>
  );
}
