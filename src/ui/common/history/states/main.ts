import { useCallback } from "react";

import { useHistoryReset, useHistoryState } from "../hooks";

export type MainPageSection = "home" | "markets" | "transactions" | "profile" | "swap";

export const mainPageSections: MainPageSection[] = ["home", "markets", "transactions", "profile", "swap"];

export function useMainPageSection() {
  const [section, setSection] = useHistoryState<MainPageSection>("section", "home");

  const sectionIndex = mainPageSections.indexOf(section);

  return { section, sectionIndex, setSection };
}

export function useMainPagePopupOpen() {
  const [popupOpen, setPopupOpen] = useHistoryState<boolean>("operationsPopupOpen", false);

  return { popupOpen, setPopupOpen };
}

export function useGoHome() {
  const reset = useHistoryReset();

  return useCallback(
    <S extends MainPageSection>(section?: S, pageSpecificStates?: any) => {
      reset("/", { ...pageSpecificStates, section: section && mainPageSections.includes(section) ? section : "home" });
    },
    [reset],
  );
}
