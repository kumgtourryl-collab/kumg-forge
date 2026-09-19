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
  msg.textContent = '';
}

toggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  setMode(mode === 'login' ? 'signup' : 'login');
});

function showMsg(text, isError){
  msg.textContent = text;
  msg.style.color = isError ? 'var(--danger)' : 'var(--green)';
}

function toast(text){
  const t = document.getElementById('toast');
  t.textContent = text;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  showMsg('');

  const email = emailEl.value.trim();
  const password = passEl.value;

  try {
    if (mode === 'signup'){
      const { data, error } = await db.auth.signUp({ email, password });
      if (error) throw error;

      // If email confirmation is ON, session is null until they confirm
      if (!data.session){
        showMsg('Check your email to confirm your account, then sign in.', false);
        setMode('login');
      } else {
        toast('Account created 🎉');
        setTimeout(()=> location.href = 'index.html', 600);
      }
    } else {
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast('Signed in ✅');
      setTimeout(()=> location.href = 'index.html', 500);
    }
  } catch (err){
    showMsg(err.message || 'Something went wrong', true);
  } finally {
    submitBtn.disabled = false;
  }
});

// If already signed in, skip this page
(async () => {
  const { data } = await db.auth.getSession();
  if (data.session) location.href = 'index.html';
})();