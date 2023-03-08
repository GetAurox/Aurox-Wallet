import { useHistoryGoBack } from "ui/common/history";

import NotFound from "ui/components/common/NotFound";
import Header from "ui/components/layout/misc/Header";

export default function PageNotFound() {
  const goBack = useHistoryGoBack();

  return (
    <>
      <Header title="404" onBackClick={goBack} />
      <NotFound flexGrow={1} />
    </>
  );
}
