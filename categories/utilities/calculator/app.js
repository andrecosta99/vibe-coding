/* Calculadora */

(function () {
  const display = document.getElementById('display');
  let current = '0';
  let previous = '';
  let operator = '';
  let resetNext = false;

  // Button clicks
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const value  = btn.dataset.value;

      switch (action) {
        case 'digit':    inputDigit(value); break;
        case 'decimal':  inputDecimal(); break;
        case 'operator': inputOperator(value); break;
        case 'equals':   calculate(); break;
        case 'clear':    clear(); break;
        case 'backspace': backspace(); break;
        case 'percent':  percent(); break;
      }
      updateDisplay();
    });
  });

  // Keyboard support
  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') inputDigit(e.key);
    else if (e.key === '.') inputDecimal();
    else if (e.key === '+' || e.key === '-') inputOperator(e.key);
    else if (e.key === '*') inputOperator('*');
    else if (e.key === '/') { e.preventDefault(); inputOperator('/'); }
    else if (e.key === '%') percent();
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') clear();
    else return;
    updateDisplay();
  });

  function inputDigit(d) {
    if (resetNext) { current = d; resetNext = false; }
    else if (current === '0') current = d;
    else if (current.length < 15) current += d;
  }

  function inputDecimal() {
    if (resetNext) { current = '0.'; resetNext = false; return; }
    if (!current.includes('.')) current += '.';
  }

  function inputOperator(op) {
    if (operator && !resetNext) calculate();
    previous = current;
    operator = op;
    resetNext = true;
  }

  function calculate() {
    if (!operator || resetNext) return;
    const a = parseFloat(previous);
    const b = parseFloat(current);
    let result;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : 'Erro'; break;
    }
    current = result === 'Erro' ? 'Erro' : String(parseFloat(result.toPrecision(12)));
    operator = '';
    previous = '';
    resetNext = true;
  }

  function clear() {
    current = '0';
    previous = '';
    operator = '';
    resetNext = false;
  }

  function backspace() {
    if (resetNext) return;
    current = current.length > 1 ? current.slice(0, -1) : '0';
  }

  function percent() {
    current = String(parseFloat(current) / 100);
    resetNext = true;
  }

  function updateDisplay() {
    display.textContent = current;
  }
})();
