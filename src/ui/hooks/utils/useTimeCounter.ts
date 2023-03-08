import { useCallback, useEffect, useRef, useState } from "react";

export function useTimeCounter() {
  const setTimeRef = useRef(0);

  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (round === 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft => {
        const newTime = timeLeft - 1;

        if (newTime <= 0) {
          clearInterval(intervalId);
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [round]);

  const set = useCallback((time: number) => {
    setTimeRef.current = time;

    setRound(round => round + 1);
    setTimeLeft(time);
  }, []);

  const reset = useCallback(() => {
    setRound(round => round + 1);
    setTimeLeft(setTimeRef.current);
  }, []);

  return { set, reset, timeLeft, started: round > 0, finished: round > 0 && timeLeft <= 0 };
}
