/* =============================================
   AUTH.JS — Login y Registro usando la API
   ============================================= */

async function doLogin() {
  const email = document.getElementById('login-email').value.trim()
  const pass  = document.getElementById('login-pass').value
  const alert = document.getElementById('login-alert')

  if (!email || !pass) {
    showAlert(alert, 'Por favor completa todos los campos.', 'error')
    return
  }

  let data
  try {
    data = await API.login(email, pass)
  } catch (e) {
    showAlert(alert, 'No se pudo conectar con el servidor. Intenta de nuevo.', 'error')
    return
  }

  if (!data.ok || !data.token) {
    showAlert(alert, data.error || data.message || 'Correo o contraseña incorrectos.', 'error')
    return
  }

  // Guardar token
  localStorage.setItem('mn_token', data.token)

  appState.measurements = normalizeMeasurements(data.measurements)

  // Adjuntar última medición al child
  const lastM = appState.measurements[appState.measurements.length - 1]
  if (data.child && lastM) {
    data.child.lastWeight = lastM.weight
    data.child.lastHeight = lastM.height
  }

  appState.user           = data.parent
  appState.child          = data.child
  appState.completedToday = { diets: [], exercises: [] }
  saveState()
  showScreen('app')
  refreshApp()
  checkTwoWeekReminder()
}

async function doRegister() {
  const cName   = document.getElementById('c-name').value.trim()
  const cAge    = document.getElementById('c-age').value
  const cWeight = parseFloat(document.getElementById('c-weight').value)
  const cHeight = parseFloat(document.getElementById('c-height').value)

  if (!cName || !cAge || !cWeight || !cHeight || !appState.regGender) {
    showCustomAlert('Completa todos los datos del niño incluyendo el género.', 'error')
    return
  }

  // Nota: #reg-alert vive dentro de #reg-step1, que está oculto en este punto
  // (el envío del registro ocurre en el paso 2), por eso los errores aquí
  // usan showCustomAlert() en vez de showAlert() para que el usuario los vea.
  let data
  try {
    data = await API.register({
      name:              document.getElementById('r-name').value.trim(),
      last_name_paterno: document.getElementById('r-lname1').value.trim(),
      last_name_materno: document.getElementById('r-lname2').value.trim(),
      phone:             document.getElementById('r-phone').value,
      email:             document.getElementById('r-email').value.trim(),
      password:          document.getElementById('r-pass').value,
      address:           document.getElementById('r-addr').value,
      child_name:        cName,
      child_age:         parseInt(cAge),
      child_gender:      appState.regGender,
      child_weight:      cWeight,
      child_height:      cHeight
    })
  } catch (e) {
    showCustomAlert('No se pudo conectar con el servidor. Intenta de nuevo.', 'error')
    return
  }

  if (!data.ok || !data.token) {
    showCustomAlert(data.error || data.message || 'Error al registrar. Verifica tus datos.', 'error')
    return
  }

  // Guardar token
  localStorage.setItem('mn_token', data.token)

  appState.user  = data.parent
  appState.child = { lastWeight: cWeight, lastHeight: cHeight, ...(data.child || {}) }
  appState.measurements = data.measurements && data.measurements.length
    ? normalizeMeasurements(data.measurements)
    : [{
        date: new Date().toISOString(),
        weight: cWeight,
        height: cHeight,
        bmi: calcBMIVal(cWeight, cHeight).toFixed(2),
        cat: getBMICat(calcBMIVal(cWeight, cHeight)).key
      }]
  appState.completedToday = { diets: [], exercises: [] }
  appState.regGender      = null
  saveState()
  showScreen('app')
  refreshApp()
}

function doLogout() {
  localStorage.removeItem('mn_token')
  appState.user           = null
  appState.child          = null
  appState.measurements   = []
  appState.completedToday = { diets: [], exercises: [] }
  appState.diet           = { step: 'idle', nivelCosto: null, dieta: null, selections: {} }
  saveState()
  showScreen('landing')
}

let regStep = 1

function nextStep() {
  const name  = document.getElementById('r-name').value.trim()
  const email = document.getElementById('r-email').value.trim()
  const pass  = document.getElementById('r-pass').value
  const alert = document.getElementById('reg-alert')

  if (!name || !email || !pass) {
    showAlert(alert, 'Completa los campos obligatorios.', 'error')
    return
  }
  if (pass.length < 8) {
    showAlert(alert, 'La contraseña debe tener al menos 8 caracteres.', 'error')
    return
  }

  document.getElementById('reg-step1').classList.add('hidden')
  document.getElementById('reg-step2').classList.remove('hidden')
  document.getElementById('step1-dot').className  = 'step done'
  document.getElementById('step2-dot').className  = 'step active'
  document.getElementById('step-line1').className = 'step-line done'
  regStep = 2
}

function prevStep() {
  document.getElementById('reg-step2').classList.add('hidden')
  document.getElementById('reg-step1').classList.remove('hidden')
  document.getElementById('step1-dot').className  = 'step active'
  document.getElementById('step2-dot').className  = 'step inactive'
  document.getElementById('step-line1').className = 'step-line'
  regStep = 1
}

function selectGender(g) {
  appState.regGender = g
  document.getElementById('gbtn-m').classList.toggle('selected', g === 'male')
  document.getElementById('gbtn-f').classList.toggle('selected', g === 'female')
}

function updateRegBMI() {
  const w    = parseFloat(document.getElementById('c-weight').value)
  const h    = parseFloat(document.getElementById('c-height').value)
  const prev = document.getElementById('reg-bmi-preview')
  if (w > 0 && h > 0) {
    const bmi = calcBMIVal(w, h)
    const cat = getBMICat(bmi)
    prev.style.display = 'block'
    prev.style.color   = cat.color
    prev.textContent   = `Tu IMC es: ${bmi.toFixed(1)} — ${cat.label}`
  }
}