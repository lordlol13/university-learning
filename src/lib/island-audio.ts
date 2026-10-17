/**
 * Island synthesized audio chimes for milestone interaction and completion.
 * Inspired by Lovable's Island Audio engine, synthesized natively via Web Audio API.
 */

let audioCtx: AudioContext | null = null;
const STORAGE_KEY = "uplift_sound_enabled";
const listeners = new Set<() => void>();

export function getSoundPreference(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === null ? true : val === "true";
  } catch {
    return true;
  }
}

export function setSoundPreference(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore storage restrictions
  }
  listeners.forEach((listener) => listener());
}

export function subscribeSoundPreference(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function playChime(enabled = true, success = false): void {
  if (!enabled || typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }

    const ctx = audioCtx;
    // Success: Bright celebratory triad (C5, E5, G5).
    // Selection: Gentle rising harmonic interval (E5, A5).
    const frequencies = success ? [523.25, 659.25, 783.99] : [659.25, 880];

    frequencies.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.075;

      oscillator.type = "sine";
      oscillator.frequency.value = frequency;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.065, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.35);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.38);
    });
  } catch {
    // Audio is optional and fail-safe on unsupported or restricted environments
  }
}
