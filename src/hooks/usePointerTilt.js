import { useCallback } from 'react';

const resetVars = (element) => {
  if (!element) return;
  element.style.setProperty('--card-pointer-x', '50%');
  element.style.setProperty('--card-pointer-y', '36%');
  element.style.setProperty('--card-rotate-x', '0deg');
  element.style.setProperty('--card-rotate-y', '0deg');
  element.style.setProperty('--card-pointer-alpha', '0');
};

/**
 * Tilts only the target element while tracking the cursor inside a larger area.
 * This keeps the full menu perfectly still and gives the physical card its own
 * independent parallax/reflection response.
 */
export function usePointerTilt(
  targetRef,
  { trackingRef = targetRef, strengthX = 7, strengthY = 9 } = {}
) {
  const onMouseMove = useCallback(
    (event) => {
      const target = targetRef.current;
      const trackingArea = trackingRef?.current ?? target;
      if (!target || !trackingArea) return;

      const rect = trackingArea.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      const rotateX = (0.5 - py) * strengthX;
      const rotateY = (px - 0.5) * strengthY;

      target.style.setProperty('--card-pointer-x', `${(px * 100).toFixed(2)}%`);
      target.style.setProperty('--card-pointer-y', `${(py * 100).toFixed(2)}%`);
      target.style.setProperty('--card-rotate-x', `${rotateX.toFixed(2)}deg`);
      target.style.setProperty('--card-rotate-y', `${rotateY.toFixed(2)}deg`);
      target.style.setProperty('--card-pointer-alpha', '1');
    },
    [targetRef, trackingRef, strengthX, strengthY]
  );

  const onMouseLeave = useCallback(() => resetVars(targetRef.current), [targetRef]);

  return { onMouseMove, onMouseLeave };
}
