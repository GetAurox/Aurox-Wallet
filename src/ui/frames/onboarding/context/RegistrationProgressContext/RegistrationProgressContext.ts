import { createContext } from "react";

import noop from "lodash/noop";

import { RegistrationProgressContextValue } from "./types";

export const RegistrationProgressContext = createContext<RegistrationProgressContextValue>({
  progress: { totalPoints: 0, action: null, getPoints: 0, percent: 0 },
  setProgress: noop,
});
