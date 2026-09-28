// 2D 카툰 래그돌 물리 시뮬레이터 (스프링-관절 물리)
export class Ragdoll {
  constructor(baseX, baseY) {
    this.originX = baseX;
    this.originY = baseY;
    this.reset();
  }

  reset() {
    const ox = this.originX;
    const oy = this.originY;

    // 관절 노드 초기 위치 (x, y, vx, vy, mass)
    this.nodes = {
      head: { x: ox, y: oy - 120, vx: 0, vy: 0, m: 2.5, angle: 0, va: 0 },
      neck: { x: ox, y: oy - 65, vx: 0, vy: 0, m: 1.0 },
      chest: { x: ox, y: oy, vx: 0, vy: 0, m: 4.0, angle: 0, va: 0 },
      pelvis: { x: ox, y: oy + 80, vx: 0, vy: 0, m: 3.5 },

      leftShoulder: { x: ox - 40, y: oy - 45, vx: 0, vy: 0, m: 1.0 },
      leftElbow: { x: ox - 65, y: oy, vx: 0, vy: 0, m: 0.8 },
      leftHand: { x: ox - 75, y: oy + 55, vx: 0, vy: 0, m: 0.6 },

      rightShoulder: { x: ox + 40, y: oy - 45, vx: 0, vy: 0, m: 1.0 },
      rightElbow: { x: ox + 65, y: oy, vx: 0, vy: 0, m: 0.8 },
      rightHand: { x: ox + 75, y: oy + 55, vx: 0, vy: 0, m: 0.6 },

      leftHip: { x: ox - 25, y: oy + 85, vx: 0, vy: 0, m: 1.2 },
      leftKnee: { x: ox - 30, y: oy + 150, vx: 0, vy: 0, m: 1.0 },
      leftFoot: { x: ox - 35, y: oy + 210, vx: 0, vy: 0, m: 0.8 },

      rightHip: { x: ox + 25, y: oy + 85, vx: 0, vy: 0, m: 1.2 },
      rightKnee: { x: ox + 30, y: oy + 150, vx: 0, vy: 0, m: 1.0 },
      rightFoot: { x: ox + 35, y: oy + 210, vx: 0, vy: 0, m: 0.8 }
    };

    // 타겟 홈 포즈 (기본 상태로 복귀하려는 힘)
    this.homePositions = {};
    for (const [key, node] of Object.entries(this.nodes)) {
      this.homePositions[key] = { x: node.x - ox, y: node.y - oy };
    }

    this.isFlyingOff = false;
    this.flyTimer = 0;
  }

  // 타격 충격량 가하기
  applyImpulse(fx, fy, target = 'head', torque = 0) {
    if (this.nodes[target]) {
      this.nodes[target].vx += fx / this.nodes[target].m;
      this.nodes[target].vy += fy / this.nodes[target].m;
    }
    // 인접 관절에도 충격 전달
    if (target === 'head') {
      this.nodes.head.va += torque || (fx > 0 ? 0.35 : -0.35);
      this.nodes.neck.vx += fx * 0.4;
      this.nodes.chest.vx += fx * 0.25;
      this.nodes.leftHand.vy -= Math.abs(fx) * 0.2;
      this.nodes.rightHand.vy -= Math.abs(fx) * 0.2;
    } else if (target === 'chest') {
      this.nodes.chest.vx += fx * 0.7;
      this.nodes.pelvis.vx += fx * 0.5;
    }

    // 초강력 타격 시 화면 밖 날아가기 트리거
    const totalForce = Math.hypot(fx, fy);
    if (totalForce > 85 && !this.isFlyingOff) {
      this.triggerBlastOff(fx, fy);
    }
  }

  // 화면 밖으로 날아갔다가 리스폰
  triggerBlastOff(fx, fy) {
    this.isFlyingOff = true;
    this.flyTimer = 60; // 60프레임 동안 회전하며 날아감
    const blastX = (fx > 0 ? 1 : -1) * (40 + Math.random() * 20);
    const blastY = -50 - Math.random() * 25;

    for (const node of Object.values(this.nodes)) {
      node.vx = blastX;
      node.vy = blastY;
    }
    this.nodes.head.va = (fx > 0 ? 1 : -1) * 0.5;
  }

  update(dt = 1) {
    const ox = this.originX;
    const oy = this.originY;

    if (this.isFlyingOff) {
      this.flyTimer--;
      // 관성 이동 & 빠른 회전
      for (const node of Object.values(this.nodes)) {
        node.x += node.vx * dt;
        node.y += node.vy * dt;
        node.vy += 1.8 * dt; // 중력
      }
      this.nodes.head.angle += this.nodes.head.va * dt;

      if (this.flyTimer <= 0) {
        // 위에서 쿵 떨어지며 리스폰
        this.reset();
        for (const node of Object.values(this.nodes)) {
          node.y -= 500; // 천장에서 낙하
          node.vy = 20;
        }
        this.isFlyingOff = false;
      }
      return;
    }

    // 일반 상태: 스프링 복원력 & 감쇠
    const stiffness = 0.08; // 복원 탄성 계수
    const damping = 0.84;   // 속도 감쇄
    const jointConstraint = 0.15; // 관절 간 거리 제약 계수

    // 1. 홈 포지션 복원 스프링
    for (const [key, node] of Object.entries(this.nodes)) {
      const home = this.homePositions[key];
      const targetX = ox + home.x;
      const targetY = oy + home.y;

      const dx = targetX - node.x;
      const dy = targetY - node.y;

      node.vx += dx * stiffness;
      node.vy += dy * stiffness;

      node.vx *= damping;
      node.vy *= damping;

      node.x += node.vx * dt;
      node.y += node.vy * dt;
    }

    // 2. 머리 회전 복원 스프링
    const head = this.nodes.head;
    const targetAngle = (head.x - this.nodes.neck.x) * 0.015; // 목 꺾임 각도
    head.va += (targetAngle - head.angle) * 0.12;
    head.va *= 0.8;
    head.angle += head.va * dt;

    // 3. 가슴 회전
    const chest = this.nodes.chest;
    const chestTarget = (chest.x - ox) * 0.008;
    chest.va += (chestTarget - chest.angle) * 0.1;
    chest.va *= 0.8;
    chest.angle += chest.va * dt;

    // 4. 어깨/엉덩이 관절 동기화 (가슴, 골반 기준)
    this.nodes.leftShoulder.x = chest.x - 40;
    this.nodes.leftShoulder.y = chest.y - 45;
    this.nodes.rightShoulder.x = chest.x + 40;
    this.nodes.rightShoulder.y = chest.y - 45;

    this.nodes.neck.x = chest.x;
    this.nodes.neck.y = chest.y - 65;

    this.nodes.leftHip.x = this.nodes.pelvis.x - 25;
    this.nodes.leftHip.y = this.nodes.pelvis.y;
    this.nodes.rightHip.x = this.nodes.pelvis.x + 25;
    this.nodes.rightHip.y = this.nodes.pelvis.y;
  }

  // 타겟 포인트와 가장 가까운 관절 확인 (충돌 감지용)
  getHitTarget(px, py) {
    const headDist = Math.hypot(this.nodes.head.x - px, this.nodes.head.y - py);
    if (headDist < 65) return { part: 'head', node: this.nodes.head, dist: headDist };

    const chestDist = Math.hypot(this.nodes.chest.x - px, this.nodes.chest.y - py);
    if (chestDist < 80) return { part: 'chest', node: this.nodes.chest, dist: chestDist };

    return null;
  }

  // 래그돌 전체 렌더링
  draw(ctx, avatarRenderer) {
    const n = this.nodes;
    const outfit = avatarRenderer.config.outfit;
    const sleeveColor = outfit === 'hiking_vest' ? '#E65100' : (outfit === 'tracksuit' ? '#1E88E5' : '#ECEFF1');
    const pantsColor = outfit === 'tracksuit' ? '#1E88E5' : '#37474F';

    // 1. 다리 렌더링 (뒤)
    // 왼다리
    avatarRenderer.drawLimb(ctx, n.leftHip.x, n.leftHip.y, n.leftKnee.x, n.leftKnee.y, 22, pantsColor);
    avatarRenderer.drawLimb(ctx, n.leftKnee.x, n.leftKnee.y, n.leftFoot.x, n.leftFoot.y, 18, pantsColor);
    // 오른다리
    avatarRenderer.drawLimb(ctx, n.rightHip.x, n.rightHip.y, n.rightKnee.x, n.rightKnee.y, 22, pantsColor);
    avatarRenderer.drawLimb(ctx, n.rightKnee.x, n.rightKnee.y, n.rightFoot.x, n.rightFoot.y, 18, pantsColor);

    // 구두 / 슬리퍼
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.ellipse(n.leftFoot.x, n.leftFoot.y, 16, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(n.rightFoot.x, n.rightFoot.y, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 몸통 렌더링
    avatarRenderer.drawTorso(ctx, n.chest.x, n.chest.y, n.chest.angle, 90, 115);

    // 3. 팔 렌더링
    // 왼팔
    avatarRenderer.drawLimb(ctx, n.leftShoulder.x, n.leftShoulder.y, n.leftElbow.x, n.leftElbow.y, 18, sleeveColor);
    avatarRenderer.drawLimb(ctx, n.leftElbow.x, n.leftElbow.y, n.leftHand.x, n.leftHand.y, 14, sleeveColor);
    // 오른팔
    avatarRenderer.drawLimb(ctx, n.rightShoulder.x, n.rightShoulder.y, n.rightElbow.x, n.rightElbow.y, 18, sleeveColor);
    avatarRenderer.drawLimb(ctx, n.rightElbow.x, n.rightElbow.y, n.rightHand.x, n.rightHand.y, 14, sleeveColor);

    // 손 (주먹)
    ctx.fillStyle = avatarRenderer.config.skinColor;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(n.leftHand.x, n.leftHand.y, 10, 0, Math.PI * 2);
    ctx.arc(n.rightHand.x, n.rightHand.y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 4. 머리 렌더링 (가장 앞)
    avatarRenderer.drawHead(ctx, n.head.x, n.head.y, n.head.angle, 54);
  }
}
