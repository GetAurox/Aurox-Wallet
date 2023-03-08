import { ReactNode, useMemo, useState } from "react";

import { RegistrationProgressContext } from "./RegistrationProgressContext";
import { RegistrationProgressProps, RegistrationProgressContextValue } from "./types";

export interface RegistrationProgressContextProviderProps {
  children?: ReactNode;
}

export function RegistrationProgressContextProvider(props: RegistrationProgressContextProviderProps) {
  const { children } = props;

  const [progress, setProgress] = useState<RegistrationProgressProps>({ totalPoints: 0, action: null, getPoints: 0, percent: 0 });

  const value = useMemo<RegistrationProgressContextValue>(
    () => ({
      progress,
      setProgress,
    }),
    [progress, setProgress],
  );

  return <RegistrationProgressContext.Provider value={value}>{children}</RegistrationProgressContext.Provider>;
}
