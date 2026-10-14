import { useCallback, useEffect, useRef, useState } from 'react';

export function useHoldActivation({ duration = 1650, disabled = false, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const frameRef = useRef(0);
  const startedAtRef = useRef(0);
  const completedRef = useRef(false);

  const stop = useCallback(
    ({ reset = true } = {}) => {
      cancelAnimationFrame(frameRef.current);
      startedAtRef.current = 0;
      setIsHolding(false);

      if (completedRef.current) {
        completedRef.current = false;
        return;
      }

      if (reset && !disabled) {
        setProgress(0);
      }
    },
    [disabled]
  );

  const tick = useCallback(
    (timestamp) => {
      if (!startedAtRef.current) startedAtRef.current = timestamp;

      const next = Math.min((timestamp - startedAtRef.current) / duration, 1);
      setProgress(next);

      if (next >= 1) {
        completedRef.current = true;
        setIsHolding(false);
        cancelAnimationFrame(frameRef.current);
        onComplete?.();
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    },
    [duration, onComplete]
  );

  const start = useCallback(
    (event) => {
      if (disabled || isHolding) return;
      event.preventDefault();
      event.currentTarget.blur();

      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture is a progressive enhancement.
      }

      cancelAnimationFrame(frameRef.current);
      startedAtRef.current = 0;
      completedRef.current = false;
      setProgress(0);
      setIsHolding(true);
      frameRef.current = requestAnimationFrame(tick);
    },
    [disabled, isHolding, tick]
  );

  const end = useCallback(
    (event) => {
      try {
        event?.currentTarget?.releasePointerCapture?.(event.pointerId);
      } catch {
        // Ignore browsers that no longer own the pointer capture.
      }
      stop({ reset: true });
    },
    [stop]
  );

  const lockAtComplete = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    completedRef.current = false;
    setIsHolding(false);
    setProgress(1);
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  return { progress, isHolding, start, end, stop, lockAtComplete, setProgress };
}
