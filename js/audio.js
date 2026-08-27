/* ==========================================================================
   CatKeyLab - Synthesized Web Audio & Haptic System
   ========================================================================== */

let audioCtx = null;
let soundEnabled = true;

export function initAudio() {
  soundEnabled = localStorage.getItem('catkeylab_sound') !== 'false';
  
  // Attach document-wide gesture listeners to unlock Web Audio context automatically
  const unlock = () => {
    getAudioContext();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
  window.addEventListener('mousemove', unlock, { passive: true, once: true });
}

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('catkeylab_sound', soundEnabled);
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function playClickSound(freq = 600, duration = 0.04) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silent catch if audio context blocked by browser autoplay policy
  }
}

export function triggerVibration(pattern = 30) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
}
