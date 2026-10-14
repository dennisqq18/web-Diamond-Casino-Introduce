let audioContext = null;
let masterGain = null;

const getContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.052;
    masterGain.connect(audioContext.destination);
  }

  return audioContext;
};

const scheduleBell = (ctx, when, frequency, gainValue, pan = 0) => {
  const oscillator = ctx.createOscillator();
  const shimmer = ctx.createOscillator();
  const voiceGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const panner = typeof ctx.createStereoPanner === 'function' ? ctx.createStereoPanner() : null;

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, when);

  shimmer.type = 'triangle';
  shimmer.frequency.setValueAtTime(frequency * 2.01, when);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(5200, when);
  filter.Q.setValueAtTime(0.6, when);

  voiceGain.gain.setValueAtTime(0.0001, when);
  voiceGain.gain.exponentialRampToValueAtTime(gainValue, when + 0.018);
  voiceGain.gain.exponentialRampToValueAtTime(gainValue * 0.32, when + 0.14);
  voiceGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.62);

  oscillator.connect(voiceGain);
  shimmer.connect(voiceGain);
  voiceGain.connect(filter);

  if (panner) {
    panner.pan.setValueAtTime(pan, when);
    filter.connect(panner);
    panner.connect(masterGain);
  } else {
    filter.connect(masterGain);
  }

  oscillator.start(when);
  shimmer.start(when);
  oscillator.stop(when + 0.68);
  shimmer.stop(when + 0.68);
};

export const audioService = {
  async unlock() {
    try {
      const ctx = getContext();
      if (ctx?.state === 'suspended') await ctx.resume();
    } catch {
      // Audio is an enhancement; never let it affect membership activation.
    }
  },

  async playSuccess() {
    try {
      const ctx = getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') await ctx.resume();

      const now = ctx.currentTime + 0.025;

      // Quiet, three-step verification chime: warm root, confirmation third,
      // then a light upper sparkle. The master is intentionally conservative.
      scheduleBell(ctx, now, 523.25, 0.42, -0.12);
      scheduleBell(ctx, now + 0.105, 659.25, 0.34, 0.06);
      scheduleBell(ctx, now + 0.215, 987.77, 0.22, 0.16);
    } catch {
      // Ignore unsupported/blocked Web Audio implementations.
    }
  },
};
