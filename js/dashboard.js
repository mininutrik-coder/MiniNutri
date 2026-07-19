function renderDashboard(catKey) {
 /* COMENTADO — tarjetas de dietas y ejercicios desactivadas temporalmente
 const diets = DIETS[catKey] || DIETS.normal;
 const exercises = EXERCISES[catKey] || EXERCISES.normal;
 const dc = document.getElementById('diet-cards');
 const ec = document.getElementById('exercise-cards');
 dc.innerHTML = '';
 ec.innerHTML = '';

 diets.forEach((d, i) => {
 const done = appState.completedToday.diets.includes(i);
 dc.innerHTML += `
 <div class="activity-card ${done ? 'done' : ''}" id="diet-${i}">
 <div class="activity-name">${d.icon} ${d.name}</div>
 <div class="activity-meta">
 ${d.slots.map(s => `<span class="chip">${s}</span>`).join('')}
 </div>
 <p style="font-size:.85rem;color:var(--text-soft);margin-bottom:10px">${d.desc}</p>
 <button class="check-btn" onclick="completeActivity('diet',${i})">
 ${done ? ' ¡Completado!' : ' ¡Lo completé hoy!'}
 </button>
 </div>`;
 });

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
 */
}

function completeActivity(type, idx) {
 const arr = type === 'diet'
 ? appState.completedToday.diets
 : appState.completedToday.exercises;

 if (arr.includes(idx)) return; // ya completado

 arr.push(idx);
 saveState();

 const msg = CONGRATS[Math.floor(Math.random() * CONGRATS.length)];
 setMascotMsg(msg, true);

 // Actualizar card visualmente
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