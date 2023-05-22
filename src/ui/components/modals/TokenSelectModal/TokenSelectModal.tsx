import { memo } from "react";
import omit from "lodash/omit";

import FromTokenSelectModal from "./FromTokenSelectModal";
import ToTokenSelectModal from "./ToTokenSelectModal";

import { TokenSelectModalProps } from "./types";

export default memo(function TokenSelectModal(props: TokenSelectModalProps) {
  const { direction } = props;

  return direction === "from" ? (
    <FromTokenSelectModal {...omit(props, ["direction", "selectedNetworkIdentifier"])} />
  ) : (
    <ToTokenSelectModal {...omit(props, ["direction"])} />
  );
});
