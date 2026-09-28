// 아바타 외형 파츠 정의 및 Canvas 드로잉 유틸리티
export const AVATAR_PARTS = {
  hair: [
    // 여성 헤어 스타일
    { id: 'hair_female_bob', name: '👩 도도한 칼단발 (보브컷)' },
    { id: 'hair_female_ponytail', name: '👱‍♀️ 깐깐한 포니테일' },
    { id: 'hair_female_wave', name: '👩‍🦱 우아한 롱 웨이브' },
    { id: 'hair_female_bun', name: '👵 시어머니풍 똥머리' },
    // 남성 및 공용 헤어 스타일
    { id: 'hair_2_8', name: '👨 2:8 깻잎 가르마' },
    { id: 'hair_balding', name: '👴 부장님 듬성 탈모' },
    { id: 'hair_comb', name: '👨‍🦰 기름진 올백 머리' },
    { id: 'hair_bushy', name: '🧑 덥수룩 덮은 머리' },
    { id: 'hair_curly', name: '🧑‍🦱 뽀글뽀글 아재 파마' }
  ],
  face_exp: [
    { id: 'sharp_glare', name: '차가운 째려봄 (레드립)' },
    { id: 'scolding', name: '잔소리 폭격 (히스테릭)' },
    { id: 'annoyed', name: '꼰대 찡그림' },
    { id: 'smirk', name: '능글맞은 썩소' },
    { id: 'dark_circle', name: '만성 야근 다크서클' },
    { id: 'furious', name: '버럭 핏대 얼굴' },
    { id: 'sleepy', name: '멍때리는 표정' }
  ],
  glasses: [
    { id: 'cat_eye', name: '날카로운 캣츠아이 뿔테' },
    { id: 'round_wire', name: '로즈골드 동글이 안경' },
    { id: 'horn_rimmed', name: '두꺼운 검정 뿔테 안경' },
    { id: 'gold_rim', name: '금테 반무테 안경' },
    { id: 'sunglasses', name: '등산용 선글라스' },
    { id: 'none', name: '안경 없음' }
  ],
  accessory: [
    { id: 'pearl_earring', name: '우아한 진주 귀걸이' },
    { id: 'silk_scarf', name: '명품 실크 스카프' },
    { id: 'nose_hair', name: '삐져나온 코털' },
    { id: 'mustache', name: '팔자 콧수염' },
    { id: 'toothpick', name: '물고 있는 이쑤시개' },
    { id: 'mole', name: '턱 왕점과 털' },
    { id: 'none', name: '악세사리 없음' }
  ],
  outfit: [
    { id: 'office_blouse', name: '리본 오피스 블라우스' },
    { id: 'tweed_jacket', name: '핑크 트위드 자켓' },
    { id: 'striped_tie', name: '촌스러운 줄무늬 넥타이' },
    { id: 'old_suit', name: '구겨진 쥐색 양복' },
    { id: 'hiking_vest', name: '주말 출근 등산조끼' },
    { id: 'tracksuit', name: '백수풍 삼선 추리닝' }
  ]
};

export const DEFAULT_AVATARS = {
  male: {
    gender: 'male',
    name: '김부장',
    role: '개발팀 부장',
    hair: 'hair_2_8',
    face_exp: 'annoyed',
    glasses: 'horn_rimmed',
    accessory: 'nose_hair',
    outfit: 'striped_tie',
    skinColor: '#FDD8B5'
  },
  female: {
    gender: 'female',
    name: '박부장',
    role: '기획팀 부장',
    hair: 'hair_female_bob',
    face_exp: 'sharp_glare',
    glasses: 'cat_eye',
    accessory: 'pearl_earring',
    outfit: 'office_blouse',
    skinColor: '#FEE2E2'
  }
};

export const DEFAULT_AVATAR = DEFAULT_AVATARS.male;

export class AvatarRenderer {
  constructor(config = {}) {
    this.config = { ...DEFAULT_AVATAR, ...config };
    this.hitTimer = 0; // 타격 지속 시간
    this.lastHitType = null;
    this.bumpHeight = 0; // 머리에 솟아오른 혹
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  triggerHit(type = 'flick', force = 1) {
    this.hitTimer = 25; // 25프레임간 피격 표정
    this.lastHitType = type;
    this.bumpHeight = Math.min(35, this.bumpHeight + 6 * force);
  }

  update() {
    if (this.hitTimer > 0) this.hitTimer--;
    if (this.bumpHeight > 0) this.bumpHeight = Math.max(0, this.bumpHeight - 0.08);
  }

  // 머리 렌더링 (Head node 위치 기준)
  drawHead(ctx, x, y, angle, radius = 55) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const isHit = this.hitTimer > 0;
    const isFemale = this.config.gender === 'female';

    // 0. 긴 뒷머리 (롱 웨이브 등은 얼굴 뒤에 먼저 드로잉)
    if (this.config.hair === 'hair_female_wave') {
      ctx.fillStyle = '#211714';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.7, radius * 0.5, radius * 0.45, radius * 0.8, -0.2, 0, Math.PI * 2);
      ctx.ellipse(radius * 0.7, radius * 0.5, radius * 0.45, radius * 0.8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.config.hair === 'hair_female_ponytail') {
      // 묶은 포니테일 뒷부분
      ctx.fillStyle = '#1C1917';
      ctx.beginPath();
      ctx.ellipse(radius * 0.75, -radius * 0.7, radius * 0.35, radius * 0.65, 0.6, 0, Math.PI * 2);
      ctx.fill();
      // 머리끈
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.ellipse(radius * 0.45, -radius * 0.6, 8, 12, 0.6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.config.hair === 'hair_female_bun') {
      // 정수리 똥머리
      ctx.fillStyle = '#1C1917';
      ctx.beginPath();
      ctx.arc(0, -radius * 1.15, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
      // 비녀 꽂이
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.55, -radius * 1.15);
      ctx.lineTo(radius * 0.55, -radius * 1.25);
      ctx.stroke();
    }

    // 혹 (머리 위로 솟아오름)
    if (this.bumpHeight > 2) {
      ctx.fillStyle = '#E57373';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.4, -radius * 0.95, this.bumpHeight * 0.6, this.bumpHeight, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 반창고 십자가
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.4 - 7, -radius * 0.95);
      ctx.lineTo(-radius * 0.4 + 7, -radius * 0.95);
      ctx.moveTo(-radius * 0.4, -radius * 0.95 - 7);
      ctx.lineTo(-radius * 0.4, -radius * 0.95 + 7);
      ctx.stroke();
    }

    // 1. 얼굴 베이스
    ctx.fillStyle = isHit ? '#FFCDD2' : (this.config.skinColor || (isFemale ? '#FEE2E2' : '#FDD8B5'));
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 1.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (!isFemale) {
      // 남성 이중턱 주름
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#C99E82';
      ctx.beginPath();
      ctx.arc(0, radius * 0.75, radius * 0.4, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // 여성 볼터치 블러셔
      ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.55, radius * 0.18, 12, 7, -0.1, 0, Math.PI * 2);
      ctx.ellipse(radius * 0.55, radius * 0.18, 12, 7, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 표정 (눈썹, 눈, 입)
    this.drawFaceExpression(ctx, radius, isHit);

    // 3. 코
    ctx.lineWidth = isFemale ? 2 : 3;
    ctx.strokeStyle = '#333';
    ctx.fillStyle = '#E69C7B';
    ctx.beginPath();
    if (isFemale) {
      // 오똑하고 얄쌍한 코
      ctx.moveTo(0, radius * 0.05);
      ctx.lineTo(3, radius * 0.18);
      ctx.lineTo(-3, radius * 0.18);
      ctx.stroke();
    } else {
      ctx.ellipse(0, radius * 0.12, 9, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. 악세사리 (코털, 수염, 귀걸이, 스카프 등)
    this.drawAccessory(ctx, radius);

    // 5. 안경
    this.drawGlasses(ctx, radius);

    // 6. 앞머리 & 외곽 헤어 스타일
    this.drawHair(ctx, radius);

    // 7. 피격 시 뺨 자국 / 땀방울 / 멍
    if (isHit) {
      ctx.fillStyle = 'rgba(239, 83, 80, 0.6)';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.5, radius * 0.2, 16, 12, -0.2, 0, Math.PI * 2);
      ctx.ellipse(radius * 0.5, radius * 0.2, 16, 12, 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#4FC3F7';
      ctx.strokeStyle = '#0288D1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(radius * 0.8, -radius * 0.4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // 눈, 눈썹, 입
  drawFaceExpression(ctx, radius, isHit) {
    const eyeY = -radius * 0.05;
    const eyeSpacing = radius * 0.45;

    ctx.strokeStyle = '#1a1a1a';
    ctx.fillStyle = '#1a1a1a';

    if (isHit) {
      // 피격 시 코믹 띠용 눈
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 12, eyeY - 12);
      ctx.lineTo(-eyeSpacing + 12, eyeY + 12);
      ctx.moveTo(-eyeSpacing + 12, eyeY - 12);
      ctx.lineTo(-eyeSpacing - 12, eyeY + 12);
      ctx.stroke();

      ctx.fillStyle = '#FFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(eyeSpacing, eyeY, 16, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(eyeSpacing + 2, eyeY + 2, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#5A1827';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.48, 18, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#FF5252';
      ctx.beginPath();
      ctx.arc(0, radius * 0.54, 10, Math.PI, 0);
      ctx.fill();
      return;
    }

    const exp = this.config.face_exp;

    // 다크서클
    if (exp === 'dark_circle') {
      ctx.fillStyle = 'rgba(92, 107, 115, 0.45)';
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing, eyeY + 10, 16, 7, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeSpacing, eyeY + 10, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 눈썹
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (exp === 'sharp_glare') {
      // 날카로운 아치형 눈썹
      ctx.moveTo(-eyeSpacing - 14, eyeY - 24);
      ctx.lineTo(-eyeSpacing + 12, eyeY - 15);
      ctx.moveTo(eyeSpacing + 14, eyeY - 24);
      ctx.lineTo(eyeSpacing - 12, eyeY - 15);
    } else if (exp === 'scolding') {
      // 찌푸린 앵그리 눈썹
      ctx.moveTo(-eyeSpacing - 15, eyeY - 20);
      ctx.lineTo(-eyeSpacing + 10, eyeY - 26);
      ctx.moveTo(eyeSpacing + 15, eyeY - 20);
      ctx.lineTo(eyeSpacing - 10, eyeY - 26);
    } else if (exp === 'annoyed' || exp === 'furious') {
      ctx.moveTo(-eyeSpacing - 14, eyeY - 22);
      ctx.lineTo(-eyeSpacing + 14, eyeY - 14);
      ctx.moveTo(eyeSpacing + 14, eyeY - 22);
      ctx.lineTo(eyeSpacing - 14, eyeY - 14);
    } else if (exp === 'smirk') {
      ctx.moveTo(-eyeSpacing - 14, eyeY - 20);
      ctx.lineTo(-eyeSpacing + 14, eyeY - 14);
      ctx.moveTo(eyeSpacing - 14, eyeY - 14);
      ctx.lineTo(eyeSpacing + 14, eyeY - 24);
    } else {
      ctx.moveTo(-eyeSpacing - 14, eyeY - 16);
      ctx.lineTo(-eyeSpacing + 14, eyeY - 16);
      ctx.moveTo(eyeSpacing - 14, eyeY - 16);
      ctx.lineTo(eyeSpacing + 14, eyeY - 16);
    }
    ctx.stroke();

    // 눈
    ctx.fillStyle = '#FFF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(-eyeSpacing, eyeY, 11, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(eyeSpacing, eyeY, 11, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 속눈썹 (sharp_glare or scolding 일 때 아이라인 & 속눈썹 연출)
    if (exp === 'sharp_glare' || exp === 'scolding') {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // 왼쪽 속눈썹
      ctx.moveTo(-eyeSpacing - 10, eyeY - 5);
      ctx.lineTo(-eyeSpacing - 17, eyeY - 10);
      ctx.moveTo(-eyeSpacing - 6, eyeY - 7);
      ctx.lineTo(-eyeSpacing - 12, eyeY - 13);
      // 오른쪽 속눈썹
      ctx.moveTo(eyeSpacing + 10, eyeY - 5);
      ctx.lineTo(eyeSpacing + 17, eyeY - 10);
      ctx.moveTo(eyeSpacing + 6, eyeY - 7);
      ctx.lineTo(eyeSpacing + 12, eyeY - 13);
      ctx.stroke();
    }

    // 눈동자
    ctx.fillStyle = '#222';
    ctx.beginPath();
    const pupilOffsetX = exp === 'smirk' ? 3 : (exp === 'sharp_glare' ? 1 : 0);
    ctx.arc(-eyeSpacing + pupilOffsetX, eyeY, 4.5, 0, Math.PI * 2);
    ctx.arc(eyeSpacing + pupilOffsetX, eyeY, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 입
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (exp === 'sharp_glare') {
      // 단호하게 다문 레드 립
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.44, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#881337';
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-13, radius * 0.44);
      ctx.lineTo(13, radius * 0.44);
      ctx.stroke();
    } else if (exp === 'scolding') {
      // 쏘아붙이는 외침 레드 립
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.46, 15, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3E0A16';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.46, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // 윗니
      ctx.fillStyle = '#FFF';
      ctx.fillRect(-6, radius * 0.41, 12, 3);
    } else if (exp === 'smirk') {
      ctx.moveTo(-14, radius * 0.45);
      ctx.quadraticCurveTo(0, radius * 0.42, 16, radius * 0.35);
      ctx.stroke();
    } else if (exp === 'furious') {
      ctx.fillStyle = '#8B0000';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.44, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.arc(0, radius * 0.58, 16, Math.PI + 0.5, -0.5);
      ctx.stroke();
    }

    if (this.config.gender !== 'female' && exp !== 'sharp_glare' && exp !== 'scolding') {
      // 팔자주름
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#BCAAA4';
      ctx.beginPath();
      ctx.arc(-18, radius * 0.35, 12, 0.4, Math.PI * 0.7);
      ctx.arc(18, radius * 0.35, 12, Math.PI * 0.3, Math.PI * 0.6);
      ctx.stroke();
    }
  }

  // 안경
  drawGlasses(ctx, radius) {
    const type = this.config.glasses;
    if (type === 'none') return;

    const eyeY = -radius * 0.05;
    const eyeSpacing = radius * 0.45;

    ctx.save();
    if (type === 'cat_eye') {
      // 날카로운 캣츠아이 뿔테
      ctx.strokeStyle = '#881337';
      ctx.fillStyle = 'rgba(136, 19, 55, 0.15)';
      ctx.lineWidth = 4;

      // 왼쪽 캣츠아이
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing - 22, eyeY - 16);
      ctx.lineTo(-eyeSpacing + 18, eyeY - 11);
      ctx.lineTo(-eyeSpacing + 12, eyeY + 12);
      ctx.lineTo(-eyeSpacing - 18, eyeY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 오른쪽 캣츠아이
      ctx.beginPath();
      ctx.moveTo(eyeSpacing + 22, eyeY - 16);
      ctx.lineTo(eyeSpacing - 18, eyeY - 11);
      ctx.lineTo(eyeSpacing - 12, eyeY + 12);
      ctx.lineTo(eyeSpacing + 18, eyeY + 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 브릿지
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing + 18, eyeY - 4);
      ctx.lineTo(eyeSpacing - 18, eyeY - 4);
      ctx.stroke();
    } else if (type === 'round_wire') {
      // 로즈골드 동글이 안경
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 16, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 16, 0, Math.PI * 2);
      ctx.moveTo(-eyeSpacing + 16, eyeY);
      ctx.lineTo(eyeSpacing - 16, eyeY);
      ctx.stroke();
    } else if (type === 'horn_rimmed') {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 5;
      ctx.strokeRect(-eyeSpacing - 18, eyeY - 14, 36, 28);
      ctx.strokeRect(eyeSpacing - 18, eyeY - 14, 36, 28);
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing + 18, eyeY);
      ctx.lineTo(eyeSpacing - 18, eyeY);
      ctx.stroke();
    } else if (type === 'gold_rim') {
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, 15, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, 15, 0, Math.PI * 2);
      ctx.moveTo(-eyeSpacing + 15, eyeY);
      ctx.lineTo(eyeSpacing - 15, eyeY);
      ctx.stroke();
    } else if (type === 'sunglasses') {
      ctx.fillStyle = '#1A237E';
      ctx.strokeStyle = '#0D47A1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-eyeSpacing - 20, eyeY - 14, 40, 26, [8, 8, 14, 14]);
      ctx.roundRect(eyeSpacing - 20, eyeY - 14, 40, 26, [8, 8, 14, 14]);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-eyeSpacing + 20, eyeY - 4);
      ctx.lineTo(eyeSpacing - 20, eyeY - 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 악세사리
  drawAccessory(ctx, radius) {
    const acc = this.config.accessory;
    if (acc === 'none') return;

    ctx.save();
    if (acc === 'pearl_earring') {
      // 우아한 진주 귀걸이 (양쪽 귀)
      const earY = radius * 0.18;
      [-radius * 0.96, radius * 0.96].forEach(earX => {
        // 골드 고리
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(earX, earY, 4, 0, Math.PI * 2);
        ctx.stroke();
        // 진주 방울
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(earX, earY + 9, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // 진주 하이라이트
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(earX - 2, earY + 7, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    } else if (acc === 'silk_scarf') {
      // 명품 실크 스카프
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.92, radius * 0.45, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // 스카프 매듭
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.ellipse(0, radius * 0.98, 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // 스카프 꼬리
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, radius * 1.02);
      ctx.lineTo(-8, radius * 1.25);
      ctx.moveTo(3, radius * 1.02);
      ctx.lineTo(8, radius * 1.22);
      ctx.stroke();
    } else if (acc === 'nose_hair') {
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(3, radius * 0.22);
      ctx.quadraticCurveTo(8, radius * 0.28, 12, radius * 0.26);
      ctx.moveTo(-4, radius * 0.22);
      ctx.quadraticCurveTo(-9, radius * 0.29, -13, radius * 0.25);
      ctx.stroke();
    } else if (acc === 'mustache') {
      ctx.fillStyle = '#222';
      ctx.beginPath();
      ctx.ellipse(-12, radius * 0.28, 14, 7, -0.2, 0, Math.PI * 2);
      ctx.ellipse(12, radius * 0.28, 14, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (acc === 'toothpick') {
      ctx.strokeStyle = '#E0D0B0';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(10, radius * 0.48);
      ctx.lineTo(35, radius * 0.42);
      ctx.stroke();
    } else if (acc === 'mole') {
      ctx.fillStyle = '#3E2723';
      ctx.beginPath();
      ctx.arc(22, radius * 0.65, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(22, radius * 0.65);
      ctx.lineTo(30, radius * 0.72);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 헤어 스타일
  drawHair(ctx, radius) {
    const hair = this.config.hair;
    ctx.save();
    ctx.fillStyle = '#212121';
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3.5;

    if (hair === 'hair_female_bob') {
      // 도도한 칼단발 (보브컷)
      // 윗머리 & 둥근 볼륨
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, Math.PI * 0.8, Math.PI * 2.2);
      // 왼쪽 칼단발 떨어지는 선
      ctx.lineTo(-radius * 0.95, radius * 0.45);
      ctx.lineTo(-radius * 0.55, -radius * 0.2);
      // 앞머리 (뱅)
      ctx.quadraticCurveTo(0, -radius * 0.35, radius * 0.55, -radius * 0.2);
      // 오른쪽 칼단발 떨어지는 선
      ctx.lineTo(radius * 0.95, radius * 0.45);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 머릿결 하이라이트
      ctx.strokeStyle = '#44403C';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-radius * 0.6, -radius * 0.7);
      ctx.quadraticCurveTo(0, -radius * 0.5, radius * 0.6, -radius * 0.7);
      ctx.stroke();
    } else if (hair === 'hair_female_ponytail') {
      // 깐깐한 포니테일 앞머리
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, Math.PI * 0.82, Math.PI * 2.18);
      ctx.quadraticCurveTo(0, -radius * 0.45, -radius * 0.75, -radius * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hair === 'hair_female_wave') {
      // 우아한 롱 웨이브 (앞머리 및 옆머리 웨이브)
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, Math.PI * 0.8, Math.PI * 2.2);
      ctx.quadraticCurveTo(0, -radius * 0.4, -radius * 0.7, -radius * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 옆 웨이브 컬
      ctx.fillStyle = '#211714';
      ctx.beginPath();
      ctx.ellipse(-radius * 0.9, radius * 0.2, 14, 25, -0.2, 0, Math.PI * 2);
      ctx.ellipse(radius * 0.9, radius * 0.2, 14, 25, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (hair === 'hair_female_bun') {
      // 단정한 쪽머리 스타일 앞머리
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, Math.PI * 0.85, Math.PI * 2.15);
      ctx.quadraticCurveTo(0, -radius * 0.5, -radius * 0.7, -radius * 0.15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hair === 'hair_2_8') {
      ctx.beginPath();
      ctx.arc(0, 0, radius + 4, Math.PI * 0.85, Math.PI * 2.15);
      ctx.quadraticCurveTo(-radius * 0.1, -radius * 0.45, -radius * 0.8, -radius * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#424242';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(radius * 0.45, -radius * 0.85);
      ctx.quadraticCurveTo(0, -radius * 0.45, -radius * 0.5, -radius * 0.25);
      ctx.stroke();
    } else if (hair === 'hair_balding') {
      ctx.beginPath();
      ctx.ellipse(-radius * 0.95, -radius * 0.1, 14, 30, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(radius * 0.95, -radius * 0.1, 14, 30, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-10, -radius - 2);
      ctx.quadraticCurveTo(-5, -radius - 20, 10, -radius - 15);
      ctx.moveTo(0, -radius - 2);
      ctx.quadraticCurveTo(12, -radius - 22, 22, -radius - 12);
      ctx.stroke();
    } else if (hair === 'hair_comb') {
      ctx.beginPath();
      ctx.arc(0, -radius * 0.1, radius + 7, Math.PI * 0.8, Math.PI * 2.2);
      ctx.quadraticCurveTo(0, -radius * 0.6, -radius * 0.85, -radius * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (hair === 'hair_curly') {
      ctx.beginPath();
      for (let a = Math.PI * 0.75; a <= Math.PI * 2.25; a += 0.3) {
        const hx = Math.cos(a) * (radius + 8);
        const hy = Math.sin(a) * (radius + 8);
        ctx.arc(hx, hy, 14, 0, Math.PI * 2);
      }
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, radius + 5, Math.PI * 0.8, Math.PI * 2.2);
      ctx.lineTo(radius * 0.8, -radius * 0.2);
      ctx.lineTo(-radius * 0.8, -radius * 0.2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // 몸통 렌더링 (의상)
  drawTorso(ctx, x, y, angle, width = 90, height = 110) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const outfit = this.config.outfit;

    // 몸통 베이스 색상
    let bodyColor = '#FFFFFF';
    if (outfit === 'office_blouse') bodyColor = '#FDF8F6';
    else if (outfit === 'tweed_jacket') bodyColor = '#F472B6';
    else if (outfit === 'hiking_vest') bodyColor = '#FF8F00';
    else if (outfit === 'old_suit') bodyColor = '#546E7A';
    else if (outfit === 'tracksuit') bodyColor = '#1E88E5';

    ctx.fillStyle = bodyColor;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, [12, 12, 20, 20]);
    ctx.fill();
    ctx.stroke();

    // 의상 디테일
    if (outfit === 'office_blouse') {
      // V-넥 블라우스 라인
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, -height / 2);
      ctx.lineTo(0, -height / 2 + 35);
      ctx.lineTo(18, -height / 2);
      ctx.stroke();

      // 큰 보라/네이비 타이 리본 매듭
      ctx.fillStyle = '#6366F1';
      ctx.strokeStyle = '#4338CA';
      ctx.lineWidth = 2.5;
      // 리본 중앙 매듭
      ctx.beginPath();
      ctx.ellipse(0, -height / 2 + 32, 6, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 리본 날개 좌/우
      ctx.beginPath();
      ctx.ellipse(-14, -height / 2 + 28, 12, 7, -0.3, 0, Math.PI * 2);
      ctx.ellipse(14, -height / 2 + 28, 12, 7, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 리본 끈 아래로
      ctx.beginPath();
      ctx.moveTo(-3, -height / 2 + 36);
      ctx.lineTo(-8, -height / 2 + 65);
      ctx.lineTo(-1, -height / 2 + 62);
      ctx.moveTo(3, -height / 2 + 36);
      ctx.lineTo(8, -height / 2 + 65);
      ctx.lineTo(1, -height / 2 + 62);
      ctx.stroke();
    } else if (outfit === 'tweed_jacket') {
      // 핑크 트위드 자켓 칼라 & 금장 단추
      ctx.fillStyle = '#1E1B4B';
      ctx.fillRect(-width / 2, -height / 2, width, 14);

      // 가운데 여밈 라인
      ctx.strokeStyle = '#1E1B4B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(0, height / 2);
      ctx.stroke();

      // 금장 단추들
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 1.5;
      [-height / 2 + 30, -height / 2 + 50, -height / 2 + 70].forEach(by => {
        ctx.beginPath();
        ctx.arc(-8, by, 4, 0, Math.PI * 2);
        ctx.arc(8, by, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    } else if (outfit === 'striped_tie' || outfit === 'old_suit') {
      // 와이셔츠 깃
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(-24, -height / 2);
      ctx.lineTo(0, -height / 2 + 30);
      ctx.lineTo(-6, -height / 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(24, -height / 2);
      ctx.lineTo(0, -height / 2 + 30);
      ctx.lineTo(6, -height / 2);
      ctx.fill();
      ctx.stroke();

      // 넥타이
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.moveTo(-10, -height / 2 + 25);
      ctx.lineTo(10, -height / 2 + 25);
      ctx.lineTo(16, height / 2 - 10);
      ctx.lineTo(0, height / 2 + 10);
      ctx.lineTo(-16, height / 2 - 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#FFD54F';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-8, -height / 2 + 40);
      ctx.lineTo(8, -height / 2 + 55);
      ctx.moveTo(-12, -height / 2 + 70);
      ctx.lineTo(12, -height / 2 + 85);
      ctx.stroke();
    } else if (outfit === 'hiking_vest') {
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 3;
      ctx.strokeRect(-width / 2 + 8, -10, 28, 30);
      ctx.strokeRect(width / 2 - 36, -10, 28, 30);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -height / 2);
      ctx.lineTo(0, height / 2);
      ctx.stroke();
    } else if (outfit === 'tracksuit') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-width / 2 + 6, -height / 2);
      ctx.lineTo(-width / 2 + 6, height / 2);
      ctx.moveTo(-width / 2 + 14, -height / 2);
      ctx.lineTo(-width / 2 + 14, height / 2);
      ctx.moveTo(width / 2 - 6, -height / 2);
      ctx.lineTo(width / 2 - 6, height / 2);
      ctx.moveTo(width / 2 - 14, -height / 2);
      ctx.lineTo(width / 2 - 14, height / 2);
      ctx.stroke();
    }

    // 이름표 (사원증 목걸이)
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(-22, -height / 2 + 55, 44, 28);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-22, -height / 2 + 55, 44, 28);

    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.config.role || '부장', 0, -height / 2 + 67);
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(this.config.name ? this.config.name.slice(0, 4) : '김부장', 0, -height / 2 + 79);

    ctx.restore();
  }

  // 팔 렌더링
  drawLimb(ctx, x1, y1, x2, y2, width = 24, color = null) {
    ctx.save();
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.lineWidth = width - 6;
    ctx.strokeStyle = color || '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
}
