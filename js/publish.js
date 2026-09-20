// KUMG Forge — Publish page logic
// IMPORTANT: change this to your Render URL after deploy
const PUBLISH_API = 'https://kumg-forge-server.onrender.com';

let project = null;
let userId = null;

const projNameEl  = document.getElementById('projName');
const subInput    = document.getElementById('subInput');
const statusLine  = document.getElementById('statusLine');
const publishBtn  = document.getElementById('publishBtn');
const liveBox     = document.getElementById('liveBox');
const liveUrl     = document.getElementById('liveUrl');
const copyBtn     = document.getElementById('copyBtn');
const openBtn     = document.getElementById('openBtn');
const unpublishBtn = document.getElementById('unpublishBtn');

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 2200);
}

function setStatus(text, cls){
  statusLine.textContent = text || '';
  statusLine.className = 'status-line ' + (cls || '');
}

function showLive(sub){
  liveBox.classList.add('show');
  const url = `https://${sub}.kumg.app`;
  liveUrl.textContent = url;
  liveUrl.href = url;
}

async function init(){
  const { data } = await db.auth.getSession();
  if (!data.session){ location.href = 'auth.html'; return; }
  userId = data.session.user.id;

  const id = new URLSearchParams(location.search).get('id');
  if (!id){ location.href = 'index.html'; return; }

  try {
    project = await getProject(id);
  } catch(err){
    toast('Project not found');
    setTimeout(()=> location.href = 'index.html', 900);
    return;
  }

  projNameEl.textContent = project.name;

  // Suggest a default subdomain
  if (project.subdomain){
    subInput.value = project.subdomain;
    showLive(project.subdomain);
    publishBtn.textContent = 'Update publish';
  } else {
    subInput.value = slugify(project.name);
  }
}

function slugify(str){
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30) || 'mysite';
}

subInput.addEventListener('input', () => {
  subInput.value = subInput.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  setStatus('');
});

publishBtn.addEventListener('click', async () => {
  const sub = subInput.value.trim();
  if (sub.length < 3){ setStatus('At least 3 characters.', 'err'); return; }

  publishBtn.disabled = true;
  setStatus('Publishing…');

  try {
    const res = await fetch(PUBLISH_API + '/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, subdomain: sub, userId })
    });
    const json = await res.json();

    if (!res.ok){
      if (json.upgrade){
        setStatus('Free plan allows 1 published site. Upgrade to Pro.', 'err');
      } else {
        setStatus(json.error || 'Publish failed.', 'err');
      }
      return;
    }

    setStatus('Live ✅', 'ok');
    showLive(sub);
    toast('Published 🎉');
    publishBtn.textContent = 'Update publish';
  } catch(err){
    console.error(err);
    setStatus('Network error. Try again.', 'err');
  } finally {
    publishBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(liveUrl.href);
    toast('Link copied');
  } catch {
    toast('Copy failed');
  }
});

openBtn.addEventListener('click', () => {
  window.open(liveUrl.href, '_blank');
});

unpublishBtn.addEventListener('click', async () => {
  if (!confirm('Take this site offline?')) return;
  try {
    const res = await fetch(PUBLISH_API + '/api/unpublish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, userId })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed');
    liveBox.classList.remove('show');
    setStatus('Unpublished.', '');
    toast('Site unpublished');
    publishBtn.textContent = 'Publish';
  } catch(err){
    toast(err.message || 'Failed');
  }
});

init();
