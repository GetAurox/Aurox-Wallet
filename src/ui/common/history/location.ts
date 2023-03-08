import { Location, parsePath, Path } from "history";
import { v4 as uuidV4 } from "uuid";

export function createLocationEntry<S extends Record<string, unknown>>(path: string | Partial<Path>, state: S = {} as S): Location {
  return Object.freeze({
    pathname: "/",
    search: "",
    hash: "",
    state: state,
    key: uuidV4(),
    ...(typeof path === "string" ? parsePath(path) : path),
  });
}

export function setLocationEntryState<S extends Record<string, unknown>>(location: Location, newState: S): Location {
  return Object.freeze({ ...location, state: newState });
}
