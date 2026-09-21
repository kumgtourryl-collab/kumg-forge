// KUMG Forge — Age verification

const ddEl   = document.getElementById('dd');
const mmEl   = document.getElementById('mm');
const yyyyEl = document.getElementById('yyyy');
const formEl = document.getElementById('dobForm');
const btnEl  = document.getElementById('submitBtn');
const msgEl  = document.getElementById('msg');

function showMsg(text, isError){
  msgEl.textContent = text || '';
  msgEl.style.color = isError ? 'var(--danger)' : 'var(--green)';
}

function toast(text){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = text;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 2200);
}

// Only digits in each field
[ddEl, mmEl, yyyyEl].forEach(el => {
  el.addEventListener('input', () => {
    el.value = el.value.replace(/[^0-9]/g, '');
  });
});

// Auto-advance between fields
ddEl.addEventListener('input', () => {
  if (ddEl.value.length === 2) mmEl.focus();
});
mmEl.addEventListener('input', () => {
  if (mmEl.value.length === 2) yyyyEl.focus();
});

// Backspace on empty field goes back
mmEl.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && !mmEl.value) ddEl.focus();
});
yyyyEl.addEventListener('keydown', (e) => {
  if (e.key === 'Backspace' && !yyyyEl.value) mmEl.focus();
});

// ---------- On submit ----------
formEl.addEventListener('submit', async (e) => {
  e.preventDefault();
  showMsg('');

  const dd = ddEl.value.trim();
  const mm = mmEl.value.trim();
  const yyyy = yyyyEl.value.trim();

  if (dd.length < 1 || mm.length < 1 || yyyy.length !== 4){
    showMsg('Please fill in Day, Month, and Year.', true);
    return;
  }

  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);

  if (month < 1 || month > 12){
    showMsg('Month must be between 1 and 12.', true);
    return;
  }
  if (day < 1 || day > 31){
    showMsg('Day must be between 1 and 31.', true);
    return;
  }

  // Build YYYY-MM-DD
  const dobStr = `${year.toString().padStart(4,'0')}-${month.toString().padStart(2,'0')}-${day.toString().padStart(2,'0')}`;
  const dobDate = new Date(dobStr + 'T00:00:00Z');

  // Real date check (catches 31 Feb, etc.)
  if (
    dobDate.getUTCDate() !== day ||
    dobDate.getUTCMonth() + 1 !== month ||
    dobDate.getUTCFullYear() !== year
  ){
    showMsg('That date does not exist. Please check and try again.', true);
    return;
  }

  // Client-side age check (server re-checks)
  const now = new Date();
  const age = Math.floor((now - dobDate) / (1000 * 60 * 60 * 24 * 365.25));
  if (age < 13){
    showMsg('You must be at least 13 years old.', true);
    return;
  }
  if (age > 120){
    showMsg('Please enter a valid date of birth.', true);
    return;
  }

  btnEl.disabled = true;

  try {
    const { data: sessionData } = await db.auth.getSession();
    if (!sessionData.session){ location.href = 'auth.html'; return; }

    const { error } = await db
      .from('profiles')
      .update({ dob: dobStr, age_verified: true })
      .eq('id', sessionData.session.user.id);

    if (error) throw error;

    toast('Age verified ✅');
    setTimeout(()=> location.href = 'index.html', 700);
  } catch (err){
    const raw = (err?.message || 'Something went wrong').toString();
    let friendly = raw;
    if (/at least 13/i.test(raw)) friendly = 'You must be at least 13 years old.';
    if (/valid date/i.test(raw)) friendly = 'Please enter a valid date of birth.';
    showMsg(friendly, true);
    btnEl.disabled = false;
  }
});

// ---------- Guard: if already verified, skip this page ----------
(async () => {
  const { data } = await db.auth.getSession();
  if (!data.session){ location.href = 'auth.html'; return; }

  const { data: profile } = await db
    .from('profiles')
    .select('dob, age_verified')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (profile?.dob){
    location.href = 'index.html';
    return;
  }

  // Focus the first field
  setTimeout(()=> ddEl.focus(), 300);
})();