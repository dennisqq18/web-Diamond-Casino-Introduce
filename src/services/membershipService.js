import { isNuiRuntime, postNui } from './nuiBridge.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const makeActivationId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `activation-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const membershipService = {
  async activate(profile) {
    const startedAt = Date.now();
    const response = await postNui('activateMembership', {
      profile,
      clientActivationId: makeActivationId(),
      startedAt,
    });

    // In a normal browser there is no FiveM callback, so emulate the final
    // acknowledgement. This keeps the React flow identical in preview and NUI.
    if (!isNuiRuntime()) {
      await wait(420);
    }

    return {
      ok: response?.ok !== false,
      activationId: response?.activationId ?? makeActivationId(),
      activatedAt: response?.activatedAt ?? new Date().toISOString(),
      profile: response?.profile ?? profile,
    };
  },

  async close(reason = 'user') {
    try {
      await postNui('closeMembership', { reason });
    } catch {
      // The local UI should still close even if an external NUI callback is absent.
    }
  },

  async reportAgeGate(result) {
    try {
      await postNui('membershipAgeGate', { result, at: new Date().toISOString() });
    } catch {
      // Non-critical analytics / host notification.
    }
  },
};
