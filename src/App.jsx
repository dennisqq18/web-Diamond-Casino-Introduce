import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import AgeGate from './components/AgeGate.jsx';
import CasinoBrand from './components/CasinoBrand.jsx';
import CloseButton from './components/CloseButton.jsx';
import FeatureRow from './components/FeatureRow.jsx';
import HoldToActivateButton from './components/HoldToActivateButton.jsx';
import SignatureSeal from './components/SignatureSeal.jsx';
import { CoinsIcon, CrownIcon, GiftIcon } from './components/icons.jsx';
import { useHoldActivation } from './hooks/useHoldActivation.js';
import { usePointerTilt } from './hooks/usePointerTilt.js';
import { membershipService } from './services/membershipService.js';
import { audioService } from './services/audioService.js';
import { subscribeNuiMessages } from './services/nuiBridge.js';
import { initialMembershipState, membershipReducer } from './state/membershipReducer.js';

const blockCopy = (event) => event.preventDefault();

const clamp01 = (value) => Math.max(0, Math.min(1, value));
const smoothstep = (start, end, value) => {
  const t = clamp01((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

export default function App() {
  const [state, dispatch] = useReducer(membershipReducer, initialMembershipState);
  const panelRef = useRef(null);
  const cardRef = useRef(null);
  const activationRequestRef = useRef(false);
  const previousStatusRef = useRef(state.status);

  const completeActivation = useCallback(async () => {
    if (activationRequestRef.current || state.status === 'active') return;
    activationRequestRef.current = true;
    dispatch({ type: 'ACTIVATION_START' });

    try {
      const result = await membershipService.activate(state.profile);
      if (!result.ok) throw new Error('Activation was rejected.');
      dispatch({ type: 'ACTIVATION_SUCCESS', payload: result });
    } catch (error) {
      activationRequestRef.current = false;
      dispatch({ type: 'ACTIVATION_ERROR', payload: error?.message });
    }
  }, [state.profile, state.status]);

  const hold = useHoldActivation({
    duration: 1700,
    disabled: state.status === 'active' || state.status === 'activating',
    onComplete: completeActivation,
  });

  const tilt = usePointerTilt(cardRef, { trackingRef: panelRef, strengthX: 6.4, strengthY: 8.8 });

  useEffect(() => {
    if (state.status === 'active') {
      hold.lockAtComplete();
      activationRequestRef.current = false;
    }

    if (state.status === 'idle' && state.error) {
      hold.setProgress(0);
    }
  }, [state.status, state.error, hold.lockAtComplete, hold.setProgress]);

  useEffect(() => {
    const previous = previousStatusRef.current;

    if (state.status === 'active' && previous !== 'active') {
      audioService.playSuccess();
    }

    previousStatusRef.current = state.status;
  }, [state.status]);

  useEffect(() => {
    return subscribeNuiMessages((message) => {
      switch (message.type) {
        case 'membership:setProfile':
          dispatch({ type: 'SET_PROFILE', payload: message.payload ?? {} });
          break;
        case 'membership:close':
          dispatch({ type: 'CLOSE', payload: 'host' });
          break;
        case 'membership:open':
          dispatch({ type: 'OPEN' });
          break;
        default:
          break;
      }
    });
  }, []);

  const rawProgress = state.status === 'active' ? 1 : hold.progress;
  const phases = useMemo(() => {
    return {
      panel: smoothstep(0.04, 0.52, rawProgress),
      card: smoothstep(0.12, 0.66, rawProgress),
      feature1: smoothstep(0.24, 0.5, rawProgress),
      feature2: smoothstep(0.4, 0.68, rawProgress),
      feature3: smoothstep(0.56, 0.84, rawProgress),
      signature: smoothstep(0.42, 0.96, rawProgress),
      meta: state.status === 'active' ? 1 : smoothstep(0.88, 1, rawProgress),
      close: state.status === 'active' ? 1 : 0,
    };
  }, [rawProgress, state.status]);

  const features = useMemo(
    () => [
      {
        icon: <CrownIcon />,
        title: 'PRIVATE SALON',
        kicker: 'Discreet arrival · reserved reception',
        copy: 'A reserved salon, priority reception and discreet host service — prepared exclusively for selected members.',
        progress: phases.feature1,
      },
      {
        icon: <CoinsIcon />,
        title: 'CURATED GAMING',
        kicker: 'Private tables · elevated limits',
        copy: 'A more selective gaming experience with curated tables, elevated limits and access to private sessions.',
        progress: phases.feature2,
      },
      {
        icon: <GiftIcon />,
        title: 'BESPOKE PRIVILEGES',
        kicker: 'Tailored rewards · invitation only',
        copy: 'Personalized rewards, discreet privileges and invitation-only experiences reserved for the membership circle.',
        progress: phases.feature3,
      },
    ],
    [phases.feature1, phases.feature2, phases.feature3]
  );

  const acceptAge = async () => {
    dispatch({ type: 'AGE_ACCEPT' });
    membershipService.reportAgeGate('accepted');
  };

  const declineAge = () => {
    dispatch({ type: 'AGE_DECLINE' });
    membershipService.reportAgeGate('declined-once');
  };

  const confirmMinor = async () => {
    dispatch({ type: 'AGE_BLOCK' });
    membershipService.reportAgeGate('underage-confirmed');
    membershipService.close('underage');
  };

  const closeMenu = async () => {
    dispatch({ type: 'CLOSE', payload: 'user' });
    await membershipService.close('user');
  };

  if (state.isClosed || state.ageStep === 'blocked') {
    return null;
  }

  return (
    <main
      className="nui-shell"
      onCopy={blockCopy}
      onCut={blockCopy}
      onDragStart={blockCopy}
      onContextMenu={blockCopy}
    >
      {state.ageStep !== 'accepted' ? (
        <AgeGate
          step={state.ageStep}
          onAccept={acceptAge}
          onDecline={declineAge}
          onConfirmMinor={confirmMinor}
        />
      ) : (
        <section
          ref={panelRef}
          className={`access-panel ${state.status === 'active' ? 'is-activated' : ''} ${hold.isHolding ? 'is-holding' : ''} ${state.status === 'activating' ? 'is-finalizing' : ''}`}
          aria-label="Diamond Casino membership"
          onMouseMove={tilt.onMouseMove}
          onMouseLeave={tilt.onMouseLeave}
          style={{
            '--hold-progress': rawProgress,
            '--phase-panel': phases.panel,
            '--phase-card': phases.card,
            '--phase-meta': phases.meta,
            '--phase-close': phases.close,
          }}
        >
          <div className="panel-scene" aria-hidden="true">
            <div className="scene-wordmark">
              <span>THE</span>
              <strong>Diamond</strong>
              <em>CASINO &amp; RESORT</em>
            </div>
            <div className="scene-door" />
            <div className="scene-floor" />
            <div className="scene-ambient scene-ambient--left" />
            <div className="scene-ambient scene-ambient--right" />
            <div className="scene-pointer-glow" />
            <div className="scene-activation-glow" />
          </div>

          <span className="panel-diamond panel-diamond-top" />

          {state.status === 'active' && <CloseButton onClose={closeMenu} />}

          <CasinoBrand />

          <div className="card-stage" aria-label="Diamond member card">
            <div className="card-stage-glow" aria-hidden="true" />
            <div className="card-ground-line" aria-hidden="true" />

            <article ref={cardRef} className="member-card">
              <div className="card-sheen" />
              <div className="card-lines" />
              <div className="card-reflection" />
              <div className="card-edge-glow" />
              <div className="card-activation-wave" />

              <div className="card-topline">
                <div className="card-access-label"><span /> PREMIUM ACCESS</div>
                <div className="card-serial">DC · 01 / AURUM</div>
              </div>

              <div className="card-header">
                <div className="card-brand-block">
                  <div className="card-title">{state.profile.membershipLabel}</div>
                  <div className="card-subtitle">DIAMOND CASINO ACCESS</div>
                </div>
                <div className="card-mark">
                  <SignatureSeal progress={phases.signature} active={state.status === 'active'} />
                </div>
              </div>

              <div className="card-middle" aria-hidden="true">
                <div className="card-chip">
                  <span /><span /><span /><span /><span /><span />
                </div>
                <div className="card-security-copy">
                  <span>MEMBER ACCESS</span>
                  <strong>DIAMOND PRIVATE NETWORK</strong>
                </div>
                <div className="card-hologram"><i /><b>◆</b></div>
              </div>

              <div className="card-bottom">
                <div className="member-block">
                  <div className="tiny-label">MEMBER</div>
                  <div className="member-name">{state.profile.memberName}</div>
                  <div className="member-rule" />
                  <div className="member-meta">{state.profile.privilegeLevel}</div>
                </div>

                <div className="valid-block">
                  <div className="tiny-label">VALID THRU</div>
                  <div className="valid-date">{state.profile.validThru}</div>
                </div>
              </div>

              <div className="card-microprint" aria-hidden="true">THE DIAMOND · CASINO &amp; RESORT · PRIVATE MEMBERSHIP · LOS SANTOS</div>
            </article>
          </div>

          <div className="features">
            {features.map((feature, index) => (
              <FeatureRow
                key={feature.title}
                index={index}
                icon={feature.icon}
                title={feature.title}
                kicker={feature.kicker}
                progress={feature.progress}
              >
                {feature.copy}
              </FeatureRow>
            ))}
          </div>

          <HoldToActivateButton
            progress={rawProgress}
            isHolding={hold.isHolding}
            status={state.status}
            onPointerDown={(event) => {
              audioService.unlock();
              hold.start(event);
            }}
            onPointerUp={hold.end}
            onPointerCancel={hold.end}
          />

          {state.error && <div className="activation-error">{state.error}</div>}

          <div className="footer-ornament"><i /><span /><i /></div>
          <div className="footer-copy">
            {state.status === 'active' ? 'MEMBERSHIP AUTHORIZED' : 'YOUR PRIVATE EXPERIENCE BEGINS HERE'}
          </div>
        </section>
      )}
    </main>
  );
}
