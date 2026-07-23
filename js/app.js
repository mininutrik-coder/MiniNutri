/* =============================================
   APP.JS — Estado global e inicialización
   La sesión se restaura solo si hay un token real
   guardado de un login/registro previo contra la API.
   ============================================= */

let appState = {
  user: null,
  child: null,
  measurements: [],
  completedToday: { diets: [], exercises: [] },
  lastActiveDay: null,
  lastMeasureDate: null,
  regGender: null,
  streak: 0,
  diet: { step: 'idle', nivelCosto: null, dieta: null, selections: {} }
};

window.addEventListener('load', () => {
  loadState();
  setupModalListeners();

  setTimeout(() => {
    const hasSession = !!localStorage.getItem('mn_token') && !!appState.child;

    if (hasSession) {
      showScreen('app');
      refreshApp();
      checkTwoWeekReminder();
    } else {
      localStorage.removeItem('mn_token');
      appState.user = null;
      appState.child = null;
      appState.measurements = [];
      saveState();
      showScreen('landing');
    }
  }, 1200);
});

function refreshApp() {
  if (!appState.child) return;

  const child = appState.child;
  const last = appState.measurements?.[appState.measurements.length - 1];
  const catKey = last ? last.cat : 'normal';

  document.getElementById('dash-welcome').textContent = `¡Hola, ${child.name}! `;
  document.getElementById('dash-subtitle').textContent = 'Aquí está tu plan de hoy';

  if (last) {
    const cat = getBMICat(parseFloat(last.bmi));
    document.getElementById('dash-bmi').textContent = parseFloat(last.bmi).toFixed(1);
    document.getElementById('dash-cat').textContent = cat.label;
  }

  const today = new Date().toDateString();
  if (appState.lastActiveDay !== today) {
    appState.completedToday = { diets: [], exercises: [] };
    appState.lastActiveDay = today;
    saveState();
  }

  renderDashboard(catKey);
  updateStats();
  renderProfile();

  showTab('calculator');
  loadChildDataIntoCalculator();
  setMascotMsg(`¡Hola ${child.name}! Soy Mini, tu amigo saludable`);
}