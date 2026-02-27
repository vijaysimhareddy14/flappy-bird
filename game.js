const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const birdImg = new Image();
birdImg.src = "./bird.png";

const pipeImg = new Image();
pipeImg.src = "./pipe.png";

let bird, pipes, score, running;

function reset() {
  bird = {
    x: 80,
    y: canvas.height / 2,
    w: 40,
    h: 30,
    vy: 0
  };

  pipes = [];
  score = 0;
  running = true;
  restartBtn.style.display = "none";
}

function addPipe() {
  const gap = 160;
  const top = Math.random() * (canvas.height - gap - 100) + 50;
  pipes.push({
    x: canvas.width,
    top,
    bottom: top + gap,
    w: 70,
    passed: false
  });
}

function update() {
  if (!running) return;

  bird.vy += 0.5;
  bird.y += bird.vy;

  if (bird.y + bird.h > canvas.height || bird.y < 0) {
    gameOver();
  }

  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
    addPipe();
  }

  pipes.forEach(p => {
    p.x -= 2;

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
  });

  pipes = pipes.filter(p => p.x + p.w > 0);
}

function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  pipes.forEach(p => {
    ctx.drawImage(pipeImg, p.x, 0, p.w, p.top);
    ctx.drawImage(pipeImg, p.x, p.bottom, p.w, canvas.height - p.bottom);
  });

  ctx.drawImage(birdImg, bird.x, bird.y, bird.w, bird.h);

  ctx.fillStyle = "#fff";
  ctx.font = "32px Arial";
  ctx.fillText(score, canvas.width / 2, 60);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  restartBtn.style.display = "block";
}

canvas.addEventListener("click", () => {
  if (!running) {
    reset();
  }
  bird.vy = -9;
});

restartBtn.addEventListener("click", reset);

reset();
loop();