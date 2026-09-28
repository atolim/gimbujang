// 무기 정의 및 투척체 물리 시뮬레이션
import { sounds } from './audio.js';

export const WEAPON_TYPES = [
  {
    id: 'flick',
    name: '딱밤 슬링샷',
    icon: '👉',
    desc: '뒤로 당겼다 놓으면 손맛 극대화!',
    damage: 35,
    unlocked: true,
    price: 0
  },
  {
    id: 'water_balloon',
    name: '물풍선',
    icon: '🎈',
    desc: '얼굴에 시원하게 팡 터지는 물폭탄',
    damage: 20,
    unlocked: true,
    price: 0
  },
  {
    id: 'slipper',
    name: '삼선 슬리퍼',
    icon: '🩴',
    desc: '찰진 소리와 함께 뺨에 착 달라붙음',
    damage: 28,
    unlocked: true,
    price: 0
  },
  {
    id: 'keyboard',
    name: '무선 키보드',
    icon: '⌨️',
    desc: '키캡이 사방으로 날아가는 둔탁한 타격',
    damage: 45,
    unlocked: true,
    price: 0
  },
  {
    id: 'documents',
    name: '결재 반려 서류',
    icon: '📑',
    desc: '상사의 눈앞에 서류철을 흩뿌려라',
    damage: 25,
    unlocked: true,
    price: 0
  },
  {
    id: 'hammer',
    name: '대형 뿅망치',
    icon: '🔨',
    desc: '머리가 쏙 들어갈 만큼 강력한 뿅!',
    damage: 55,
    unlocked: true,
    price: 0
  },
  {
    id: 'golden_swatter',
    name: '전설의 황금 파리채',
    icon: '⚡',
    desc: '짜릿한 10만 볼트 스파크 타격',
    damage: 80,
    unlocked: true,
    price: 0
  }
];

export class Projectile {
  constructor(type, startX, startY, targetX, targetY, onHit) {
    this.type = type;
    this.x = startX;
    this.y = startY;
    this.startX = startX;
    this.startY = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.onHit = onHit;

    // 포물선 및 비행 파라미터
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.hypot(dx, dy);
    this.totalDuration = Math.max(12, Math.min(24, Math.floor(dist / 25)));
    this.progress = 0;
    this.angle = 0;
    this.scale = 0.7;
    this.peakArc = -Math.min(150, dist * 0.35); // 위로 솟아오르는 곡선
    this.isFinished = false;
  }

  update() {
    this.progress++;
    const t = this.progress / this.totalDuration;

    // 2차 베지에 포물선 궤적
    this.x = this.startX + (this.targetX - this.startX) * t;
    const linearY = this.startY + (this.targetY - this.startY) * t;
    const arcY = 4 * this.peakArc * t * (1 - t);
    this.y = linearY + arcY;

    // 회전 및 원근감 확대
    this.angle += 0.28;
    this.scale = 0.7 + t * 0.5;

    if (this.progress >= this.totalDuration) {
      this.isFinished = true;
      if (this.onHit) this.onHit(this.targetX, this.targetY, this.type);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(this.scale, this.scale);

    const type = this.type;
    if (type === 'water_balloon') {
      // 물풍선
      ctx.fillStyle = '#00B0FF';
      ctx.strokeStyle = '#0081CB';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 22, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 물풍선 묶은 매듭
      ctx.fillStyle = '#0081CB';
      ctx.fillRect(-4, -32, 8, 6);

      // 하이라이트 광택
      ctx.fillStyle = '#E1F5FE';
      ctx.beginPath();
      ctx.ellipse(-7, -8, 5, 10, -0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'slipper') {
      // 삼선 슬리퍼
      ctx.fillStyle = '#212121';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-16, -34, 32, 68, 16);
      ctx.fill();
      ctx.stroke();

      // 흰색 삼선 밴드
      ctx.fillStyle = '#37474F';
      ctx.fillRect(-16, -14, 32, 28);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-16, -10, 32, 4);
      ctx.fillRect(-16, -2, 32, 4);
      ctx.fillRect(-16, 6, 32, 4);
    } else if (type === 'keyboard') {
      // 무선 키보드
      ctx.fillStyle = '#455A64';
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-35, -20, 70, 40, 6);
      ctx.fill();
      ctx.stroke();

      // 키 버튼들
      ctx.fillStyle = '#ECEFF1';
      for (let r = -12; r <= 12; r += 8) {
        for (let c = -28; c <= 28; c += 8) {
          ctx.fillRect(c, r, 6, 6);
        }
      }
    } else if (type === 'documents') {
      // 서류철
      ctx.fillStyle = '#0277BD';
      ctx.strokeStyle = '#01579B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-24, -32, 48, 64, 4);
      ctx.fill();
      ctx.stroke();

      // 삐져나온 서류 더미
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-20, -28, 40, 56);
      ctx.fillStyle = '#D32F2F';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('반려', -10, 0);
    } else if (type === 'hammer') {
      // 대형 뿅망치
      // 자루
      ctx.fillStyle = '#FFD54F';
      ctx.fillRect(-6, 0, 12, 50);
      // 머리통 (빨강 & 노랑 둥근 통)
      ctx.fillStyle = '#E53935';
      ctx.strokeStyle = '#B71C1C';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-30, -25, 60, 30, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FFEB3B';
      ctx.beginPath();
      ctx.ellipse(-30, -10, 6, 15, 0, 0, Math.PI * 2);
      ctx.ellipse(30, -10, 6, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'golden_swatter') {
      // 황금 파리채
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = '#FFA000';
      ctx.lineWidth = 3;
      // 망
      ctx.strokeRect(-22, -45, 44, 45);
      ctx.fillRect(-22, -45, 44, 45);
      // 손잡이
      ctx.fillStyle = '#FFA000';
      ctx.fillRect(-4, 0, 8, 45);
    }

    ctx.restore();
  }
}
