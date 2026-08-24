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

  options.forEach((name) => {
    const lane = document.createElement('div');
    lane.className = 'lane';

    const laneName = document.createElement('div');
    laneName.className = 'lane-name';
    laneName.textContent = name;

    const laneTrack = document.createElement('div');
    laneTrack.className = 'lane-track';

    const runner = document.createElement('div');
    runner.className = 'runner bounce';
    runner.textContent = '🏃';
    // Force starting position at the very left, with no transition yet
    runner.style.transition = 'none';
    runner.style.left = '0%';

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

  // Force the browser to register the starting position before enabling
  // smooth movement, so runners don't appear to "slide in" from elsewhere.
  track.offsetHeight; // forces reflow
  runners.forEach(r => {
    r.el.style.transition = 'left 0.25s ease';
  });

  const tickTime = 250;      // how often position updates
  const finishLine = 90;     // percent — where the flag sits
  // Average increment tuned so a winner tends to arrive around 15 seconds.
  // 15000ms / 250ms = 60 ticks; 90 / 60 = 1.5 average increment needed.
  const minStep = 0.5;
  const maxStep = 2.5;

  let raceOver = false;

  const interval = setInterval(() => {
    if (raceOver) return;

    let winner = null;

    runners.forEach(r => {
      const step = minStep + Math.random() * (maxStep - minStep);
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
        runners.forEach(r => r.el.classList.remove('bounce'));
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
