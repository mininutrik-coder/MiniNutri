
async function doLogin() {
  const email = document.getElementById('login-email').value.trim()
  const pass = document.getElementById('login-pass').value
  const alert = document.getElementById('login-alert')

  if (!email || !pass) {
    showAlert(alert, 'Por favor completa todos los campos.', 'error')
    return
  }

  const { data, error } = await db
    .from('parents')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) {
    showAlert(alert, 'Correo no registrado.', 'error')
    return
  }

  if (data.password !== pass) {
    showAlert(alert, 'Contraseña incorrecta.', 'error')
    return
  }

  const { data: child } = await db
    .from('children')
    .select('*')
    .eq('parent_id', data.id)
    .single()

  const { data: measurements } = await db
    .from('measurements')
    .select('*')
    .eq('child_id', child?.id)
    .order('measured_at', { ascending: true })

  const lastM = measurements?.[measurements.length - 1]
  if (child && lastM) {
    child.lastWeight = lastM.weight
    child.lastHeight = lastM.height
  }

  appState.user = data
  appState.child = child
  appState.measurements = measurements || []
  appState.completedToday = { diets: [], exercises: [] }
  saveState()
  showScreen('app')
  refreshApp()
  checkTwoWeekReminder()
}

async function doRegister() {
  const cName = document.getElementById('c-name').value.trim()
  const cAge = document.getElementById('c-age').value
  const cWeight = parseFloat(document.getElementById('c-weight').value)
  const cHeight = parseFloat(document.getElementById('c-height').value)

  if (!cName || !cAge || !cWeight || !cHeight || !appState.regGender) {
    alert('Completa todos los datos del niño incluyendo el género.')
    return
  }

  const { data: parent, error: parentError } = await db
    .from('parents')
    .insert({
      name: document.getElementById('r-name').value.trim(),
      last_name_paterno: document.getElementById('r-lname1').value.trim(),
      last_name_materno: document.getElementById('r-lname2').value.trim(),
      phone: document.getElementById('r-phone').value,
      email: document.getElementById('r-email').value.trim(),
      password: document.getElementById('r-pass').value,
      address: document.getElementById('r-addr').value
    })
    .select()
    .single()

  if (parentError) {
    alert('Error al registrar: ' + parentError.message)
    return
  }

  const { data: child, error: childError } = await db
    .from('children')
    .insert({
      parent_id: parent.id,
      name: cName,
      age: parseInt(cAge),
      gender: appState.regGender
    })
    .select()
    .single()

  if (childError) {
    alert('Error al registrar niño: ' + childError.message)
    return
  }

  const bmi = calcBMIVal(cWeight, cHeight)
  const cat = getBMICat(bmi)

  const { data: measurement } = await db
    .from('measurements')
    .insert({
      child_id: child.id,
      weight: cWeight,
      height: cHeight,
      bmi: parseFloat(bmi.toFixed(2)),
      category: cat.key
    })
    .select()
    .single()

  child.lastWeight = cWeight
  child.lastHeight = cHeight

  appState.user = parent
  appState.child = child
  appState.measurements = [measurement]
  appState.completedToday = { diets: [], exercises: [] }
  appState.regGender = null
  saveState()
  showScreen('app')
  refreshApp()
}

function doLogout() {
  appState.user = null
  appState.child = null
  appState.completedToday = { diets: [], exercises: [] }
  saveState()
  showScreen('landing')
}

let regStep = 1

function nextStep() {
  const name = document.getElementById('r-name').value.trim()
  const email = document.getElementById('r-email').value.trim()
  const pass = document.getElementById('r-pass').value
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
  document.getElementById('step1-dot').className = 'step done'
  document.getElementById('step2-dot').className = 'step active'
  document.getElementById('step-line1').className = 'step-line done'
  regStep = 2
}

function prevStep() {
  document.getElementById('reg-step2').classList.add('hidden')
  document.getElementById('reg-step1').classList.remove('hidden')
  document.getElementById('step1-dot').className = 'step active'
  document.getElementById('step2-dot').className = 'step inactive'
  document.getElementById('step-line1').className = 'step-line'
  regStep = 1
}

function selectGender(g) {
  appState.regGender = g
  document.getElementById('gbtn-m').classList.toggle('selected', g === 'male')
  document.getElementById('gbtn-f').classList.toggle('selected', g === 'female')
}

function updateRegBMI() {
  const w = parseFloat(document.getElementById('c-weight').value)
  const h = parseFloat(document.getElementById('c-height').value)
  const prev = document.getElementById('reg-bmi-preview')
  if (w > 0 && h > 0) {
    const bmi = calcBMIVal(w, h)
    const cat = getBMICat(bmi)
    prev.style.display = 'block'
    prev.style.color = cat.color
    prev.textContent = `Tu IMC es: ${bmi.toFixed(1)} — ${cat.label}`
  }
}