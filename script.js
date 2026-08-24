const screens = {
  welcome: document.getElementById('welcome-screen'),
  input: document.getElementById('input-screen'),
  race: document.getElementById('race-screen'),
  winner: document.getElementById('winner-screen'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

const startBtn = document.getElementById('start-btn');
const optionsContainer = document.getElementById('options-container');
const addOptionBtn = document.getElementById('add-option-btn');
const readyBtn = document.getElementById('ready-btn');
const track = document.getElementById('track');
const winnerName = document.getElementById('winner-name');
const restartBtn = document.getElementById('restart-btn');

// Glowing colors + matching emoji per lane
const RUNNER_STYLES = [
  { color: '#FF6B6B', emoji: '🏃' },
  { color: '#4ECDC4', emoji: '🏃' },
  { color: '#FFD93D', emoji: '🏃' },
  { color: '#6BCB77', emoji: '🏃' },
  { color: '#C77DFF', emoji: '🏃' },
  { color: '#FF9F45', emoji: '🏃' },
];

startBtn.addEventListener('click', () => showScreen('input'));

addOptionBtn.addEventListener('click', () => {
  const currentInputs = document.querySelectorAll('.option-input').length;
  if (currentInputs >= 6) {
    alert('Max 6 options!');
    return;
  }
  const newInput = document.createElement('input');
  newInput.type = 'text';
  newInput.className = 'option-input';
  newInput.placeholder = `Option ${currentInputs + 1}`;
  optionsContainer.appendChild(newInput);
});

readyBtn.addEventListener('click', () => {
  const inputs = document.querySelectorAll('.option-input');
  const options = [...inputs].map(i => i.value.trim()).filter(v => v !== '');
  if (options.length < 2) {
    alert('Type at least 2 options!');
    return;
  }
  showScreen('race');
  startRace(options);
});

function startRace(options) {
  track.innerHTML = '';
  const runners = [];
  const lanes = [];
  const flags = [];

  options.forEach((name, i) => {
    const style = RUNNER_STYLES[i % RUNNER_STYLES.length];

    const lane = document.createElement('div');
    lane.className = 'lane';

    const laneName = document.createElement('div');
    laneName.className = 'lane-name';
    laneName.textContent = name;

    const laneTrack = document.createElement('div');
    laneTrack.className = 'lane-track';

    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.style.background = style.color;
    runner.style.color = style.color; // powers the glow (box-shadow: currentColor)
    runner.style.left = '0%';
    runner.innerHTML = `<span>${style.emoji}</span>`;

    const flag = document.createElement('div');
    flag.className = 'finish-flag';
    flag.textContent = '🏁';

    laneTrack.appendChild(runner);
    laneTrack.appendChild(flag);
    lane.appendChild(laneName);
    lane.appendChild(laneTrack);
    track.appendChild(lane);

    runners.push({ el: runner, progress: 0, name: name });
    lanes.push(lane);
    flags.push(flag);
  });

  // ---- ENTRANCE ANIMATION ----
  // Lanes slide in first (staggered), then runners pop/flow into place
  // shortly after, then the race itself begins once everyone has arrived.
  const laneStagger = 90;   // ms between each lane appearing
  const runnerDelay = 250;  // runners start flowing in after lanes begin
  const runnerStagger = 110;
  const runnerAnimTime = 450;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lanes.forEach((lane, i) => {
        setTimeout(() => lane.classList.add('lane-visible'), i * laneStagger);
      });

      runners.forEach((r, i) => {
        setTimeout(() => {
          r.el.classList.add('runner-visible');
        }, runnerDelay + i * runnerStagger);
      });

      flags.forEach((flag, i) => {
        setTimeout(() => {
          flag.classList.add('flag-visible');
        }, runnerDelay + i * runnerStagger);
      });
    });
  });

  // Total time before every runner has finished flowing in
  const entranceTotal = runnerDelay + (runners.length - 1) * runnerStagger + runnerAnimTime;

  setTimeout(() => {
    runners.forEach(r => r.el.classList.add('racing'));
    runTheRace(runners);
  }, entranceTotal + 150);
}

function runTheRace(runners) {
  const tickTime = 180;
  const finishLine = 90;
  const baseMin = 0.4;
  const baseMax = 1.8;
  const burstChance = 0.18;
  const burstMin = 3;
  const burstMax = 6;

  let raceOver = false;

  const interval = setInterval(() => {
    if (raceOver) return;

    let winner = null;

    runners.forEach(r => {
      let step = baseMin + Math.random() * (baseMax - baseMin);
      const isBurst = Math.random() < burstChance;
      if (isBurst) {
        step += burstMin + Math.random() * (burstMax - burstMin);
        r.el.classList.add('burst');
        setTimeout(() => r.el.classList.remove('burst'), 200);
      }
      r.progress += step;
      if (r.progress >= finishLine) r.progress = finishLine;
      r.el.style.left = r.progress + '%';

      if (r.progress >= finishLine && !winner) winner = r;
    });

    if (winner) {
      raceOver = true;
      clearInterval(interval);
      setTimeout(() => {
        winnerName.textContent = winner.name;
        showScreen('winner');
        launchConfetti();
      }, 500);
    }
  }, tickTime);
}

restartBtn.addEventListener('click', () => {
  showScreen('welcome');
  optionsContainer.innerHTML = `
    <input type="text" class="option-input" placeholder="Option 1">
    <input type="text" class="option-input" placeholder="Option 2">
  `;
});

// ----- Lightweight confetti (no external library needed) -----
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#C77DFF', '#FF9F45'];
  const pieces = [];
  const count = 90;

  for (let i = 0; i < count; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -8 - 3,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 12,
      gravity: 0.25,
    });
  }

  let frame = 0;
  const maxFrames = 110;

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  animate();
}
