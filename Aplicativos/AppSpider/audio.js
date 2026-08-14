/* ==========================================================================
   SPIDER-COMM HUD // WEB AUDIO API RETRO 8-BIT SYNTHESIZER
   ========================================================================== */

class SpideyAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.currentNoteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play short button click sound
  playClick() {
    if (this.isMuted) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Play Radar Sonar Ping
  playRadarPing() {
    if (this.isMuted) return;
    this.init();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // Play Web-Zip Swoosh effect
  playWebZip() {
    if (this.isMuted) return;
    this.init();

    // Frequency sweep down + noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // Play Siren / Threat Alarm
  playAlarm() {
    if (this.isMuted) return;
    this.init();

    for (let i = 0; i < 2; i++) {
      const startTime = this.ctx.currentTime + i * 0.15;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 523 : 659, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.12);
    }
  }

  // Procedural 8-Bit Spider-Man Theme Loop
  toggleMusic() {
    if (this.isPlayingMusic) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  startMusic() {
    this.init();
    this.isPlayingMusic = true;
    this.currentNoteIndex = 0;

    // Classic Spider Theme pattern in C Minor / Blues scale
    const melody = [
      { freq: 261.63, duration: 0.2 }, // C4
      { freq: 311.13, duration: 0.2 }, // Eb4
      { freq: 349.23, duration: 0.2 }, // F4
      { freq: 369.99, duration: 0.2 }, // F#4
      { freq: 392.00, duration: 0.4 }, // G4
      { freq: 0,      duration: 0.2 }, // Rest
      { freq: 392.00, duration: 0.2 }, // G4
      { freq: 466.16, duration: 0.2 }, // Bb4
      { freq: 523.25, duration: 0.4 }, // C5
      { freq: 0,      duration: 0.2 }, // Rest
      { freq: 466.16, duration: 0.2 }, // Bb4
      { freq: 392.00, duration: 0.2 }, // G4
      { freq: 349.23, duration: 0.2 }, // F4
      { freq: 311.13, duration: 0.2 }, // Eb4
      { freq: 261.63, duration: 0.6 }, // C4
    ];

    const playNextNote = () => {
      if (!this.isPlayingMusic || this.isMuted) return;

      const note = melody[this.currentNoteIndex];
      if (note.freq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + note.duration - 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + note.duration - 0.05);
      }

      this.currentNoteIndex = (this.currentNoteIndex + 1) % melody.length;
      this.musicTimer = setTimeout(playNextNote, note.duration * 1000);
    };

    playNextNote();
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

const spideyAudio = new SpideyAudioEngine();
