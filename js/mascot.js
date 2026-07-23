const MASCOT_SHOW_MS = 7000;
const MASCOT_HIDE_MS = 15000;
let mascotCycleTimer = null;

/** Cambia el mensaje de la mascota y reinicia su ciclo de mostrar/ocultar */
function setMascotMsg(msg, celebrate = false) {
  document.getElementById('mascot-bubble').textContent = msg;
  showMascotBubble();
  restartMascotCycle();

  if (celebrate) {
    const body = document.querySelector('.mascot-body');
    body.style.animation = 'none';
    // Forzar reflow para reiniciar animación
    void body.offsetWidth;
    body.style.animation = 'celebrate .5s ease 3';
    setTimeout(() => {
      body.style.animation = 'mascotIdle 3s ease-in-out infinite';
    }, 1600);
  }
}

function showMascotBubble() {
  document.getElementById('mascot-bubble').classList.remove('mascot-bubble-hidden');
}

function hideMascotBubble() {
  document.getElementById('mascot-bubble').classList.add('mascot-bubble-hidden');
}

function restartMascotCycle() {
  clearTimeout(mascotCycleTimer);

  mascotCycleTimer = setTimeout(() => {
    hideMascotBubble();
    mascotCycleTimer = setTimeout(() => {
      showMascotBubble();
      restartMascotCycle(); // repite el mismo mensaje hasta que llegue uno nuevo
    }, MASCOT_HIDE_MS);
  }, MASCOT_SHOW_MS);
}

/** Al hacer clic en la mascota, muestra un tip aleatorio de inmediato */
function mascotClick() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  setMascotMsg(tip);
}
