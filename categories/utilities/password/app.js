/* Gerador de Palavras-passe */

(function () {
  const CHARS = {
    upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:   'abcdefghijklmnopqrstuvwxyz',
    digits:  '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };

  const lengthRange  = document.getElementById('length-range');
  const lengthValue  = document.getElementById('length-value');
  const optUpper     = document.getElementById('opt-upper');
  const optLower     = document.getElementById('opt-lower');
  const optDigits    = document.getElementById('opt-digits');
  const optSymbols   = document.getElementById('opt-symbols');
  const display      = document.getElementById('password-display');
  const generateBtn  = document.getElementById('generate-btn');
  const copyBtn      = document.getElementById('copy-btn');
  const strengthBar  = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');

  lengthRange.addEventListener('input', () => {
    lengthValue.textContent = lengthRange.value;
    generate();
  });

  [optUpper, optLower, optDigits, optSymbols].forEach(cb => cb.addEventListener('change', generate));
  generateBtn.addEventListener('click', generate);

  copyBtn.addEventListener('click', () => {
    const text = display.textContent;
    if (!text || text === '—') return;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = 'Copiar', 1500);
    }).catch(() => {
      // Fallback for file:// protocol
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = 'Copiar', 1500);
    });
  });

  function generate() {
    let pool = '';
    if (optUpper.checked)  pool += CHARS.upper;
    if (optLower.checked)  pool += CHARS.lower;
    if (optDigits.checked) pool += CHARS.digits;
    if (optSymbols.checked) pool += CHARS.symbols;

    if (!pool) {
      display.textContent = 'Seleciona pelo menos uma opção';
      strengthBar.style.background = 'var(--clr-border)';
      strengthBar.style.width = '0';
      strengthLabel.textContent = '—';
      return;
    }

    const len = +lengthRange.value;
    let password = '';
    const array = new Uint32Array(len);
    crypto.getRandomValues(array);
    for (let i = 0; i < len; i++) {
      password += pool[array[i] % pool.length];
    }

    display.textContent = password;
    updateStrength(password, pool.length);
  }

  function updateStrength(password, poolSize) {
    // Entropy = length * log2(poolSize)
    const entropy = password.length * Math.log2(poolSize);
    let level, color, label;

    if (entropy < 28) {
      level = 20; color = 'var(--clr-danger)'; label = 'Muito fraca';
    } else if (entropy < 36) {
      level = 40; color = '#ea580c'; label = 'Fraca';
    } else if (entropy < 60) {
      level = 60; color = 'var(--clr-warning)'; label = 'Razoável';
    } else if (entropy < 80) {
      level = 80; color = '#65a30d'; label = 'Forte';
    } else {
      level = 100; color = 'var(--clr-success)'; label = 'Muito forte';
    }

    strengthBar.style.width = level + '%';
    strengthBar.style.background = color;
    strengthLabel.textContent = `${label} (~${Math.round(entropy)} bits de entropia)`;
  }

  generate();
})();
