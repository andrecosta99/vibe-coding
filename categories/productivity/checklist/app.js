/* Checklist de Projeto — Lógica principal */

(function () {
  // --- Storage keys ---
  const TEMPLATES_KEY = 'vibe_checklist_templates';
  const PROJECTS_KEY  = 'vibe_checklist_projects';

  // --- Default templates ---
  const DEFAULT_TEMPLATES = [
    {
      id: 't1',
      name: 'Lançar Landing Page',
      tasks: [
        'Definir objetivo da página',
        'Criar wireframe',
        'Escrever copy principal',
        'Design visual (UI)',
        'Desenvolver HTML/CSS',
        'Adicionar formulário de contacto',
        'Testar responsividade',
        'Configurar domínio',
        'Publicar online',
        'Testar em vários browsers'
      ]
    },
    {
      id: 't2',
      name: 'Criar App Móvel',
      tasks: [
        'Definir funcionalidades principais',
        'Criar user stories',
        'Design de ecrãs (mockups)',
        'Configurar ambiente de desenvolvimento',
        'Implementar navegação',
        'Desenvolver ecrã principal',
        'Integrar armazenamento local',
        'Testes unitários',
        'Testes de usabilidade',
        'Publicar na loja'
      ]
    },
    {
      id: 't3',
      name: 'Organizar Evento',
      tasks: [
        'Definir data e local',
        'Criar lista de convidados',
        'Enviar convites',
        'Reservar espaço',
        'Contratar catering',
        'Preparar decoração',
        'Criar programa do evento',
        'Testar equipamento audiovisual',
        'Confirmar presenças',
        'Fazer check-in no dia'
      ]
    },
    {
      id: 't4',
      name: 'Campanha de Marketing',
      tasks: [
        'Definir público-alvo',
        'Definir orçamento',
        'Criar conteúdo visual',
        'Escrever textos/copy',
        'Configurar anúncios',
        'Agendar publicações',
        'Monitorizar métricas',
        'Ajustar segmentação',
        'Relatório de resultados',
        'Otimizar para próxima campanha'
      ]
    }
  ];

  // --- State ---
  let templates = loadData(TEMPLATES_KEY, DEFAULT_TEMPLATES);
  let projects  = loadData(PROJECTS_KEY, []);
  let currentTab = 'templates';
  let modalMode = ''; // 'template' | 'project'

  // --- DOM refs ---
  const tabTemplates = document.getElementById('tab-templates');
  const tabProjects  = document.getElementById('tab-projects');
  const templatesSection = document.getElementById('templates-section');
  const projectsSection  = document.getElementById('projects-section');
  const templatesList = document.getElementById('templates-list');
  const projectsList  = document.getElementById('projects-list');
  const newTemplateBtn = document.getElementById('new-template-btn');
  const newProjectBtn  = document.getElementById('new-project-btn');

  // Modal
  const modalOverlay   = document.getElementById('modal-overlay');
  const modalTitle     = document.getElementById('modal-title');
  const modalName      = document.getElementById('modal-name');
  const modalBaseWrap  = document.getElementById('modal-template-select');
  const modalBase      = document.getElementById('modal-base');
  const modalCancel    = document.getElementById('modal-cancel');
  const modalConfirm   = document.getElementById('modal-confirm');

  // --- Persistence ---
  function loadData(key, fallback) {
    try {
      const d = localStorage.getItem(key);
      return d ? JSON.parse(d) : fallback;
    } catch { return fallback; }
  }
  function saveTemplates() { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates)); }
  function saveProjects()  { localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects)); }

  // --- Tabs ---
  tabTemplates.addEventListener('click', () => switchTab('templates'));
  tabProjects.addEventListener('click', () => switchTab('projects'));

  function switchTab(tab) {
    currentTab = tab;
    tabTemplates.classList.toggle('active', tab === 'templates');
    tabProjects.classList.toggle('active', tab === 'projects');
    templatesSection.classList.toggle('hidden', tab !== 'templates');
    projectsSection.classList.toggle('hidden', tab !== 'projects');
  }

  // --- Render templates ---
  function renderTemplates() {
    templatesList.innerHTML = '';
    if (templates.length === 0) {
      templatesList.innerHTML = '<p style="color:var(--clr-text-muted);font-size:.9rem">Nenhum modelo. Cria o primeiro!</p>';
      return;
    }
    templates.forEach(tpl => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card__header">
          <span class="project-card__title">${esc(tpl.name)}</span>
          <div class="project-card__actions">
            <button class="btn btn-primary btn-sm create-from" data-id="${tpl.id}" title="Criar projeto a partir deste modelo">Criar Projeto</button>
            <button class="btn btn-danger btn-sm delete-tpl" data-id="${tpl.id}" title="Apagar modelo">✕</button>
          </div>
        </div>
        <ul class="checklist-items">
          ${tpl.tasks.map(t => `<li class="checklist-item" style="opacity:.7"><span style="color:var(--clr-text-muted);font-size:.85rem">• ${esc(t)}</span></li>`).join('')}
        </ul>
        <p style="font-size:.8rem;color:var(--clr-text-muted);margin-top:.4rem">${tpl.tasks.length} tarefas</p>
      `;
      templatesList.appendChild(card);
    });

    // Event: create project from template
    templatesList.querySelectorAll('.create-from').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tpl = templates.find(t => t.id === btn.dataset.id);
        if (!tpl) return;
        const project = {
          id: uid(),
          name: tpl.name + ' — Cópia',
          tasks: tpl.tasks.map(t => ({ text: t, done: false }))
        };
        projects.push(project);
        saveProjects();
        switchTab('projects');
        renderProjects();
      });
    });

    // Event: delete template
    templatesList.querySelectorAll('.delete-tpl').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = templates.findIndex(t => t.id === btn.dataset.id);
        if (idx < 0) return;
        if (!confirm('Queres apagar este modelo?')) return;
        const deleted = templates[idx];
        templates = templates.filter(t => t.id !== btn.dataset.id);
        saveTemplates();
        renderTemplates();
        UIFeedback?.toast('Modelo apagado.', 'Desfazer', () => {
          templates.splice(Math.min(idx, templates.length), 0, deleted);
          saveTemplates();
          renderTemplates();
        });
      });
    });
  }

  // --- Render projects ---
  function renderProjects() {
    projectsList.innerHTML = '';
    if (projects.length === 0) {
      projectsList.innerHTML = '<p style="color:var(--clr-text-muted);font-size:.9rem">Nenhum projeto. Cria um novo ou usa um modelo!</p>';
      return;
    }
    projects.forEach(proj => {
      const done = proj.tasks.filter(t => t.done).length;
      const total = proj.tasks.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="project-card__header">
          <span class="project-card__title">${esc(proj.name)}</span>
          <div class="project-card__actions">
            <button class="btn btn-sm duplicate-proj" data-id="${proj.id}" style="background:var(--clr-border)" title="Duplicar">📋</button>
            <button class="btn btn-danger btn-sm delete-proj" data-id="${proj.id}" title="Apagar">✕</button>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill ${pct === 100 ? 'complete' : ''}" style="width:${pct}%"></div>
        </div>
        <p style="font-size:.8rem;color:var(--clr-text-muted)">${done}/${total} concluídas (${pct}%)</p>
        <ul class="checklist-items" data-project="${proj.id}">
          ${proj.tasks.map((t, i) => `
            <li class="checklist-item ${t.done ? 'done' : ''}">
              <input type="checkbox" id="task-${proj.id}-${i}" ${t.done ? 'checked' : ''} data-project="${proj.id}" data-index="${i}">
              <label for="task-${proj.id}-${i}">${esc(t.text)}</label>
              <button class="remove-task" data-project="${proj.id}" data-index="${i}" aria-label="Remover tarefa">✕</button>
            </li>
          `).join('')}
        </ul>
        <div class="add-task-row">
          <input type="text" placeholder="Nova tarefa…" data-project="${proj.id}" class="new-task-input" aria-label="Nova tarefa">
          <button class="btn btn-primary btn-sm add-task-btn" data-project="${proj.id}">+</button>
        </div>
      `;
      projectsList.appendChild(card);
    });

    // Checkbox events
    projectsList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        const proj = projects.find(p => p.id === cb.dataset.project);
        if (proj) {
          proj.tasks[+cb.dataset.index].done = cb.checked;
          saveProjects();
          renderProjects();
        }
      });
    });

    // Remove task
    projectsList.querySelectorAll('.remove-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const proj = projects.find(p => p.id === btn.dataset.project);
        if (proj) {
          const i = +btn.dataset.index;
          const deleted = proj.tasks[i];
          if (!deleted) return;
          if (!confirm('Queres remover esta tarefa?')) return;
          proj.tasks.splice(i, 1);
          saveProjects();
          renderProjects();
          UIFeedback?.toast('Tarefa removida.', 'Desfazer', () => {
            const target = projects.find(p => p.id === btn.dataset.project);
            if (!target) return;
            target.tasks.splice(Math.min(i, target.tasks.length), 0, deleted);
            saveProjects();
            renderProjects();
          });
        }
      });
    });

    // Add task
    projectsList.querySelectorAll('.add-task-btn').forEach(btn => {
      btn.addEventListener('click', () => addTask(btn.dataset.project));
    });
    projectsList.querySelectorAll('.new-task-input').forEach(inp => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask(inp.dataset.project);
      });
    });

    // Duplicate project
    projectsList.querySelectorAll('.duplicate-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const orig = projects.find(p => p.id === btn.dataset.id);
        if (!orig) return;
        projects.push({
          id: uid(),
          name: orig.name + ' (cópia)',
          tasks: orig.tasks.map(t => ({ text: t.text, done: false }))
        });
        saveProjects();
        renderProjects();
      });
    });

    // Delete project
    projectsList.querySelectorAll('.delete-proj').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = projects.findIndex(p => p.id === btn.dataset.id);
        if (idx < 0) return;
        if (!confirm('Queres apagar este projeto?')) return;
        const deleted = projects[idx];
        projects = projects.filter(p => p.id !== btn.dataset.id);
        saveProjects();
        renderProjects();
        UIFeedback?.toast('Projeto apagado.', 'Desfazer', () => {
          projects.splice(Math.min(idx, projects.length), 0, deleted);
          saveProjects();
          renderProjects();
        });
      });
    });
  }

  function addTask(projectId) {
    const input = projectsList.querySelector(`.new-task-input[data-project="${projectId}"]`);
    const text = input.value.trim();
    if (!text) return;
    const proj = projects.find(p => p.id === projectId);
    if (proj) {
      proj.tasks.push({ text, done: false });
      saveProjects();
      renderProjects();
    }
  }

  // --- Modal logic ---
  newTemplateBtn.addEventListener('click', () => openModal('template'));
  newProjectBtn.addEventListener('click', () => openModal('project'));
  modalCancel.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

  function openModal(mode) {
    modalMode = mode;
    modalName.value = '';
    if (mode === 'template') {
      modalTitle.textContent = 'Novo Modelo';
      modalBaseWrap.classList.add('hidden');
    } else {
      modalTitle.textContent = 'Novo Projeto';
      modalBaseWrap.classList.remove('hidden');
      // Populate template options
      modalBase.innerHTML = '<option value="">— Vazio —</option>';
      templates.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        modalBase.appendChild(opt);
      });
    }
    modalOverlay.classList.remove('hidden');
    modalName.focus();
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    modalMode = '';
  }

  modalConfirm.addEventListener('click', () => {
    const name = modalName.value.trim();
    if (!name) { modalName.focus(); return; }

    if (modalMode === 'template') {
      templates.push({ id: uid(), name, tasks: [] });
      saveTemplates();
      renderTemplates();
    } else {
      const baseId = modalBase.value;
      let tasks = [];
      if (baseId) {
        const tpl = templates.find(t => t.id === baseId);
        if (tpl) tasks = tpl.tasks.map(t => ({ text: t, done: false }));
      }
      projects.push({ id: uid(), name, tasks });
      saveProjects();
      renderProjects();
      switchTab('projects');
    }
    closeModal();
  });

  // Allow Enter in modal
  modalName.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') modalConfirm.click();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) closeModal();
  });

  // --- Helpers ---
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  // --- Init ---
  renderTemplates();
  renderProjects();
})();
