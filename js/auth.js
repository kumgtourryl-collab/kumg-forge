// KUMG Forge — Auth logic

const form = document.getElementById('authForm');
const emailEl = document.getElementById('email');
const passEl = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');
const title = document.getElementById('title');
const sub = document.getElementById('sub');
const toggleText = document.getElementById('toggleText');
const toggleLink = document.getElementById('toggleLink');
const msg = document.getElementById('msg');

let mode = 'login'; // or 'signup'

function setMode(next){
  mode = next;
  if (mode === 'login'){
    title.textContent = 'Welcome back';
    sub.textContent = 'Sign in to continue building.';
    submitBtn.textContent = 'Sign in';
    toggleText.textContent = 'No account yet?';
    toggleLink.textContent = 'Create one';
    passEl.setAttribute('autocomplete','current-password');
  } else {
    title.textContent = 'Create your account';
    sub.textContent = 'Start building the web from your pocket.';
    submitBtn.textContent = 'Create account';
    toggleText.textContent = 'Already have an account?';
    toggleLink.textContent = 'Sign in';
    passEl.setAttribute('autocomplete','new-password');
  }
  showMsg('');
}

toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  setMode(mode === 'login' ? 'signup' : 'login');
});

function showMsg(text, isError){
  msg.textContent = text || '';
  msg.style.color = isError ? 'var(--danger)' : 'var(--green)';
}

function toast(text){
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = text;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  showMsg('');

  const email = emailEl.value.trim().toLowerCase();
  const password = passEl.value;

  // Quick client-side validation
  if (!email || !email.includes('@')){
    showMsg('Please enter a valid email.', true);
    submitBtn.disabled = false;
    return;
  }
  if (password.length < 6){
    showMsg('Password must be at least 6 characters.', true);
    submitBtn.disabled = false;
    return;
  }

  try {
    if (mode === 'signup'){
      const { data, error } = await db.auth.signUp({ email, password });
      if (error) throw error;

      // Supabase returns a user with empty identities if the email is already
      // registered (when confirm-email is on).
      const identities = data?.user?.identities;
      if (data?.user && Array.isArray(identities) && identities.length === 0){
        throw new Error('This email is already registered. Try signing in instead.');
      }

      if (!data.session){
        // Email confirmation is ON — user must confirm via link
        showMsg('Check your email to confirm your account, then sign in.', false);
        setMode('login');
      } else {
        toast('Account created 🎉');
        setTimeout(()=> location.href = 'index.html', 700);
      }
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast('Signed in ✅');
      setTimeout(()=> location.href = 'index.html', 500);
    }
  } catch (err){
    const raw = (err?.message || 'Something went wrong').toString();

    // Friendly error mapping
    let friendly = raw;
    if (/invalid login credentials/i.test(raw)){
      friendly = 'Wrong email or password.';
    } else if (/email not confirmed/i.test(raw)){
      friendly = 'Please confirm your email first — check your inbox.';
    } else if (/user already registered/i.test(raw)){
      friendly = 'This email is already registered. Try signing in.';
    } else if (/password should be/i.test(raw)){
      friendly = 'Password is too short. Use at least 6 characters.';
    } else if (/rate limit/i.test(raw)){
      friendly = 'Too many attempts. Wait a minute and try again.';
    } else if (/network/i.test(raw)){
      friendly = 'Network error. Check your internet and try again.';
    }

    showMsg(friendly, true);
  } finally {
    submitBtn.disabled = false;
  }
});

// If already signed in, skip this page
(async () => {
  const { data } = await db.auth.getSession();
  if (data.session) location.href = 'index.html';
})();