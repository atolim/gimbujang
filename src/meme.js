// 바이럴 짤방 및 인증 카드 생성기 (Canvas 렌더링 & 다운로드/공유)
import { AvatarRenderer } from './avatar.js';

export class MemeGenerator {
  static generateCard(gameState) {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280; // 9:16 모바일 스토리 비율
    const ctx = canvas.getContext('2d');

    const avatarConfig = gameState.data.avatar;
    const stats = gameState.data.stats;

    // 1. 배경 그라데이션 (네온 다크 오피스)
    const grad = ctx.createLinearGradient(0, 0, 720, 1280);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.4, '#1E1B4B');
    grad.addColorStop(1, '#0B0F19');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 720, 1280);

    // 격자 오피스 패턴
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 720; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1280);
      ctx.stroke();
    }
    for (let y = 0; y < 1280; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(720, y);
      ctx.stroke();
    }

    // 2. 상단 헤더 배너
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(40, 60, 640, 70);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🚨 오피스 스트레스 참교육 증명서 🚨', 360, 108);

    // 서브 카피
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`발급일: ${new Date().toLocaleDateString('ko-KR')}`, 360, 170);

    // 3. 중앙 캐릭터 카드 프레임
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(80, 210, 560, 480, 24);
    ctx.fill();
    ctx.stroke();

    // 캐릭터 그리기 (피격된 표정 시뮬레이션)
    const cardAvatar = new AvatarRenderer(avatarConfig);
    cardAvatar.bumpHeight = 25;
    cardAvatar.hitTimer = 999; // 피격 표정 강제

    // 아바타 몸통 및 머리
    cardAvatar.drawTorso(ctx, 360, 490, 0.08, 120, 150);
    cardAvatar.drawHead(ctx, 360, 350, -0.1, 75);

    // 코믹 타격 효과 글자 스탬프
    ctx.font = '900 48px "Impact", sans-serif';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    ctx.strokeText('POW!!', 200, 300);
    ctx.fillStyle = '#F59E0B';
    ctx.fillText('POW!!', 200, 300);

    ctx.strokeText('야근 취소!!', 510, 440);
    ctx.fillStyle = '#10B981';
    ctx.fillText('야근 취소!!', 510, 440);

    // 이름표 배너
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(180, 640, 360, 60);
    ctx.fillStyle = '#000000';
    ctx.font = '900 28px sans-serif';
    ctx.fillText(`타겟: ${avatarConfig.name} (${avatarConfig.role})`, 360, 680);

    // 4. 하단 상세 통계 리포트 카드
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(80, 730, 560, 330, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38BDF8';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📊 참교육 성적표', 110, 775);

    const statsList = [
      { label: '누적 타격 횟수', val: `${stats.totalHits} 회` },
      { label: '연속 콤보 기록', val: `${stats.maxCombo} COMBO` },
      { label: '최대 딱밤 위력', val: `${stats.maxFlickPower} G-Force` },
      { label: '해소된 스트레스', val: `${stats.stressRelieved} pt` }
    ];

    statsList.forEach((item, idx) => {
      const y = 830 + idx * 55;
      ctx.fillStyle = '#94A3B8';
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, 120, y);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.val, 600, y);
    });

    // 5. 참교육 완료 붉은 원형 인감 도장 쾅!
    ctx.save();
    ctx.translate(520, 960);
    ctx.rotate(-0.25);
    ctx.strokeStyle = '#EF4444';
    ctx.fillStyle = '#EF4444';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 65, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 55, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('참교육', 0, -14);
    ctx.fillText('완 료', 0, 18);
    ctx.restore();

    // 6. 워터마크 / 하단 로고
    ctx.fillStyle = '#64748B';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ 오피스 스트레스 버스터 | 칼퇴근 보장 ⚡', 360, 1150);
    ctx.fillText('지금 바로 상사에게 시원한 딱밤을 날려보세요!', 360, 1185);

    return canvas;
  }

  // 다운로드
  static downloadCard(canvas, filename = 'stress_buster_proof.png') {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // Web Share API 지원 시 공유
  static async shareCard(canvas) {
    if (navigator.share && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], 'stress_buster_proof.png', { type: 'image/png' });
          await navigator.share({
            title: '오피스 스트레스 참교육 완료!',
            text: '오늘자 부장님 참교육 완료! 당신도 스트레스 풀러 오세요.',
            files: [file]
          });
        } catch (e) {
          console.warn('Share canceled or failed', e);
        }
      });
    } else {
      // 공유 API 미지원 시 자동 다운로드
      this.downloadCard(canvas);
    }
  }
}
