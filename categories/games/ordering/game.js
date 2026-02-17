/* Ordenação — Lógica do jogo (drag & drop) */

(function () {
  const themeSelect = document.getElementById('theme-select');
  const startBtn    = document.getElementById('start-btn');
  const setupArea   = document.getElementById('setup-area');
  const gameArea    = document.getElementById('game-area');
  const resultArea  = document.getElementById('result-area');
  const listEl      = document.getElementById('ordering-list');
  const validateBtn = document.getElementById('validate-btn');
  const feedbackEl  = document.getElementById('feedback');
  const bestInfoEl  = document.getElementById('best-info');
  const finalScoreEl = document.getElementById('final-score');
  const finalBestEl  = document.getElementById('final-best');
  const restartBtn   = document.getElementById('restart-btn');
  const changeBtn    = document.getElementById('change-theme-btn');

  let correctOrder = [];
  let currentTheme = '';
  let dragSrcIndex = null;

  // --- Populate themes ---
  Object.keys(ORDERING_DATA).forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    themeSelect.appendChild(opt);
  });

  function updateBestDisplay() {
    const best = Store.getBest('ordering', themeSelect.value);
    bestInfoEl.textContent = best !== null ? `${best}/${ORDERING_DATA[themeSelect.value].length}` : '—';
  }
  themeSelect.addEventListener('change', updateBestDisplay);
  updateBestDisplay();

  // --- Start ---
  startBtn.addEventListener('click', () => {
    currentTheme = themeSelect.value;
    correctOrder = [...ORDERING_DATA[currentTheme]];
    setupArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    gameArea.classList.remove('hidden');
    feedbackEl.textContent = '';
    renderList(shuffle([...correctOrder]));
  });

  // --- Render list ---
  function renderList(items) {
    listEl.innerHTML = '';
    items.forEach((text, i) => {
      const li = document.createElement('li');
      li.className = 'ordering-item';
      li.draggable = true;
      li.dataset.index = i;
      li.dataset.value = text;
      li.innerHTML = `<span class="handle" aria-hidden="true">☰</span> <span>${esc(text)}</span>`;
      li.setAttribute('aria-label', text);
      li.tabIndex = 0;

      // Drag events
      li.addEventListener('dragstart', onDragStart);
      li.addEventListener('dragover', onDragOver);
      li.addEventListener('drop', onDrop);
      li.addEventListener('dragend', onDragEnd);
      li.addEventListener('keydown', onKeyReorder);

      // Touch support
      li.addEventListener('touchstart', onTouchStart, { passive: false });
      li.addEventListener('touchmove', onTouchMove, { passive: false });
      li.addEventListener('touchend', onTouchEnd);

      listEl.appendChild(li);
    });
  }

  // --- Drag & Drop (desktop) ---
  function onDragStart(e) {
    dragSrcIndex = +this.dataset.index;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function onDrop(e) {
    e.preventDefault();
    const targetIndex = +this.dataset.index;
    if (dragSrcIndex === null || dragSrcIndex === targetIndex) return;
    swapItems(dragSrcIndex, targetIndex);
  }
  function onDragEnd() {
    this.classList.remove('dragging');
    dragSrcIndex = null;
  }

  // --- Touch support ---
  let touchSrcIndex = null;
  let touchClone = null;

  function onTouchStart(e) {
    touchSrcIndex = +this.dataset.index;
    this.classList.add('dragging');
    // Create floating clone
    const rect = this.getBoundingClientRect();
    touchClone = this.cloneNode(true);
    touchClone.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;opacity:.7;z-index:1000;pointer-events:none;`;
    document.body.appendChild(touchClone);
  }
  function onTouchMove(e) {
    e.preventDefault();
    if (!touchClone) return;
    const touch = e.touches[0];
    touchClone.style.top = (touch.clientY - 20) + 'px';
    touchClone.style.left = (touch.clientX - 20) + 'px';
  }
  function onTouchEnd(e) {
    if (touchClone) { touchClone.remove(); touchClone = null; }
    this.classList.remove('dragging');
    const touch = e.changedTouches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const li = target && target.closest('.ordering-item');
    if (li && touchSrcIndex !== null) {
      const targetIndex = +li.dataset.index;
      if (touchSrcIndex !== targetIndex) swapItems(touchSrcIndex, targetIndex);
    }
    touchSrcIndex = null;
  }

  // --- Swap ---
  function swapItems(from, to) {
    const items = listEl.querySelectorAll('.ordering-item');
    const arr = Array.from(items).map(li => li.dataset.value);
    [arr[from], arr[to]] = [arr[to], arr[from]];
    renderList(arr);
    // Clear previous validation
    feedbackEl.textContent = '';
  }

  // --- Validate ---
  validateBtn.addEventListener('click', () => {
    const items = listEl.querySelectorAll('.ordering-item');
    const arr = Array.from(items).map(li => li.dataset.value);
    let correctCount = 0;

    arr.forEach((text, i) => {
      if (text === correctOrder[i]) {
        items[i].classList.add('correct');
        items[i].classList.remove('wrong');
        correctCount++;
      } else {
        items[i].classList.add('wrong');
        items[i].classList.remove('correct');
      }
    });

    feedbackEl.textContent = `${correctCount} de ${correctOrder.length} na posição correta.`;

    // Save best score even for partial attempts
    const prev = Store.getBest('ordering', currentTheme);
    if (prev === null || correctCount > prev) {
      Store.setBest('ordering', currentTheme, correctCount);
      updateBestDisplay();
    }

    if (correctCount === correctOrder.length) {
      // All correct — show result
      setTimeout(() => showResult(correctCount), 600);
    }
  });

  // --- Result ---
  function showResult(score) {
    gameArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    finalScoreEl.textContent = `${score}/${correctOrder.length}`;
    const best = Store.getBest('ordering', currentTheme);
    finalBestEl.textContent = `Melhor: ${best}/${correctOrder.length}`;
  }

  restartBtn.addEventListener('click', () => {
    resultArea.classList.add('hidden');
    gameArea.classList.remove('hidden');
    feedbackEl.textContent = '';
    renderList(shuffle([...correctOrder]));
  });
  changeBtn.addEventListener('click', () => {
    gameArea.classList.add('hidden');
    resultArea.classList.add('hidden');
    setupArea.classList.remove('hidden');
    updateBestDisplay();
  });

  function onKeyReorder(e) {
    const idx = +this.dataset.index;
    if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      swapItems(idx, idx - 1);
    }
    if (e.key === 'ArrowDown') {
      const items = listEl.querySelectorAll('.ordering-item');
      if (idx < items.length - 1) {
        e.preventDefault();
        swapItems(idx, idx + 1);
      }
    }
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
