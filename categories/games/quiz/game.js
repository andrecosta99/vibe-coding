/* Quiz — Lógica do jogo */

(function () {
  // --- DOM refs ---
  const themeSelect  = document.getElementById('theme-select');
  const startBtn     = document.getElementById('start-btn');
  const setupArea    = document.getElementById('setup-area');
  const gameArea     = document.getElementById('game-area');
  const resultArea   = document.getElementById('result-area');
  const progressEl   = document.getElementById('progress');
  const questionEl   = document.getElementById('question-text');
  const optionsEl    = document.getElementById('options');
  const bestScoreEl  = document.getElementById('best-score');
  const finalScoreEl = document.getElementById('final-score');
  const finalBestEl  = document.getElementById('final-best');
  const restartBtn   = document.getElementById('restart-btn');
  const changeBtn    = document.getElementById('change-theme-btn');

  // --- State ---
  let currentTheme = '';
  let questions = [];
  let idx = 0;
  let score = 0;
  let answered = false;

  // --- Populate theme dropdown ---
  Object.keys(QUIZ_DATA).forEach(theme => {
    const opt = document.createElement('option');
    opt.value = theme;
    opt.textContent = theme;
    themeSelect.appendChild(opt);
  });

  // --- Show best score for selected theme ---
  function updateBestDisplay() {
    const theme = themeSelect.value;
    const best = Store.getBest('quiz', theme);
    bestScoreEl.textContent = best !== null ? `${best}/10` : '—';
  }
  themeSelect.addEventListener('change', updateBestDisplay);
  updateBestDisplay();

  // --- Start game ---
  startBtn.addEventListener('click', () => {
    currentTheme = themeSelect.value;
    const bank = QUIZ_DATA[currentTheme];
    // Pick 10 random questions
    questions = shuffle([...bank]).slice(0, 10);
    idx = 0;
    score = 0;
    setupArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    gameArea.classList.remove('hidden');
    showQuestion();
  });

  // --- Render question ---
  function showQuestion() {
    answered = false;
    const q = questions[idx];
    progressEl.textContent = `${idx + 1} / 10`;
    questionEl.textContent = q.q;
    optionsEl.innerHTML = '';
    q.options.forEach((text, i) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = text;
      btn.setAttribute('aria-label', `Opção ${i + 1}: ${text}`);
      btn.addEventListener('click', () => handleAnswer(btn, i));
      optionsEl.appendChild(btn);
    });
  }

  // --- Handle answer ---
  function handleAnswer(btn, selected) {
    if (answered) return;
    answered = true;
    const correct = questions[idx].answer;

    // Disable all buttons
    const btns = optionsEl.querySelectorAll('.quiz-option');
    btns.forEach(b => b.disabled = true);

    if (selected === correct) {
      btn.classList.add('correct');
      score++;
    } else {
      btn.classList.add('wrong');
      btns[correct].classList.add('correct');
    }

    // Next question after short delay
    setTimeout(() => {
      idx++;
      if (idx < 10) {
        showQuestion();
      } else {
        showResult();
      }
    }, 900);
  }

  // --- Result screen ---
  function showResult() {
    gameArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    finalScoreEl.textContent = `${score}/10`;

    // Update best score
    const prev = Store.getBest('quiz', currentTheme);
    if (prev === null || score > prev) {
      Store.setBest('quiz', currentTheme, score);
    }
    const best = Store.getBest('quiz', currentTheme);
    finalBestEl.textContent = `Melhor: ${best}/10`;
  }

  // --- Restart / Change theme ---
  restartBtn.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    // Re-start same theme
    const bank = QUIZ_DATA[currentTheme];
    questions = shuffle([...bank]).slice(0, 10);
    idx = 0;
    score = 0;
    gameArea.classList.remove('hidden');
    showQuestion();
  });

  changeBtn.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    gameArea.classList.add('hidden');
    setupArea.classList.remove('hidden');
    updateBestDisplay();
  });
})();
