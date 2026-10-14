import React from 'react';

export default function SignatureSeal({ progress = 0, active = false }) {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const dashOffset = 100 - safeProgress * 100;

  return (
    <svg className="signature-seal" viewBox="0 0 140 80" aria-hidden="true">
      <circle className="signature-ring" cx="70" cy="40" r="33" />
      <path
        className="signature-base"
        d="M25 50c7-12 11-17 15-17 3 0 4 3 4 6 0 4-1 8 1 8 3 0 7-8 11-13 2-2 3-2 4 0 2 6-1 14 4 14 5 0 8-7 12-13 2-3 4-4 5 0 1 6 1 15 5 15 3 0 7-4 10-10 2-4 4-4 5 0 1 6 4 10 10 11"
      />
      <path
        className="signature-line"
        pathLength="100"
        style={{ strokeDashoffset: dashOffset }}
        d="M25 50c7-12 11-17 15-17 3 0 4 3 4 6 0 4-1 8 1 8 3 0 7-8 11-13 2-2 3-2 4 0 2 6-1 14 4 14 5 0 8-7 12-13 2-3 4-4 5 0 1 6 1 15 5 15 3 0 7-4 10-10 2-4 4-4 5 0 1 6 4 10 10 11"
      />
      <path
        className={`signature-shine ${active ? 'is-active' : ''}`}
        d="M28 58c17 6 63 6 84-2"
      />
    </svg>
  );
}
