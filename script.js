const startBtn = document.getElementById('start-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const inputScreen = document.getElementById('input-screen');
const optionsContainer = document.getElementById('options-container');
const addOptionBtn = document.getElementById('add-option-btn');
const readyBtn = document.getElementById('ready-btn');
const raceScreen = document.getElementById('race-screen');
const track = document.getElementById('track');
const winnerScreen = document.getElementById('winner-screen');
const winnerName = document.getElementById('winner-name');
const restartBtn = document.getElementById('restart-btn');

// Fun colors + emojis so each runner is visually distinct
const RUNNER_STYLES = [
  { bg: '#FF6B6B', emoji: '🏃' },
  { bg: '#4ECDC4', emoji: '🏃' },
  { bg: '#FFD93D', emoji: '🏃' },
  { bg: '#6BCB77', emoji: '🏃' },
  { bg: '#A66DD4', emoji: '🏃' },
  { bg: '#FF9F45', emoji: '🏃' },
];

startBtn.addEventListener('click', () => {
  welcomeScreen.classList.add('hidden');
  inputScreen.classList.remove('hidden');
});

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
  inputScreen.classList.add('hidden');
  raceScreen.classList.remove('hidden');
  startRace(options);
});

function startRace(options) {
  track.innerHTML = '';
  const runners = [];

  options.forEach((name, i) => {
    const style = RUNNER_STYLES[i % RUNNER_STYLES.length];

    const lane = document.createElement('div');
    lane.className = 'lane';

    const laneName = document.createElement('div');
    laneName.className = 'lane-name';
    laneName.textContent = name;

    const laneTrack = document.createElement('div');
    laneTrack.className = 'lane-track';

    // Runner element — style set BEFORE it's inserted, so there is
    // nothing to transition away from on the very first paint.
    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.style.background = style.bg;
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
  });

  // Wait two animation frames before turning on smooth movement.
  // This guarantees the browser has painted the starting position
  // (left: 0%) before any transition can play, so there's no
  // "jump from the middle" glitch.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      runners.forEach(r => {
        r.el.style.transition = 'left 0.18s ease';
      });
    });
  });

  const tickTime = 180;      // fast updates = feels more alive
  const finishLine = 90;     // percent — where the flag sits
  // Tuned for ~10 second average races:
  // 10000ms / 180ms ≈ 55 ticks; need ~1.6 avg progress per tick.
  const baseMin = 0.4;
  const baseMax = 1.8;
  const burstChance = 0.18;   // 18% chance of a speed burst each tick
  const burstMin = 3;
  const burstMax = 6;

  let raceOver = false;

  const interval = setInterval(() => {
    if (raceOver) return;

    let winner = null;

    runners.forEach(r => {
      let step = baseMin + Math.random() * (baseMax - baseMin);
      if (Math.random() < burstChance) {
        step += burstMin + Math.random() * (burstMax - burstMin);
      }
      r.progress += step;
      if (r.progress >= finishLine) {
        r.progress = finishLine;
      }
      r.el.style.left = r.progress + '%';

      if (r.progress >= finishLine && !winner) {
        winner = r;
      }
    });

    if (winner) {
      raceOver = true;
      clearInterval(interval);

      setTimeout(() => {
        raceScreen.classList.add('hidden');
        winnerScreen.classList.remove('hidden');
        winnerName.textContent = winner.name;
      }, 400);
    }
  }, tickTime);
}

restartBtn.addEventListener('click', () => {
  winnerScreen.classList.add('hidden');
  welcomeScreen.classList.remove('hidden');
  optionsContainer.innerHTML = `
    <input type="text" class="option-input" placeholder="Option 1">
    <input type="text" class="option-input" placeholder="Option 2">
  `;
});
