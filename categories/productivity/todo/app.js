/* Lista de Tarefas — Lógica principal */

(function () {
  const STORAGE_KEY = 'vibe_todo_tasks';

  // Priority weight for sorting
  const PRIORITY_WEIGHT = { alta: 0, media: 1, baixa: 2 };
  const STATUS_LABELS = { 'por-fazer': 'Por fazer', 'em-curso': 'Em curso', 'concluida': 'Concluída' };
  const PRIORITY_LABELS = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

  // --- State ---
  let tasks = loadTasks();

  // --- DOM refs ---
  const titleInput    = document.getElementById('new-title');
  const descInput     = document.getElementById('new-desc');
  const priorityInput = document.getElementById('new-priority');
  const statusInput   = document.getElementById('new-status');
  const addBtn        = document.getElementById('add-task-btn');
  const searchInput   = document.getElementById('search-input');
  const filterPri     = document.getElementById('filter-priority');
  const filterSta     = document.getElementById('filter-status');
  const sortSelect    = document.getElementById('sort-select');
  const taskListEl    = document.getElementById('task-list');
  const emptyMsg      = document.getElementById('empty-msg');
  const countersEl    = document.getElementById('counters');

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
  titleInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTask(); });

  function addTask() {
    const title = titleInput.value.trim();
    if (!title) { titleInput.focus(); return; }
    tasks.push({
      id: uid(),
      title,
      desc: descInput.value.trim(),
      priority: priorityInput.value,
      status: statusInput.value,
      created: Date.now()
    });
    saveTasks();
    titleInput.value = '';
    descInput.value = '';
    priorityInput.value = 'media';
    statusInput.value = 'por-fazer';
    titleInput.focus();
    render();
  }

  // --- Filters & search ---
  searchInput.addEventListener('input', render);
  filterPri.addEventListener('change', render);
  filterSta.addEventListener('change', render);
  sortSelect.addEventListener('change', render);

  // --- Render ---
  function render() {
    const query = searchInput.value.toLowerCase().trim();
    const priFilter = filterPri.value;
    const staFilter = filterSta.value;
    const sort = sortSelect.value;

    // Filter
    let list = tasks.filter(t => {
      if (priFilter !== 'all' && t.priority !== priFilter) return false;
      if (staFilter !== 'all' && t.status !== staFilter) return false;
      if (query && !t.title.toLowerCase().includes(query) && !t.desc.toLowerCase().includes(query)) return false;
      return true;
    });

    // Sort
    list.sort((a, b) => {
      switch (sort) {
        case 'newest':  return b.created - a.created;
        case 'oldest':  return a.created - b.created;
        case 'priority': return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        case 'alpha':   return a.title.localeCompare(b.title, 'pt');
        default: return 0;
      }
    });

    // Render counters
    const counts = { 'por-fazer': 0, 'em-curso': 0, 'concluida': 0 };
    tasks.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++; });
    countersEl.innerHTML = Object.entries(counts).map(([k, v]) =>
      `<div class="todo-counter">${STATUS_LABELS[k]}: <strong>${v}</strong></div>`
    ).join('');

    // Render list
    taskListEl.innerHTML = '';
    emptyMsg.classList.toggle('hidden', list.length > 0);

    list.forEach(task => {
      const div = document.createElement('div');
      div.className = `todo-item priority-${task.priority}`;
      div.innerHTML = `
        <div class="todo-item__body">
          <div class="todo-item__title">${esc(task.title)}</div>
          ${task.desc ? `<div class="todo-item__desc">${esc(task.desc)}</div>` : ''}
          <div class="todo-item__meta">
            <span class="todo-badge badge-priority">${PRIORITY_LABELS[task.priority]}</span>
            <span class="todo-badge badge-status">${STATUS_LABELS[task.status]}</span>
          </div>
        </div>
        <div class="todo-item__actions">
          <button class="cycle-status" data-id="${task.id}" title="Mudar estado">🔄</button>
          <button class="delete-task" data-id="${task.id}" title="Apagar" style="color:var(--clr-danger)">🗑️</button>
        </div>
      `;
      taskListEl.appendChild(div);
    });

    // Cycle status
    taskListEl.querySelectorAll('.cycle-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const task = tasks.find(t => t.id === btn.dataset.id);
        if (!task) return;
        const order = ['por-fazer', 'em-curso', 'concluida'];
        const idx = order.indexOf(task.status);
        task.status = order[(idx + 1) % order.length];
        saveTasks();
        render();
      });
    });

    // Delete
    taskListEl.querySelectorAll('.delete-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = tasks.findIndex(t => t.id === btn.dataset.id);
        if (idx < 0) return;
        if (!confirm('Queres apagar esta tarefa?')) return;
        const deleted = tasks[idx];
        tasks = tasks.filter(t => t.id !== btn.dataset.id);
        saveTasks();
        render();
        UIFeedback?.toast('Tarefa apagada.', 'Desfazer', () => {
          tasks.splice(Math.min(idx, tasks.length), 0, deleted);
          saveTasks();
          render();
        });
      });
    });
  }

  // --- Helpers ---
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // --- Init ---
  render();
})();
