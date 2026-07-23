let bmiChartInstance = null;

function renderProgress() {
  renderProgressTable();
  renderChart();
}

function renderProgressTable() {
  const tbody = document.getElementById('progress-tbody');
  tbody.innerHTML = '';

  if (!appState.measurements || appState.measurements.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--gray);padding:24px">
 Sin mediciones aún. ¡Calcula tu IMC primero!
 </td></tr>`;
    return;
  }

  // Mostrar del más reciente al más antiguo
  [...appState.measurements].reverse().forEach(m => {
    const cat = getBMICat(parseFloat(m.bmi));
    tbody.innerHTML += `
 <tr>
 <td>${fmtDate(m.date)}</td>
 <td>${m.weight} kg</td>
 <td>${m.height} cm</td>
 <td style="font-weight:800;color:${cat.color}">${parseFloat(m.bmi).toFixed(1)}</td>
 <td><span class="cat-badge ${cat.cls}">${cat.label}</span></td>
 </tr>`;
  });
}

function renderChart() {
  const ctx = document.getElementById('bmiChart').getContext('2d');

  if (bmiChartInstance) {
    bmiChartInstance.destroy();
    bmiChartInstance = null;
  }

  if (!appState.measurements || appState.measurements.length === 0) return;

  const labels = appState.measurements.map(m => fmtDate(m.date));
  const data = appState.measurements.map(m => parseFloat(m.bmi));
  const colors = appState.measurements.map(m => getBMICat(parseFloat(m.bmi)).color);

  // Escala dinámica para que la línea nunca se salga de la gráfica,
  // sin importar qué tan alto o bajo sea el IMC (ej. obesidad severa).
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const pad = Math.max(2, (maxVal - minVal) * 0.15);
  const yMin = Math.max(0, Math.floor(minVal - pad));
  const yMax = Math.ceil(maxVal + pad);

  bmiChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'IMC',
        data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76,175,80,0.08)',
        borderWidth: 3,
        pointBackgroundColor: colors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 7,
        pointHoverRadius: 9,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `IMC: ${ctx.raw} — ${getBMICat(ctx.raw).label}`
          },
          backgroundColor: '#fff',
          titleColor: '#1B5E20',
          bodyColor: '#4E6B52',
          borderColor: '#4CAF50',
          borderWidth: 1,
          padding: 10
        }
      },
      scales: {
        y: {
          min: yMin,
          max: yMax,
          grid: { color: 'rgba(76,175,80,0.08)' },
          ticks: { font: { family: 'Nunito', weight: '700', size: 12 } }
        },
        x: {
          ticks: {
            font: { family: 'Nunito', weight: '600', size: 11 },
            maxRotation: 30
          }
        }
      }
    }
  });
}