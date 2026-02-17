/* Memória — Lógica do jogo */

(function () {
  // --- DOM refs ---
  const themeSelect = document.getElementById('theme-select');
  const modeEasyBtn = document.getElementById('mode-easy');
  const modeHardBtn = document.getElementById('mode-hard');
  const startBtn    = document.getElementById('start-btn');
  const setupArea   = document.getElementById('setup-area');
  const gameArea    = document.getElementById('game-area');
  const resultArea  = document.getElementById('result-area');
  const gridEl      = document.getElementById('memory-grid');
  const movesEl     = document.getElementById('moves');
  const timerEl     = document.getElementById('timer');
  const bestInfoEl  = document.getElementById('best-info');
  const finalMovesEl  = document.getElementById('final-moves');
  const finalTimeEl   = document.getElementById('final-time');
  const finalBestEl   = document.getElementById('final-best');
  const restartBtn    = document.getElementById('restart-btn');
  const changeBtn     = document.getElementById('change-theme-btn');

  // --- State ---
  let mode = 'easy'; // easy = 6 pairs (12 cards), hard = 8 pairs (16 cards)
  let cards = [];
  let flipped = [];
  let matched = 0;
  let moves = 0;
  let timerID = null;
  let seconds = 0;
  let locked = false;
  let currentTheme = '';

  // --- Populate themes ---
  Object.keys(MEMORY_DATA).forEach(theme => {
    const opt = document.createElement('option');
    opt.value = theme;
    opt.textContent = theme;
    themeSelect.appendChild(opt);
  });

  // --- Mode toggle ---
  modeEasyBtn.addEventListener('click', () => { mode = 'easy'; modeEasyBtn.classList.add('active'); modeHardBtn.classList.remove('active'); updateBestDisplay(); });
  modeHardBtn.addEventListener('click', () => { mode = 'hard'; modeHardBtn.classList.add('active'); modeEasyBtn.classList.remove('active'); updateBestDisplay(); });
  themeSelect.addEventListener('change', updateBestDisplay);

  function updateBestDisplay() {
    const best = Store.getBest('memory', themeSelect.value, mode);
    bestInfoEl.textContent = best !== null ? `${best}s` : '—';
  }
  updateBestDisplay();

  // --- Start ---
  startBtn.addEventListener('click', () => {
    currentTheme = themeSelect.value;
    const pairCount = mode === 'easy' ? 6 : 8;
    const emojis = shuffle([...MEMORY_DATA[currentTheme]]).slice(0, pairCount);
    cards = shuffle([...emojis, ...emojis]);
    matched = 0;
    moves = 0;
    seconds = 0;
    flipped = [];
    locked = false;
    movesEl.textContent = '0';
    timerEl.textContent = '0s';
    clearInterval(timerID);
    timerID = setInterval(() => { seconds++; timerEl.textContent = seconds + 's'; }, 1000);

    setupArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    gameArea.classList.remove('hidden');
    renderGrid();
  });

  // --- Render grid ---
  function renderGrid() {
    gridEl.className = 'memory-grid ' + mode;
    gridEl.innerHTML = '';
    cards.forEach((emoji, i) => {
      const div = document.createElement('div');
      div.className = 'memory-card';
      div.dataset.index = i;
      div.textContent = emoji;
      div.setAttribute('role', 'button');
      div.setAttribute('aria-label', 'Carta ' + (i + 1));
      div.tabIndex = 0;
      div.addEventListener('click', () => flipCard(div, i));
      div.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flipCard(div, i);
        }
      });
      gridEl.appendChild(div);
    });
  }

  // --- Flip ---
  function flipCard(el, index) {
    if (locked) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;
    if (flipped.length >= 2) return;

    el.classList.add('flipped');
    flipped.push({ el, index });

    if (flipped.length === 2) {
      moves++;
      movesEl.textContent = moves;
      const [a, b] = flipped;
      if (cards[a.index] === cards[b.index]) {
        // Match
        a.el.classList.add('matched');
        b.el.classList.add('matched');
        matched += 2;
        flipped = [];
        if (matched === cards.length) {
          clearInterval(timerID);
          setTimeout(showResult, 400);
        }
      } else {
        // No match — flip back
        locked = true;
        setTimeout(() => {
          a.el.classList.remove('flipped');
          b.el.classList.remove('flipped');
          flipped = [];
          locked = false;
        }, 700);
      }
    }
  }

  // --- Result ---
  function showResult() {
    gameArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    finalMovesEl.textContent = moves;
    finalTimeEl.textContent = seconds + 's';

    const prev = Store.getBest('memory', currentTheme, mode);
    if (prev === null || seconds < prev) {
      Store.setBest('memory', currentTheme, seconds, mode);
    }
    const best = Store.getBest('memory', currentTheme, mode);
    finalBestEl.textContent = `Melhor tempo (${mode === 'easy' ? 'fácil' : 'difícil'}): ${best}s`;
  }

  // --- Restart / change ---
  restartBtn.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    startBtn.click();
  });
  changeBtn.addEventListener('click', () => {
    clearInterval(timerID);
    gameArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    setupArea.classList.remove('hidden');
    updateBestDisplay();
  });
})();
