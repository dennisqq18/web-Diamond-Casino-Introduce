export const initialMembershipState = {
  ageStep: 'initial',
  status: 'idle',
  error: null,
  activation: null,
  isClosed: false,
  closeReason: null,
  profile: {
    memberName: 'AURUM SIGNATURE',
    membershipLabel: 'AURUM',
    validThru: '12 · 12 · 2030',
    privilegeLevel: 'PRIVILEGE LEVEL',
  },
};

export function membershipReducer(state, action) {
  switch (action.type) {
    case 'AGE_ACCEPT':
      return { ...state, ageStep: 'accepted' };
    case 'AGE_DECLINE':
      return { ...state, ageStep: 'confirm-no' };
    case 'AGE_BLOCK':
      return { ...state, ageStep: 'blocked', isClosed: true, closeReason: 'underage' };
    case 'ACTIVATION_START':
      return { ...state, status: 'activating', error: null };
    case 'ACTIVATION_SUCCESS':
      return { ...state, status: 'active', activation: action.payload, error: null };
    case 'ACTIVATION_ERROR':
      return { ...state, status: 'idle', activation: null, error: action.payload ?? 'Activation failed.' };
    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'CLOSE':
      return { ...state, isClosed: true, closeReason: action.payload ?? 'user' };
    case 'OPEN':
      return { ...state, isClosed: false, closeReason: null };
    default:
      return state;
  }
}
