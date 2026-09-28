// Web Audio API 절차적 사운드 효과 신시사이저 & 햅틱 진동 관리
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  vibrate(ms = 30) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }

  // 슬링샷 차징음 (피치 및 텐션이 올라가는 사운드)
  playCharge(ratio) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120 + ratio * 380, t);
    osc.frequency.exponentialRampToValueAtTime(150 + ratio * 450, t + 0.08);

    gain.gain.setValueAtTime(0.08 * (0.3 + ratio * 0.7), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);

    // 미세 햅틱
    if (Math.random() < 0.3) {
      this.vibrate(10 + Math.floor(ratio * 30));
    }
  }

  // 딱밤 강력 타격음 (묵직한 펀치 + 찰진 스냅음)
  playFlickHit(powerRatio = 1) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.vibrate([30, 40, 60]);

    const t = this.ctx.currentTime;
    
    // 1. 묵직한 서브 킥 (저음 충격)
    const kick = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kick.type = 'sine';
    kick.frequency.setValueAtTime(180, t);
    kick.frequency.exponentialRampToValueAtTime(30, t + 0.22);
    kickGain.gain.setValueAtTime(0.7 * powerRatio, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    kick.connect(kickGain);
    kickGain.connect(this.ctx.destination);
    kick.start(t);
    kick.stop(t + 0.25);

    // 2. 찰진 스냅 (화이트 노이즈 버스트)
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, t);
    noiseFilter.Q.setValueAtTime(3, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6 * powerRatio, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(t);
  }

  // 물풍선 첨벙 사운드
  playWaterSplash() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate(40);

    const t = this.ctx.currentTime;
    // 물방울 튀는 소리 버블 3개
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.03;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300 + i * 200, t + delay);
      osc.frequency.exponentialRampToValueAtTime(700 + i * 250, t + delay + 0.09);

      gain.gain.setValueAtTime(0.3, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.09);
    }
  }

  // 슬리퍼 짝! 뺨 맞는 소리
  playSlap() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate(35);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(550, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // 뿅망치 뿅~ 사운드 (귀여운 카툰 삐약음)
  playSqueak() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate(30);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, t);
    osc.frequency.exponentialRampToValueAtTime(1450, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.18);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // 무선 키보드 와장창 (플라스틱 키캡 충돌음)
  playKeyboardClatter() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate([20, 20, 30]);

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const delay = i * 0.025;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(400 + Math.random() * 500, t + delay);
      gain.gain.setValueAtTime(0.18, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.05);
    }
  }

  // 황금 파리채 전격/스파크 (지리릿!)
  playZap() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate([50, 20, 70]);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.linearRampToValueAtTime(150, t + 0.2);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  // 결재서류 펄럭 찰싹
  playPaperSlap() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate(25);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.1);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // 피버 타임 진입 사이렌 & 팡파레
  playFeverStart() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate([100, 50, 100, 50, 200]);

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.3, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.25);
    });
  }

  // 보상 획득/도장 쾅 사운드
  playStamp() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    this.vibrate(60);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);
    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  // UI 버튼 클릭음
  playClick() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.04);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }
}

export const sounds = new SoundManager();
