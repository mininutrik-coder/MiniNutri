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

async function updateMeasurement() {
  const w = parseFloat(document.getElementById('upd-weight').value);
  const h = parseFloat(document.getElementById('upd-height').value);

  if (!w || !h || w <= 0 || h <= 0) {
    showCustomAlert('Por favor ingresa un peso y talla válidos.', 'error');
    return;
  }

  const bmi = calcBMIVal(w, h);
  const cat = getBMICat(bmi);
  const last = appState.measurements?.[appState.measurements.length - 1];
  const wasNormal = last && last.cat === 'normal';

  // Guardar nueva medición
  appState.measurements.push({
    date: new Date().toISOString(),
    weight: w,
    height: h,
    bmi: bmi.toFixed(2),
    cat: cat.key
  });
  appState.lastMeasureDate = new Date().toISOString();
  if (appState.child) {
    appState.child.lastWeight = w;
    appState.child.lastHeight = h;
  }
  saveState();

  if (appState.child?.id) {
    try { await API.addMeasurement(appState.child.id, w, h); } catch (e) { /* se queda guardado localmente */ }
  }

  // Actualizar UI
  renderProfile();
  renderProgress();
  document.getElementById('dash-bmi').textContent = bmi.toFixed(1);
  document.getElementById('dash-cat').textContent = cat.label;
  renderDashboard(cat.key);

  // Limpiar campos
  document.getElementById('upd-weight').value = '';
  document.getElementById('upd-height').value = '';

  if (cat.key === 'normal') {
    if (!wasNormal) {
      showCelebration(`¡Llegaste a un peso normal! `);
    } else {
      setMascotMsg(`IMC actualizado: ${bmi.toFixed(1)} — ${cat.label} `, true);
    }
  } else {
    showCustomAlert(`Tu nuevo IMC es ${bmi.toFixed(1)} (${cat.label}). Te recomendamos consultar a un adulto o profesional de salud.`, 'warning');
    setMascotMsg(`Tu IMC cambió a ${cat.label}. Revisa tu plan en Mi Plan.`, true);
  }
}