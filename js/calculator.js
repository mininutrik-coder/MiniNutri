let calcGender = null;
let apexGaugeInstance = null;

function loadChildDataIntoCalculator() {
  if (!appState.child) return;

  const child = appState.child;
  const last = appState.measurements?.[appState.measurements.length - 1];

  const weight = child.lastWeight || last?.weight;
  const height = child.lastHeight || last?.height;
  const age = child.age;
  const gender = child.gender;

  // Guardar valores para que calcBMI los use
  calcGender = gender;

  // Mostrar en divs de solo lectura
  const genderText = gender === 'male' ? 'Niño' : gender === 'female' ? 'Niña' : '—';
  const gdisplay = document.getElementById('calc-gender-display');
  const wdisplay = document.getElementById('calc-weight-display');
  const hdisplay = document.getElementById('calc-height-display');
  const adisplay = document.getElementById('calc-age-display');

  if (gdisplay) gdisplay.textContent = genderText;
  if (wdisplay) wdisplay.textContent = weight ? `${weight} kg` : '—';
  if (hdisplay) hdisplay.textContent = height ? `${height} cm` : '—';
  if (adisplay) adisplay.textContent = age ? `${age} años` : '—';

  // Guardar valores en variables globales para calcBMI
  window._calcWeight = parseFloat(weight) || 0;
  window._calcHeight = parseFloat(height) || 0;
  window._calcAge = parseInt(age) || 0;

  renderPlanActionButton();
}

// Un solo botón que cambia según si ya se eligió una dieta o no
function renderPlanActionButton() {
  const btn = document.getElementById('btn-plan-action');
  if (!btn) return;

  if (appState.diet?.step === 'done') {
    btn.textContent = 'Ver mi plan';
    btn.onclick = goToPlan;
  } else {
    btn.textContent = 'Elegir dieta';
    btn.onclick = goToChooseDiet;
  }
}

function calcSelectGender(g) {
  calcGender = g;
}

async function calcBMI() {
  // Usar valores guardados desde loadChildDataIntoCalculator
  const w = window._calcWeight;
  const h = window._calcHeight;

  if (!w || !h || w <= 0 || h <= 0) {
    showCustomAlert('No se encontraron datos de medición. Por favor actualiza tus medidas en Perfil.', 'error');
    return;
  }

  const bmi = calcBMIVal(w, h);
  const cat = getBMICat(bmi);

  const resultEl = document.getElementById('gauge-result');
  resultEl.classList.remove('result-hidden');
  resultEl.style.display = 'block';

  document.getElementById('gauge-cat').textContent = cat.label;
  document.getElementById('gauge-cat').style.color = cat.color;
  const diff = (bmi - 20.35).toFixed(1);
  document.getElementById('gauge-diff').textContent = diff > 0
    ? `+${diff} del rango normal`
    : `${diff} del rango normal`;

  renderApexGauge(bmi, cat);
  renderPlanActionButton();

  if (appState.child) {
    const last = appState.measurements[appState.measurements.length - 1];
    if (!last || Math.abs(parseFloat(last.bmi) - bmi) > 0.5) {
      appState.measurements.push({
        date: new Date().toISOString(),
        weight: w,
        height: h,
        bmi: bmi.toFixed(2),
        cat: cat.key
      });
      saveState();

      if (appState.child.id) {
        try { await API.addMeasurement(appState.child.id, w, h); } catch (e) { /* se queda guardado localmente */ }
      }
    }
    document.getElementById('dash-bmi').textContent = bmi.toFixed(1);
    document.getElementById('dash-cat').textContent = cat.label;
    renderDashboard(cat.key);
  }

  setTimeout(() => {
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);

  setMascotMsg(`Tu IMC es ${bmi.toFixed(1)}: ${cat.label}`);
}

function renderApexGauge(bmi, cat) {
  if (apexGaugeInstance) {
    apexGaugeInstance.destroy();
    apexGaugeInstance = null;
  }
  document.getElementById('apex-gauge').innerHTML = '';

  const MIN = 15, MAX = 38;
  const clamped = Math.max(MIN, Math.min(MAX, bmi));
  const pct = Math.round(((clamped - MIN) / (MAX - MIN)) * 100);

  const options = {
    series: [pct],
    chart: {
      type: 'radialBar', height: 320,
      sparkline: { enabled: true }, background: 'transparent',
      animations: {
        enabled: true, speed: 1000,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 600 }
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -135, endAngle: 135,
        track: {
          background: '#EAF5EC', strokeWidth: '100%', margin: 4,
          dropShadow: { enabled: true, top: 2, left: 0, blur: 8, opacity: 0.08 }
        },
        dataLabels: {
          name: {
            offsetY: -15, show: true, color: '#78909C',
            fontFamily: 'Nunito, sans-serif', fontWeight: '700', fontSize: '14px',
            formatter: () => 'Tu IMC'
          },
          value: {
            formatter: () => bmi.toFixed(1), color: cat.color,
            fontFamily: 'Baloo 2, cursive', fontSize: '48px',
            fontWeight: '800', offsetY: 10, show: true
          }
        },
        hollow: {
          margin: 0, size: '65%', background: '#fff',
          dropShadow: { enabled: true, top: 3, left: 0, blur: 4, opacity: 0.06 }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light', type: 'horizontal', shadeIntensity: 0.15,
        colorStops: [
          { offset: 0, color: '#4A90D9', opacity: 1 },
          { offset: 30, color: '#4F9D6E', opacity: 1 },
          { offset: 65, color: '#FF7F59', opacity: 1 },
          { offset: 100, color: '#E2574C', opacity: 1 }
        ]
      }
    },
    stroke: { lineCap: 'round' },
    labels: ['Tu IMC']
  };

  apexGaugeInstance = new ApexCharts(document.getElementById('apex-gauge'), options);
  apexGaugeInstance.render();

  const old = document.getElementById('gauge-zone-labels');
  if (old) old.remove();

  const labels = document.createElement('div');
  labels.id = 'gauge-zone-labels';
  labels.style.cssText = `display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:4px;margin-bottom:12px;`;
  labels.innerHTML = `
 <span style="display:flex;align-items:center;gap:5px;font-size:.78rem;font-weight:700;color:#2E5F8A;font-family:Nunito,sans-serif">
 <span style="width:10px;height:10px;border-radius:50%;background:#4A90D9;display:inline-block"></span>Bajo peso
 </span>
 <span style="display:flex;align-items:center;gap:5px;font-size:.78rem;font-weight:700;color:#2F6E4A;font-family:Nunito,sans-serif">
 <span style="width:10px;height:10px;border-radius:50%;background:#4F9D6E;display:inline-block"></span>Normal
 </span>
 <span style="display:flex;align-items:center;gap:5px;font-size:.78rem;font-weight:700;color:#C1512E;font-family:Nunito,sans-serif">
 <span style="width:10px;height:10px;border-radius:50%;background:#FF7F59;display:inline-block"></span>Sobrepeso
 </span>
 <span style="display:flex;align-items:center;gap:5px;font-size:.78rem;font-weight:700;color:#A33B30;font-family:Nunito,sans-serif">
 <span style="width:10px;height:10px;border-radius:50%;background:#E2574C;display:inline-block"></span>Obesidad
 </span>
 `;
  document.getElementById('apex-gauge').insertAdjacentElement('afterend', labels);
}

function goToPlan() {
  showTab('dashboard');
}

function goToChooseDiet() {
  if (appState.diet.step === 'idle') {
    appState.diet.step = 'tier';
    saveState();
  }
  renderDashboard(getCurrentCatKey());
  showTab('dashboard');
}