import React from 'react';

export default function FeatureRow({ icon, title, kicker, children, progress = 0, index = 0 }) {
  const order = String(index + 1).padStart(2, '0');

  return (
    <div
      className="feature-row"
      style={{
        '--feature-progress': progress,
        '--feature-order': index,
      }}
    >
      <div className="feature-rail" aria-hidden="true">
        <span>{order}</span>
        <i />
      </div>

      <div className="feature-icon">{icon}</div>

      <div className="feature-copy-wrap">
        <div className="feature-title-row">
          <div className="feature-title-block">
            <div className="feature-title">{title}</div>
            <div className="feature-kicker">{kicker}</div>
          </div>
          <div className="feature-mark" aria-hidden="true"><span /><i /></div>
        </div>
        <div className="feature-copy">{children}</div>
      </div>
    </div>
  );
}
