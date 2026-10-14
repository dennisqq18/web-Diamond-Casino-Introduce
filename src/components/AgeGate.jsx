import React from 'react';

const DiamondGlyph = () => (
  <svg className="age-glyph" viewBox="0 0 64 52" aria-hidden="true">
    <path d="M9 17 19 7h26l10 10-23 28L9 17Z" />
    <path d="M9 17h46M19 7l7 10 6-10 6 10 7-10M26 17l6 28 6-28" />
  </svg>
);

export default function AgeGate({ step, onAccept, onDecline, onConfirmMinor }) {
  const confirmStep = step === 'confirm-no';

  return (
    <section className={`age-panel ${confirmStep ? 'age-panel--confirm' : ''}`} aria-label="Age confirmation">
      <div className="age-panel__noise" aria-hidden="true" />
      <div className="age-panel__glow" aria-hidden="true" />
      <span className="panel-diamond panel-diamond-top" />

      <div className="age-brand">
        <DiamondGlyph />
        <div>
          <span>THE DIAMOND</span>
          <strong>CASINO &amp; RESORT</strong>
        </div>
      </div>

      <div className="age-step">{confirmStep ? 'VERIFICARE 02 / 02' : 'VERIFICARE 01 / 02'}</div>

      <div className="age-emblem" aria-hidden="true">
        <span className="age-emblem__ring" />
        <strong>18</strong>
        <small>+</small>
      </div>

      <div className="age-panel__eyebrow">MEMBERSHIP ACCESS CONTROL</div>
      <h2>{confirmStep ? 'Confirmi că nu ai 18 ani?' : 'Confirmă că ai împlinit 18 ani'}</h2>
      <p>
        {confirmStep
          ? 'Aceasta este ultima confirmare. Dacă alegi că nu ai 18 ani, accesul la această interfață va fi închis până la reîncărcarea paginii.'
          : 'Accesul la zona de membership este rezervat persoanelor majore. Confirmarea ta este necesară înainte de a continua.'}
      </p>

      <div className="age-divider"><i /><span /><i /></div>

      <div className="age-actions">
        {confirmStep ? (
          <>
            <button type="button" className="age-action age-action--danger" onClick={onConfirmMinor}>
              <span>Da, confirm că nu am 18 ani</span>
              <b aria-hidden="true">×</b>
            </button>
            <button type="button" className="age-action age-action--primary" onClick={onAccept}>
              <span>Corectez — am 18 ani</span>
              <b aria-hidden="true">↗</b>
            </button>
          </>
        ) : (
          <>
            <button type="button" className="age-action age-action--primary" onClick={onAccept}>
              <span>Confirm — am 18 ani sau peste</span>
              <b aria-hidden="true">↗</b>
            </button>
            <button type="button" className="age-action" onClick={onDecline}>
              <span>Nu am împlinit 18 ani</span>
              <b aria-hidden="true">—</b>
            </button>
          </>
        )}
      </div>

      <div className="age-legal">ACCES 18+ · VERIFICARE LOCALĂ · FĂRĂ STOCAREA DATELOR PERSONALE</div>
    </section>
  );
}
