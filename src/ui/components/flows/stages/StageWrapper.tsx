import { Button, Stack } from "@mui/material";
import { ReactNode } from "react";

import Header from "ui/components/layout/misc/Header";

export interface StageWrapperProps {
  title: string;
  back: () => void;
  close: () => void;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  buttonText?: string;
  isLoading?: boolean;
  hideButton?: boolean;
}

export default function StageWrapper(props: StageWrapperProps) {
  const { title, back, close, children, disabled, onClick, buttonText, hideButton } = props;

  return (
    <>
      <Header title={title} onBackClick={back} onCloseClick={close} />
      <Stack width={1} px={2} flexGrow={1}>
        {children}
      </Stack>
      {/* Push the rest of the components to the bottom */}
      {!hideButton && (
        <Button sx={{ mt: "19px", mx: 2, mb: 2 }} variant="contained" onClick={onClick} disabled={disabled}>
          {buttonText ?? title}
        </Button>
      )}
    </>
  );
}
