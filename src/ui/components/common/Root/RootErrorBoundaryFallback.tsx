import { memo } from "react";

import { Box } from "@mui/material";

import { MainPageSection, useGoHome, useHistoryGoBackOrReset } from "ui/common/history";

import AlertStatus from "ui/components/common/AlertStatus";
import MainPageBottomNavigation from "ui/frames/popup/components/MainPage/MainPageBottomNavigation";
import CopyableText from "ui/components/clipboard/CopyableText";

interface RootErrorBoundaryFallbackProps {
  errorMessage: string;
  errorName: string;
  onHideError: () => void;
}

export default memo(function RootErrorBoundaryFallback(props: RootErrorBoundaryFallbackProps) {
  const { errorMessage, errorName, onHideError } = props;

  const goHome = useGoHome();
  const goBackOrReset = useHistoryGoBackOrReset();

  const handleOnHideError = () => {
    onHideError();

    goBackOrReset("/");
  };

  const handleBeforeButtonClick = (section: MainPageSection) => {
    onHideError();

    goHome(section);
  };

  return (
    <>
      <Box m={2}>
        <AlertStatus
          error={true}
          errorText={errorMessage}
          showButton
          title={
            <>
              {errorName}
              <br />
              <br />
              Please contact <CopyableText text="support@getaurox.com" disableCollapseIdentifier variant="large" ml={0} /> if this error
              persists.
            </>
          }
          onButtonClick={handleOnHideError}
        />
      </Box>
      <MainPageBottomNavigation beforeButtonClick={handleBeforeButtonClick} />
    </>
  );
});
