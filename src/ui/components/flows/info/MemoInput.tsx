import { Box, Link, Typography } from "@mui/material";

import FormField from "../../form/FormField";
import InfoTooltip from "../../info/InfoTooltip";

export interface MemoInputProps {
  memo: string;
  onChange: (value: string) => void;
}

export default function MemoInput(props: MemoInputProps) {
  const { memo, onChange } = props;

  return (
    <Box mt={3.125}>
      <FormField
        label={
          <>
            Memo
            <InfoTooltip>
              <Typography variant="large">
                Sed bibendum, ligula eget mollis volutpat, neque metus congue nibh, vitae venenatis magna metus vel tellus. Nam tempor eu
                enim nec cursus.
              </Typography>
              <Typography variant="large" mt={1}>
                <Link href="#" target="_blank" rel="noreferrer" underline="hover">
                  Learn more
                </Link>
              </Typography>
            </InfoTooltip>
          </>
        }
        placeholder="Enter memo"
        name="memo"
        autoComplete="off"
        value={memo}
        onChange={event => onChange(event.target.value)}
      />
    </Box>
  );
}
