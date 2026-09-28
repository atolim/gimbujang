// 직장 상사 코믹 대사 시스템 및 말풍선 연출
export const BOSS_QUOTES = [
  "내일 야근이야!!",
  "보고서 다시 써와!",
  "자네 지금 제정신인가?!",
  "라떼는 말이야~ 윽!",
  "내가 왕년에는 말이지..",
  "요즘 MZ들은 끈기가 없어!",
  "오늘 팀 회식 필수 참석이야!",
  "월급값은 하고 가야지?!",
  "아파! 뼈 맞았어!",
  "김대리! 시말서 써와!",
  "퇴근 버튼 누르기만 해봐!",
  "주말에 등산이나 갈까?!"
];

export class DialogueSystem {
  constructor() {
    this.currentQuote = null;
    this.timer = 0;
    this.x = 0;
    this.y = 0;
    this.scale = 0;
  }

  showRandomQuote(x, y) {
    const idx = Math.floor(Math.random() * BOSS_QUOTES.length);
    this.currentQuote = BOSS_QUOTES[idx];
    this.x = x;
    this.y = y - 60;
    this.timer = 50; // 50 프레임 동안 표시
    this.scale = 0.2;
  }

  update() {
    if (this.timer > 0) {
      this.timer--;
      if (this.scale < 1) {
        this.scale += 0.2;
      }
      this.y -= 0.6; // 살짝 위로 떠오름
    }
  }

  draw(ctx) {
    if (this.timer <= 0 || !this.currentQuote) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(Math.min(1, this.scale), Math.min(1, this.scale));

    const alpha = this.timer < 15 ? this.timer / 15 : 1;
    ctx.globalAlpha = alpha;

    ctx.font = 'bold 15px "Pretendard", "Noto Sans KR", sans-serif';
    const textWidth = ctx.measureText(this.currentQuote).width;
    const paddingX = 16;
    const paddingY = 10;
    const bw = textWidth + paddingX * 2;
    const bh = 34;

    // 말풍선 배경
    ctx.fillStyle = '#FFF8E1';
    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh, bw, bh, [10, 10, 10, 10]);
    ctx.fill();
    ctx.stroke();

    // 말풍선 꼬리
    ctx.fillStyle = '#FFF8E1';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(0, 8);
    ctx.lineTo(6, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 텍스트
    ctx.fillStyle = '#BF360C';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.currentQuote, 0, -bh / 2);

    ctx.restore();
  }
}
