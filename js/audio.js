/* ==========================================================================
   ClickPulse - Synthesized Web Audio & Haptic System
   ========================================================================== */

let audioCtx = null;
let soundEnabled = true;

export function initAudio() {
  soundEnabled = localStorage.getItem('clickpulse_sound') !== 'false';
}

export function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem('clickpulse_sound', soundEnabled);
  return soundEnabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function playClickSound(freq = 600, duration = 0.04) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
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
