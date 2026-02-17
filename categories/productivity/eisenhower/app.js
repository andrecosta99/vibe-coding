/* Matriz de Eisenhower — Lógica principal */

(function () {
  const STORAGE_KEY = 'vibe_eisenhower_tasks';

  // --- State ---
  let tasks = loadTasks();
  let activeFilter = 'all';

  // --- DOM refs ---
  const taskInput     = document.getElementById('task-input');
  const tagInput      = document.getElementById('tag-input');
  const quadrantSel   = document.getElementById('quadrant-select');
  const addBtn        = document.getElementById('add-btn');
  const filterBar     = document.getElementById('filter-bar');
  const quadrantItems = document.querySelectorAll('.quadrant__items');

  // --- Persistence ---
  function loadTasks() {
    try {
      const d = localStorage.getItem(STORAGE_KEY);
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  }
  function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

  // --- Add task ---
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

  function addTask() {
    const text = taskInput.value.trim();
    if (!text) { taskInput.focus(); return; }
    const tag = tagInput.value.trim() || '';
    tasks.push({
      id: uid(),
      text,
      tag,
      quadrant: quadrantSel.value
    });
    saveTasks();
    taskInput.value = '';
    tagInput.value = '';
    taskInput.focus();
    renderAll();
  }

  // --- Render ---
  function renderAll() {
    renderFilters();
    renderQuadrants();
  }

  function renderFilters() {
    // Collect unique tags
    const tags = [...new Set(tasks.map(t => t.tag).filter(Boolean))].sort();
    filterBar.innerHTML = '<span style="font-size:.82rem;font-weight:600;color:var(--clr-text-muted)">Filtrar:</span>';
    const allBtn = document.createElement('button');
    allBtn.className = 'tag-filter' + (activeFilter === 'all' ? ' active' : '');
    allBtn.dataset.tag = 'all';
    allBtn.textContent = 'Todas';
    allBtn.addEventListener('click', () => { activeFilter = 'all'; renderAll(); });
    filterBar.appendChild(allBtn);

    tags.forEach(tag => {
      const btn = document.createElement('button');
      btn.className = 'tag-filter' + (activeFilter === tag ? ' active' : '');
      btn.dataset.tag = tag;
      btn.textContent = tag;
      btn.addEventListener('click', () => { activeFilter = tag; renderAll(); });
      filterBar.appendChild(btn);
    });
  }

  function renderQuadrants() {
    quadrantItems.forEach(container => {
      const q = container.dataset.quadrant;
      container.innerHTML = '';

      const filtered = tasks.filter(t => {
        if (t.quadrant !== q) return false;
        if (activeFilter !== 'all' && t.tag !== activeFilter) return false;
        return true;
      });

      filtered.forEach(task => {
        const div = document.createElement('div');
        div.className = 'eisenhower-task';
        div.draggable = true;
        div.dataset.id = task.id;
        div.tabIndex = 0;
        div.setAttribute('aria-label', `Tarefa: ${task.text}. Usa teclas 1 a 4 para mover de quadrante.`);

        let tagHTML = task.tag ? `<span class="eisenhower-tag">${esc(task.tag)}</span>` : '';
        div.innerHTML = `
          <span class="task-text">${esc(task.text)}</span>
          ${tagHTML}
          <button class="delete-task" data-id="${task.id}" aria-label="Apagar tarefa">✕</button>
        `;

        // Desktop drag
        div.addEventListener('dragstart', onDragStart);
        div.addEventListener('dragend', onDragEnd);

        // Touch drag
        div.addEventListener('touchstart', onTouchStart, { passive: false });
        div.addEventListener('touchmove', onTouchMove, { passive: false });
        div.addEventListener('touchend', onTouchEnd);
        div.addEventListener('keydown', onTaskKeyMove);

        container.appendChild(div);
      });
    });

    // Delete events
    document.querySelectorAll('.delete-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = tasks.findIndex(t => t.id === btn.dataset.id);
        if (idx < 0) return;
        if (!confirm('Queres apagar esta tarefa?')) return;
        const deleted = tasks[idx];
        tasks = tasks.filter(t => t.id !== btn.dataset.id);
        saveTasks();
        renderAll();
        UIFeedback?.toast('Tarefa apagada.', 'Desfazer', () => {
          tasks.splice(Math.min(idx, tasks.length), 0, deleted);
          saveTasks();
          renderAll();
        });
      });
    });

    // Drop zones
    document.querySelectorAll('.quadrant').forEach(quad => {
      quad.addEventListener('dragover', (e) => { e.preventDefault(); quad.classList.add('drag-over'); });
      quad.addEventListener('dragleave', () => quad.classList.remove('drag-over'));
      quad.addEventListener('drop', onDrop);
    });
  }

  // --- Desktop Drag & Drop ---
  let dragId = null;

  function onDragStart(e) {
    dragId = this.dataset.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.quadrant').forEach(q => q.classList.remove('drag-over'));
  }
  function onDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (!dragId) return;
    const targetQuadrant = this.dataset.quadrant || this.querySelector('.quadrant__items')?.dataset.quadrant;
    if (!targetQuadrant) return;
    const task = tasks.find(t => t.id === dragId);
    if (task && task.quadrant !== targetQuadrant) {
      task.quadrant = targetQuadrant;
      saveTasks();
      renderAll();
    }
    dragId = null;
  }

  // --- Touch Drag ---
  let touchId = null;
  let touchClone = null;

  function onTouchStart(e) {
    touchId = this.dataset.id;
    this.classList.add('dragging');
    const rect = this.getBoundingClientRect();
    touchClone = this.cloneNode(true);
    touchClone.style.cssText = `position:fixed;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;opacity:.6;z-index:1000;pointer-events:none;`;
    document.body.appendChild(touchClone);
  }
  function onTouchMove(e) {
    e.preventDefault();
    if (!touchClone) return;
    const t = e.touches[0];
    touchClone.style.top = (t.clientY - 20) + 'px';
    touchClone.style.left = (t.clientX - 10) + 'px';
  }
  function onTouchEnd(e) {
    if (touchClone) { touchClone.remove(); touchClone = null; }
    this.classList.remove('dragging');
    if (!touchId) return;
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const quad = el && (el.closest('.quadrant'));
    if (quad) {
      const targetQuadrant = quad.dataset.quadrant;
      const task = tasks.find(t => t.id === touchId);
      if (task && task.quadrant !== targetQuadrant) {
        task.quadrant = targetQuadrant;
        saveTasks();
        renderAll();
      }
    }
    touchId = null;
  }

  function onTaskKeyMove(e) {
    const map = {
      '1': 'urgent-important',
      '2': 'important-not-urgent',
      '3': 'urgent-not-important',
      '4': 'not-urgent-not-important'
    };
    const target = map[e.key];
    if (!target) return;
    const task = tasks.find(t => t.id === this.dataset.id);
    if (!task || task.quadrant === target) return;
    task.quadrant = target;
    saveTasks();
    renderAll();
    UIFeedback?.toast('Tarefa movida de quadrante.');
  }

  // --- Helpers ---
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // --- Init ---
  renderAll();
})();
