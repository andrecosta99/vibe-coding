/* Criador de Emojis — Combina partes de emojis */

(function () {
  const STORAGE_KEY = 'vibe_emoji_collection';

  // Emoji parts: face bases, eyes, mouths, accessories
  const PARTS = {
    'Cara': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😎', '🤓', '🧐', '😏', '🤗'],
    'Olhos': ['👀', '👁️', '🥺', '😳', '🤨', '🧿', '👓', '🕶️', '🥽', '💫', '✨', '⭐', '🌟', '💎', '🔮'],
    'Boca': ['👄', '💋', '👅', '🦷', '😬', '🤐', '😮', '😲', '😱', '🤭', '😷', '🤢', '🤮', '💬', '💭'],
    'Acessório': ['🎩', '👑', '🎀', '🧢', '⛑️', '🎭', '💄', '💍', '🌸', '🌺', '🍀', '🔥', '❄️', '⚡', '🌈']
  };

  let selected = {};
  let collection = loadCollection();

  const previewEl   = document.getElementById('emoji-preview');
  const partsEl     = document.getElementById('emoji-parts');
  const randomBtn   = document.getElementById('random-btn');
  const saveBtn     = document.getElementById('save-btn');
  const copyBtn     = document.getElementById('copy-btn');
  const collectionEl = document.getElementById('collection');
  const clearBtn    = document.getElementById('clear-collection');

  // Initialize with first item of each category
  Object.keys(PARTS).forEach(cat => {
    selected[cat] = PARTS[cat][0];
  });

  function buildParts() {
    partsEl.innerHTML = '';
    Object.entries(PARTS).forEach(([cat, emojis]) => {
      const group = document.createElement('div');
      group.className = 'emoji-part-group';
      group.innerHTML = `<label>${cat}</label>`;
      const scroll = document.createElement('div');
      scroll.className = 'emoji-scroll';

      emojis.forEach(emoji => {
        const span = document.createElement('span');
        span.className = 'emoji-option' + (selected[cat] === emoji ? ' selected' : '');
        span.textContent = emoji;
        span.addEventListener('click', () => {
          selected[cat] = emoji;
          scroll.querySelectorAll('.emoji-option').forEach(s => s.classList.remove('selected'));
          span.classList.add('selected');
          updatePreview();
        });
        scroll.appendChild(span);
      });

      group.appendChild(scroll);
      partsEl.appendChild(group);
    });
  }

  function updatePreview() {
    const combo = Object.values(selected).join('');
    previewEl.textContent = combo;
  }

  function getCombo() {
    return Object.values(selected).join('');
  }

  // Random
  randomBtn.addEventListener('click', () => {
    Object.keys(PARTS).forEach(cat => {
      const arr = PARTS[cat];
      selected[cat] = arr[Math.floor(Math.random() * arr.length)];
    });
    buildParts();
    updatePreview();
  });

  // Save
  saveBtn.addEventListener('click', () => {
    const combo = getCombo();
    if (!collection.includes(combo)) {
      collection.push(combo);
      saveCollection();
      renderCollection();
    }
  });

  // Copy
  copyBtn.addEventListener('click', () => {
    const text = getCombo();
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = 'Copiar Emoji', 1500);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = 'Copiar Emoji', 1500);
    });
  });

  // Collection
  function loadCollection() {
    try {
      const d = localStorage.getItem(STORAGE_KEY);
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  }
  function saveCollection() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  }

  function renderCollection() {
    collectionEl.innerHTML = '';
    clearBtn.style.display = collection.length > 0 ? '' : 'none';
    if (collection.length === 0) {
      collectionEl.innerHTML = '<p style="font-size:.85rem;color:var(--clr-text-muted)">Nenhum emoji guardado.</p>';
      return;
    }
    collection.forEach((combo, i) => {
      const span = document.createElement('span');
      span.className = 'emoji-saved';
      span.textContent = combo;
      span.title = 'Clica para remover';
      span.addEventListener('click', () => {
        collection.splice(i, 1);
        saveCollection();
        renderCollection();
      });
      collectionEl.appendChild(span);
    });
  }

  clearBtn.addEventListener('click', () => {
    collection = [];
    saveCollection();
    renderCollection();
  });

  // Init
  buildParts();
  updatePreview();
  renderCollection();
})();
