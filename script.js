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
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');

const RUNNER_COLORS = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#6BCB77', '#C77DFF', '#FF9F45'];
const ANIMAL_EMOJIS = ['🐕', '🐇', '🐈', '🐓', '🦀', '🐢'];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
  setupRace(options);
});

function setupRace(options) {
  track.innerHTML = '';
  countdownOverlay.classList.remove('show');
  const runners = [];
  const lanes = [];
  const flags = [];

  const shuffledAnimals = shuffle(ANIMAL_EMOJIS);

  options.forEach((name, i) => {
    const color = RUNNER_COLORS[i % RUNNER_COLORS.length];
    const emoji = shuffledAnimals[i % shuffledAnimals.length];

    const lane = document.createElement('div');
    lane.className = 'lane';

    const laneTrack = document.createElement('div');
    laneTrack.className = 'lane-track';

    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.style.background = color;
    runner.style.color = color;
    runner.innerHTML = `<span>${emoji}</span>`;

    const flag = document.createElement('div');
    flag.className = 'finish-flag';
    flag.textContent = '🏁';

    laneTrack.appendChild(runner);
    laneTrack.appendChild(flag);

    const laneName = document.createElement('div');
    laneName.className = 'lane-name';
    laneName.textContent = name;

    lane.appendChild(laneTrack);
    lane.appendChild(laneName);
    track.appendChild(lane);

    runners.push({ el: runner, progress: 0, name: name });
    lanes.push(lane);
    flags.push(flag);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      lanes.forEach((lane, i) => {
        setTimeout(() => lane.classList.add('lane-visible'), i * 70);
      });
      flags.forEach((flag, i) => {
        setTimeout(() => flag.classList.add('flag-visible'), i * 70);
      });
    });
  });

  const laneSettleTime = lanes.length * 70 + 350;

  const entryOrder = shuffle(runners.map((_, i) => i));
  const entryStagger = 300;

  setTimeout(() => {
    entryOrder.forEach((runnerIndex, orderPosition) => {
      setTimeout(() => {
        const r = runners[runnerIndex];
        r.el.classList.add('hopping-in', 'at-start');
      }, orderPosition * entryStagger);
    });
  }, laneSettleTime);

  const entryTransitionTime = 900;
  const allInPlaceTime = laneSettleTime + entryOrder.length * entryStagger + entryTransitionTime;

  setTimeout(() => {
    runCountdown(() => {
      runners.forEach(r => r.el.classList.add('racing'));
      runTheRace(runners);
    });
  }, allInPlaceTime);
}

function runCountdown(onDone) {
  countdownOverlay.classList.add('show');
  const steps = ['3', '2', '1', 'GO!'];
  let i = 0;

  function nextStep() {
    countdownNumber.textContent = steps[i];
    countdownNumber.classList.remove('pop');
    void countdownNumber.offsetWidth;
    countdownNumber.classList.add('pop');
    i++;
    if (i < steps.length) {
      setTimeout(nextStep, 700);
    } else {
      setTimeout(() => {
        countdownOverlay.classList.remove('show');
        onDone();
      }, 500);
    }
  }

  nextStep();
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
