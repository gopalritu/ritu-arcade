(() => {
  const home = document.getElementById('homeScreen');
  const gameScreen = document.getElementById('gameScreen');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlayText = document.getElementById('overlayText');
  const startButton = document.getElementById('startButton');
  const backButton = document.getElementById('backButton');
  const pauseButton = document.getElementById('pauseButton');
  const liveScore = document.getElementById('liveScore');
  const highScoreLabel = document.getElementById('highScoreLabel');
  const controlHint = document.getElementById('controlHint');
  const carTouchControls = document.getElementById('carTouchControls');
  const images = {};
  const assetNames = ['Bird.png','Pipes.png','WhiteCar.png','RedCar1.png','RedCar2.png','YellowCar1.png','YellowCar2.png','YellowCar3.png'];
  assetNames.forEach(name => { const img = new Image(); img.src = `Assets/${name}`; images[name] = img; });
  let currentGame = null, running = false, paused = false, gameOver = false, raf = 0, lastTime = 0;
  let score = 0, highScore = 0, birdState = null, pipes = [], spawnElapsed = 0;
  let carState = null, enemies = [], carSpawnElapsed = 0, laneLines = [];
  const rand = (min,max) => min + Math.random()*(max-min);
  const stored = key => Number(localStorage.getItem(key) || 0);
  const save = (key,value) => localStorage.setItem(key,String(value));
  const ready = names => names.every(n => images[n] && images[n].complete && images[n].naturalWidth > 0);
  function resizeCanvas() {
    const w = currentGame === 'car' ? 600 : 800, h = currentGame === 'car' ? 800 : 600;
    canvas.width = w; canvas.height = h;
  }
  function launch(game) {
    currentGame = game; home.classList.add('hidden'); gameScreen.classList.remove('hidden');
    document.getElementById('gameTitle').textContent = game === 'bird' ? 'Flappy Bird' : 'Car Dodging';
    document.getElementById('gameEyebrow').textContent = game === 'bird' ? '01 / REFLEX' : '02 / DODGE';
    controlHint.textContent = game === 'bird' ? 'SPACE / TAP TO FLAP · P TO PAUSE' : '← → OR A / D TO CHANGE LANES · R TO RESTART';
    carTouchControls.classList.toggle('hidden', game !== 'car');
    pauseButton.classList.toggle('hidden', game !== 'bird');
    highScore = stored(game === 'bird' ? 'miniArcadeBirdBest' : 'miniArcadeCarBest');
    highScoreLabel.textContent = `PERSONAL BEST: ${highScore}`;
    resizeCanvas(); resetGame(); showOverlay('Ready to play?', game === 'bird' ? 'Press Space or tap the game to flap.' : 'Use ← → or A / D to dodge the traffic.', 'Start playing');
    draw();
  }
  function showOverlay(title,text,button='Play again') { overlayTitle.textContent=title; overlayText.textContent=text; startButton.innerHTML=`${button} <span>→</span>`; overlay.classList.remove('hidden'); }
  function hideOverlay(){overlay.classList.add('hidden');}
  function resetGame() {
    cancelAnimationFrame(raf); running=false; paused=false; gameOver=false; score=0; liveScore.textContent='0';
    if(currentGame==='bird') { birdState={x:120,y:250,w:27,h:21.15,velocity:0}; pipes=[]; spawnElapsed=0; }
    else { carState={x:250,y:650,w:57.75,h:94.6}; enemies=[]; carSpawnElapsed=0; laneLines=Array.from({length:10},(_,i)=>({y:i*90})); }
    pauseButton.textContent='Pause'; lastTime=0;
  }
  function startGame() { if(gameOver) resetGame(); hideOverlay(); paused=false; running=true; lastTime=performance.now(); raf=requestAnimationFrame(loop); }
  function updateScore(n) { score=n; liveScore.textContent=String(score); if(score>highScore){highScore=score;save(currentGame==='bird'?'miniArcadeBirdBest':'miniArcadeCarBest',highScore);highScoreLabel.textContent=`PERSONAL BEST: ${highScore}`;} }
  function endGame() { running=false; gameOver=true; cancelAnimationFrame(raf); showOverlay('Game over',`Your score: ${score} · Best: ${highScore}`,'Play again'); draw(); }
  function flap(){ if(currentGame!=='bird')return; if(gameOver){startGame();return;} if(!running&&!paused){startGame();birdState.velocity=-320;return;} if(running&&!paused)birdState.velocity=-320; }
  function moveCar(dir){ if(currentGame!=='car'||!running||paused||gameOver)return; if(dir<0&&carState.x>120)carState.x-=50; if(dir>0&&carState.x<420)carState.x+=50; }
  function loop(now){ if(!running)return; const dt=Math.min((now-lastTime)/1000,.04);lastTime=now; if(!paused){if(currentGame==='bird')updateBird(dt);else updateCar(dt);} draw(); if(running)raf=requestAnimationFrame(loop); }
  function updateBird(dt){
    birdState.velocity+=900*dt;birdState.y+=birdState.velocity*dt;
    spawnElapsed+=dt;if(spawnElapsed>1.8){const center=150+Math.random()*250;pipes.push({x:800,center,scored:false});spawnElapsed=0;}
    const pw=52*.35,ph=321*1.2,gap=170;
    for(const p of pipes){p.x-=220*dt;if(!p.scored&&p.x+pw<birdState.x){p.scored=true;updateScore(score+1);}const topY=p.center-gap/2-ph,bottomY=p.center+gap/2;if(rects(birdState.x,birdState.y,birdState.w,birdState.h,p.x,topY,pw,ph)||rects(birdState.x,birdState.y,birdState.w,birdState.h,p.x,bottomY,pw,ph)){endGame();return;}}
    pipes=pipes.filter(p=>p.x>-120);if(birdState.y<0||birdState.y+birdState.h>600)endGame();
  }
  function updateCar(dt){
    laneLines.forEach(l=>{l.y+=200*dt;if(l.y>800)l.y=-60;});carSpawnElapsed+=dt;
    if(carSpawnElapsed>1){const lanes=[170,250,330,410],cars=['RedCar1.png','RedCar2.png','YellowCar1.png','YellowCar2.png','YellowCar3.png'];const lane=lanes[Math.floor(Math.random()*lanes.length)],name=cars[Math.floor(Math.random()*cars.length)];enemies.push({x:lane,y:-300,w:105*.55,h:images[name].naturalHeight*.55,name,speed:200});carSpawnElapsed=0;}
    for(const e of enemies){e.y+=e.speed*dt;if(rects(carState.x,carState.y,carState.w,carState.h,e.x,e.y,e.w,e.h)){endGame();return;}}
    const before=enemies.length;enemies=enemies.filter(e=>{if(e.y>850){updateScore(score+1);return false;}return true;});
  }
  function rects(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}
  function drawBird(){
    ctx.fillStyle='rgb(235,235,235)';ctx.fillRect(0,0,800,600);
    const pw=52*.35,ph=321*1.2,gap=170;
    pipes.forEach(p=>{const x=p.x,topY=p.center-gap/2-ph,bottomY=p.center+gap/2;const pipe=images['Pipes.png'];if(pipe.complete&&pipe.naturalWidth){ctx.save();ctx.translate(x,topY+ph);ctx.scale(1,-1);ctx.drawImage(pipe,0,0,pw,ph);ctx.restore();ctx.drawImage(pipe,x,bottomY,pw,ph);}});
    const bird=images['Bird.png'];if(bird.complete&&bird.naturalWidth)ctx.drawImage(bird,birdState.x,birdState.y,birdState.w,birdState.h);
    ctx.fillStyle='#111';ctx.font='bold 28px ArcadeSans, sans-serif';ctx.textBaseline='top';ctx.fillText(`SCORE: ${score}`,20,15);ctx.fillText(`HIGH SCORE: ${highScore}`,520,15);
    if(paused){ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(0,0,800,600);ctx.fillStyle='#245';ctx.font='bold 32px ArcadeSans';ctx.fillText('PAUSED',330,260);}
  }
  function drawCar(){
    ctx.fillStyle='#000';ctx.fillRect(0,0,600,800);ctx.fillStyle='rgb(0,180,0)';ctx.fillRect(0,0,120,800);ctx.fillRect(480,0,120,800);
    ctx.fillStyle='#fff';laneLines.forEach(l=>ctx.fillRect(295,l.y,10,60));
    enemies.forEach(e=>{const im=images[e.name];if(im.complete&&im.naturalWidth)ctx.drawImage(im,e.x,e.y,e.w,e.h);});const player=images['WhiteCar.png'];if(player.complete&&player.naturalWidth)ctx.drawImage(player,carState.x,carState.y,carState.w,carState.h);
    ctx.fillStyle='#fff';ctx.font='bold 24px ArcadeSans, sans-serif';ctx.textBaseline='top';ctx.fillText(`SCORE: ${score}`,20,10);
    if(gameOver){ctx.fillStyle='#fff';ctx.font='bold 32px ArcadeSans';ctx.fillText('GAME OVER',120,350);ctx.font='bold 20px ArcadeSans';ctx.fillText('Press R to Restart',120,395);}
  }
  function draw(){if(!currentGame)return;if(currentGame==='bird')drawBird();else drawCar();}
  function pauseToggle(){if(currentGame!=='bird'||gameOver||!running)return;paused=!paused;pauseButton.textContent=paused?'Resume':'Pause';if(paused){cancelAnimationFrame(raf);drawBird();}else{lastTime=performance.now();raf=requestAnimationFrame(loop);}}
  document.querySelectorAll('[data-launch]').forEach(b=>b.addEventListener('click',()=>launch(b.dataset.launch)));
  backButton.addEventListener('click',()=>{cancelAnimationFrame(raf);running=false;currentGame=null;gameScreen.classList.add('hidden');home.classList.remove('hidden');});
  document.getElementById('brandHome').addEventListener('click',e=>{if(!gameScreen.classList.contains('hidden')){e.preventDefault();backButton.click();}});
  startButton.addEventListener('click',()=>startGame());pauseButton.addEventListener('click',pauseToggle);
  canvas.addEventListener('pointerdown',e=>{if(currentGame==='bird'){e.preventDefault();flap();}});
  document.addEventListener('keydown',e=>{if(gameScreen.classList.contains('hidden'))return;if(currentGame==='bird'){if(e.code==='Space'){e.preventDefault();flap();}if(e.code==='KeyP')pauseToggle();if(e.code==='KeyR'&&gameOver)startGame();}else{if(e.code==='ArrowLeft'||e.code==='KeyA'){e.preventDefault();moveCar(-1);}if(e.code==='ArrowRight'||e.code==='KeyD'){e.preventDefault();moveCar(1);}if(e.code==='KeyR'&&gameOver)startGame();}});
  document.getElementById('leftTouch').addEventListener('pointerdown',()=>moveCar(-1));document.getElementById('rightTouch').addEventListener('pointerdown',()=>moveCar(1));
  let touchX=null;canvas.addEventListener('touchstart',e=>{if(currentGame==='car')touchX=e.touches[0].clientX;},{passive:true});canvas.addEventListener('touchend',e=>{if(currentGame==='car'&&touchX!==null){const dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>20)moveCar(dx<0?-1:1);touchX=null;}},{passive:true});
  // Wait for the local image assets before enabling a game launch.
  Promise.all(assetNames.map(n=>new Promise(resolve=>{if(images[n].complete&&images[n].naturalWidth)return resolve();images[n].addEventListener('load',resolve,{once:true});images[n].addEventListener('error',resolve,{once:true});}))).then(()=>{});
})();
