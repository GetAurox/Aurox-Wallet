import { useEffect } from "react";

import { useHistory } from "ui/common/history";

export function useFocusRestoration() {
  const history = useHistory();

  useEffect(() => {
    if (!history) {
      return;
    }

    const timer = setTimeout(() => {
      const targetId = history.getCurrentState()?.lastFocusedElementId;

      if (targetId) {
        document.getElementById(targetId)?.focus();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [history]);

  useEffect(() => {
    if (!history) {
      return;
    }

    const focusHandler = (event: FocusEvent) => {
      const target = event.target as Element;

      if (target?.id) {
        history.updateCurrentState(draft => {
          draft.lastFocusedElementId = target.id;
        });
      }
    };

    const blurHandler = () => {
      if (document.hasFocus()) {
        history.updateCurrentState(draft => {
          delete draft.lastFocusedElementId;
        });
      }
    };

    document.body.addEventListener("focus", focusHandler, { capture: true, passive: true });
    document.body.addEventListener("blur", blurHandler, { capture: true, passive: true });

    return () => {
      document.body.removeEventListener("focus", focusHandler, { capture: true });
      document.body.removeEventListener("blur", blurHandler, { capture: true });
    };
  }, [history]);
}
