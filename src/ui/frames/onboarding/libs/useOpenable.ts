import { useCallback, useState } from "react";

export function useOpenable(initialIsOpen = false) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);

  const handleOpen = useCallback(() => setIsOpen(true), []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleToggle = useCallback(() => setIsOpen(prev => !prev), []);

  return [isOpen, handleOpen, handleClose, handleToggle] as const;
}
