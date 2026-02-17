/* Conversor de Unidades */

(function () {
  // Conversion data: each category has units with a factor to the base unit.
  // Temperature is handled separately.
  const CATEGORIES = {
    'Comprimento': {
      base: 'm',
      units: {
        'mm':  { label: 'Milímetro (mm)', factor: 0.001 },
        'cm':  { label: 'Centímetro (cm)', factor: 0.01 },
        'm':   { label: 'Metro (m)', factor: 1 },
        'km':  { label: 'Quilómetro (km)', factor: 1000 },
        'in':  { label: 'Polegada (in)', factor: 0.0254 },
        'ft':  { label: 'Pé (ft)', factor: 0.3048 },
        'yd':  { label: 'Jarda (yd)', factor: 0.9144 },
        'mi':  { label: 'Milha (mi)', factor: 1609.344 },
      }
    },
    'Peso': {
      base: 'kg',
      units: {
        'mg': { label: 'Miligrama (mg)', factor: 0.000001 },
        'g':  { label: 'Grama (g)', factor: 0.001 },
        'kg': { label: 'Quilograma (kg)', factor: 1 },
        't':  { label: 'Tonelada (t)', factor: 1000 },
        'oz': { label: 'Onça (oz)', factor: 0.0283495 },
        'lb': { label: 'Libra (lb)', factor: 0.453592 },
      }
    },
    'Temperatura': {
      special: true,
      units: {
        'C': { label: 'Celsius (°C)' },
        'F': { label: 'Fahrenheit (°F)' },
        'K': { label: 'Kelvin (K)' },
      }
    },
    'Volume': {
      base: 'l',
      units: {
        'ml': { label: 'Mililitro (ml)', factor: 0.001 },
        'cl': { label: 'Centilitro (cl)', factor: 0.01 },
        'l':  { label: 'Litro (l)', factor: 1 },
        'gal': { label: 'Galão US (gal)', factor: 3.78541 },
        'cup': { label: 'Chávena US (cup)', factor: 0.236588 },
        'fl_oz': { label: 'Onça fluida US (fl oz)', factor: 0.0295735 },
      }
    }
  };

  const catSelect  = document.getElementById('category');
  const fromSelect = document.getElementById('from-unit');
  const toSelect   = document.getElementById('to-unit');
  const valueInput = document.getElementById('value-input');
  const resultEl   = document.getElementById('result');

  // Populate categories
  Object.keys(CATEGORIES).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  catSelect.addEventListener('change', populateUnits);
  fromSelect.addEventListener('change', convert);
  toSelect.addEventListener('change', convert);
  valueInput.addEventListener('input', convert);

  function populateUnits() {
    const cat = CATEGORIES[catSelect.value];
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    Object.entries(cat.units).forEach(([key, u]) => {
      const o1 = document.createElement('option');
      o1.value = key; o1.textContent = u.label;
      const o2 = o1.cloneNode(true);
      fromSelect.appendChild(o1);
      toSelect.appendChild(o2);
    });
    // Default: set "to" to second unit
    if (toSelect.options.length > 1) toSelect.selectedIndex = 1;
    convert();
  }

  function convert() {
    const val = parseFloat(valueInput.value);
    if (isNaN(val)) { resultEl.textContent = '—'; return; }

    const cat = CATEGORIES[catSelect.value];
    const from = fromSelect.value;
    const to = toSelect.value;

    let result;
    if (cat.special) {
      // Temperature
      result = convertTemp(val, from, to);
    } else {
      const baseValue = val * cat.units[from].factor;
      result = baseValue / cat.units[to].factor;
    }

    // Format nicely
    const formatted = Number.isInteger(result) ? result.toString() : result.toPrecision(8).replace(/\.?0+$/, '');
    const fromLabel = cat.units[from].label.split('(')[0].trim();
    const toLabel = cat.units[to].label.split('(')[0].trim();
    resultEl.textContent = `${val} ${fromLabel} = ${formatted} ${toLabel}`;
  }

  function convertTemp(val, from, to) {
    // Convert to Celsius first
    let celsius;
    if (from === 'C') celsius = val;
    else if (from === 'F') celsius = (val - 32) * 5 / 9;
    else celsius = val - 273.15; // K

    // Convert from Celsius to target
    if (to === 'C') return celsius;
    if (to === 'F') return celsius * 9 / 5 + 32;
    return celsius + 273.15; // K
  }

  populateUnits();
})();
