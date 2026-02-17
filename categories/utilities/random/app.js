/* Gerador Aleatório */

(function () {
  const NAMES = [
    'Maria', 'João', 'Ana', 'Pedro', 'Inês', 'Tiago', 'Beatriz', 'Miguel',
    'Carolina', 'Diogo', 'Sofia', 'Rafael', 'Leonor', 'Gonçalo', 'Mariana',
    'Tomás', 'Matilde', 'Rodrigo', 'Sara', 'Francisco', 'Rita', 'Afonso',
    'Madalena', 'Guilherme', 'Alice', 'Duarte', 'Lara', 'Santiago', 'Eva', 'Martim'
  ];

  const modeSelect    = document.getElementById('mode-select');
  const numberOptions = document.getElementById('number-options');
  const numMin        = document.getElementById('num-min');
  const numMax        = document.getElementById('num-max');
  const generateBtn   = document.getElementById('generate-btn');
  const outputEl      = document.getElementById('output');
  const historyEl     = document.getElementById('history');

  let history = [];

  modeSelect.addEventListener('change', () => {
    numberOptions.classList.toggle('hidden', modeSelect.value !== 'number');
  });

  generateBtn.addEventListener('click', generate);

  function generate() {
    const mode = modeSelect.value;
    let result = '';
    let display = '';

    switch (mode) {
      case 'number': {
        const min = parseInt(numMin.value) || 0;
        const max = parseInt(numMax.value) || 100;
        const val = Math.floor(Math.random() * (max - min + 1)) + min;
        result = String(val);
        display = result;
        break;
      }
      case 'dice': {
        const val = Math.floor(Math.random() * 6) + 1;
        const faces = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        display = faces[val] + ' ' + val;
        result = String(val);
        break;
      }
      case 'color': {
        const hex = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
        display = hex;
        outputEl.style.background = hex;
        outputEl.style.color = isLight(hex) ? '#000' : '#fff';
        result = hex;
        break;
      }
      case 'name': {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        display = name;
        result = name;
        break;
      }
      case 'coin': {
        const val = Math.random() < 0.5 ? 'Cara' : 'Coroa';
        display = (val === 'Cara' ? '🪙' : '🔵') + ' ' + val;
        result = val;
        break;
      }
    }

    // Reset color styles for non-color modes
    if (mode !== 'color') {
      outputEl.style.background = '';
      outputEl.style.color = '';
    }

    outputEl.textContent = display;

    // Add to history
    const modeLabel = modeSelect.options[modeSelect.selectedIndex].text;
    history.unshift(`${modeLabel}: ${result}`);
    if (history.length > 20) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyEl.innerHTML = history.map(h => `<li>${h}</li>`).join('');
  }

  function isLight(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
  }
})();
