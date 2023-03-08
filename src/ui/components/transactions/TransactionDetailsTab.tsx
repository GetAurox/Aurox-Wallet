import { Stack } from "@mui/material";

import MemoInput from "ui/components/flows/info/MemoInput";

export interface TransactionDetailsTabProps {
  setMemo: (value: string) => void;
  memo: string;
}

export default function TransactionDetailsTab(props: TransactionDetailsTabProps) {
  const { setMemo, memo } = props;

  const handleMemoChange = (value: string) => {
    setMemo(value);
  };

  return (
    <Stack px={2}>
      <MemoInput memo={memo} onChange={handleMemoChange} />
    </Stack>
  );
}
