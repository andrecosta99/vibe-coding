/* Batida Musical — Sequenciador de 16 passos com Web Audio API */

(function () {
  const STEPS = 16;
  const INSTRUMENTS = [
    { name: 'Bombo',  color: '#dc2626', synth: 'kick' },
    { name: 'Caixa',  color: '#ea580c', synth: 'snare' },
    { name: 'Hi-Hat', color: '#eab308', synth: 'hihat' },
    { name: 'Clap',   color: '#16a34a', synth: 'clap' },
    { name: 'Tom',    color: '#2563eb', synth: 'tom' },
  ];

  const gridEl      = document.getElementById('beat-grid');
  const playBtn     = document.getElementById('play-btn');
  const stopBtn     = document.getElementById('stop-btn');
  const clearBtn    = document.getElementById('clear-grid-btn');
  const bpmRange    = document.getElementById('bpm-range');
  const bpmValue    = document.getElementById('bpm-value');

  // State: grid[instrument][step] = true/false
  let grid = INSTRUMENTS.map(() => new Array(STEPS).fill(false));
  let playing = false;
  let currentStep = -1;
  let intervalID = null;
  let audioCtx = null;

  // Build grid UI
  function buildGrid() {
    gridEl.innerHTML = '';
    INSTRUMENTS.forEach((inst, row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'beat-row';
      rowEl.innerHTML = `<span class="beat-label">${inst.name}</span>`;

      for (let col = 0; col < STEPS; col++) {
        const cell = document.createElement('div');
        cell.className = 'beat-cell' + (grid[row][col] ? ' active' : '');
        cell.dataset.row = row;
        cell.dataset.col = col;
        if (grid[row][col]) cell.style.background = inst.color;
        else cell.style.background = 'var(--clr-bg)';

        cell.addEventListener('click', () => {
          grid[row][col] = !grid[row][col];
          cell.classList.toggle('active', grid[row][col]);
          cell.style.background = grid[row][col] ? inst.color : 'var(--clr-bg)';
        });
        rowEl.appendChild(cell);
      }
      gridEl.appendChild(rowEl);
    });
  }

  // BPM
  bpmRange.addEventListener('input', () => {
    bpmValue.textContent = bpmRange.value;
    if (playing) { stop(); play(); } // restart with new BPM
  });

  // Play / Stop
  playBtn.addEventListener('click', play);
  stopBtn.addEventListener('click', stop);

  function play() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    playing = true;
    playBtn.disabled = true;
    stopBtn.disabled = false;
    currentStep = -1;

    const bpm = +bpmRange.value;
    const interval = (60 / bpm / 4) * 1000; // 16th note

    intervalID = setInterval(() => {
      currentStep = (currentStep + 1) % STEPS;
      highlightStep(currentStep);

      INSTRUMENTS.forEach((inst, row) => {
        if (grid[row][currentStep]) {
          playSound(inst.synth);
        }
      });
    }, interval);
  }

  function stop() {
    playing = false;
    clearInterval(intervalID);
    playBtn.disabled = false;
    stopBtn.disabled = true;
    highlightStep(-1);
  }

  function highlightStep(step) {
    document.querySelectorAll('.beat-cell').forEach(cell => {
      cell.classList.remove('playing');
    });
    if (step < 0) return;
    document.querySelectorAll(`.beat-cell[data-col="${step}"]`).forEach(cell => {
      cell.classList.add('playing');
    });
  }

  clearBtn.addEventListener('click', () => {
    grid = INSTRUMENTS.map(() => new Array(STEPS).fill(false));
    buildGrid();
  });

  // --- Sound synthesis (no external files) ---
  function playSound(type) {
    const t = audioCtx.currentTime;

    switch (type) {
      case 'kick': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.3);
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'snare': {
        // Noise burst
        const bufferSize = audioCtx.sampleRate * 0.1;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        noise.connect(filter).connect(gain).connect(audioCtx.destination);
        noise.start(t);
        noise.stop(t + 0.15);
        break;
      }
      case 'hihat': {
        const bufferSize = audioCtx.sampleRate * 0.05;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 5000;
        noise.connect(filter).connect(gain).connect(audioCtx.destination);
        noise.start(t);
        noise.stop(t + 0.05);
        break;
      }
      case 'clap': {
        // Multiple short noise bursts
        for (let i = 0; i < 3; i++) {
          const offset = i * 0.01;
          const bufferSize = audioCtx.sampleRate * 0.02;
          const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let j = 0; j < bufferSize; j++) data[j] = Math.random() * 2 - 1;
          const noise = audioCtx.createBufferSource();
          noise.buffer = buffer;
          const gain = audioCtx.createGain();
          gain.gain.setValueAtTime(0.6, t + offset);
          gain.gain.exponentialRampToValueAtTime(0.01, t + offset + 0.08);
          const filter = audioCtx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 2500;
          noise.connect(filter).connect(gain).connect(audioCtx.destination);
          noise.start(t + offset);
          noise.stop(t + offset + 0.08);
        }
        break;
      }
      case 'tom': {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
    }
  }

  buildGrid();
})();
