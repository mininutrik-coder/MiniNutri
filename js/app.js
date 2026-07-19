/* =============================================
   APP.JS — Estado global e inicialización
   MODO SIN LOGIN: entra directo con datos de
   prueba locales (Supabase desconectado)
   ============================================= */

let appState = {
  user: null,
  child: null,
  measurements: [],
  completedToday: { diets: [], exercises: [] },
  lastActiveDay: null,
  lastMeasureDate: null,
  regGender: null,
  streak: 0
};

window.addEventListener('load', () => {
  loadState();
  setupModalListeners();

  setTimeout(() => {
    // *** MODO SIN LOGIN ***
    // Si no hay child guardado, se crea uno de prueba automáticamente
    if (!appState.child) {
      appState.user = { id: 'local-demo', name: 'Demo' };
      appState.child = {
        id: 'child-demo',
        name: 'Azael',
        age: 7,
        gender: 'male',
        lastWeight: 25,
        lastHeight: 122
      };
      appState.measurements = [{
        date: new Date().toISOString(),
        weight: 25,
        height: 122,
        bmi: calcBMIVal(25, 122).toFixed(2),
        cat: getBMICat(calcBMIVal(25, 122)).key
      }];
      saveState();
    }

    showScreen('app');
    refreshApp();
    checkTwoWeekReminder();
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