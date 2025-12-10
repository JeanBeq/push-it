import { useAppSelector } from '@/store/hooks';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook pour calculer et mettre à jour les secondes écoulées d'un workout.
 * Gère automatiquement l'intervalle et les changements d'état de l'app.
 */
export function useElapsedSeconds() {
  const workout = useAppSelector((state) => state.workout);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const computeElapsedSeconds = useCallback(() => {
    if (!workout.activeSessionId) return 0;
    const base = workout.elapsedBeforePause;
    const running = !workout.isPaused && workout.startedAt ? Date.now() - workout.startedAt : 0;
    return Math.floor((base + running) / 1000);
  }, [workout.activeSessionId, workout.elapsedBeforePause, workout.isPaused, workout.startedAt]);

  useEffect(() => {
    setElapsedSeconds(computeElapsedSeconds());
    if (!workout.activeSessionId || workout.isPaused) return;
    const interval = setInterval(() => setElapsedSeconds(computeElapsedSeconds()), 1000);
    return () => clearInterval(interval);
  }, [computeElapsedSeconds, workout.activeSessionId, workout.isPaused]);

  return elapsedSeconds;
}
