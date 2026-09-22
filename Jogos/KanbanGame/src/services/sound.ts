/* Efeitos sonoros sintetizados (WebAudio) — sem arquivos externos */
export type SoundId = 'done' | 'bug' | 'alert' | 'money' | 'event' | 'day' | 'deploy' | 'click' | 'error' | 'achievement' | 'drop';

let ctx: AudioContext | null = null;
let enabled = true;
let volume = 0.5;

export function configureSound(on: boolean, vol: number) {
  enabled = on;
  volume = vol;
}

function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.2, slideTo?: number) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + start;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain * volume, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export function play(id: SoundId) {
  if (!enabled) return;
  try {
    switch (id) {
      case 'done':
        tone(660, 0, 0.12, 'sine', 0.18);
        tone(880, 0.08, 0.14, 'sine', 0.16);
        tone(1320, 0.16, 0.22, 'sine', 0.12);
        break;
      case 'bug':
        tone(220, 0, 0.12, 'square', 0.06);
        tone(180, 0.1, 0.16, 'square', 0.05);
        break;
      case 'alert':
        tone(880, 0, 0.18, 'triangle', 0.14);
        tone(660, 0.2, 0.18, 'triangle', 0.14);
        tone(880, 0.4, 0.22, 'triangle', 0.12);
        break;
      case 'money':
        tone(1046, 0, 0.08, 'triangle', 0.12);
        tone(1568, 0.06, 0.18, 'triangle', 0.1);
        break;
      case 'event':
        tone(392, 0, 0.2, 'sine', 0.14);
        tone(523, 0.12, 0.26, 'sine', 0.12);
        break;
      case 'day':
        tone(330, 0, 0.25, 'sine', 0.1, 520);
        tone(660, 0.18, 0.3, 'sine', 0.07);
        break;
      case 'deploy':
        tone(200, 0, 0.35, 'sawtooth', 0.04, 800);
        break;
      case 'click':
        tone(1200, 0, 0.04, 'sine', 0.06);
        break;
      case 'drop':
        tone(500, 0, 0.06, 'sine', 0.08, 700);
        break;
      case 'error':
        tone(160, 0, 0.18, 'sawtooth', 0.05);
        break;
      case 'achievement':
        [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.12));
        break;
    }
  } catch {
    /* áudio indisponível */
  }
}
