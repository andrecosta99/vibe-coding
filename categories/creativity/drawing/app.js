/* Quadro de Desenho */

(function () {
  const canvas      = document.getElementById('drawing-canvas');
  const ctx         = canvas.getContext('2d');
  const colorPicker = document.getElementById('color-picker');
  const sizeRange   = document.getElementById('size-range');
  const eraserBtn   = document.getElementById('eraser-btn');
  const clearBtn    = document.getElementById('clear-btn');
  const downloadBtn = document.getElementById('download-btn');

  let drawing = false;
  let erasing = false;
  let lastX = 0;
  let lastY = 0;

  // Make canvas responsive
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.min(900, rect.width - 32);
    canvas.style.width = w + 'px';
    canvas.style.height = Math.round(w * 500 / 900) + 'px';
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Drawing state
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = erasing ? '#ffffff' : colorPicker.value;
    ctx.lineWidth = erasing ? +sizeRange.value * 3 : +sizeRange.value;
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }

  function stopDraw() {
    drawing = false;
  }

  // Mouse events
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('mouseleave', stopDraw);

  // Touch events
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDraw);

  // Eraser toggle
  eraserBtn.addEventListener('click', () => {
    erasing = !erasing;
    eraserBtn.style.background = erasing ? 'var(--clr-primary)' : 'var(--clr-border)';
    eraserBtn.style.color = erasing ? '#fff' : '';
  });

  // Clear canvas
  clearBtn.addEventListener('click', () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  // Download
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'desenho.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
})();
