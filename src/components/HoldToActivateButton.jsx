import React from 'react';

export default function HoldToActivateButton({
  progress,
  isHolding,
  status,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
}) {
  const active = status === 'active';
  const activating = status === 'activating';

  const label = active
    ? 'MEMBERSHIP ACTIVE'
    : activating
      ? 'FINALIZING ACCESS'
      : isHolding
        ? 'HOLD TO AUTHORIZE'
        : 'ACTIVATE MEMBERSHIP';

  const preventKeyboardActivation = (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <button
      className={`claim-button ${active ? 'is-complete' : ''}`}
      type="button"
      tabIndex={-1}
      aria-label={label}
      disabled={active || activating}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onKeyDown={preventKeyboardActivation}
      onBlur={(event) => event.currentTarget.blur()}
      style={{ '--button-width': `${(active ? 1 : progress) * 100}%` }}
    >
      <span className="button-progress" aria-hidden="true" />
      <span className="button-sweep" aria-hidden="true" />
      <span className="button-label">{label}</span>
      <span className="button-arrow" aria-hidden="true">↗</span>
    </button>
  );
}
