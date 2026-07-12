const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 600;
canvas.height = 600;

let gridSize = 20;
let cellSize = canvas.width / gridSize;

let snake, dir, nextDir, food, obstacles;
let score, high = Number(localStorage.getItem('snake_high') || 0);

document.getElementById('high').textContent = high;

let running = false, paused = false, gameOver = false;

const speedMap = {1:10,2:8,3:6,4:4,5:3};
let speedLevel = 2;
let ticks = 0;

function reset(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  nextDir = {...dir};
  score = 0;
  speedLevel = 2;

  running = false;
  paused = false;
  gameOver = false;

  document.getElementById('score').textContent = score;

  generateObstacles();
  placeFood();
}

function placeFood(){
  while(true){
    let x = Math.floor(Math.random()*gridSize);
    let y = Math.floor(Math.random()*gridSize);

    if(!snake.some(s=>s.x===x && s.y===y) &&
       !obstacles.some(o=>o.x===x && o.y===y)){
      food = {x,y};
      break;
    }
  }
}

function generateObstacles(){
  obstacles = [];
  while(obstacles.length < 5){
    let x = Math.floor(Math.random()*gridSize);
    let y = Math.floor(Math.random()*gridSize);

    if(!snake.some(s=>s.x===x && s.y===y)){
      obstacles.push({x,y});
    }
  }
}

document.addEventListener('keydown', e=>{
  const map = {
    ArrowUp:'up',ArrowDown:'down',
    ArrowLeft:'left',ArrowRight:'right',
    w:'up',a:'left',s:'down',d:'right'
  };

  if(e.key === ' ') togglePause();

  if(map[e.key]) changeDir(map[e.key]);
});

function changeDir(k){
  const m = {
    up:{x:0,y:-1},down:{x:0,y:1},
    left:{x:-1,y:0},right:{x:1,y:0}
  };

  let nd = m[k];
  if(!nd) return;

  if(nd.x === -dir.x && nd.y === -dir.y) return;

  nextDir = nd;

  if(!running) startGame();
}

function update(){
  dir = {...nextDir};

  let head = {x:snake[0].x + dir.x, y:snake[0].y + dir.y};

  if(head.x<0 || head.y<0 || head.x>=gridSize || head.y>=gridSize){
    return endGame();
  }

  if(snake.some(s=>s.x===head.x && s.y===head.y)){
    return endGame();
  }

  if(obstacles.some(o=>o.x===head.x && o.y===head.y)){
    return endGame();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    score++;
    document.getElementById('score').textContent = score;

    // 🔥 Dynamic Difficulty
    if(score % 5 === 0){
      speedLevel = Math.min(5, speedLevel + 1);
    }

    placeFood();
  } else {
    snake.pop();
  }
}

function endGame(){
  running = false;
  gameOver = true;

  if(score > high){
    high = score;
    localStorage.setItem('snake_high', high);
    document.getElementById('high').textContent = high;
  }
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // food
  ctx.fillStyle = "orange";
  ctx.fillRect(food.x*cellSize, food.y*cellSize, cellSize, cellSize);

  // snake
  ctx.fillStyle = "lime";
  snake.forEach(s=>{
    ctx.fillRect(s.x*cellSize, s.y*cellSize, cellSize, cellSize);
  });

  // obstacles
  ctx.fillStyle = "red";
  obstacles.forEach(o=>{
    ctx.fillRect(o.x*cellSize, o.y*cellSize, cellSize, cellSize);
  });
}

function loop(){
  if(running && !paused && !gameOver){
    ticks++;
    if(ticks >= speedMap[speedLevel]){
      update();
      ticks = 0;
    }
  }

  draw();
  requestAnimationFrame(loop);
}

document.getElementById('startBtn').onclick = ()=>{ if(gameOver) reset(); startGame(); };
document.getElementById('pauseBtn').onclick = togglePause;
document.getElementById('resetBtn').onclick = reset;

function startGame(){ running = true; paused = false; }
function togglePause(){ if(running) paused = !paused; }

reset();
loop();