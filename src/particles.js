// 만화풍 코믹 타격 파티클 및 스크린 쉐이크 시스템
export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.comicTexts = [];
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
  }

  triggerShake(intensity = 10, duration = 12) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  getShakeOffset() {
    if (this.shakeDuration <= 0) return { x: 0, y: 0 };
    const factor = this.shakeDuration / 12;
    return {
      x: (Math.random() * 2 - 1) * this.shakeIntensity * factor,
      y: (Math.random() * 2 - 1) * this.shakeIntensity * factor
    };
  }

  // 코믹 폭발 텍스트 스탬프 추가
  addComicText(x, y, text, color = '#FF1744', scale = 1.3) {
    this.comicTexts.push({
      x,
      y,
      text,
      color,
      scale: scale * 0.4,
      targetScale: scale,
      rotation: (Math.random() - 0.5) * 0.4,
      life: 28,
      maxLife: 28
    });
  }

  // 무기 타입별 파티클 방출
  spawnHitParticles(x, y, type = 'flick', count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const p = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        type: 'star',
        size: 5 + Math.random() * 8,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3,
        color: '#FFEB3B'
      };

      if (type === 'water_balloon') {
        p.type = 'droplet';
        p.color = '#00E5FF';
        p.vy += 3;
      } else if (type === 'keyboard') {
        p.type = 'keycap';
        p.keyText = ['Esc', 'Enter', 'Ctrl', 'F5', 'Del', 'Z'][Math.floor(Math.random() * 6)];
        p.color = '#ECEFF1';
        p.size = 12;
      } else if (type === 'golden_swatter') {
        p.type = 'spark';
        p.color = '#FFD700';
        p.size = 7;
      } else if (type === 'documents') {
        p.type = 'paper';
        p.color = '#FFFFFF';
        p.size = 14;
      }

      this.particles.push(p);
    }
  }

  update() {
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      if (this.shakeDuration === 0) this.shakeIntensity = 0;
    }

    // 파티클 업데이트
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28; // 중력
      p.rot += p.vRot;
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 코믹 텍스트 업데이트
    for (let i = this.comicTexts.length - 1; i >= 0; i--) {
      const t = this.comicTexts[i];
      t.life--;
      if (t.scale < t.targetScale) {
        t.scale += (t.targetScale - t.scale) * 0.45;
      }
      t.y -= 0.5;
      if (t.life <= 0) {
        this.comicTexts.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    // 1. 파티클 그리기
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = Math.max(0, alpha);

      if (p.type === 'star') {
        // 별 모양
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#F57F17';
        ctx.lineWidth = 1.5;
        this.drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'droplet') {
        // 물방울
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.7, p.size * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'keycap') {
        // 사각 키캡
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#263238';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);

        ctx.fillStyle = '#263238';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.keyText, 0, 0);
      } else if (p.type === 'paper') {
        // A4 서류 종이
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#90A4AE';
        ctx.lineWidth = 1;
        ctx.fillRect(-p.size * 0.5, -p.size * 0.7, p.size, p.size * 1.4);
        ctx.strokeRect(-p.size * 0.5, -p.size * 0.7, p.size, p.size * 1.4);

        // 글줄 모방
        ctx.fillStyle = '#CFD8DC';
        ctx.fillRect(-p.size * 0.35, -p.size * 0.4, p.size * 0.7, 1.5);
        ctx.fillRect(-p.size * 0.35, -p.size * 0.1, p.size * 0.7, 1.5);
        ctx.fillRect(-p.size * 0.35, p.size * 0.2, p.size * 0.5, 1.5);
      } else if (p.type === 'spark') {
        // 번개 스파크
        ctx.strokeStyle = '#FFF176';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-p.size, -p.size);
        ctx.lineTo(0, 0);
        ctx.lineTo(p.size, -p.size * 0.5);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 2. 만화풍 코믹 텍스트 폭발 이펙트 그리기
    for (const t of this.comicTexts) {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.rotation);
      ctx.scale(t.scale, t.scale);

      const alpha = Math.min(1, t.life / 10);
      ctx.globalAlpha = alpha;

      // 만화 폭발 별 배경
      ctx.fillStyle = '#FFEA00';
      ctx.strokeStyle = '#D50000';
      ctx.lineWidth = 4;
      this.drawExplosionBurst(ctx, 0, 0, 14, 55, 30);
      ctx.fill();
      ctx.stroke();

      // 텍스트 외곽선 & 채우기
      ctx.font = '900 28px "Impact", "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(t.text, 0, 0);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
    }
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  }

  drawExplosionBurst(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = 0;
    const step = Math.PI / spikes;
    ctx.beginPath();
    for (let i = 0; i < spikes; i++) {
      const r1 = outerRadius + (Math.sin(i * 1.5) * 8);
      const x1 = cx + Math.cos(rot) * r1;
      const y1 = cy + Math.sin(rot) * r1;
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      rot += step;

      const r2 = innerRadius + (Math.cos(i * 1.5) * 5);
      const x2 = cx + Math.cos(rot) * r2;
      const y2 = cy + Math.sin(rot) * r2;
      ctx.lineTo(x2, y2);
      rot += step;
    }
    ctx.closePath();
  }
}
