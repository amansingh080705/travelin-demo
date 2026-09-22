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

  function isValidFullName(name){
    return /^[A-Za-z ]+$/.test(name)
  }

  function isValidEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email)
  }

  function isValidPassportNumber(value){
    const cleaned = value.trim()
    return cleaned.length >= 4 && cleaned.length <= 9
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

  function getStoredCardState(){
    const raw = sessionStorage.getItem('travelinCardState') || localStorage.getItem('travelinCardState')
    if(!raw) return null
    try {
      const saved = JSON.parse(raw)
      return saved && saved.card && saved.userData ? saved : null
    } catch (error) {
      return null
    }
  }

  function persistCardState(card, userData){
    if(!card || !userData) return
    const payload = JSON.stringify({
      card,
      userData,
      homeCurrency: homeCurrencyInput ? homeCurrencyInput.value : ''
    })
    sessionStorage.setItem('travelinCardState', payload)
    localStorage.setItem('travelinCardState', payload)
  }

  function restoreCardState(){
    const saved = getStoredCardState()
    if(!saved) return false
    try {
      const { card, userData } = saved

      if(saved.homeCurrency && homeCurrencyInput){
        homeCurrencyInput.value = saved.homeCurrency
        homeCurrencyInput.dispatchEvent(new Event('change'))
      }

      renderCard(saved.card, saved.userData)
      return true
    } catch (error) {
      return false
    }
  }

  window.addEventListener('pageshow', () => {
    const restored = restoreCardState()
    if(!restored && !cardArea.innerHTML.trim()) {
      renderEmptyCardState()
    }
  })

  function renderEmptyCardState(){
    cardArea.innerHTML = `
      <div class="card-empty-state" aria-live="polite">
        <div class="empty-state-header">
          <span class="empty-status-pill">Awaiting verification</span>
          <span class="empty-state-chip">Temporary INR card</span>
        </div>

        <div class="empty-card-visual" aria-hidden="true">
          <div class="empty-card-topline">
            <span>TravelIN</span>
            <span>Temp • INR</span>
          </div>
          <div class="empty-card-label">Temporary Virtual Card</div>
          <div class="empty-card-number">XXXX XXXX XXXX XXXX</div>
          <div class="empty-card-footer">
            <span>Travel valid</span>
            <span>RBI demo</span>
          </div>
        </div>

        <h4>Your temporary TravelIN card is waiting to be issued</h4>
        <p>Complete visa verification to unlock your temporary virtual INR debit card for local payments, top-ups, and cash pickup while you travel.</p>

        <div class="empty-state-features">
          <span>✓ Visa review</span>
          <span>✓ Temporary card</span>
          <span>✓ Cash access</span>
        </div>
      </div>
    `
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

  document.querySelectorAll('.password-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target)
      if (!target) return
      const isPassword = target.type === 'password'
      target.type = isPassword ? 'text' : 'password'
      button.textContent = isPassword ? '🙈' : '👁'
      button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password')
    })
  })

  signupForm.addEventListener('submit', (event)=>{
    event.preventDefault()
    const name = $('#signup-name').value.trim()
    const email = $('#signup-email').value.trim().toLowerCase()
    const password = $('#signup-password').value
    if(!name || !email || !password){ setFeedback(signupFeedback, 'Please complete all fields.', true); return }
    if(!isValidFullName(name)){ setFeedback(signupFeedback, 'Full name must contain letters and spaces only.', true); return }
    if(!isValidEmail(email)){ setFeedback(signupFeedback, 'Enter a valid email address, such as name@gmail.com.', true); return }
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
    sessionStorage.removeItem('travelinCardState')
    localStorage.removeItem('travelinCardState')
    loginForm.reset()
    signupForm.reset()
    setFeedback(loginFeedback, '')
    renderEmptyCardState()
    showAuth()
    switchAuthMode('login')
  })

  // Do not auto-open the wallet on a fresh page load. The user must log in again.
  // Keeping a saved session in localStorage should not skip the authentication screen.
  function genCardNumber(){ // demo card num generator
    const a = Math.floor(1000 + Math.random()*9000)
    const b = Math.floor(1000 + Math.random()*9000)
    const c = Math.floor(1000 + Math.random()*9000)
    const d = Math.floor(1000 + Math.random()*9000)
    return `${a} ${b} ${c} ${d}`
  }

  // Elements
  const visaForm = $('#visa-form')
  const fullNameInput = $('#fullName')
  const visaNumberInput = $('#visaNumber')
  const passportInput = $('#passport')
  const feedback = $('#visa-feedback')
  const cardArea = $('#card-area')
  const virtualCardPreview = $('#virtual-card-preview')
  const convertBtn = $('#convertBtn')
  const amountInput = $('#amount')
  const convResult = $('#conv-result')
  const homeCurrencyInput = $('#homeCurrency')
  const countryInput = $('#country')
  const countryOptions = $('#country-options')
  const currencyRate = $('#currency-rate')
  const ratesStatus = $('#rates-status')

  ;[fullNameInput, visaNumberInput, passportInput].forEach((input) => {
    if (!input) return
    input.addEventListener('input', () => {
      input.value = input.value.toUpperCase()
    })
  })

  const countryNames = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
    'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
    'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
    'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica',
    'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt',
    'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon',
    'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel',
    'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
    'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi',
    'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova',
    'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
    'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
    'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
    'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania',
    'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen', 'Zambia', 'Zimbabwe'
  ]

  countryNames.forEach((countryName)=>{
    const option = document.createElement('option')
    option.value = countryName
    countryOptions.appendChild(option)
  })

  function isValidCountry(country){
    return countryNames.some((countryName) => countryName.toLowerCase() === country.trim().toLowerCase())
  }

  const countryCurrencyMap = {
    Afghanistan: 'AFN', Albania: 'ALL', Algeria: 'DZD', Andorra: 'EUR', Angola: 'AOA',
    'Antigua and Barbuda': 'XCD', Argentina: 'ARS', Armenia: 'AMD', Australia: 'AUD', Austria: 'EUR',
    Azerbaijan: 'AZN', Bahamas: 'BSD', Bahrain: 'BHD', Bangladesh: 'BDT', Barbados: 'BBD', Belarus: 'BYN',
    Belgium: 'EUR', Belize: 'BZD', Benin: 'XOF', Bhutan: 'BTN', Bolivia: 'BOB',
    'Bosnia and Herzegovina': 'BAM', Botswana: 'BWP', Brazil: 'BRL', Brunei: 'BND', Bulgaria: 'BGN',
    'Burkina Faso': 'XOF', Burundi: 'BIF', 'Cabo Verde': 'CVE', Cambodia: 'KHR', Cameroon: 'XAF',
    Canada: 'CAD', 'Central African Republic': 'XAF', Chad: 'XAF', Chile: 'CLP', China: 'CNY',
    Colombia: 'COP', Comoros: 'KMF', Congo: 'XAF', 'Costa Rica': 'CRC', Croatia: 'EUR', Cuba: 'CUP',
    Cyprus: 'EUR', Czechia: 'CZK', Denmark: 'DKK', Djibouti: 'DJF', Dominica: 'XCD',
    'Dominican Republic': 'DOP', Ecuador: 'USD', Egypt: 'EGP', 'El Salvador': 'USD',
    'Equatorial Guinea': 'XAF', Eritrea: 'ERN', Estonia: 'EUR', Eswatini: 'SZL', Ethiopia: 'ETB',
    Fiji: 'FJD', Finland: 'EUR', France: 'EUR', Gabon: 'XAF', Gambia: 'GMD', Georgia: 'GEL', Germany: 'EUR',
    Ghana: 'GHS', Greece: 'EUR', Grenada: 'XCD', Guatemala: 'GTQ', Guinea: 'GNF', 'Guinea-Bissau': 'XOF',
    Guyana: 'GYD', Haiti: 'HTG', Honduras: 'HNL', Hungary: 'HUF', Iceland: 'ISK', India: 'INR',
    Indonesia: 'IDR', Iran: 'IRR', Iraq: 'IQD', Ireland: 'EUR', Israel: 'ILS', Italy: 'EUR', Jamaica: 'JMD',
    Japan: 'JPY', Jordan: 'JOD', Kazakhstan: 'KZT', Kenya: 'KES', Kiribati: 'AUD', Kuwait: 'KWD',
    Kyrgyzstan: 'KGS', Laos: 'LAK', Latvia: 'EUR', Lebanon: 'LBP', Lesotho: 'LSL', Liberia: 'LRD',
    Libya: 'LYD', Liechtenstein: 'CHF', Lithuania: 'EUR', Luxembourg: 'EUR', Madagascar: 'MGA', Malawi: 'MWK',
    Malaysia: 'MYR', Maldives: 'MVR', Mali: 'XOF', Malta: 'EUR', 'Marshall Islands': 'USD', Mauritania: 'MRU',
    Mauritius: 'MUR', Mexico: 'MXN', Micronesia: 'USD', Moldova: 'MDL', Monaco: 'EUR', Mongolia: 'MNT',
    Montenegro: 'EUR', Morocco: 'MAD', Mozambique: 'MZN', Myanmar: 'MMK', Namibia: 'NAD', Nauru: 'AUD',
    Nepal: 'NPR', Netherlands: 'EUR', 'New Zealand': 'NZD', Nicaragua: 'NIO', Niger: 'XOF', Nigeria: 'NGN',
    'North Korea': 'KPW', 'North Macedonia': 'MKD', Norway: 'NOK', Oman: 'OMR', Pakistan: 'PKR', Palau: 'USD',
    Panama: 'USD', 'Papua New Guinea': 'PGK', Paraguay: 'PYG', Peru: 'PEN', Philippines: 'PHP', Poland: 'PLN',
    Portugal: 'EUR', Qatar: 'QAR', Romania: 'RON', Russia: 'RUB', Rwanda: 'RWF',
    'Saint Kitts and Nevis': 'XCD', 'Saint Lucia': 'XCD', 'Saint Vincent and the Grenadines': 'XCD',
    Samoa: 'WST', 'San Marino': 'EUR', 'Sao Tome and Principe': 'STN', 'Saudi Arabia': 'SAR', Senegal: 'XOF',
    Serbia: 'RSD', Seychelles: 'SCR', 'Sierra Leone': 'SLL', Singapore: 'SGD', Slovakia: 'EUR', Slovenia: 'EUR',
    'Solomon Islands': 'SBD', Somalia: 'SOS', 'South Africa': 'ZAR', 'South Korea': 'KRW', 'South Sudan': 'SSP',
    Spain: 'EUR', 'Sri Lanka': 'LKR', Sudan: 'SDG', Suriname: 'SRD', Sweden: 'SEK', Switzerland: 'CHF',
    Syria: 'SYP', Taiwan: 'TWD', Tajikistan: 'TJS', Tanzania: 'TZS', Thailand: 'THB', 'Timor-Leste': 'USD',
    Togo: 'XOF', Tonga: 'TOP', 'Trinidad and Tobago': 'TTD', Tunisia: 'TND', Turkey: 'TRY',
    Turkmenistan: 'TMT', Tuvalu: 'AUD', Uganda: 'UGX', Ukraine: 'UAH', 'United Arab Emirates': 'AED',
    'United Kingdom': 'GBP', 'United States': 'USD', Uruguay: 'UYU', Uzbekistan: 'UZS', Vanuatu: 'VUV',
    'Vatican City': 'EUR', Venezuela: 'VES', Vietnam: 'VND', Yemen: 'YER', Zambia: 'ZMW', Zimbabwe: 'USD'
  }

  function selectCurrencyForCountry(){
    const selectedCountry = countryNames.find((countryName) => countryName.toLowerCase() === countryInput.value.trim().toLowerCase())
    const currencyCode = countryCurrencyMap[selectedCountry] || 'USD'
    if(currencies.some(([code]) => code === currencyCode)){
      homeCurrencyInput.value = currencyCode
      homeCurrencyInput.dispatchEvent(new Event('change'))
    }
  }

  const currencyCatalog = [
    ['AED', 'UAE Dirham', 26.10], ['AUD', 'Australian Dollar', 62.40],
    ['AZN', 'Azerbaijani Manat', 56.30], ['BDT', 'Bangladeshi Taka', 0.88],
    ['BHD', 'Bahraini Dinar', 254.00], ['BND', 'Brunei Dollar', 70.80],
    ['BRL', 'Brazilian Real', 16.10], ['BYN', 'Belarusian Ruble', 28.90],
    ['CAD', 'Canadian Dollar', 69.90], ['CHF', 'Swiss Franc', 108.40],
    ['CNY', 'Chinese Yuan', 13.15], ['DKK', 'Danish Krone', 14.20],
    ['EGP', 'Egyptian Pound', 1.95], ['EUR', 'Euro', 103.49],
    ['GBP', 'British Pound', 117.90], ['GHS', 'Ghanaian Cedi', 6.20],
    ['HKD', 'Hong Kong Dollar', 12.20], ['IDR', 'Indonesian Rupiah', 0.0058],
    ['ILS', 'Israeli New Shekel', 25.80], ['JOD', 'Jordanian Dinar', 135.00],
    ['JPY', 'Japanese Yen', 0.64], ['KES', 'Kenyan Shilling', 0.74],
    ['KRW', 'South Korean Won', 0.071], ['KWD', 'Kuwaiti Dinar', 312.00],
    ['LKR', 'Sri Lankan Rupee', 0.29], ['MAD', 'Moroccan Dirham', 9.80],
    ['MYR', 'Malaysian Ringgit', 20.20], ['NGN', 'Nigerian Naira', 0.066],
    ['NOK', 'Norwegian Krone', 8.90], ['NZD', 'New Zealand Dollar', 57.60],
    ['OMR', 'Omani Rial', 249.00], ['PHP', 'Philippine Peso', 1.70],
    ['PKR', 'Pakistani Rupee', 0.34], ['QAR', 'Qatari Riyal', 26.30],
    ['RUB', 'Russian Ruble', 1.02], ['SAR', 'Saudi Riyal', 25.50],
    ['SEK', 'Swedish Krona', 8.90], ['SGD', 'Singapore Dollar', 70.20],
    ['THB', 'Thai Baht', 2.80], ['TND', 'Tunisian Dinar', 30.80],
    ['TRY', 'Turkish Lira', 2.50], ['TWD', 'New Taiwan Dollar', 3.10],
    ['UAH', 'Ukrainian Hryvnia', 2.35], ['UGX', 'Ugandan Shilling', 0.024],
    ['USD', 'US Dollar', 95.79], ['INR', 'Indian Rupee', 1],
    ['VND', 'Vietnamese Dong', 0.0041], ['ZAR', 'South African Rand', 5.10]
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

  countryInput.addEventListener('change', selectCurrencyForCountry)
  countryInput.addEventListener('input', ()=>{
    if(isValidCountry(countryInput.value)) selectCurrencyForCountry()
  })

  populateCurrencyOptions()
  restoreCardState()

  async function loadLiveRates(){
    ratesStatus.textContent = 'Using standard TravelIN INR rates.'
    currencies = currencyCatalog.map(([code, name, rate]) => [code, name, rate])
    Object.assign(demoRates, Object.fromEntries(currencies.map(([code, name, rate]) => [code, rate])))
    populateCurrencyOptions()
  }
  loadLiveRates()
  setInterval(loadLiveRates, 15 * 60 * 1000)

  // Render a simple virtual card preview for hero
  function showPreview(){
    virtualCardPreview.innerHTML = `
      <div class="card-placeholder" aria-hidden="true">
        <div class="preview-badge">TravelIN</div>
        <div class="preview-title">Temporary Virtual INR Debit Card</div>
        <div class="preview-number">XXXX XXXX XXXX XXXX</div>
        <div class="preview-meta">
          <span>Verified</span>
          <span>RBI-aligned</span>
        </div>
      </div>
    `
  }
  showPreview()
  renderEmptyCardState()

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
    convResult.innerHTML = `${amt} ${homeCur} → <strong>₹ ${inr} INR</strong>`
  })

  // Visa form submit (demo verification).
  visaForm.addEventListener('submit', (ev)=>{
    ev.preventDefault()
    feedback.textContent = ''
    const form = new FormData(visaForm)
    const data = Object.fromEntries(form.entries())
    data.fullName = (data.fullName || '').trim().toUpperCase()
    data.visaNumber = (data.visaNumber || '').trim().toUpperCase()
    data.passport = (data.passport || '').trim().toUpperCase()
    // naive client-side validation
    if(getStoredCardState()){
      feedback.textContent = 'The card is already generated.'
      return
    }
    if(!data.fullName || !data.visaNumber || !data.passport || !data.homeCurrency){
      feedback.textContent = 'Please fill all required fields.'
      return
    }
    if(!isValidFullName(data.fullName.trim())){
      feedback.textContent = 'Full name must contain letters and spaces only.'
      return
    }
    if(!isValidPassportNumber(data.passport)){
      feedback.textContent = 'Passport number must be between 4 and 9 characters.'
      return
    }
    if(!isValidCountry(data.country)){
      feedback.textContent = 'Please select a country from the list.'
      countryInput.focus()
      return
    }
    fullNameInput.value = data.fullName
    visaNumberInput.value = data.visaNumber
    passportInput.value = data.passport
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
      persistCardState(card, data)
      feedback.textContent = 'Card created. Ready to use (demo).'
    }, 900) // simulated latency
  })

  function renderCard(card, userData){
    persistCardState(card, userData)
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
      if(!amt || amt <= 0){
        alert('Enter a valid positive amount before topping up.')
        amountInput.value = 0
        return
      }
      const converted = amt * rate
      // In production: call server to perform the conversion, debit user externally, credit card in INR, and record transaction.
      const balanceEl = $('#card-balance')
      const newBal = (parseFloat(card.balanceINR) + converted)
      card.balanceINR = newBal
      balanceEl.textContent = `₹${newBal.toFixed(2)}`
      persistCardState(card, userData)
      amountInput.value = 0
      localStorage.removeItem('travelinLastPaymentAmount')
      alert(`Demo: Converted ${amt} ${homeCur} → ₹${converted.toFixed(2)} and loaded to card.`)
    })

    $('#pay-app').addEventListener('click', ()=>{
      const search = new URLSearchParams({
        action: 'pay',
        holder: encodeURIComponent(card.holder || ''),
        number: encodeURIComponent(card.number || ''),
        balance: String(card.balanceINR || 0),
        currency: homeCurrencyInput.value || 'INR'
      }).toString()
      window.location.href = `card-action.html?${search}`
    })

    $('#withdraw').addEventListener('click', ()=>{
      const search = new URLSearchParams({
        action: 'pickup',
        holder: encodeURIComponent(card.holder || ''),
        number: encodeURIComponent(card.number || ''),
        balance: String(card.balanceINR || 0),
        currency: homeCurrencyInput.value || 'INR'
      }).toString()
      window.location.href = `card-action.html?${search}`
    })
  }

})();
