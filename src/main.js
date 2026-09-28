// 김부장 (오피스 스트레스 버스터) - 메인 인터랙티브 컨트롤러
import { sounds } from './audio.js';
import { AvatarRenderer, AVATAR_PARTS, DEFAULT_AVATARS } from './avatar.js';
import { Ragdoll } from './ragdoll.js';
import { ParticleSystem } from './particles.js';
import { DialogueSystem } from './dialogues.js';
import { WEAPON_TYPES, Projectile } from './weapons.js';
import { gameState, STRESS_TIERS } from './state.js';
import { MemeGenerator } from './meme.js';

class KimManagerApp {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // 코어 시스템
    this.particles = new ParticleSystem();
    this.dialogue = new DialogueSystem();
    this.avatar = new AvatarRenderer(gameState.data.avatar);
    this.ragdoll = null;
    
    // 무기 및 투척체
    this.projectiles = [];
    this.selectedWeaponId = 'flick';

    // 슬링샷 (딱밤) 상태
    this.isSlingshotActive = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragCurrent = { x: 0, y: 0 };
    this.dragPower = 0;

    // 게임 루프 & 콤보 / 피버
    this.combo = 0;
    this.comboTimer = 0;
    this.feverGauge = 0;
    this.isFeverTime = false;
    this.feverTimer = 0;

    // 아바타 프리뷰
    this.previewCanvas = document.getElementById('avatarPreviewCanvas');
    this.previewCtx = this.previewCanvas.getContext('2d');
    this.tempAvatarConfig = { ...gameState.data.avatar };
    this.currentPartsTab = 'hair';

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // 래그돌 초기화 (화면 비율에 맞춤)
    this.setupRagdoll();

    this.setupInputs();
    this.setupUI();
    this.renderWeaponDeck();
    this.updateHUD();

    // 오피스 시계 연동
    this.updateClock();
    setInterval(() => this.updateClock(), 10000);

    // 메인 루프 시작
    requestAnimationFrame((t) => this.loop(t));
  }

  setupRagdoll() {
    const isMobile = window.innerWidth < 600;
    const cx = window.innerWidth / 2;
    // 모바일에서는 조금 더 상단에 배치하여 하단 덱과 겹치지 않게
    const cy = isMobile ? window.innerHeight * 0.44 : window.innerHeight / 2 + 10;
    this.ragdoll = new Ragdoll(cx, cy);
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    if (this.ragdoll) {
      const isMobile = window.innerWidth < 600;
      this.ragdoll.originX = window.innerWidth / 2;
      this.ragdoll.originY = isMobile ? window.innerHeight * 0.44 : window.innerHeight / 2 + 10;
    }
  }

  updateClock() {
    const el = document.getElementById('officeClock');
    if (!el) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `🕒 ${h}:${m} (칼퇴!)`;
  }

  setupInputs() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onStart = (e) => {
      // 모바일 제스처 스크롤 방지
      if (e.type === 'touchstart') {
        const clientY = e.touches[0].clientY;
        if (clientY < window.innerHeight - 130) {
          e.preventDefault();
        }
      }

      sounds.ensureContext();
      const pos = getPos(e);

      if (this.selectedWeaponId === 'flick') {
        this.isSlingshotActive = true;
        this.dragStart = { ...pos };
        this.dragCurrent = { ...pos };
        this.dragPower = 0;
      }
    };

    const onMove = (e) => {
      if (!this.isSlingshotActive) return;
      if (e.cancelable && e.type === 'touchmove') e.preventDefault();
      const pos = getPos(e);
      this.dragCurrent = { ...pos };

      const dx = this.dragStart.x - this.dragCurrent.x;
      const dy = this.dragStart.y - this.dragCurrent.y;
      const dist = Math.hypot(dx, dy);
      this.dragPower = Math.min(100, Math.floor(dist * 0.65));

      if (this.dragPower > 15 && Math.random() < 0.25) {
        sounds.playCharge(this.dragPower / 100);
      }
    };

    const onEnd = (e) => {
      if (this.isSlingshotActive) {
        this.isSlingshotActive = false;

        const dx = this.dragStart.x - this.dragCurrent.x;
        const dy = this.dragStart.y - this.dragCurrent.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 25) {
          const angle = Math.atan2(dy, dx);
          const targetX = this.ragdoll.nodes.head.x + (Math.random() - 0.5) * 30;
          const targetY = this.ragdoll.nodes.head.y + (Math.random() - 0.5) * 20;

          const powerRatio = Math.max(0.3, this.dragPower / 100);
          this.executeFlickHit(targetX, targetY, powerRatio, angle);
        } else {
          const targetX = this.dragStart.x;
          const targetY = this.dragStart.y;
          const hit = this.ragdoll.getHitTarget(targetX, targetY);
          if (hit) {
            this.executeFlickHit(targetX, targetY, 0.45, 0);
          }
        }
        return;
      }

      if (this.selectedWeaponId !== 'flick') {
        const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
        if (clientY < window.innerHeight - 150) {
          this.throwCurrentWeapon(clientX, clientY);
        }
      }
    };

    this.canvas.addEventListener('mousedown', onStart);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  executeFlickHit(x, y, powerRatio, angle) {
    const isFever = this.isFeverTime;
    const finalPower = isFever ? powerRatio * 1.8 : powerRatio;
    const damage = Math.round(35 * finalPower);

    sounds.playFlickHit(finalPower);

    const forceX = Math.cos(angle) * (65 * finalPower);
    const forceY = Math.sin(angle) * (50 * finalPower);
    this.ragdoll.applyImpulse(forceX, forceY, 'head', (Math.random() - 0.5) * 0.8 * finalPower);

    this.avatar.triggerHit('flick', finalPower);

    const stampText = finalPower > 0.8 ? 'POW!!' : (finalPower > 0.5 ? 'BAM!' : '딱!');
    this.particles.addComicText(x, y, stampText, '#FF1744', 1.2 + finalPower * 0.5);
    this.particles.spawnHitParticles(x, y, 'flick', Math.floor(15 + finalPower * 20));
    this.particles.triggerShake(Math.floor(8 + finalPower * 14), 14);

    if (Math.random() < 0.65) {
      this.dialogue.showRandomQuote(this.ragdoll.nodes.head.x, this.ragdoll.nodes.head.y);
    }

    this.registerHit(damage, finalPower * 100);
  }

  throwCurrentWeapon(targetX, targetY) {
    const weaponId = this.selectedWeaponId;
    const weapon = WEAPON_TYPES.find(w => w.id === weaponId);
    if (!weapon) return;

    const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 80;
    const startY = window.innerHeight - 90;

    const count = this.isFeverTime ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const offsetX = (i - (count - 1) / 2) * 40;
      const proj = new Projectile(weaponId, startX, startY, targetX + offsetX, targetY, (hx, hy, type) => {
        this.onProjectileHit(hx, hy, type, weapon);
      });
      this.projectiles.push(proj);
    }
  }

  onProjectileHit(x, y, type, weapon) {
    const isFever = this.isFeverTime;
    const damage = weapon.damage * (isFever ? 1.7 : 1.0);

    if (type === 'water_balloon') sounds.playWaterSplash();
    else if (type === 'slipper') sounds.playSlap();
    else if (type === 'keyboard') sounds.playKeyboardClatter();
    else if (type === 'golden_swatter') sounds.playZap();
    else if (type === 'hammer') sounds.playSqueak();
    else if (type === 'documents') sounds.playPaperSlap();

    const fx = (Math.random() - 0.5) * 60;
    const fy = -18 - Math.random() * 22;
    this.ragdoll.applyImpulse(fx, fy, 'head');
    this.avatar.triggerHit(type, 1.2);

    const comicLabels = {
      water_balloon: '첨벙!',
      slipper: '찰싹!',
      keyboard: '와장창!',
      golden_swatter: '지지직!',
      hammer: '뿅!!',
      documents: '반려!!'
    };
    this.particles.addComicText(x, y, comicLabels[type] || 'HIT!', '#FF9100', 1.4);
    this.particles.spawnHitParticles(x, y, type, 22);
    this.particles.triggerShake(type === 'golden_swatter' || type === 'hammer' ? 14 : 9, 12);

    if (Math.random() < 0.6) {
      this.dialogue.showRandomQuote(this.ragdoll.nodes.head.x, this.ragdoll.nodes.head.y);
    }

    this.registerHit(damage, 60);
  }

  registerHit(damage, power) {
    this.combo++;
    this.comboTimer = 110;

    if (!this.isFeverTime) {
      this.feverGauge = Math.min(100, this.feverGauge + 14);
      if (this.feverGauge >= 100) {
        this.triggerFeverTime();
      }
    }

    gameState.addHit(damage, power, this.combo);
    this.updateHUD();
  }

  triggerFeverTime() {
    this.isFeverTime = true;
    this.feverTimer = 360;
    sounds.playFeverStart();

    const overlay = document.getElementById('feverOverlay');
    if (overlay) overlay.classList.add('active');
  }

  endFeverTime() {
    this.isFeverTime = false;
    this.feverGauge = 0;
    const overlay = document.getElementById('feverOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  updateHUD() {
    const brandTitleEl = document.getElementById('targetBrandTitle');
    if (brandTitleEl) {
      brandTitleEl.textContent = gameState.data.avatar.name || '김부장';
    }

    const wbTargetName = document.getElementById('wbTargetName');
    if (wbTargetName) {
      wbTargetName.textContent = gameState.data.avatar.name || '김부장';
    }

    const reasonTextEl = document.getElementById('hudReasonText');
    if (reasonTextEl) {
      reasonTextEl.textContent = gameState.data.selectedReason || '직장 스트레스';
    }

    document.getElementById('stressRelieved').textContent = gameState.data.stats.stressRelieved;
    document.getElementById('currentStressBadge').textContent = `${gameState.data.currentStressScore || 8}점`;

    const comboContainer = document.getElementById('comboContainer');
    const comboNumber = document.getElementById('comboNumber');
    if (this.combo > 1) {
      comboContainer.classList.add('active');
      comboNumber.textContent = this.combo;
    } else {
      comboContainer.classList.remove('active');
    }

    const feverBar = document.getElementById('feverBar');
    const feverText = document.getElementById('feverText');
    if (this.isFeverTime) {
      const remainingPct = Math.round((this.feverTimer / 360) * 100);
      feverBar.style.width = `${remainingPct}%`;
      feverText.textContent = `🔥 FEVER! ${Math.ceil(this.feverTimer / 60)}s`;
    } else {
      feverBar.style.width = `${this.feverGauge}%`;
      feverText.textContent = `⚡ FEVER ${this.feverGauge}%`;
    }
  }

  // 스트레스 점수에 따라 무기 덱 렌더링
  renderWeaponDeck() {
    const deck = document.getElementById('weaponDeck');
    if (!deck) return;
    deck.innerHTML = '';

    const activeWeapons = gameState.getActiveWeapons();

    // 현재 선택된 무기가 잠긴 상태라면 첫 번째 사용 가능한 무기로 자동 교체
    if (!activeWeapons.includes(this.selectedWeaponId)) {
      this.selectedWeaponId = activeWeapons[0] || 'flick';
    }

    WEAPON_TYPES.forEach((w) => {
      const isAvailable = activeWeapons.includes(w.id);
      const isSelected = this.selectedWeaponId === w.id;

      const card = document.createElement('div');
      card.className = `weapon-card ${isSelected ? 'active' : ''} ${!isAvailable ? 'locked' : ''}`;
      card.innerHTML = `
        <span class="w-icon">${w.icon}</span>
        <span class="w-name">${w.name}</span>
        ${!isAvailable ? '<span class="w-lock-badge">🔒</span>' : ''}
      `;

      card.addEventListener('click', () => {
        sounds.playClick();
        if (isAvailable) {
          this.selectedWeaponId = w.id;
          this.renderWeaponDeck();
          const hint = document.getElementById('actionHint');
          if (hint) {
            hint.innerHTML = w.id === 'flick' 
              ? '👆 화면을 뒤로 당겨 <span class="highlight">파워 딱밤</span>을 날리세요!'
              : `🎯 화면을 탭하여 <span class="highlight">${w.name}</span>을(를) 투척하세요!`;
          }
        } else {
          // 잠긴 무기면 스트레스 측정 모달 열기 안내
          this.renderStressModal();
          this.openModal('stressMeterModal');
        }
      });

      deck.appendChild(card);
    });

    // 선택된 카드가 덱 영역 중앙에 잘리지 않고 보이도록 자동 스크롤
    requestAnimationFrame(() => {
      const activeCard = deck.querySelector('.weapon-card.active');
      if (activeCard) {
        activeCard.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }

  setupUI() {
    // 사운드 토글
    const soundBtn = document.getElementById('soundToggleBtn');
    soundBtn.addEventListener('click', () => {
      const isMuted = sounds.toggleMute();
      soundBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    // 스트레스 측정 모달 열기 (우측 배지 및 중앙 원인 배지)
    const openStressModal = () => {
      sounds.playClick();
      this.renderStressModal();
      this.openModal('stressMeterModal');
    };

    document.getElementById('stressMeterBtn').addEventListener('click', openStressModal);
    const hudReasonBtn = document.getElementById('hudStressReason');
    if (hudReasonBtn) {
      hudReasonBtn.addEventListener('click', openStressModal);
    }

    // 아바타 모달 열기
    document.getElementById('openAvatarBtn').addEventListener('click', () => {
      sounds.playClick();
      this.tempAvatarConfig = { ...gameState.data.avatar };
      this.renderAvatarStudio();
      this.openModal('avatarModal');
    });

    // 인증서 모달 열기
    document.getElementById('openProofBtn').addEventListener('click', () => {
      sounds.playClick();
      this.renderProofModal();
      this.openModal('proofModal');
    });

    // 닫기 버튼
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        sounds.playClick();
        const targetId = e.currentTarget.getAttribute('data-close');
        this.closeModal(targetId);
      });
    });

    // 아바타 저장
    document.getElementById('saveAvatarBtn').addEventListener('click', () => {
      sounds.playStamp();
      const name = document.getElementById('avatarNameInput').value.trim() || (this.tempAvatarConfig.gender === 'female' ? '박부장' : '김부장');
      const role = document.getElementById('avatarRoleInput').value.trim() || '부장';
      this.tempAvatarConfig.name = name;
      this.tempAvatarConfig.role = role;

      gameState.updateAvatar(this.tempAvatarConfig);
      this.avatar.updateConfig(gameState.data.avatar);
      this.updateHUD();
      this.closeModal('avatarModal');
    });

    // 아바타 성별 프리셋 버튼
    const presetMaleBtn = document.getElementById('presetMaleBtn');
    const presetFemaleBtn = document.getElementById('presetFemaleBtn');
    if (presetMaleBtn && presetFemaleBtn) {
      presetMaleBtn.addEventListener('click', () => {
        sounds.playClick();
        presetMaleBtn.classList.add('active');
        presetFemaleBtn.classList.remove('active');
        this.tempAvatarConfig = { ...DEFAULT_AVATARS.male };
        document.getElementById('avatarNameInput').value = this.tempAvatarConfig.name;
        document.getElementById('avatarRoleInput').value = this.tempAvatarConfig.role;
        this.renderPartsOptions();
        this.drawAvatarPreview();
      });

      presetFemaleBtn.addEventListener('click', () => {
        sounds.playClick();
        presetFemaleBtn.classList.add('active');
        presetMaleBtn.classList.remove('active');
        this.tempAvatarConfig = { ...DEFAULT_AVATARS.female };
        document.getElementById('avatarNameInput').value = this.tempAvatarConfig.name;
        document.getElementById('avatarRoleInput').value = this.tempAvatarConfig.role;
        this.renderPartsOptions();
        this.drawAvatarPreview();
      });
    }

    // 스트레스 슬라이더 변경 감지
    const stressInput = document.getElementById('stressInput');
    const scoreVal = document.getElementById('stressScoreVal');
    const emojiVal = document.getElementById('stressEmoji');

    stressInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      scoreVal.textContent = val;
      if (val <= 3) emojiVal.textContent = '😌';
      else if (val <= 6) emojiVal.textContent = '😤';
      else if (val <= 8) emojiVal.textContent = '🤬';
      else emojiVal.textContent = '🤯';
    });

    // 스트레스 원인 등록 및 입력 이벤트
    const addReasonBtn = document.getElementById('addReasonBtn');
    const customReasonInput = document.getElementById('customReasonInput');

    const handleAddCustomReason = () => {
      if (!customReasonInput) return;
      const val = customReasonInput.value.trim();
      if (!val) {
        customReasonInput.focus();
        return;
      }
      sounds.playClick();
      gameState.addReason(val);
      customReasonInput.value = '';
      this.renderReasonTags();
    };

    if (addReasonBtn) {
      addReasonBtn.addEventListener('click', handleAddCustomReason);
    }
    if (customReasonInput) {
      customReasonInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddCustomReason();
        }
      });
    }

    // 스트레스 수치 적용 및 무기 장착
    document.getElementById('applyStressBtn').addEventListener('click', () => {
      sounds.playStamp();
      const score = parseInt(stressInput.value);
      const activeTag = document.querySelector('.reason-tag.active');
      const activeReason = activeTag?.dataset.reason || gameState.data.selectedReason || '직장 스트레스';

      gameState.setStressScore(score, activeReason);
      this.renderWeaponDeck();
      this.updateHUD();
      this.closeModal('stressMeterModal');

      // 안내 토스트
      alert(`🔥 오늘의 스트레스 ${score}점 ("${activeReason}")이 등록되었습니다!\n모든 무기를 자유롭게 사용하여 스트레스를 날려보세요!`);
    });

    // 짤방 다운로드 및 공유
    document.getElementById('downloadCardBtn').addEventListener('click', () => {
      sounds.playStamp();
      const card = MemeGenerator.generateCard(gameState);
      MemeGenerator.downloadCard(card, 'kim_manager_proof.png');
    });

    document.getElementById('shareCardBtn').addEventListener('click', () => {
      sounds.playStamp();
      const card = MemeGenerator.generateCard(gameState);
      MemeGenerator.shareCard(card);
    });
  }

  // 스트레스 사유 동적 렌더링 및 개별 태그 이벤트
  renderReasonTags() {
    const container = document.getElementById('reasonTags');
    if (!container) return;

    const reasons = gameState.getReasons();
    const selected = gameState.data.selectedReason || reasons[0] || '직장 스트레스';
    const defaultReasons = ['야근 강요', '보고서 반려', '무의미한 회의', '라떼는 말이야', '월요병'];

    container.innerHTML = '';
    reasons.forEach((reason) => {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = `reason-tag ${reason === selected ? 'active' : ''}`;
      tag.dataset.reason = reason;

      const label = document.createElement('span');
      label.textContent = reason;
      tag.appendChild(label);

      // 직접 등록한 커스텀 원인은 삭제(✕) 버튼 제공
      if (!defaultReasons.includes(reason)) {
        const removeBtn = document.createElement('span');
        removeBtn.className = 'reason-tag-remove';
        removeBtn.textContent = '✕';
        removeBtn.title = '원인 삭제';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          sounds.playClick();
          gameState.removeReason(reason);
          this.renderReasonTags();
        });
        tag.appendChild(removeBtn);
      }

      tag.addEventListener('click', () => {
        sounds.playClick();
        gameState.data.selectedReason = reason;
        gameState.save();
        container.querySelectorAll('.reason-tag').forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
      });

      container.appendChild(tag);
    });
  }

  renderStressModal() {
    const current = gameState.data.currentStressScore || 8;
    const stressInput = document.getElementById('stressInput');
    const scoreVal = document.getElementById('stressScoreVal');
    const emojiVal = document.getElementById('stressEmoji');

    stressInput.value = current;
    scoreVal.textContent = current;
    if (current <= 3) emojiVal.textContent = '😌';
    else if (current <= 6) emojiVal.textContent = '😤';
    else if (current <= 8) emojiVal.textContent = '🤬';
    else emojiVal.textContent = '🤯';

    this.renderReasonTags();

    const customReasonInput = document.getElementById('customReasonInput');
    if (customReasonInput) {
      customReasonInput.value = '';
    }
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('open');
  }

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('open');
  }

  renderAvatarStudio() {
    const isFemale = this.tempAvatarConfig.gender === 'female' || (this.tempAvatarConfig.name && this.tempAvatarConfig.name.includes('박부장'));
    const presetMaleBtn = document.getElementById('presetMaleBtn');
    const presetFemaleBtn = document.getElementById('presetFemaleBtn');
    if (presetMaleBtn && presetFemaleBtn) {
      if (isFemale) {
        presetFemaleBtn.classList.add('active');
        presetMaleBtn.classList.remove('active');
      } else {
        presetMaleBtn.classList.add('active');
        presetFemaleBtn.classList.remove('active');
      }
    }

    const nameInput = document.getElementById('avatarNameInput');
    const roleInput = document.getElementById('avatarRoleInput');
    nameInput.value = this.tempAvatarConfig.name || (isFemale ? '박부장' : '김부장');
    roleInput.value = this.tempAvatarConfig.role || (isFemale ? '기획팀 부장' : '개발팀 부장');

    const tabs = document.querySelectorAll('.part-tab-btn');
    tabs.forEach(btn => {
      btn.onclick = () => {
        sounds.playClick();
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        this.currentPartsTab = btn.getAttribute('data-tab');
        this.renderPartsOptions();
      };
    });

    this.renderPartsOptions();
    this.drawAvatarPreview();
  }

  renderPartsOptions() {
    const container = document.getElementById('partsOptionsList');
    container.innerHTML = '';
    const partKey = this.currentPartsTab;
    const options = AVATAR_PARTS[partKey] || [];

    options.forEach(opt => {
      const isSelected = this.tempAvatarConfig[partKey] === opt.id;
      const item = document.createElement('div');
      item.className = `part-option-item ${isSelected ? 'selected' : ''}`;
      item.innerHTML = `
        <span>${opt.name}</span>
        ${isSelected ? '<span>✔</span>' : ''}
      `;
      item.addEventListener('click', () => {
        sounds.playClick();
        this.tempAvatarConfig[partKey] = opt.id;
        this.renderPartsOptions();
        this.drawAvatarPreview();
      });
      container.appendChild(item);
    });
  }

  drawAvatarPreview() {
    const pCtx = this.previewCtx;
    pCtx.clearRect(0, 0, 200, 240);

    const prevRenderer = new AvatarRenderer(this.tempAvatarConfig);
    prevRenderer.drawTorso(pCtx, 100, 180, 0, 75, 95);
    prevRenderer.drawHead(pCtx, 100, 90, 0, 46);
  }

  renderProofModal() {
    const container = document.getElementById('proofCanvasContainer');
    container.innerHTML = '';
    const card = MemeGenerator.generateCard(gameState);
    container.appendChild(card);
  }

  loop(time) {
    this.update();
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  update() {
    if (this.comboTimer > 0) {
      this.comboTimer--;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.updateHUD();
      }
    }

    if (this.isFeverTime) {
      this.feverTimer--;
      if (this.feverTimer <= 0) {
        this.endFeverTime();
      }
      this.updateHUD();
    }

    if (this.ragdoll) this.ragdoll.update();
    if (this.avatar) this.avatar.update();
    if (this.dialogue) this.dialogue.update();
    if (this.particles) this.particles.update();

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.update();
      if (p.isFinished) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    const shake = this.particles.getShakeOffset();
    ctx.translate(shake.x, shake.y);

    if (this.ragdoll && this.avatar) {
      this.ragdoll.draw(ctx, this.avatar);
    }

    for (const p of this.projectiles) {
      p.draw(ctx);
    }

    this.particles.draw(ctx);
    this.dialogue.draw(ctx);

    if (this.isSlingshotActive) {
      this.drawSlingshotGuide(ctx);
    }

    ctx.restore();
  }

  drawSlingshotGuide(ctx) {
    const start = this.dragStart;
    const cur = this.dragCurrent;
    const power = this.dragPower;

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#F59E0B';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(cur.x, cur.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const dx = start.x - cur.x;
    const dy = start.y - cur.y;
    const targetX = start.x + dx * 1.5;
    const targetY = start.y + dy * 1.5;

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    ctx.fillStyle = '#FFD54F';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cur.x, cur.y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '900 16px "Pretendard", sans-serif';
    ctx.fillStyle = power > 75 ? '#EF4444' : '#F59E0B';
    ctx.textAlign = 'center';
    ctx.fillText(`${power}% POWER`, cur.x, cur.y - 25);

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new KimManagerApp();
});
