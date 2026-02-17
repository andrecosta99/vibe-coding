/* Tempo de Reação — Lógica do jogo */

(function () {
  const themeSelect = document.getElementById('theme-select');
  const startBtn    = document.getElementById('start-btn');
  const setupArea   = document.getElementById('setup-area');
  const gameArea    = document.getElementById('game-area');
  const resultArea  = document.getElementById('result-area');
  const zoneEl      = document.getElementById('reaction-zone');
  const roundEl     = document.getElementById('round-num');
  const msgEl       = document.getElementById('round-msg');
  const bestInfoEl  = document.getElementById('best-info');
  const finalAvgEl  = document.getElementById('final-avg');
  const finalListEl = document.getElementById('final-list');
  const finalBestEl = document.getElementById('final-best');
  const restartBtn  = document.getElementById('restart-btn');
  const changeBtn   = document.getElementById('change-theme-btn');

  let currentTheme = '';
  let themeConfig = null;
  let round = 0;
  let times = [];
  let timeoutID = null;
  let startTime = 0;
  let waiting = false; // waiting for target to appear

  // --- Populate themes ---
  Object.keys(REACTION_DATA).forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    themeSelect.appendChild(opt);
  });

  function updateBestDisplay() {
    const best = Store.getBest('reaction', themeSelect.value);
    bestInfoEl.textContent = best !== null ? `${best} ms` : '—';
  }
  themeSelect.addEventListener('change', updateBestDisplay);
  updateBestDisplay();

  // --- Start ---
  startBtn.addEventListener('click', () => {
    currentTheme = themeSelect.value;
    themeConfig = REACTION_DATA[currentTheme];
    round = 0;
    times = [];
    setupArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    gameArea.classList.remove('hidden');
    nextRound();
  });

  // --- Round flow ---
  function nextRound() {
    if (round >= 5) { showResult(); return; }
    round++;
    roundEl.textContent = `${round} / 5`;
    zoneEl.innerHTML = '';
    msgEl.textContent = 'Espera pelo alvo…';
    waiting = true;

    const delay = 1000 + Math.random() * 2000;
    timeoutID = setTimeout(() => {
      waiting = false;
      showTarget();
    }, delay);
  }

  // Prevent early click
  zoneEl.addEventListener('click', (e) => {
    if (waiting && !e.target.classList.contains('color-btn') && !e.target.classList.contains('target')) {
      // Early click — penalise
      clearTimeout(timeoutID);
      msgEl.textContent = 'Demasiado cedo! Espera pelo alvo.';
      setTimeout(nextRoundSameIndex, 800);
    }
  });

  function nextRoundSameIndex() {
    round--; // repeat this round
    nextRound();
  }

  // --- Show target ---
  function showTarget() {
    const data = themeConfig.generate();
    msgEl.textContent = themeConfig.type === 'color' ? 'Clica na cor correspondente!' : 'Clica no alvo!';
    zoneEl.innerHTML = '';

    if (themeConfig.type === 'click') {
      const span = document.createElement('span');
      span.className = 'target';
      span.style.cssText = data.style;
      span.textContent = data.display;
      span.addEventListener('click', recordTime);
      zoneEl.appendChild(span);
    } else {
      // Color mode: show word + color buttons
      const word = document.createElement('div');
      word.className = 'target';
      word.style.cssText = data.style;
      word.textContent = data.display;
      zoneEl.appendChild(word);

      const btnRow = document.createElement('div');
      btnRow.className = 'color-buttons';
      // Shuffle colors for button display
      const allColors = shuffle([...themeConfig.colors]);
      allColors.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'color-btn';
        btn.style.background = c.hex;
        btn.textContent = c.name;
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (c.name === data.targetColor.name) {
            recordTime();
          } else {
            msgEl.textContent = 'Cor errada! Tenta outra vez.';
          }
        });
        btnRow.appendChild(btn);
      });
      zoneEl.appendChild(btnRow);
    }

    startTime = performance.now();
  }

  function recordTime() {
    const elapsed = Math.round(performance.now() - startTime);
    times.push(elapsed);
    msgEl.textContent = `${elapsed} ms`;
    zoneEl.innerHTML = '';
    setTimeout(nextRound, 800);
  }

  // --- Result ---
  function showResult() {
    gameArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    finalAvgEl.textContent = `${avg} ms`;
    finalListEl.innerHTML = times.map((t, i) => `<li>Ronda ${i + 1}: ${t} ms</li>`).join('');

    const prev = Store.getBest('reaction', currentTheme);
    if (prev === null || avg < prev) {
      Store.setBest('reaction', currentTheme, avg);
    }
    const best = Store.getBest('reaction', currentTheme);
    finalBestEl.textContent = `Melhor média: ${best} ms`;
  }

  restartBtn.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    round = 0; times = [];
    gameArea.classList.remove('hidden');
    nextRound();
  });
  changeBtn.addEventListener('click', () => {
    clearTimeout(timeoutID);
    gameArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    setupArea.classList.remove('hidden');
    updateBestDisplay();
  });
})();
