/* Pomodoro + Deep Work — Lógica principal */

(function () {
  const HISTORY_KEY = 'vibe_pomodoro_history';

  // --- Modes ---
  const MODES = {
    '25-5':  { work: 25, brk: 5 },
    '50-10': { work: 50, brk: 10 },
    'custom': { work: 25, brk: 5 }
  };

  // --- State ---
  let currentMode = '25-5';
  let phase = 'work'; // 'work' | 'break'
  let remaining = MODES[currentMode].work * 60; // seconds
  let running = false;
  let intervalID = null;
  let sessionStart = null;

  // --- DOM refs ---
  const timerEl       = document.getElementById('timer');
  const phaseEl       = document.getElementById('phase');
  const startBtn      = document.getElementById('start-btn');
  const pauseBtn      = document.getElementById('pause-btn');
  const resetBtn      = document.getElementById('reset-btn');
  const focusBtn      = document.getElementById('focus-btn');
  const customInputs  = document.getElementById('custom-inputs');
  const customWork    = document.getElementById('custom-work');
  const customBreak   = document.getElementById('custom-break');
  const sessionsTodayEl = document.getElementById('sessions-today');
  const focusTotalEl    = document.getElementById('focus-total');
  const historyBody     = document.getElementById('history-body');
  const noHistoryEl     = document.getElementById('no-history');
  const modeBtns        = document.querySelectorAll('.mode-btn');

  // --- Mode selection ---
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (running) return; // don't switch while running
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      customInputs.classList.toggle('hidden', currentMode !== 'custom');
      resetTimer();
    });
  });

  customWork.addEventListener('change', () => { if (!running) resetTimer(); });
  customBreak.addEventListener('change', () => { if (!running) resetTimer(); });

  // --- Timer controls ---
  startBtn.addEventListener('click', () => {
    if (running) return;
    running = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    if (phase === 'work' && !sessionStart) sessionStart = Date.now();
    intervalID = setInterval(tick, 1000);
  });

  pauseBtn.addEventListener('click', () => {
    if (!running) return;
    running = false;
    clearInterval(intervalID);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  resetBtn.addEventListener('click', resetTimer);

  // --- Focus mode ---
  let focusMode = false;
  focusBtn.addEventListener('click', () => {
    focusMode = !focusMode;
    document.body.classList.toggle('focus-mode', focusMode);
    focusBtn.textContent = focusMode ? 'Sair Focus' : 'Focus';
  });

  // --- Timer logic ---
  function tick() {
    remaining--;
    updateDisplay();

    if (remaining <= 0) {
      clearInterval(intervalID);
      running = false;
      startBtn.disabled = false;
      pauseBtn.disabled = true;

      if (phase === 'work') {
        // Work phase ended — log session
        logSession();
        // Switch to break
        phase = 'break';
        phaseEl.textContent = 'Pausa';
        remaining = getBreakTime() * 60;
        updateDisplay();
        // Auto-start break
        startBtn.click();
      } else {
        // Break ended — back to work
        phase = 'work';
        phaseEl.textContent = 'Trabalho';
        remaining = getWorkTime() * 60;
        sessionStart = null;
        updateDisplay();
      }
    }
  }

  function updateDisplay() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    // Update page title
    document.title = `${timerEl.textContent} — Pomodoro`;
  }

  function resetTimer() {
    clearInterval(intervalID);
    running = false;
    phase = 'work';
    phaseEl.textContent = 'Trabalho';
    remaining = getWorkTime() * 60;
    sessionStart = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    updateDisplay();
    document.title = 'Pomodoro + Deep Work — Vibe Playground';
  }

  function getWorkTime() {
    if (currentMode === 'custom') return Math.max(1, Math.min(120, +customWork.value || 25));
    return MODES[currentMode].work;
  }
  function getBreakTime() {
    if (currentMode === 'custom') return Math.max(1, Math.min(60, +customBreak.value || 5));
    return MODES[currentMode].brk;
  }

  // --- Session logging ---
  function logSession() {
    const history = loadHistory();
    const duration = getWorkTime();
    const modeLabel = currentMode === 'custom'
      ? `${getWorkTime()}/${getBreakTime()}`
      : currentMode.replace('-', '/');

    history.push({
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      mode: modeLabel,
      duration,
      date: todayKey()
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderStats();
  }

  function loadHistory() {
    try {
      const d = localStorage.getItem(HISTORY_KEY);
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  // --- Render stats ---
  function renderStats() {
    const history = loadHistory();
    const today = todayKey();
    const todaySessions = history.filter(h => h.date === today);
    const totalMin = todaySessions.reduce((sum, h) => sum + h.duration, 0);

    sessionsTodayEl.textContent = todaySessions.length;
    focusTotalEl.textContent = totalMin + ' min';

    historyBody.innerHTML = '';
    noHistoryEl.classList.toggle('hidden', todaySessions.length > 0);

    // Show most recent first
    [...todaySessions].reverse().forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.time}</td><td>${s.mode}</td><td>${s.duration} min</td>`;
      historyBody.appendChild(tr);
    });
  }

  // --- Init ---
  updateDisplay();
  renderStats();
})();
