import { dialogContentClasses } from "@mui/material";
import { memo } from "react";

import DialogBase from "ui/components/common/DialogBase";
import Success from "ui/components/layout/misc/Success";

const contentWrapper = { rowGap: 1.5, mt: "35px" };

const sxStyles = {
  contentDialog: {
    [`&.${dialogContentClasses.root}`]: {
      px: 0,
    },
  },
};

export interface WaitingApprovalModalProps {
  onOk: () => void;
  onClose: () => void;
}

export default memo(function WaitingApprovalModal(props: WaitingApprovalModalProps) {
  const { onClose, onOk } = props;

  return (
    <DialogBase
      open
      title=""
      onClose={onClose}
      sxContent={sxStyles.contentDialog}
      content={
        <Success
          onButtonClick={onOk}
          contentWrapper={contentWrapper}
          heading="Waiting for Token Approval"
          subheading="This may take a few seconds. Once the token is approved you may proceed with the swap transaction."
        />
      }
    />
  );
});
