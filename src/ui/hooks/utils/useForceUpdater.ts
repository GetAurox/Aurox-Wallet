import { useReducer } from "react";

export function useForceUpdater() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  return forceUpdate as () => void;
}
