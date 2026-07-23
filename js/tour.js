/* =============================================
   TOUR.JS — Tutorial de bienvenida (spotlight)
   Se muestra una sola vez por cuenta, la primera
   vez que la persona entra a la app.
   ============================================= */

const TOUR_STEPS = [
  {
    beforeShow: () => showTab('calculator'),
    target: () => window.innerWidth <= 768 ? '#bnav-calculator' : '#tab-calculator',
    title: 'Calcula tu IMC',
    text: 'Aquí calculas tu Índice de Masa Corporal con tu peso y talla más reciente.'
  },
  {
    beforeShow: () => showTab('calculator'),
    target: () => '#btn-calc-imc',
    title: 'Calcular mi IMC',
    text: 'Presiona este botón para calcular tu IMC. Al terminar, verás un botón para elegir tu dieta.'
  },
  {
    beforeShow: () => showTab('calculator'),
    target: () => '#btn-ver-mi-plan',
    title: 'Ver mi plan',
    text: 'Este botón te lleva directo a la pestaña Mi Plan.'
  },
  {
    beforeShow: () => showTab('dashboard'),
    target: () => window.innerWidth <= 768 ? '#bnav-dashboard' : '#tab-dashboard',
    title: 'Mi Plan',
    text: 'Elige tu dieta paso a paso y revisa los ejercicios recomendados para ti.'
  },
  {
    beforeShow: () => showTab('dashboard'),
    target: () => '#btn-elegir-dieta-plan',
    title: 'Elige tu dieta',
    text: 'Toca aquí para elegir el nivel de precio y armar tu dieta del día.'
  },
  {
    beforeShow: () => showTab('progress'),
    target: () => window.innerWidth <= 768 ? '#bnav-progress' : '#tab-progress',
    title: 'Progreso',
    text: 'Aquí puedes ver cómo ha cambiado tu IMC a lo largo del tiempo.'
  },
  {
    beforeShow: () => showTab('profile'),
    target: () => window.innerWidth <= 768 ? '#bnav-profile' : '#tab-profile',
    title: 'Perfil',
    text: 'Aquí ves tus logros y estadísticas.'
  },
  {
    beforeShow: () => showTab('profile'),
    target: () => '#btn-actualizar-medidas',
    title: 'Actualiza tus medidas',
    text: 'Cuando cambien tu peso o talla, actualízalos aquí para mantener tu IMC al día.'
  },
  {
    target: () => '.mascot-body',
    title: 'Mini, tu amigo',
    text: 'Tócame cuando quieras un consejo de salud. ¡Siempre estoy aquí para ayudarte!'
  }
];

let tourStepIndex = 0;
let tourEls = null;

function getOnboardedIds() {
  try { return JSON.parse(localStorage.getItem('mn_onboarded_ids') || '[]'); } catch (e) { return []; }
}

function markOnboarded(id) {
  if (!id) return;
  const ids = getOnboardedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem('mn_onboarded_ids', JSON.stringify(ids));
  }
}

function maybeStartTour() {
  const id = appState.user?.id;
  if (!id || getOnboardedIds().includes(id)) return;
  setTimeout(startTour, 900);
}

function startTour() {
  tourStepIndex = 0;
  buildTourOverlay();
  showTourStep();
}

function buildTourOverlay() {
  if (document.getElementById('tour-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'tour-overlay';
  overlay.className = 'tour-overlay';
  overlay.addEventListener('click', () => nextTourStep());

  const spotlight = document.createElement('div');
  spotlight.id = 'tour-spotlight';
  spotlight.className = 'tour-spotlight';

  const tooltipWrap = document.createElement('div');
  tooltipWrap.id = 'tour-tooltip-wrap';
  tooltipWrap.className = 'tour-tooltip-wrap';
  tooltipWrap.addEventListener('click', e => e.stopPropagation());
  tooltipWrap.innerHTML = `
    <img src="./assets/MascotaMiniNutri.png" alt="Mini" class="tour-mascot-img">
    <div class="tour-tooltip" id="tour-tooltip">
      <div class="tour-tooltip-title" id="tour-title"></div>
      <p class="tour-tooltip-text" id="tour-text"></p>
      <div class="tour-tooltip-footer">
        <span class="tour-progress" id="tour-progress"></span>
        <div class="tour-tooltip-actions">
          <button class="tour-btn tour-btn-skip" id="tour-skip">Saltar</button>
          <button class="tour-btn tour-btn-next" id="tour-next">Siguiente</button>
        </div>
      </div>
    </div>`;

  overlay.appendChild(spotlight);
  overlay.appendChild(tooltipWrap);
  document.body.appendChild(overlay);

  document.getElementById('tour-skip').addEventListener('click', e => { e.stopPropagation(); endTour(); });
  document.getElementById('tour-next').addEventListener('click', e => { e.stopPropagation(); nextTourStep(); });
  window.addEventListener('resize', repositionTour);

  tourEls = { overlay, spotlight, tooltipWrap };
}

function nextTourStep() {
  tourStepIndex++;
  if (tourStepIndex >= TOUR_STEPS.length) {
    endTour();
    return;
  }
  showTourStep();
}

function showTourStep() {
  const step = TOUR_STEPS[tourStepIndex];
  if (step.beforeShow) step.beforeShow();

  // Pequeña espera para que el cambio de pestaña se refleje en el layout
  setTimeout(() => {
    const el = document.querySelector(step.target());

    if (!el) { nextTourStep(); return; }

    document.getElementById('tour-title').textContent = step.title;
    document.getElementById('tour-text').textContent = step.text;
    document.getElementById('tour-progress').textContent = `${tourStepIndex + 1} de ${TOUR_STEPS.length}`;
    document.getElementById('tour-next').textContent = tourStepIndex === TOUR_STEPS.length - 1 ? '¡Listo!' : 'Siguiente';

    positionTourAround(el);
  }, step.beforeShow ? 150 : 0);
}

function positionTourAround(el) {
  if (!tourEls) return;
  const rect = el.getBoundingClientRect();
  const pad = 8;
  const { spotlight, tooltipWrap } = tourEls;

  spotlight.style.top = `${rect.top - pad}px`;
  spotlight.style.left = `${rect.left - pad}px`;
  spotlight.style.width = `${rect.width + pad * 2}px`;
  spotlight.style.height = `${rect.height + pad * 2}px`;

  const mascotSpace = window.innerWidth <= 480 ? 0 : 84; // en pantallas muy angostas se apila arriba
  const ttWidth = Math.min(260, window.innerWidth - 24 - mascotSpace);
  const wrapWidth = ttWidth + mascotSpace;
  let top = rect.bottom + 16;

  if (top + 160 > window.innerHeight) {
    top = Math.max(12, rect.top - 160);
  }

  let left = rect.left + rect.width / 2 - wrapWidth / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - wrapWidth - 12));

  tooltipWrap.style.top = `${top}px`;
  tooltipWrap.style.left = `${left}px`;
  tooltipWrap.style.flexDirection = mascotSpace ? 'row' : 'column';
  tooltipWrap.style.alignItems = mascotSpace ? 'flex-end' : 'center';
  tooltipWrap.querySelector('.tour-tooltip').style.width = `${ttWidth}px`;
}

function repositionTour() {
  if (!tourEls) return;
  const step = TOUR_STEPS[tourStepIndex];
  const el = document.querySelector(step.target());
  if (el) positionTourAround(el);
}

function endTour() {
  markOnboarded(appState.user?.id);
  window.removeEventListener('resize', repositionTour);
  tourEls?.overlay.remove();
  tourEls = null;
}
