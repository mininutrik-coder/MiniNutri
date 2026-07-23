function calcBMIVal(weight, height) {
  return weight / Math.pow(height / 100, 2);
}

function getBMICat(bmi) {
  if (bmi < 17.9) return { key: 'underweight', label: 'Bajo peso', color: '#4A90D9', cls: 'cat-underweight' };
  if (bmi < 22.8) return { key: 'normal', label: 'Peso normal', color: '#4F9D6E', cls: 'cat-normal' };
  if (bmi < 30) return { key: 'overweight', label: 'Sobrepeso', color: '#FF7F59', cls: 'cat-overweight' };
  return { key: 'obese', label: 'Obesidad', color: '#E2574C', cls: 'cat-obese' };
}

// Normaliza una medición que viene de la API (measured_at/category) al formato
// que usa el resto de la app (date/cat), recalculando el IMC en el cliente.
function normalizeMeasurement(m) {
  const weight = parseFloat(m.weight);
  const height = parseFloat(m.height);
  const bmi = parseFloat(m.bmi) || calcBMIVal(weight, height);
  return {
    id: m.id,
    date: m.date || m.measured_at || new Date().toISOString(),
    weight,
    height,
    bmi: bmi.toFixed(2),
    cat: getBMICat(bmi).key
  };
}

function normalizeMeasurements(arr) {
  return (arr || []).map(normalizeMeasurement);
}

function saveState() {
  localStorage.setItem('nutrikids_state', JSON.stringify(appState));
}

function loadState() {
  const s = localStorage.getItem('nutrikids_state');
  if (s) {
    try { appState = { ...appState, ...JSON.parse(s) }; } catch (e) { }
  }
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function showAlert(el, msg, type) {
  el.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
  setTimeout(() => { el.innerHTML = ''; }, 3500);
}

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
  document.getElementById('mascot-wrap').style.display = name === 'app' ? 'flex' : 'none';
}

function showTab(name) {
  const tabs = ['calculator', 'dashboard', 'progress', 'profile'];
  tabs.forEach(t => {
    document.getElementById('tab-content-' + t).classList.toggle('hidden', t !== name);
    const btn = document.getElementById('tab-' + t);
    const bBtn = document.getElementById('bnav-' + t);
    if (btn) btn.classList.toggle('active', t === name);
    if (bBtn) bBtn.classList.toggle('active', t === name);
  });
  if (name === 'progress') renderProgress();
  if (name === 'profile') renderProfile();
  if (name === 'calculator') loadChildDataIntoCalculator(); // *** CLAVE ***
}

function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('hidden');
}