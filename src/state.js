// 사용자 데이터 및 게임 상태 영속성 관리 (LocalStorage)
import { DEFAULT_AVATAR } from './avatar.js';

const STORAGE_KEY = 'office_stress_buster_state_v2';

export const STRESS_TIERS = {
  LOW: {
    max: 3,
    title: '🟢 1~3점 (경미한 스트레스)',
    desc: '가벼운 주의 주기 딱 좋은 기본 무기 지급',
    weapons: ['flick', 'water_balloon', 'documents']
  },
  MID: {
    max: 6,
    title: '🟡 4~6점 (짜증 & 분노 축적)',
    desc: '본격적인 오피스 격퇴 무기 추가 해금',
    weapons: ['flick', 'water_balloon', 'documents', 'slipper', 'keyboard']
  },
  HIGH: {
    max: 10,
    title: '🔴 7~10점 (극대노 폭발 직전)',
    desc: '모든 결전 무기 (대형 뿅망치, 황금 파리채) 총출동!',
    weapons: ['flick', 'water_balloon', 'documents', 'slipper', 'keyboard', 'hammer', 'golden_swatter']
  }
};

export class GameState {
  constructor() {
    this.data = this.load();
  }

  getDefaultData() {
    const today = new Date().toISOString().split('T')[0];
    return {
      coins: 99999,
      currentStressScore: 8, // 기본값 8점 (극대노)
      avatar: { ...DEFAULT_AVATAR, name: '김부장', role: '부장' },
      stats: {
        totalHits: 0,
        maxCombo: 0,
        maxFlickPower: 0,
        stressRelieved: 0
      },
      attendance: {
        lastDate: null,
        streak: 0,
        history: []
      },
      reasons: ['야근 강요', '보고서 반려', '무의미한 회의', '라떼는 말이야', '월요병'],
      selectedReason: '야근 강요'
    };
  }

  getReasons() {
    if (!this.data.reasons || !Array.isArray(this.data.reasons) || this.data.reasons.length === 0) {
      this.data.reasons = ['야근 강요', '보고서 반려', '무의미한 회의', '라떼는 말이야', '월요병'];
    }
    return this.data.reasons;
  }

  addReason(newReason) {
    const trimmed = (newReason || '').trim();
    if (!trimmed) return false;
    const reasons = this.getReasons();
    if (!reasons.includes(trimmed)) {
      reasons.push(trimmed);
    }
    this.data.selectedReason = trimmed;
    this.save();
    return true;
  }

  removeReason(reasonToRemove) {
    const reasons = this.getReasons();
    this.data.reasons = reasons.filter(r => r !== reasonToRemove);
    if (this.data.selectedReason === reasonToRemove) {
      this.data.selectedReason = this.data.reasons[0] || '직장 스트레스';
    }
    this.save();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...this.getDefaultData(), ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
    return this.getDefaultData();
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }

  // 모든 무기는 스트레스 점수와 상관없이 항상 전체 제공
  getActiveWeapons() {
    return ['flick', 'water_balloon', 'slipper', 'keyboard', 'documents', 'hammer', 'golden_swatter'];
  }

  isWeaponAvailable(weaponId) {
    return true;
  }

  // 스트레스 점수 갱신
  setStressScore(score, reason = '직장 스트레스') {
    this.data.currentStressScore = score;
    this.data.selectedReason = reason;
    const today = new Date().toISOString().split('T')[0];
    const att = this.data.attendance;

    att.lastDate = today;
    att.history.push({
      date: today,
      score,
      reason
    });

    if (att.history.length > 7) {
      att.history.shift();
    }

    this.save();
    return this.getActiveWeapons();
  }

  hasCheckedInToday() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.attendance.lastDate === today;
  }

  addHit(damage, power = 0, combo = 0) {
    this.data.stats.totalHits++;
    this.data.stats.stressRelieved += Math.round(damage);
    this.data.coins += Math.max(1, Math.floor(damage / 10));

    if (combo > this.data.stats.maxCombo) {
      this.data.stats.maxCombo = combo;
    }
    if (power > this.data.stats.maxFlickPower) {
      this.data.stats.maxFlickPower = Math.round(power);
    }
    this.save();
  }

  updateAvatar(newAvatar) {
    this.data.avatar = { ...this.data.avatar, ...newAvatar };
    this.save();
  }
}

export const gameState = new GameState();
