import { useContext } from "react";

import { AnalyticsContext } from "./context";

const useAnalyticsContext = () => useContext(AnalyticsContext);

export default useAnalyticsContext;
