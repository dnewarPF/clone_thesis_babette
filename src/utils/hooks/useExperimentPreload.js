import {useEffect, useState} from "react";
import {
  getCachedExperimentRounds,
  preloadExperimentRounds
} from "../experimentRoundsCache";

export function useExperimentPreload() {
  const cached = getCachedExperimentRounds();
  const [isReady, setIsReady] = useState(Boolean(cached));
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (isReady) {
      return;
    }

    let active = true;
    setIsLoading(true);

    preloadExperimentRounds()
      .then(() => {
        if (!active) {
          return;
        }
        setIsReady(true);
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt, isReady]);

  const retry = () => {
    if (isReady) {
      return;
    }
    setError(null);
    setIsLoading(true);
    setAttempt((prev) => prev + 1);
  };

  return {isReady, isLoading, error, retry};
}
