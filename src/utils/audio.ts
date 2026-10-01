// Offline Web Audio API Synthesizer & Speech Synthesis (zero server, zero external dependencies)

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setAudioMuted(muted: boolean) {
  isMuted = muted;
  if (typeof window !== 'undefined') {
    localStorage.setItem('hanzilab_muted', muted ? 'true' : 'false');
  }
}

export function getAudioMuted(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hanzilab_muted') === 'true';
  }
  return isMuted;
}

export type SoundEffect = 'correct' | 'wrong' | 'click' | 'victory' | 'stroke' | 'card_flip';

export function playSound(type: SoundEffect) {
  if (getAudioMuted()) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'correct': {
        // Pentatonic joyful chime: E5 -> G5 -> A5
        const freqs = [659.25, 783.99, 880.0];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.4);
        });
        break;
      }

      case 'wrong': {
        // Low gentle wooden thud
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }

      case 'click': {
        // Crisp bamboo click
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }

      case 'card_flip': {
        // Subtle paper whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }

      case 'stroke': {
        // Traditional water-brush tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.linearRampToValueAtTime(659.25, now + 0.12); // E5

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.28);
        break;
      }

      case 'victory': {
        // Traditional gong / celebratory fanfare
        const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);

          gain.gain.setValueAtTime(0, now + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.9);
        });
        break;
      }
    }
  } catch {
    // Graceful fallback if audio is not allowed or restricted by policy
  }
}

/**
 * Offline Chinese speech synthesis via Web Speech API (native in modern browsers).
 * Works offline with device voices.
 */
export function speakChinese(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  if (getAudioMuted()) return false;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // slightly slower for clear educational articulation
    utterance.pitch = 1.0;

    // Try to pick a Chinese voice if available
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => v.lang.startsWith('zh') || v.name.includes('Chinese'));
    if (zhVoice) {
      utterance.voice = zhVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}
