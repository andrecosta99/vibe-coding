/* ===== Vibe Playground — Shared helpers ===== */

/**
 * Build and inject the site header (title + "Sobre o Autor" button).
 * Breadcrumbs are rendered separately inside .container.
 * @param {Array<{label:string, href:string}>} crumbs – breadcrumb trail (last item is current page)
 */
function renderHeader(crumbs) {
  const header = document.querySelector('.site-header');
  if (!header) return;

  // Find the home href from crumbs (first item)
  const homeHref = crumbs[0].href;

  header.innerHTML = `
    <div class="site-header__inner">
      <div class="site-header__title"><a href="${homeHref}">Vibe Playground</a></div>
      <button class="header-author-btn" id="open-author-modal" aria-label="Sobre o autor">Sobre o Autor</button>
    </div>`;

  // Render breadcrumbs inside .container (before first child), only if more than 1 crumb
  if (crumbs.length > 1) {
    const container = document.querySelector('.container');
    if (container) {
      const nav = document.createElement('nav');
      nav.className = 'breadcrumb';
      nav.setAttribute('aria-label', 'Breadcrumb');
      nav.innerHTML = crumbs.map((c, i) => {
        if (i < crumbs.length - 1) {
          return `<a href="${c.href}">${c.label}</a> <span>/</span>`;
        }
        return `<span class="breadcrumb__current">${c.label}</span>`;
      }).join(' ');
      container.insertBefore(nav, container.firstChild);
    }
  }
}

/**
 * Simple localStorage helpers scoped per game.
 */
const Store = {
  _key(game, theme, extra) {
    return `vibe_${game}_${theme}${extra ? '_' + extra : ''}`;
  },
  getBest(game, theme, extra) {
    const v = localStorage.getItem(this._key(game, theme, extra));
    return v !== null ? JSON.parse(v) : null;
  },
  setBest(game, theme, value, extra) {
    localStorage.setItem(this._key(game, theme, extra), JSON.stringify(value));
  }
};

/**
 * Shuffle an array in place (Fisher-Yates).
 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Render the site footer with credits and author modal.
 * @param {string} basePath – relative path to project root (e.g. '' for root, '../../' for nested)
 */
function renderFooter(basePath) {
  const bp = basePath || '';

  // Footer
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.setAttribute('role', 'contentinfo');
  footer.innerHTML = `
    <div class="site-footer__inner">
      <p>Desenvolvido por <a href="https://superhumano.ai" target="_blank" rel="noopener">SuperHumano AI</a> e <a href="https://andrefcosta.com" target="_blank" rel="noopener">André F. Costa</a></p>
    </div>`;
  document.body.appendChild(footer);

  // Author modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'author-overlay';
  overlay.id = 'author-overlay';
  overlay.innerHTML = `
    <div class="author-modal" role="dialog" aria-label="Sobre o autor">
      <button class="author-modal__close" id="close-author-modal" aria-label="Fechar">&times;</button>
      <img src="${bp}assets/img/andrefcosta.png" alt="André F. Costa" class="author-photo" onerror="this.style.display='none'">
      <h2>André F. Costa</h2>
      <p class="author-subtitle">Professor Universitário &bull; Produto Digital &bull; IA</p>
      <div class="author-bio">
        <p>André F. Costa é Professor Universitário nas áreas de Produto Digital e Tecnologias Web, tendo formado centenas de alunos entre Portugal e Brasil ao longo da última década. Trabalha na interseção entre design, tecnologia e Inteligência Artificial, com foco na criação e desenvolvimento de produtos digitais e startups tecnológicas.</p>
        <p>Ao longo do seu percurso profissional, participou em diversos projetos digitais nacionais e internacionais, incluindo colaboração na implementação dos Apple Maps em Portugal. Dinamiza regularmente formações em organizações tecnológicas de referência em Portugal, Brasil, Angola e Cabo Verde.</p>
        <p>É convidado em eventos de tecnologia como o Web Summit, Tech Summit e CESAE Digital, entre outros. É autor do capítulo "Inteligência Artificial e o Futuro do Trabalho" no livro luso-brasileiro <em>Negócios e Carreiras II</em> e possui trabalhos científicos publicados na área da Inteligência Artificial. Enquanto empreendedor tecnológico, é fundador de dois produtos digitais online com faturação combinada superior a 100 mil euros (mais de 500 mil reais).</p>
      </div>
      <div class="author-socials">
        <a href="https://www.youtube.com/@superhumano-ai" target="_blank" rel="noopener">&#9654; YouTube</a>
        <a href="https://www.instagram.com/andrefcosta.digital/" target="_blank" rel="noopener">&#128247; Instagram</a>
        <a href="https://www.linkedin.com/in/andrecosta/" target="_blank" rel="noopener">&#128188; LinkedIn</a>
        <a href="https://andrefcosta.com" target="_blank" rel="noopener">&#127760; Website</a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // Modal open / close — attach to header button
  const openBtn = document.getElementById('open-author-modal');
  if (openBtn) {
    openBtn.addEventListener('click', () => overlay.classList.add('open'));
  }
  document.getElementById('close-author-modal').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') overlay.classList.remove('open');
  });
}

/**
 * Simple toast notification with optional action (e.g., undo).
 */
const UIFeedback = {
  _ensureWrap() {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      wrap.setAttribute('aria-live', 'polite');
      wrap.setAttribute('aria-atomic', 'true');
      document.body.appendChild(wrap);
    }
    return wrap;
  },
  toast(message, actionLabel, actionCb, ttl = 5000) {
    const wrap = this._ensureWrap();
    const toast = document.createElement('div');
    toast.className = 'toast';
    const msg = document.createElement('span');
    msg.className = 'toast__msg';
    msg.textContent = message;
    toast.appendChild(msg);
    if (actionLabel && typeof actionCb === 'function') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast__action';
      btn.textContent = actionLabel;
      btn.addEventListener('click', () => {
        actionCb();
        toast.remove();
      });
      toast.appendChild(btn);
    }
    wrap.appendChild(toast);
    setTimeout(() => toast.remove(), ttl);
  }
};

window.UIFeedback = UIFeedback;
