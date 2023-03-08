import { loadUserPreferencesFromLocalArea, saveUserPreferencesToLocalArea, defaultUserPreferences } from "common/storage";

import { makeStorageHook } from "./makeStorageHook";

export const useLocalUserPreferences = makeStorageHook(
  loadUserPreferencesFromLocalArea,
  saveUserPreferencesToLocalArea,
  defaultUserPreferences,
);
