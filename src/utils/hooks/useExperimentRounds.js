import {useEffect, useState} from "react";
import {
  getCachedExperimentRounds,
  preloadExperimentRounds
} from "../experimentRoundsCache";

export function useExperimentRounds() {
  const cached = getCachedExperimentRounds();
  const [state, setState] = useState(
    cached
      ? {isLoading: false, rounds: cached.rounds, error: null}
      : {isLoading: true, rounds: [], error: null}
  );

  useEffect(() => {
    let isMounted = true;

    preloadExperimentRounds()
      .then((result) => {
        if (!isMounted) {
          return;
        }
        setState({isLoading: false, rounds: result.rounds, error: null});
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }
        setState({isLoading: false, rounds: [], error});
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
