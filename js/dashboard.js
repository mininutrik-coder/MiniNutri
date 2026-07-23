const DIETA_SEXO_MAP = { male: 'nino', female: 'nina' };
const DIETA_ESTADO_MAP = {
  underweight: 'bajo_peso',
  normal: 'normal',
  overweight: 'sobrepeso',
  obese: 'obesidad'
};

const NIVEL_COSTO_INFO = {
  bajo: { label: 'Precio bajo', rango: '$40–60 MXN aprox.', desc: 'Alimentos económicos, fáciles de encontrar en tiendas cercanas.' },
  medio: { label: 'Precio medio', rango: '$60–100 MXN aprox.', desc: 'Un poco más de variedad, sigue siendo accesible en tiendas cercanas.' },
  alto: { label: 'Precio alto', rango: '$100–140 MXN aprox.', desc: 'Mayor variedad de alimentos, disponible en tiendas cercanas.' }
};

const DIET_SLOTS = [
  { key: 'desayuno', label: 'Desayuno' },
  { key: 'colacion_matutina', label: 'Colación matutina' },
  { key: 'comida', label: 'Comida' },
  { key: 'colacion_vespertina', label: 'Colación vespertina' },
  { key: 'cena', label: 'Cena' }
];

// Clave del objeto de la dieta -> item_type que espera la API de selections
const CATEGORY_META = {
  frutas: { itemType: 'fruta', label: 'Fruta' },
  cereales: { itemType: 'cereal', label: 'Cereal' },
  proteinas: { itemType: 'proteina', label: 'Proteína' },
  verduras: { itemType: 'verdura', label: 'Verdura' },
  grasas: { itemType: 'grasa', label: 'Grasa' },
  complemento: { itemType: 'complemento', label: 'Complemento' }
};

const ITEM_TYPE_TO_DIETA_KEY = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([dietaKey, meta]) => [meta.itemType, dietaKey])
);

function getCurrentCatKey() {
  const last = appState.measurements?.[appState.measurements.length - 1];
  return last ? getBMICat(parseFloat(last.bmi)).key : 'normal';
}

async function renderDashboard(catKey) {
  const dc = document.getElementById('diet-cards');
  const ec = document.getElementById('exercise-cards');
  if (!dc || !ec) return;

  renderExerciseCards(ec, catKey);

  if (!appState.child) {
    dc.innerHTML = '';
    return;
  }

  await renderDietSection(dc);
}

async function renderDietSection(dc) {
  if (!appState.diet) appState.diet = { step: 'idle', nivelCosto: null, dieta: null, selections: {} };
  const step = appState.diet.step;

  if (step === 'tier') return renderDietTierSelect(dc);
  if (step === 'building' && appState.diet.dieta) return renderDietBuilder(dc);
  if (step === 'done' && appState.diet.dieta) return renderDietSummary(dc);

  return renderDietIdle(dc);
}

function renderDietIdle(dc) {
  dc.innerHTML = `
    <div style="text-align:center;padding:24px 8px">
      <p style="color:var(--text-soft);font-weight:600;margin-bottom:16px">Aún no has elegido tu dieta.</p>
      <button class="btn btn-green" onclick="startDietSelection()">Elegir dieta</button>
    </div>`;
}

function startDietSelection() {
  appState.diet.step = 'tier';
  saveState();
  renderDashboard(getCurrentCatKey());
}

function renderDietTierSelect(dc) {
  if (getCurrentCatKey() === 'normal') {
    dc.innerHTML = `
      <div style="text-align:center;padding:24px 8px">
        <p style="color:var(--text-soft);font-weight:600">¡Felicidades! Tu peso está en un rango saludable.</p>
        <p style="color:var(--text-soft);font-size:.9rem">Por ahora no hay un plan de alimentación especial para tu categoría. Sigue con tus buenos hábitos.</p>
      </div>`;
    return;
  }

  let html = '<p style="font-size:.85rem;color:var(--text-soft);margin-bottom:12px">Elige el nivel de precio que más te acomode:</p>';

  Object.entries(NIVEL_COSTO_INFO).forEach(([nivel, info]) => {
    html += `
      <div class="activity-card">
        <div class="activity-name">${info.label}</div>
        <div class="activity-meta"><span class="chip">${info.rango}</span></div>
        <p style="font-size:.85rem;color:var(--text-soft);margin-bottom:10px">${info.desc}</p>
        <button class="check-btn" onclick="chooseTier('${nivel}')">Elegir este nivel</button>
      </div>`;
  });

  dc.innerHTML = html;
}

async function chooseTier(nivel) {
  const dc = document.getElementById('diet-cards');
  dc.innerHTML = '<p style="font-size:.85rem;color:var(--text-soft)">Cargando tu dieta...</p>';

  const sexo = DIETA_SEXO_MAP[appState.child.gender] || 'nino';
  const estado_nutricional = DIETA_ESTADO_MAP[getCurrentCatKey()] || 'normal';

  let res;
  try {
    res = await API.getDieta(sexo, estado_nutricional, nivel);
  } catch (e) {
    dc.innerHTML = '<p style="font-size:.85rem;color:var(--text-soft)">No se pudo cargar la dieta. Intenta de nuevo.</p>';
    return;
  }

  const dieta = res.dietas && res.dietas[0];
  if (!res.ok || !dieta) {
    dc.innerHTML = '<p style="font-size:.85rem;color:var(--text-soft)">No encontramos una dieta para ese nivel de precio.</p>';
    return;
  }

  appState.diet = { step: 'building', nivelCosto: nivel, dieta, selections: {}, estado: estado_nutricional };
  saveState();
  renderDietBuilder(dc);
}

// ¿El niño cambió de categoría de peso desde que se eligió esta dieta?
function dietNeedsUpdate() {
  if (!appState.diet?.estado) return false;
  if (appState.diet.step !== 'building' && appState.diet.step !== 'done') return false;
  const currentEstado = DIETA_ESTADO_MAP[getCurrentCatKey()] || 'normal';
  return currentEstado !== appState.diet.estado;
}

function renderDietMismatchBanner() {
  if (!dietNeedsUpdate()) return '';
  const last = appState.measurements?.[appState.measurements.length - 1];
  const label = last ? getBMICat(parseFloat(last.bmi)).label : '';
  return `
    <div class="activity-card" style="border:2px solid var(--orange);background:var(--orange-light)">
      <div class="activity-name" style="color:#C1512E">Tu categoría de peso cambió</div>
      <p style="font-size:.85rem;color:var(--text-soft);margin-bottom:10px">Ahora tu categoría es "${label}". Esta dieta ya no corresponde a tu peso actual — actualízala para seguir el plan correcto.</p>
      <button class="check-btn" onclick="resetDietForCategoryChange()">Actualizar dieta ahora</button>
    </div>`;
}

async function resetDietForCategoryChange() {
  if (appState.child?.id) {
    try { await API.clearTodaySelections(appState.child.id); } catch (e) { /* seguimos igual */ }
  }
  appState.diet = { step: 'tier', nivelCosto: null, dieta: null, selections: {} };
  saveState();
  renderDashboard(getCurrentCatKey());
}

function renderDietResumen(dieta) {
  let html = '';
  if (dieta.objetivo) {
    html += `<p style="font-size:.85rem;color:var(--text-soft);margin-bottom:8px">${dieta.objetivo}</p>`;
  }
  if (dieta.energia_kcal) {
    html += `<span class="chip" style="margin-bottom:12px;display:inline-block">${dieta.energia_kcal} kcal/día</span>`;
  }
  return html;
}

function formatAlimento(item) {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    return item.cantidad ? `${item.alimento} (${item.cantidad})` : item.alimento;
  }
  return '';
}

// Los líquidos vienen como texto libre, ej: "Leche entera: 250 mL (1 porción al día"
function parseLiquidoOption(text) {
  const match = text.match(/(\d+(?:\.\d+)?\s*(?:mL|L))/i);
  const label = text.split(':')[0].trim();
  return { alimento: label || text, cantidad: match ? match[1] : '', fullText: text };
}

function getLiquidoOptions(dieta) {
  const opts = [];
  if (dieta.liquidos?.leche) opts.push(parseLiquidoOption(dieta.liquidos.leche));
  if (dieta.liquidos?.opcional) opts.push(parseLiquidoOption(dieta.liquidos.opcional));
  return opts;
}

function renderLiquidosSection(dieta) {
  const options = getLiquidoOptions(dieta);
  if (!options.length) return '';

  const selected = appState.diet.selections?.desayuno?.liquido;

  let html = `<div class="activity-card"><div class="activity-name">Líquidos del día</div><p style="font-size:.8rem;color:var(--text-soft);margin-bottom:8px">Elige solo uno:</p><div class="gender-toggle">`;
  options.forEach((opt, i) => {
    const isSel = selected && selected.alimento === opt.alimento;
    html += `<button class="gender-btn ${isSel ? 'selected' : ''}" onclick="selectDietItem('desayuno','liquido',${i})">${opt.alimento}${opt.cantidad ? ' (' + opt.cantidad + ')' : ''}</button>`;
  });
  html += '</div>';
  if (dieta.liquidos?.agua_simple) {
    html += `<p style="font-size:.8rem;color:var(--text-soft);margin-top:8px">Agua simple recomendada: ${dieta.liquidos.agua_simple}</p>`;
  }
  html += '</div>';
  return html;
}

function renderMealSection(mealKey, label, mealData) {
  if (!mealData) return '';

  let html = `<div class="activity-card"><div class="activity-name">${label}</div>`;
  if (mealData.bebida) {
    html += `<p style="font-size:.85rem;color:var(--text-soft);margin-bottom:10px">Bebida: ${mealData.bebida}</p>`;
  }

  Object.entries(CATEGORY_META).forEach(([dietaKey, meta]) => {
    const arr = mealData[dietaKey];
    if (!arr || !arr.length) return;

    const selected = appState.diet.selections?.[mealKey]?.[meta.itemType];
    html += `<label style="display:block;font-weight:700;font-size:.86rem;margin:10px 0 6px">${meta.label}: elige uno</label><div class="gender-toggle">`;
    arr.forEach((item, i) => {
      const isSel = selected && selected.alimento === item.alimento;
      html += `<button class="gender-btn ${isSel ? 'selected' : ''}" onclick="selectDietItem('${mealKey}','${meta.itemType}',${i})">${formatAlimento(item)}</button>`;
    });
    html += '</div>';
  });

  html += '</div>';
  return html;
}

function selectDietItem(meal, itemType, index) {
  const dieta = appState.diet.dieta;
  let alimento, cantidad;

  if (itemType === 'liquido') {
    const opt = getLiquidoOptions(dieta)[index];
    if (!opt) return;
    alimento = opt.alimento;
    cantidad = opt.cantidad;
  } else {
    const dietaKey = ITEM_TYPE_TO_DIETA_KEY[itemType];
    const item = dieta[meal]?.[dietaKey]?.[index];
    if (!item) return;
    alimento = item.alimento;
    cantidad = item.cantidad;
  }

  if (!appState.diet.selections[meal]) appState.diet.selections[meal] = {};
  appState.diet.selections[meal][itemType] = { alimento, cantidad };
  saveState();

  if (appState.child?.id) {
    API.saveSelection(appState.child.id, meal, itemType, alimento, cantidad)
      .catch(() => { /* se queda guardado localmente */ });
  }

  renderDietBuilder(document.getElementById('diet-cards'));
}

function isSelectionComplete(dieta) {
  const liquidoOpts = getLiquidoOptions(dieta);
  if (liquidoOpts.length && !appState.diet.selections?.desayuno?.liquido) return false;

  return DIET_SLOTS.every(slot => {
    const mealData = dieta[slot.key];
    if (!mealData) return true;
    return Object.entries(CATEGORY_META).every(([dietaKey, meta]) => {
      const arr = mealData[dietaKey];
      if (!arr || !arr.length) return true;
      return !!appState.diet.selections?.[slot.key]?.[meta.itemType];
    });
  });
}

function renderDietBuilder(dc) {
  const dieta = appState.diet.dieta;
  if (!dieta) { renderDietIdle(dc); return; }

  let html = renderDietMismatchBanner();
  html += renderDietResumen(dieta);

  html += renderLiquidosSection(dieta);
  DIET_SLOTS.forEach(slot => { html += renderMealSection(slot.key, slot.label, dieta[slot.key]); });

  const complete = isSelectionComplete(dieta);
  html += `
    <button class="btn btn-green w-full mt-16" style="${complete ? '' : 'opacity:.5;cursor:not-allowed'}" ${complete ? '' : 'disabled'} onclick="finalizeDiet()">Guardar mi dieta</button>
    <button class="btn btn-outline w-full mt-8" onclick="resetDiet()">Cancelar y elegir otro nivel</button>`;

  dc.innerHTML = html;
}

function finalizeDiet() {
  const dieta = appState.diet.dieta;
  if (!isSelectionComplete(dieta)) {
    showCustomAlert('Elige una opción en cada categoría antes de guardar tu dieta.', 'warning');
    return;
  }

  appState.diet.step = 'done';
  if (!appState.completedToday.diets.length) {
    appState.completedToday.diets.push('plan-guardado');
    updateStats();
  }
  saveState();
  renderDashboard(getCurrentCatKey());
  setMascotMsg('¡Guardaste tu dieta de hoy! ', true);
}

function renderDietSummary(dc) {
  const dieta = appState.diet.dieta;
  if (!dieta) { renderDietIdle(dc); return; }

  let html = renderDietMismatchBanner();

  const info = NIVEL_COSTO_INFO[appState.diet.nivelCosto];
  html += info
    ? `<p style="font-size:.85rem;color:var(--text-soft);margin-bottom:6px;font-weight:700">${info.label} (${info.rango})</p>`
    : '';

  html += renderDietResumen(dieta);

  const liq = appState.diet.selections?.desayuno?.liquido;
  if (liq) {
    html += `<div class="activity-card"><div class="activity-name">Líquidos del día</div><div class="activity-meta"><span class="chip">${liq.alimento}${liq.cantidad ? ' (' + liq.cantidad + ')' : ''}</span></div></div>`;
  }

  DIET_SLOTS.forEach(slot => {
    const mealData = dieta[slot.key];
    if (!mealData) return;
    const picks = appState.diet.selections?.[slot.key] || {};

    const items = [];
    Object.values(CATEGORY_META).forEach(meta => {
      const picked = picks[meta.itemType];
      if (picked) items.push(`${meta.label}: ${picked.alimento}${picked.cantidad ? ' (' + picked.cantidad + ')' : ''}`);
    });
    if (!items.length && !mealData.bebida) return;

    const detailId = `sumdiet-${slot.key}`;
    html += `
      <div class="activity-card">
        <div class="activity-name" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="toggleCollapse('${detailId}')">
          <span>${slot.label}</span><span id="${detailId}-arrow">▸</span>
        </div>
        <div id="${detailId}" class="hidden" style="margin-top:10px">
          ${mealData.bebida ? `<p style="font-size:.8rem;color:var(--text-soft);margin-bottom:8px">Bebida: ${mealData.bebida}</p>` : ''}
          <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start">
            ${items.map(i => `<span class="chip">${i}</span>`).join('')}
          </div>
        </div>
      </div>`;
  });

  if (dieta.recomendaciones && dieta.recomendaciones.length) {
    html += `<p style="font-size:.8rem;color:var(--text-soft);margin-top:8px">${dieta.recomendaciones.join(' · ')}</p>`;
  }

  html += '<button class="btn btn-outline w-full mt-16" onclick="resetDiet()">Actualizar dieta</button>';

  dc.innerHTML = html;
}

function toggleCollapse(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isHidden = el.classList.toggle('hidden');
  const arrow = document.getElementById(id + '-arrow');
  if (arrow) arrow.textContent = isHidden ? '▸' : '▾';
}

async function resetDiet() {
  if (!confirm('¿Quieres elegir un nuevo nivel de precio? Se borrará tu selección de hoy.')) return;

  if (appState.child?.id) {
    try { await API.clearTodaySelections(appState.child.id); } catch (e) { /* seguimos igual */ }
  }

  appState.diet = { step: 'tier', nivelCosto: null, dieta: null, selections: {} };
  saveState();
  renderDashboard(getCurrentCatKey());
}

function renderExerciseCards(ec, catKey) {
  const exercises = EXERCISES[catKey] || EXERCISES.normal;
  ec.innerHTML = '';
  exercises.forEach((e, i) => {
    const done = appState.completedToday.exercises.includes(i);
    ec.innerHTML += `
      <div class="activity-card ${done ? 'done' : ''}" id="ex-${i}">
        <div class="activity-name">${e.icon} ${e.name}</div>
        <div class="activity-meta">
          <span class="chip"> ${e.duration}</span>
          <span class="chip orange"> ${e.schedule}</span>
        </div>
        <button class="check-btn" onclick="completeActivity('exercise',${i})">
          ${done ? ' ¡Hecho!' : ' ¡Lo hice!'}
        </button>
      </div>`;
  });
}

function completeActivity(type, idx) {
  const arr = type === 'diet'
    ? appState.completedToday.diets
    : appState.completedToday.exercises;

  if (arr.includes(idx)) return; // ya completado

  arr.push(idx);
  saveState();

  if (appState.child?.id) {
    API.addActivity(appState.child.id, type, idx).catch(() => { /* se queda registrado localmente */ });
  }

  const msg = CONGRATS[Math.floor(Math.random() * CONGRATS.length)];
  setMascotMsg(msg, true);

  const id = type === 'diet' ? `diet-${idx}` : `ex-${idx}`;
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('done');
    el.querySelector('.check-btn').innerHTML = type === 'diet' ? ' ¡Completado!' : ' ¡Hecho!';
  }

  updateStats();
}

function updateStats() {
  const d = appState.completedToday.diets.length;
  const e = appState.completedToday.exercises.length;
  document.getElementById('stat-diets').textContent = d;
  document.getElementById('stat-exercises').textContent = e;

  const firstDate = appState.measurements?.[0]?.date || new Date().toISOString();
  const days = Math.max(0, Math.floor((Date.now() - new Date(firstDate)) / 86400000));
  document.getElementById('stat-days').textContent = days;

  const streak = (d > 0 || e > 0) ? (appState.streak || 1) : 0;
  document.getElementById('stat-streak').textContent = streak;
}
