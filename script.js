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
    const runner = document.createElement('div');
    runner.className = 'runner';
    runner.textContent = '🏃 ' + name;
    lane.appendChild(runner);
    track.appendChild(lane);
    runners.push({ el: runner, progress: 0, name: name });
  });

  const raceDuration = 10000; // 10 seconds
  const tickTime = 300;
  const finishLine = 85; // percent

  const interval = setInterval(() => {
    runners.forEach(r => {
      r.progress += Math.random() * 8;
      if (r.progress > finishLine) r.progress = finishLine;
      r.el.style.left = r.progress + '%';
    });
  }, tickTime);

  setTimeout(() => {
    clearInterval(interval);
    const trueWinnerIndex = Math.floor(Math.random() * runners.length);
    const finalWinner = runners[trueWinnerIndex];
    finalWinner.el.style.left = finishLine + '%';

    setTimeout(() => {
      raceScreen.classList.add('hidden');
      winnerScreen.classList.remove('hidden');
      winnerName.textContent = finalWinner.name;
    }, 500);
  }, raceDuration);
}

restartBtn.addEventListener('click', () => {
  winnerScreen.classList.add('hidden');
  welcomeScreen.classList.remove('hidden');
  optionsContainer.innerHTML = `
    <input type="text" class="option-input" placeholder="Option 1">
    <input type="text" class="option-input" placeholder="Option 2">
  `;
});
