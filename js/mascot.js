/** Cambia el mensaje de la mascota */
function setMascotMsg(msg, celebrate = false) {
  document.getElementById('mascot-bubble').textContent = msg;

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

/** Al hacer clic en la mascota, muestra un tip aleatorio */
function mascotClick() {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  setMascotMsg(tip);
}