import { useContext } from "react";

import { RegistrationProgressContext } from "./RegistrationProgressContext";

export function useRegistrationProgressContext() {
  return useContext(RegistrationProgressContext);
}
