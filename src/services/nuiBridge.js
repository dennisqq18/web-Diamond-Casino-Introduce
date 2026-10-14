const hasNuiRuntime = () =>
  typeof window !== 'undefined' && typeof window.GetParentResourceName === 'function';

export const isNuiRuntime = hasNuiRuntime;

export async function postNui(eventName, payload = {}) {
  if (!hasNuiRuntime()) {
    return { ok: true, mock: true, eventName, payload };
  }

  const resourceName = window.GetParentResourceName();
  const response = await fetch(`https://${resourceName}/${eventName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`NUI request failed: ${eventName}`);
  }

  const text = await response.text();
  if (!text) return { ok: true };

  try {
    return JSON.parse(text);
  } catch {
    return { ok: true, raw: text };
  }
}

export function subscribeNuiMessages(handler) {
  if (typeof window === 'undefined') return () => {};

  const listener = (event) => {
    if (!event?.data || typeof event.data !== 'object') return;
    handler(event.data);
  };

  window.addEventListener('message', listener);
  return () => window.removeEventListener('message', listener);
}
