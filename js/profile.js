function renderProfile() {
  if (!appState.child) return;

  document.getElementById('profile-avatar').textContent =
    appState.child.gender === 'female' ? '' : '';
  document.getElementById('profile-name').textContent = appState.child.name;

  const last = appState.measurements?.[appState.measurements.length - 1];
  if (last) {
    const cat = getBMICat(parseFloat(last.bmi));
    const badge = document.getElementById('profile-bmi-badge');
    badge.textContent = `IMC: ${parseFloat(last.bmi).toFixed(1)} — ${cat.label}`;
    badge.style.background = cat.color + '33';
    badge.style.borderColor = cat.color + '88';
  }

  updateStats();
}

function updateMeasurement() {
  const w = parseFloat(document.getElementById('upd-weight').value);
  const h = parseFloat(document.getElementById('upd-height').value);

  if (!w || !h || w <= 0 || h <= 0) {
    alert('Por favor ingresa un peso y talla válidos.');
    return;
  }

  const bmi = calcBMIVal(w, h);
  const cat = getBMICat(bmi);
  const last = appState.measurements?.[appState.measurements.length - 1];

  // Detectar si mejoró de categoría
  const improved = last && getCatLevel(cat.key) < getCatLevel(last.cat);

  // Guardar nueva medición
  appState.measurements.push({
    date: new Date().toISOString(),
    weight: w,
    height: h,
    bmi: bmi.toFixed(2),
    cat: cat.key
  });
  appState.lastMeasureDate = new Date().toISOString();
  saveState();

  // Actualizar UI
  renderProfile();
  renderProgress();
  document.getElementById('dash-bmi').textContent = bmi.toFixed(1);
  document.getElementById('dash-cat').textContent = cat.label;
  renderDashboard(cat.key);

  // Limpiar campos
  document.getElementById('upd-weight').value = '';
  document.getElementById('upd-height').value = '';

  if (improved) {
    showCelebration(`¡Pasaste a: ${cat.label}! `);
  } else {
    setMascotMsg(`IMC actualizado: ${bmi.toFixed(1)} — ${cat.label} `, true);
  }
}