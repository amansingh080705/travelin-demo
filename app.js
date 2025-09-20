// Demo frontend logic for TravelIN
// IMPORTANT: For production, replace all simulated client-side verification with secure server-side APIs.

(function(){
  // Helpers
  function $(sel){return document.querySelector(sel)}
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

  // Simulated server data (demo only)
  // In production, call your server endpoint to fetch official RBI rates (server must be trusted).
  const demoRates = {
    "USD": 82.50,
    "EUR": 89.10,
    "GBP": 103.25,
    "AUD": 50.40,
    "CAD": 61.80,
    "JPY": 0.56
  }

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
