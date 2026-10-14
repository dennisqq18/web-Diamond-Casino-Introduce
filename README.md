# Diamond Casino Membership UI

React/Vite membership interface designed to work both as a normal browser preview and as a FiveM NUI.

## Run locally

```bash
npm install
npm run dev
```

## Client-side architecture

- `state/membershipReducer.js` - UI/session state machine.
- `hooks/useHoldActivation.js` - hold-to-authorize interaction driven by `requestAnimationFrame`.
- `hooks/usePointerTilt.js` - cursor parallax/3D tilt without moving the cursor.
- `services/membershipService.js` - activation, age-gate and close workflow.
- `services/nuiBridge.js` - browser/FiveM transport abstraction.
- `components/*` - isolated visual and interactive components.

## Optional FiveM NUI callbacks

When `window.GetParentResourceName` exists, the UI automatically posts JSON to:

- `activateMembership`
- `closeMembership`
- `membershipAgeGate`

Without FiveM, the service automatically falls back to an in-browser mock acknowledgement so the same flow can be previewed normally.

## Optional messages from the host

The page listens for `window.postMessage` payloads:

```js
{ type: 'membership:setProfile', payload: {
  memberName: 'AURUM SIGNATURE',
  membershipLabel: 'AURUM',
  validThru: '12 · 12 · 2030',
  privilegeLevel: 'PRIVILEGE LEVEL'
}}
```

Also supported:

```js
{ type: 'membership:close' }
{ type: 'membership:open' }
```

The 18+ rejection and normal close behavior are kept in memory only, so a browser refresh resets the interface as requested.

## Audio + motion notes

- `services/audioService.js` uses the browser Web Audio API to synthesize a quiet premium success chime after activation. No audio asset or external library is required.
- `hooks/usePointerTilt.js` now affects only the physical membership card. The main menu remains completely fixed while the card follows the cursor with subtle 3D tilt and reflection.
- The close icon is now an inline SVG, so `lucide-react` is no longer required.

## V4 visual refinement

- Rebuilt the membership card with a wider, more realistic physical-card proportion, chip/security details, hologram and better spacing.
- Reworked the privilege area into premium editorial rows with numbered rails, refined type hierarchy and glass/metal accents.
- Rebuilt the 18+ gate as a branded Diamond compliance card with a two-step verification flow.
- Existing activation, signature, audio, close and FiveM/NUI bridge behavior is preserved.
