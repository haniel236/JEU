// Gestionnaire de sons de l'application (Web Audio API).
// Génère des sons synthétiques — aucun fichier audio requis.
// Le volume est volontairement élevé : certaines actions étaient trop silencieuses.

export type SoundName = 'click' | 'success' | 'error' | 'notify' | 'victory';

const STORAGE_KEY = 'zmj:sound';

interface SoundPrefs {
  muted: boolean;
  volume: number; // 0..1
}

function loadPrefs(): SoundPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SoundPrefs>;
      return {
        muted: Boolean(parsed.muted),
        volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : 0.9,
      };
    }
  } catch {
    /* ignore */
  }
  return { muted: false, volume: 0.9 };
}

let prefs = loadPrefs();
let ctx: AudioContext | null = null;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Tone {
  freq: number;
  start: number; // décalage en secondes
  duration: number;
  type?: OscillatorType;
  gain?: number; // gain relatif de la note (0..1)
}

// Chaque son est une petite séquence de notes.
const RECIPES: Record<SoundName, Tone[]> = {
  click: [{ freq: 320, start: 0, duration: 0.06, type: 'triangle', gain: 0.5 }],
  success: [
    { freq: 523.25, start: 0, duration: 0.12, gain: 0.9 },
    { freq: 659.25, start: 0.1, duration: 0.12, gain: 0.9 },
    { freq: 783.99, start: 0.2, duration: 0.2, gain: 1 },
  ],
  error: [
    { freq: 311.13, start: 0, duration: 0.16, type: 'sawtooth', gain: 0.7 },
    { freq: 233.08, start: 0.14, duration: 0.24, type: 'sawtooth', gain: 0.7 },
  ],
  notify: [
    { freq: 880, start: 0, duration: 0.12, gain: 1 },
    { freq: 1174.66, start: 0.11, duration: 0.18, gain: 1 },
  ],
  victory: [
    { freq: 523.25, start: 0, duration: 0.12, gain: 1 },
    { freq: 659.25, start: 0.12, duration: 0.12, gain: 1 },
    { freq: 783.99, start: 0.24, duration: 0.12, gain: 1 },
    { freq: 1046.5, start: 0.36, duration: 0.3, gain: 1 },
  ],
};

export function playSound(name: SoundName) {
  if (prefs.muted || prefs.volume <= 0) return;
  const audio = getCtx();
  if (!audio) return;

  const now = audio.currentTime;
  // Gain maître boosté pour que les actions restent bien audibles.
  const master = audio.createGain();
  master.gain.value = prefs.volume;
  master.connect(audio.destination);

  for (const tone of RECIPES[name]) {
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = tone.type ?? 'sine';
    osc.frequency.value = tone.freq;

    const startAt = now + tone.start;
    const peak = 0.35 * (tone.gain ?? 1);
    g.gain.setValueAtTime(0.0001, startAt);
    g.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, startAt + tone.duration);

    osc.connect(g);
    g.connect(master);
    osc.start(startAt);
    osc.stop(startAt + tone.duration + 0.02);
  }
}

// Certains navigateurs exigent une interaction utilisateur avant de jouer du son.
export function unlockAudio() {
  getCtx();
}

export function isMuted() {
  return prefs.muted;
}

export function setMuted(muted: boolean) {
  prefs = { ...prefs, muted };
  persist();
}

export function toggleMuted() {
  setMuted(!prefs.muted);
  return prefs.muted;
}

export function getVolume() {
  return prefs.volume;
}

export function setVolume(volume: number) {
  prefs = { ...prefs, volume: Math.min(1, Math.max(0, volume)) };
  persist();
}

let interactionsBound = false;

// Débloque l'audio à la première interaction et joue un léger clic sur les boutons.
export function initSoundInteractions() {
  if (interactionsBound || typeof document === 'undefined') return;
  interactionsBound = true;

  const unlockOnce = () => {
    unlockAudio();
    window.removeEventListener('pointerdown', unlockOnce);
    window.removeEventListener('keydown', unlockOnce);
  };
  window.addEventListener('pointerdown', unlockOnce, { once: true });
  window.addEventListener('keydown', unlockOnce, { once: true });

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null;
      const el = target?.closest('button, a, [role="button"]') as HTMLElement | null;
      if (!el || el.hasAttribute('disabled') || el.dataset.silent === 'true') return;
      playSound('click');
    },
    true,
  );
}
