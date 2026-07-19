function checkTwoWeekReminder() {
  if (!appState.child) return;

  const lastDate = appState.lastMeasureDate
    || appState.measurements?.[appState.measurements.length - 1]?.date;

  if (!lastDate) return;

  const daysDiff = (Date.now() - new Date(lastDate)) / 86400000;

  if (daysDiff >= 14) {
    document.getElementById('modal-msg').textContent =
      `¡Hola ${appState.child.name}! Ya pasaron 2 semanas. ¿Actualizamos tu peso y talla?`;
    document.getElementById('update-modal').classList.add('open');
  }
}

function dismissModal() {
  document.getElementById('update-modal').classList.remove('open');
  appState.lastMeasureDate = new Date(Date.now() - 86400000 * 13).toISOString();
  saveState();
}

function submitModalUpdate() {
  const w = parseFloat(document.getElementById('modal-weight').value);
  const h = parseFloat(document.getElementById('modal-height').value);

  if (!w || !h || w <= 0 || h <= 0) {
    alert('Por favor ingresa un peso y talla válidos.');
    return;
  }

  dismissModal();

  // Reusar la función de perfil
  document.getElementById('upd-weight').value = w;
  document.getElementById('upd-height').value = h;
  updateMeasurement();
}

// Preview en tiempo real en el modal
function setupModalListeners() {
  const updateModalPreview = () => {
    const w = parseFloat(document.getElementById('modal-weight').value);
    const h = parseFloat(document.getElementById('modal-height').value);
    const p = document.getElementById('modal-bmi-preview');
    if (w > 0 && h > 0) {
      const bmi = calcBMIVal(w, h);
      const cat = getBMICat(bmi);
      p.textContent = `IMC: ${bmi.toFixed(1)} — ${cat.label}`;
      p.style.color = cat.color;
    } else {
      p.textContent = 'IMC se calculará automáticamente';
      p.style.color = '';
    }
  };
  document.getElementById('modal-weight').addEventListener('input', updateModalPreview);
  document.getElementById('modal-height').addEventListener('input', updateModalPreview);
}


function showCelebration(msg) {
  document.getElementById('celebrate-msg').textContent = msg;
  document.getElementById('celebrate-modal').classList.add('open');
  setMascotMsg('¡Increíble progreso! ¡Pasaste a un nuevo nivel! ', true);
  launchConfetti();
}

function closeCelebrate() {
  document.getElementById('celebrate-modal').classList.remove('open');
  showTab('dashboard');
}

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:500';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const COLORS = ['#4CAF50', '#FF8F00', '#FFE082', '#1E88E5', '#E53935', '#ffffff'];
  const pieces = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width,
    y: -20,
    r: 6 + Math.random() * 8,
    d: 2 + Math.random() * 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    tilt: Math.random() * 10 - 5,
    tiltAngle: 0
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tiltAngle += 0.1;
      p.y += p.d;
      p.tilt = Math.sin(p.tiltAngle) * 12;
      ctx.beginPath();
      ctx.rect(p.x + p.tilt, p.y, p.r, p.r * 0.4);
      ctx.fillStyle = p.color;
      ctx.fill();
    });
    frame++;
    if (frame < 200) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}