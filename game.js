const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W, H;
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  W = canvas.width;
  H = canvas.height;
}
resize();
window.addEventListener("resize", resize);

// Assets
const birdImg = new Image();
birdImg.src = "./bird.png";

const pipeImg = new Image();
pipeImg.src = "./pipe.png";

const jumpAudio = new Audio("./jump.m4a");
const gameoverAudio = new Audio("./gameover.m4a");

const restartBtn = document.getElementById("restartBtn");
const gameoverVideo = document.getElementById("gameoverVideo");

// Game state
let running = true;
let frames = 0;
let score = 0;
let best = 0;

const bird = {
  x: 80,
  y: H / 2,
  w: 48,
  h: 36,
  vy: 0,
  gravity: 0.6,
  jump: -10,
  update() {
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y + this.h > H) gameOver();
    if (this.y < 0) this.y = 0;
  },
  flap() {
    this.vy = this.jump;
    jumpAudio.currentTime = 0;
    jumpAudio.play().catch(() => {});
  },
  draw() {
    if (birdImg.complete) {
      ctx.drawImage(birdImg, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
};

const pipes = [];
function addPipe() {
  const gap = 140;
  const top = Math.random() * (H - gap - 200) + 100;
  pipes.push({
    x: W,
    top,
    bottom: top + gap,
    w: 70,
    passed: false
  });
}

function reset() {
  pipes.length = 0;
  frames = 0;
  score = 0;
  bird.y = H / 2;
  bird.vy = 0;
  addPipe();
}

function gameOver() {
  running = false;
  best = Math.max(best, score);

  gameoverVideo.style.display = "block";
  gameoverVideo.currentTime = 0;
  gameoverVideo.play().catch(() => {});

  gameoverAudio.currentTime = 0;
  gameoverAudio.play().catch(() => {});

  restartBtn.style.display = "block";
}

restartBtn.onclick = () => {
  gameoverVideo.pause();
  gameoverVideo.style.display = "none";
  restartBtn.style.display = "none";
  running = true;
  reset();
};

function update() {
  if (!running) return;

  frames++;
  bird.update();

  if (frames % 90 === 0) addPipe();

  for (let i = pipes.length - 1; i >= 0; i--) {
    const p = pipes[i];
    p.x -= 2.5;

    // Collision
    if (
      bird.x < p.x + p.w &&
      bird.x + bird.w > p.x &&
      (bird.y < p.top || bird.y + bird.h > p.bottom)
    ) {
      gameOver();
    }

    if (!p.passed && p.x + p.w < bird.x) {
      p.passed = true;
      score++;
    }

    if (p.x + p.w < 0) pipes.splice(i, 1);
  }
}

function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, W, H);

  pipes.forEach(p => {
    ctx.drawImage(pipeImg, p.x, 0, p.w, p.top);
    ctx.drawImage(pipeImg, p.x, p.bottom, p.w, H - p.bottom);
  });

  bird.draw();

  ctx.fillStyle = "#fff";
  ctx.font = "28px sans-serif";
  ctx.fillText(score, W - 60, 40);

  if (!running) {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff";
    ctx.fillText("Game Over", W / 2 - 70, H / 2 - 20);
    ctx.fillText("Best: " + best, W / 2 - 55, H / 2 + 20);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener("click", () => {
  if (!running) return;
  bird.flap();
});

window.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    bird.flap();
  }
});

reset();
loop();