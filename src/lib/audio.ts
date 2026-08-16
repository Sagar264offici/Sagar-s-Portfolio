/**
 * Audio system.
 *
 * - OFF by default. `enable()` is only called from a user gesture (the SOUND toggle).
 * - If /audio/portfolio-theme.mp3 exists (a properly licensed track provided by
 *   Sagar), it is played in a loop. Otherwise an original ambient pad is
 *   generated with Web Audio — no copyrighted music is bundled.
 * - UI blips (hover/click/select/terminal) are quiet and gated by the same toggle.
 */

const THEME_URL = "/audio/portfolio-theme.mp3";

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private padNodes: { osc: OscillatorNode[]; gain: GainNode; filter: BiquadFilterNode } | null = null;
  private pulseTimer: number | null = null;
  private htmlAudio: HTMLAudioElement | null = null;
  private usingFile = false;
  private enabled = false;
  private themeChecked = false;

  get isEnabled(): boolean {
    return this.enabled;
  }

  async enable(): Promise<void> {
    if (this.enabled) return;
    try {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      await this.ctx.resume();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);

      this.enabled = true;
      if (!this.themeChecked) {
        this.themeChecked = true;
        const ok = await this.checkThemeFile();
        if (ok) this.startHtmlAudio();
        else this.startAmbientPad();
      } else if (this.usingFile) {
        // recreate the element — a closed context detaches the old source node
        this.startHtmlAudio();
      } else {
        this.startAmbientPad();
      }
    } catch {
      this.enabled = false;
    }
  }

  disable(): void {
    this.enabled = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
    this.stopPad();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close().catch(() => undefined);
    }
    this.ctx = null;
    this.master = null;
  }

  private async checkThemeFile(): Promise<boolean> {
    try {
      const res = await fetch(THEME_URL, { method: "HEAD" });
      // SPA rewrites return index.html with a 200 — only a real audio file counts.
      const isAudio = (res.headers.get("content-type") || "").includes("audio");
      return res.ok && isAudio;
    } catch {
      return false;
    }
  }

  private startHtmlAudio(): void {
    if (!this.ctx || !this.master) return;
    this.usingFile = true;
    const audio = new Audio(THEME_URL);
    audio.loop = true;
    audio.volume = 0.45;
    const src = this.ctx.createMediaElementSource(audio);
    src.connect(this.master);
    audio.play().catch(() => undefined);
    this.htmlAudio = audio;
  }

  /** Original ambient pad: slow evolving chord, cinematic pulse. */
  private startAmbientPad(): void {
    if (!this.ctx || !this.master) return;
    this.usingFile = false;
    const ctx = this.ctx;

    const ambientGain = ctx.createGain();
    ambientGain.gain.value = 0.0;
    ambientGain.connect(this.master);
    this.ambientGain = ambientGain;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.6;
    filter.connect(ambientGain);

    // Chord: A minor 9-ish spread across registers (dreamy R&B vibe).
    const freqs = [110, 164.81, 220, 261.63, 329.63, 392];
    const oscillators: OscillatorNode[] = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.value = f;
      osc.detune.value = (i - freqs.length / 2) * 3;
      const g = ctx.createGain();
      g.gain.value = 0.12 / (i + 1);
      osc.connect(g);
      g.connect(filter);
      osc.start();
      return osc;
    });

    // Slow LFO breathing the pad.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(ambientGain.gain);
    lfo.start();

    // Cinematic sub pulse.
    const pulse = ctx.createOscillator();
    pulse.type = "sine";
    pulse.frequency.value = 55;
    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0;
    pulse.connect(pulseGain);
    pulseGain.connect(this.master);
    pulse.start();

    this.pulseNodes = pulseGain;
    let pulseOn = true;
    this.pulseTimer = window.setInterval(() => {
      const t = ctx.currentTime;
      pulseGain.gain.cancelScheduledValues(t);
      pulseGain.gain.setValueAtTime(pulseGain.gain.value, t);
      pulseGain.gain.linearRampToValueAtTime(pulseOn ? 0.16 : 0, t + 1.6);
      pulseOn = !pulseOn;
    }, 3200);

    this.padNodes = { osc: oscillators, gain: ambientGain, filter };

    // Fade in gently.
    ambientGain.gain.cancelScheduledValues(ctx.currentTime);
    ambientGain.gain.setValueAtTime(0, ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.55, ctx.currentTime + 3);
  }

  private pulseNodes: GainNode | null = null;

  private stopPad(): void {
    if (this.pulseTimer !== null) {
      clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }
    if (this.padNodes) {
      try {
        this.padNodes.osc.forEach((o) => o.stop());
      } catch {
        /* already stopped */
      }
      const g = this.padNodes.gain;
      if (this.ctx) {
        g.gain.cancelScheduledValues(this.ctx.currentTime);
        g.gain.setValueAtTime(g.gain.value, this.ctx.currentTime);
        g.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
        setTimeout(() => g.disconnect(), 900);
      }
      this.padNodes = null;
    }
    this.pulseNodes = null;
    this.ambientGain = null;
  }

  /** Short quiet blip for UI feedback. kind selects pitch/envelope. */
  blip(kind: "hover" | "click" | "select" | "terminal" | "open"): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    const base = kind === "hover" ? 520 : kind === "click" ? 330 : kind === "select" ? 660 : kind === "open" ? 440 : 880;
    osc.type = kind === "terminal" ? "square" : "sine";
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * (kind === "open" ? 1.5 : 0.94), t + 0.12);
    const peak = kind === "hover" ? 0.02 : kind === "terminal" ? 0.03 : 0.05;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === "hover" ? 0.08 : 0.25));
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const audio = new AudioEngine();
