const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// build simple images via offscreen canvas (no external assets)
const birdImg = new Image();
birdImg.src = 'bird.png';
const pipeImg = new Image();
pipeImg.src = 'pipe.png';

const restartBtn = document.getElementById('restartBtn');
const gameoverVideo = document.getElementById('gameoverVideo');
const gameoverAudio = new Audio('gameover.m4a');

restartBtn.addEventListener('click', ()=>{
  if(!running){ reset(); running=true; restartBtn.style.display='none'; gameoverVideo.style.display='none'; gameoverVideo.pause(); }
});

gameoverVideo.addEventListener('ended', ()=>{
  gameoverVideo.style.display='none';
  restartBtn.style.display='block';
});

// simple sound generator using Web Audio API (no external files)
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
const jumpAudio = new Audio('jump.m4a');
jumpAudio.volume = 0.5;

function playSound(type) {
  if(type === 'jump') {
    try {
      jumpAudio.currentTime = 0;
      const playPromise = jumpAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => console.log('Audio play failed:', error));
      }
    } catch(e) {
      console.log('Error playing sound:', e);
    }
  }
}

let frames = 0;
let score = 0;
let best = 0;

const pipes = [];
function addPipe(){
  const gap = 130;
  const minTop = 50, maxTop = H - gap - 50;
  const top = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
  pipes.push({x: W, top: top, bottom: top + gap, w: 70, passed:false});
}

function reset(){
  frames = 0; score = 0; pipes.length = 0; bird.y = H/2; bird.vy = 0;
}

// spawn a pipe right away so you see it on the first frame
addPipe();

const bird = {
  x: 80,
  y: H/2,
  w: 48,
  h: 36,
  vy: 0,
  gravity: 0.55,
  jump: -9,
  imgIndex: 0,
  draw(){
    if(birdImg.complete) {
      ctx.drawImage(birdImg, this.x, this.y, this.w, this.h);
    } else {
      // fallback rect while loading
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  },
  update(){
    this.vy += this.gravity;
    this.y += this.vy;
    if(this.y + this.h > H){
      this.y = H - this.h;
      this.vy = 0;
      gameOver();
    }
    if(this.y < 0){ this.y = 0; this.vy = 0 }
  },
  flap(){ this.vy = this.jump; playSound('jump'); }
};

let running = true;
function gameOver(){
  running = false;
  best = Math.max(best, score);
  // Play video and audio simultaneously
  gameoverVideo.style.display='block';
  gameoverVideo.currentTime = 0;
  gameoverAudio.currentTime = 0;
  gameoverVideo.play().catch(e => console.log('Video play error:', e));
  gameoverAudio.play().catch(e => console.log('Audio play error:', e));
  if(restartBtn) restartBtn.style.display = 'block';
}

function update(){
  if(!running) return;
  frames++;
  bird.update();

  if(frames % 90 === 0) addPipe();

  for(let i = pipes.length-1; i >= 0; i--){
    const p = pipes[i];
    p.x -= 2.0;
    // collision
    if(bird.x < p.x + p.w && bird.x + bird.w > p.x){
      if(bird.y < p.top || bird.y + bird.h > p.bottom){ gameOver() }
    }
    if(!p.passed && p.x + p.w < bird.x){ p.passed = true; score++; playSound('score'); }
    if(p.x + p.w < -100) pipes.splice(i,1);
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  // background - warm sunset gradient
  ctx.fillStyle = '#ff9a56';
  ctx.fillRect(0,0,W,H);
  // (optional) draw a ground line to help see where pipes start
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,H-2,W,2);

  // pipes - drawn from single image
  pipes.forEach(p => {
    // top pipe
    ctx.drawImage(pipeImg, p.x, 0, p.w, p.top);
    // bottom pipe
    ctx.drawImage(pipeImg, p.x, p.bottom, p.w, H - p.bottom);
  });

  bird.draw();

  // score
  ctx.fillStyle = '#fff'; ctx.font = '28px sans-serif'; ctx.fillText(score, W - 50, 40);

  if(!running){
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
    ctx.fillText('Game Over', W/2 - 60, H/2 - 10);
    ctx.fillText('Best: ' + best, W/2 - 38, H/2 + 56);
  }
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

canvas.addEventListener('click', ()=>{
  if(!running){ reset(); running = true; restartBtn.style.display='none'; return }
  bird.flap();
});

window.addEventListener('keydown', (e)=>{ if(e.code === 'Space') { e.preventDefault(); bird.flap() } });

loop();
