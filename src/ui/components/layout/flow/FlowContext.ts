import { createContext } from "react";

export interface FlowContextValue {
  currentStep: number | null;
  totalSteps: number | null;
}

export default createContext<FlowContextValue>({ currentStep: null, totalSteps: null });
