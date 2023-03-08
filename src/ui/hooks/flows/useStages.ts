import { useCallback, useState } from "react";

export function useStages<T extends string>(stages: readonly T[], opts?: { defaultValue?: T | null }) {
  const [stage, setStage] = useState<T>(opts?.defaultValue ?? stages[0]);

  const back = useCallback(() => {
    const currentStageIdx = stages.findIndex(currentStage => currentStage === stage);

    if (currentStageIdx === 0) throw new Error("Cannot move past 0 stages");

    setStage(stages[currentStageIdx - 1]);
  }, [stage, stages]);

  const forward = useCallback(() => {
    const currentStageIdx = stages.findIndex(currentStage => currentStage === stage);

    if (currentStageIdx === stages.length - 1) throw new Error("Cannot move past final stage");

    setStage(stages[currentStageIdx + 1]);
  }, [stage, stages]);

  return { stage, setStage, back, forward };
}
