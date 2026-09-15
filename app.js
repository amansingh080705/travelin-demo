// Demo frontend logic for TravelIN
// IMPORTANT: For production, replace all simulated client-side verification with secure server-side APIs.

(function(){
  // Helpers
  function $(sel){return document.querySelector(sel)}
  const authScreen = $('#auth-screen')
  const appShell = $('#app-shell')
  const loginForm = $('#login-form')
  const signupForm = $('#signup-form')
  const loginFeedback = $('#login-feedback')
  const signupFeedback = $('#signup-feedback')
  const loginTab = $('#login-tab')
  const signupTab = $('#signup-tab')
  const logoutBtn = $('#logout-btn')

  function readUsers(){
    return JSON.parse(localStorage.getItem('travelinUsers') || '[]')
  }

  function setFeedback(element, message, isError){
    element.textContent = message
    element.classList.toggle('is-error', Boolean(isError))
  }

  function showApp(user){
    authScreen.classList.add('is-hidden')
    appShell.classList.add('is-visible')
    if(user){ localStorage.setItem('travelinSession', JSON.stringify(user)) }
  }

  function showAuth(){
    authScreen.classList.remove('is-hidden')
    appShell.classList.remove('is-visible')
  }

  function switchAuthMode(mode){
    const isLogin = mode === 'login'
    loginForm.classList.toggle('is-hidden', !isLogin)
    signupForm.classList.toggle('is-hidden', isLogin)
    loginTab.classList.toggle('is-active', isLogin)
    signupTab.classList.toggle('is-active', !isLogin)
    loginTab.setAttribute('aria-selected', String(isLogin))
    signupTab.setAttribute('aria-selected', String(!isLogin))
  }

  loginTab.addEventListener('click', ()=>switchAuthMode('login'))
  signupTab.addEventListener('click', ()=>switchAuthMode('signup'))

  signupForm.addEventListener('submit', (event)=>{
    event.preventDefault()
    const name = $('#signup-name').value.trim()
    const email = $('#signup-email').value.trim().toLowerCase()
    const password = $('#signup-password').value
    if(!name || !email || !password){ setFeedback(signupFeedback, 'Please complete all fields.', true); return }
    if(password.length < 6){ setFeedback(signupFeedback, 'Your password must be at least 6 characters.', true); return }
    const users = readUsers()
    if(users.some(user => user.email === email)){ setFeedback(signupFeedback, 'An account with this email already exists. Log in instead.', true); return }
    const user = { name, email, password }
    users.push(user)
    localStorage.setItem('travelinUsers', JSON.stringify(users))
    setFeedback(signupFeedback, 'Account created. Opening your wallet...')
    setTimeout(()=>showApp(user), 450)
  })

  loginForm.addEventListener('submit', (event)=>{
    event.preventDefault()
    const email = $('#login-email').value.trim().toLowerCase()
    const password = $('#login-password').value
    const user = readUsers().find(account => account.email === email && account.password === password)
    if(!user){ setFeedback(loginFeedback, 'Email or password is incorrect.', true); return }
    setFeedback(loginFeedback, 'Logged in. Opening your wallet...')
    setTimeout(()=>showApp(user), 350)
  })

  logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('travelinSession')
    loginForm.reset()
    signupForm.reset()
    setFeedback(loginFeedback, '')
    showAuth()
    switchAuthMode('login')
  })

  const savedSession = JSON.parse(localStorage.getItem('travelinSession') || 'null')
  if(savedSession){ showApp(savedSession) }

  function genCardNumber(){ // demo card num generator
    const a = Math.floor(1000 + Math.random()*9000)
    const b = Math.floor(1000 + Math.random()*9000)
    const c = Math.floor(1000 + Math.random()*9000)
    const d = Math.floor(1000 + Math.random()*9000)
    return `${a} ${b} ${c} ${d}`
  }

  // Elements
  const visaForm = $('#visa-form')
  const feedback = $('#visa-feedback')
  const cardArea = $('#card-area')
  const virtualCardPreview = $('#virtual-card-preview')
  const convertBtn = $('#convertBtn')
  const amountInput = $('#amount')
  const convResult = $('#conv-result')
  const homeCurrencyInput = $('#homeCurrency')
  const currencyRate = $('#currency-rate')
  const ratesStatus = $('#rates-status')

  const currencyCatalog = [
    ['AED', 'UAE Dirham', 22.46], ['AUD', 'Australian Dollar', 50.40],
    ['BDT', 'Bangladeshi Taka', 0.75], ['BRL', 'Brazilian Real', 16.51],
    ['CAD', 'Canadian Dollar', 61.80], ['CHF', 'Swiss Franc', 104.62],
    ['CNY', 'Chinese Yuan', 11.55], ['DKK', 'Danish Krone', 13.82],
    ['EGP', 'Egyptian Pound', 1.72], ['EUR', 'Euro', 103.49],
    ['GBP', 'British Pound', 103.25], ['HKD', 'Hong Kong Dollar', 10.58],
    ['IDR', 'Indonesian Rupiah', 0.0052], ['ILS', 'Israeli New Shekel', 22.68],
    ['JPY', 'Japanese Yen', 0.56], ['KRW', 'South Korean Won', 0.061],
    ['LKR', 'Sri Lankan Rupee', 0.28], ['MYR', 'Malaysian Ringgit', 19.52],
    ['NOK', 'Norwegian Krone', 8.78], ['NZD', 'New Zealand Dollar', 47.08],
    ['PHP', 'Philippine Peso', 1.48], ['PKR', 'Pakistani Rupee', 0.30],
    ['QAR', 'Qatari Riyal', 22.67], ['RUB', 'Russian Ruble', 0.92],
    ['SAR', 'Saudi Riyal', 22.00], ['SEK', 'Swedish Krona', 8.98],
    ['SGD', 'Singapore Dollar', 64.40], ['THB', 'Thai Baht', 2.58],
    ['TRY', 'Turkish Lira', 2.33], ['USD', 'US Dollar', 82.50],
    ['VND', 'Vietnamese Dong', 0.0033], ['ZAR', 'South African Rand', 4.57]
  ]
  let currencies = currencyCatalog.map(([code, name, rate]) => [code, name, rate])
  const demoRates = Object.fromEntries(currencies.map(([code, name, rate]) => [code, rate]))

  function populateCurrencyOptions(){
    const selectedCurrency = homeCurrencyInput.value
    homeCurrencyInput.innerHTML = '<option value="">Select your currency</option>'
    currencies.forEach(([code, name, rate])=>{
    const option = document.createElement('option')
    option.value = code
    option.textContent = `${code} - ${name} (1 ${code} = ₹${rate} INR)`
    homeCurrencyInput.appendChild(option)
    })
    homeCurrencyInput.value = selectedCurrency
    homeCurrencyInput.dispatchEvent(new Event('change'))
  }

  homeCurrencyInput.addEventListener('change', ()=>{
    const selected = currencies.find(([code]) => code === homeCurrencyInput.value)
    currencyRate.textContent = selected
      ? `Current rate: 1 ${selected[0]} = ₹${selected[2]} INR`
      : 'Choose a currency to see its INR exchange rate.'
  })

  populateCurrencyOptions()

  async function loadLiveRates(){
    ratesStatus.textContent = 'Updating live rates...'
    try {
      const response = await fetch('/api/exchange-rates', { cache: 'no-store' })
      if(!response.ok) throw new Error('Rates request failed')
      const data = await response.json()
      const liveRates = data.rates || {}
      currencies = currencyCatalog.map(([code, name, fallbackRate]) => [code, name, liveRates[code] || fallbackRate])
      Object.assign(demoRates, Object.fromEntries(currencies.map(([code, name, rate]) => [code, rate])))
      populateCurrencyOptions()
      const updatedAt = data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'just now'
      ratesStatus.textContent = `Live rates updated ${updatedAt}`
    } catch(error) {
      ratesStatus.textContent = 'Live rates unavailable. Showing fallback demo rates.'
    }
  }
  loadLiveRates()
  setInterval(loadLiveRates, 15 * 60 * 1000)

  // Render a simple virtual card preview for hero
  function showPreview(){
    virtualCardPreview.innerHTML = `
      <div class="card-placeholder" aria-hidden="true">
        <div style="font-weight:700">TravelIN</div>
        <div style="font-size:12px;margin-top:14px">Temporary Virtual INR Debit Card</div>
        <div style="margin-top:18px;font-family:monospace;letter-spacing:2px">XXXX XXXX XXXX XXXX</div>
      </div>
    `
  }
  showPreview()

  // Conversion function (uses demoRates)
  function getRateFor(currency){
    const c = (currency||'').toUpperCase()
    // In production: fetch(`/api/exchange-rate?from=${c}&to=INR`) on the server and return official rate.
    return demoRates[c] || null
  }

  convertBtn.addEventListener('click', (e)=>{
    e.preventDefault()
    const amt = Number(amountInput.value)
    const homeCur = homeCurrencyInput.value.trim().toUpperCase()
    if(!homeCur){ convResult.textContent = 'Enter your home currency (3-letter ISO).' ; return}
    if(!amt || amt<=0){ convResult.textContent = 'Enter a valid positive amount.' ; return}
    const rate = getRateFor(homeCur)
    if(!rate){
      convResult.textContent = `No demo rate for ${homeCur}. Server must provide official rate.`
      return
    }
    const inr = (amt * rate).toFixed(2)
    convResult.innerHTML = `${amt} ${homeCur} → <strong>₹ ${inr} INR</strong> (demo rate ${rate})`
  })

  // Visa form submit (demo verification).
  visaForm.addEventListener('submit', (ev)=>{
    ev.preventDefault()
    feedback.textContent = ''
    const form = new FormData(visaForm)
    const data = Object.fromEntries(form.entries())
    // naive client-side validation
    if(!data.fullName || !data.visaNumber || !data.passport || !data.homeCurrency){
      feedback.textContent = 'Please fill all required fields.'
      return
    }
    feedback.textContent = 'Verifying visa details (demo)...'

    // Demo verification workflow:
    // - In production: POST to secure server /api/verify-visa which will: verify visa & KYC, then return success & user ID.
    // Here we simulate success and "issue" a virtual card object.
    // NOTE: never rely on client-side verification in real product.
    setTimeout(()=>{ // simulated server response
      const verified = true // demo: set to false to test rejection
      if(!verified){
        feedback.textContent = 'Verification failed. Contact support.'
        return
      }

      feedback.textContent = 'Verified. Creating temporary virtual card...'

      // Simulate card issuance
      const card = {
        holder: data.fullName,
        number: genCardNumber(),
        expiry: '12/27',
        cvv: Math.floor(100 + Math.random()*900),
        balanceINR: 0 // top-up after conversion
      }

      // Render card + actions
      renderCard(card, data)
      feedback.textContent = 'Card created. Ready to use (demo).'
    }, 900) // simulated latency
  })

  function renderCard(card, userData){
    cardArea.innerHTML = ''
    const cardEl = document.createElement('div')
    cardEl.className = 'virtual-card'
    cardEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-weight:700">TravelIN</div>
        <div style="font-size:12px">TEMP • INR</div>
      </div>
      <div class="card-meta">${userData.fullName}</div>
      <div class="card-number">${card.number}</div>
      <div style="margin-top:8px;font-size:12px">Exp: ${card.expiry} • CVV: ${card.cvv}</div>
      <div style="margin-top:16px">
        <div class="small-muted">Balance (INR): <strong id="card-balance">₹${card.balanceINR.toFixed(2)}</strong></div>
        <div class="action-buttons" style="margin-top:12px">
          <button id="pay-app" class="btn small">Pay via App</button>
          <button id="withdraw" class="btn small">Request Cash Pickup</button>
          <button id="topup" class="btn small">Top up (Convert)</button>
        </div>
      </div>
    `
    cardArea.appendChild(cardEl)

    // Hook up actions
    $('#topup').addEventListener('click', ()=>{
      // Convert demo amount from amountInput
      const homeCur = homeCurrencyInput.value.trim().toUpperCase()
      const amt = Number(amountInput.value)
      const rate = getRateFor(homeCur)
      if(!rate){
        alert('No demo rate for your currency. Server must provide official rate.')
        return
      }
      const converted = amt * rate
      // In production: call server to perform the conversion, debit user externally, credit card in INR, and record transaction.
      const balanceEl = $('#card-balance')
      const newBal = (parseFloat(card.balanceINR) + converted)
      card.balanceINR = newBal
      balanceEl.textContent = `₹${newBal.toFixed(2)}`
      alert(`Demo: Converted ${amt} ${homeCur} → ₹${converted.toFixed(2)} and loaded to card.`)
    })

    $('#pay-app').addEventListener('click', ()=>{
      // In production: initiate payment flow or card tokenization for merchant.
      alert('Demo: Pay via app flow initiated. (Integrate with payments backend / issuer.)')
    })

    $('#withdraw').addEventListener('click', ()=>{
      // In production: open withdrawal flow (select partner branch, hold/lock INR for pickup)
      alert('Demo: Withdrawal request placed. (Server to coordinate partner bank payout.)')
    })
  }

})();
