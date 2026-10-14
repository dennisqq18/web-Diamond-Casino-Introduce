import React from 'react';

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default function CloseButton({ onClose }) {
  return (
    <button className="menu-close" type="button" aria-label="Close membership menu" onClick={onClose}>
      <span className="menu-close__halo" aria-hidden="true" />
      <CloseIcon />
    </button>
  );
}
