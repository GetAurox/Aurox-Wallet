import { KeyboardEvent, useCallback, useState } from "react";

export function useKeyLock(key: "CapsLock" | "NumLock" | "ScrollLock") {
  const [toggled, setToggled] = useState(false);

  const onKeyLock = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      setToggled(prevState => event.getModifierState?.(key) ?? prevState);
    },
    [key],
  );

  return [toggled, onKeyLock] as [boolean, (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => void];
}
