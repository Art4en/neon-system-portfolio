/**
 * Sons d'interface 100 % synthétisés avec la Web Audio API (aucun fichier audio).
 * Coupé par défaut ; le contexte audio n'est créé qu'après un geste de l'utilisateur.
 */
type Wave = OscillatorType;

interface ToneOptions {
  freq: number;
  to?: number;
  type?: Wave;
  dur?: number;
  gain?: number;
  delay?: number;
  attack?: number;
  detune?: number;
  filter?: number;
}

class Synth {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private enabled = false;
  private lastHover = 0;

  constructor() {
    if (typeof window === 'undefined') return;
    // Les navigateurs exigent un geste utilisateur pour démarrer l'audio.
    const unlock = () => {
      if (this.enabled) this.ensure();
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.ensure();
    else void this.ctx?.suspend();
  }

  get isEnabled() {
    return this.enabled;
  }

  private ensure(): AudioContext | null {
    try {
      if (!this.ctx) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new Ctx();
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -18;
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.32;
        this.master.connect(comp).connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return this.ctx;
    } catch {
      return null;
    }
  }

  private ready(): AudioContext | null {
    if (!this.enabled) return null;
    const ctx = this.ensure();
    return ctx && ctx.state !== 'closed' ? ctx : null;
  }

  private tone({
    freq,
    to,
    type = 'sine',
    dur = 0.08,
    gain = 0.1,
    delay = 0,
    attack = 0.005,
    detune = 0,
    filter,
  }: ToneOptions) {
    const ctx = this.ready();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    osc.detune.value = detune;
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let node: AudioNode = osc;
    if (filter) {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = filter;
      node = osc.connect(lp);
    }
    node.connect(amp).connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur = 0.2, gain = 0.08, freq = 1200, q = 0.8, sweepTo?: number) {
    const ctx = this.ready();
    if (!ctx || !this.master) return;
    if (!this.noiseBuffer) {
      this.noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t0 = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = q;
    bp.frequency.setValueAtTime(freq, t0);
    if (sweepTo) bp.frequency.exponentialRampToValueAtTime(sweepTo, t0 + dur);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(gain, t0);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(bp).connect(amp).connect(this.master);
    src.start(t0);
    src.stop(t0 + dur);
  }

  /** Bip très court au survol (limité pour ne pas saturer). */
  hover() {
    const now = performance.now();
    if (now - this.lastHover < 60) return;
    this.lastHover = now;
    this.tone({ freq: 2100, type: 'sine', dur: 0.035, gain: 0.025 });
  }

  /** Blip au clic. */
  blip() {
    this.tone({ freq: 660, to: 1320, type: 'square', dur: 0.07, gain: 0.04, filter: 3200 });
  }

  /** Petit tic de frappe (terminal, texte qui s'écrit). */
  tick() {
    this.tone({ freq: 3200 + Math.random() * 600, type: 'square', dur: 0.012, gain: 0.012 });
  }

  /** Débloquage d'un nœud de compétence. */
  unlock() {
    this.tone({ freq: 523, type: 'triangle', dur: 0.09, gain: 0.05 });
    this.tone({ freq: 1046, type: 'triangle', dur: 0.14, gain: 0.04, delay: 0.06 });
  }

  /** Arpège de succès (do-mi-sol-do). */
  achievement() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      this.tone({ freq: f, type: 'triangle', dur: 0.22, gain: 0.06, delay: i * 0.075 }),
    );
    this.tone({ freq: 2093, type: 'sine', dur: 0.5, gain: 0.02, delay: 0.3 });
  }

  /** Erreur (commande inconnue, champ invalide). */
  error() {
    this.tone({ freq: 160, to: 90, type: 'sawtooth', dur: 0.18, gain: 0.05, filter: 900 });
  }

  /** Souffle de transition (changement de niveau). */
  whoosh() {
    this.noise(0.45, 0.05, 400, 1.2, 3200);
  }

  /** Craquement de glitch. */
  glitch() {
    this.noise(0.12, 0.06, 2400, 4);
    this.tone({ freq: 90, type: 'square', dur: 0.08, gain: 0.03 });
  }

  /** Accord synthwave au boot (La mineur 9, scies désaccordées + filtre qui s'ouvre). */
  boot() {
    const ctx = this.ready();
    if (!ctx || !this.master) return;
    const t0 = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.Q.value = 6;
    lp.frequency.setValueAtTime(200, t0);
    lp.frequency.exponentialRampToValueAtTime(2600, t0 + 1.2);
    lp.frequency.exponentialRampToValueAtTime(500, t0 + 3);
    const amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(0.09, t0 + 0.25);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.2);
    lp.connect(amp).connect(this.master);
    [110, 164.81, 196, 246.94, 261.63].forEach((f) => {
      [-9, 9].forEach((det) => {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        o.detune.value = det;
        o.connect(lp);
        o.start(t0);
        o.stop(t0 + 3.3);
      });
    });
    this.tone({ freq: 55, type: 'sine', dur: 2.5, gain: 0.12, attack: 0.05 });
  }

  /** Envoi de transmission (formulaire). */
  transmit() {
    [880, 1174.66, 1567.98].forEach((f, i) =>
      this.tone({ freq: f, type: 'square', dur: 0.06, gain: 0.03, delay: i * 0.05, filter: 4000 }),
    );
  }
}

export const sfx = new Synth();
