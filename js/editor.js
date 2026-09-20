// KUMG Forge — Editor

let project = null;
let currentTab = 'html';
let saveTimer = null;
let previewTimer = null;
let dirty = false;

const editorEl   = document.getElementById('editor');
const previewEl  = document.getElementById('preview');
const nameEl     = document.getElementById('nameInput');
const statusEl   = document.getElementById('saveStatus');
const tabBtns    = document.querySelectorAll('.tab-btn');
const bodyEl     = document.body;

async function initEditor(){
  const { data } = await db.auth.getSession();
  if (!data.session){ location.href = 'auth.html'; return; }

  const id = new URLSearchParams(location.search).get('id');
  if (!id){ location.href = 'index.html'; return; }

  try {
    project = await getProject(id);
  } catch(err){
    toast('Project not found');
    setTimeout(()=> location.href = 'index.html', 900);
    return;
  }

  nameEl.value = project.name;
  editorEl.value = project[currentTab] || '';
  setStatus('Saved', 'saved');
  updatePreview();
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    project[currentTab] = editorEl.value;
    currentTab = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.toggle('active', b === btn));
    editorEl.value = project[currentTab] || '';
    editorEl.placeholder = placeholderFor(currentTab);
  });
});

function placeholderFor(tab){
  if (tab === 'html') return '<!-- Your HTML here -->';
  if (tab === 'css')  return '/* Your CSS here */';
  return '// Your JavaScript here';
}

editorEl.addEventListener('input', () => {
  project[currentTab] = editorEl.value;
  markDirty();
});

nameEl.addEventListener('input', () => {
  project.name = nameEl.value;
  markDirty();
});

function markDirty(){
  if (!dirty){
    dirty = true;
    setStatus('Unsaved', 'dirty');
  }
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 1500);
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 400);
}

async function saveNow(){
  if (!dirty || !project) return;
  setStatus('Saving…', 'saving');
  try {
    await updateProject(project.id, {
      name: (nameEl.value.trim() || 'Untitled'),
      html: project.html || '',
      css:  project.css  || '',
      js:   project.js   || ''
    });
    dirty = false;
    setStatus('Saved', 'saved');
  } catch(err){
    console.error(err);
    setStatus('Save failed', 'error');
  }
}

function buildPreviewDoc(){
  let html = project.html || '';
  const css = project.css || '';
  const js  = project.js  || '';

  if (css.trim()){
    const style = '<style>' + css + '</style>';
    if (html.includes('</head>')) html = html.replace('</head>', style + '</head>');
    else html = style + html;
  }
  if (js.trim()){
    const script = '<script>' + js + '<\/script>';
    if (html.includes('</body>')) html = html.replace('</body>', script + '</body>');
    else html = html + script;
  }
  return html;
}

function updatePreview(){
  previewEl.srcdoc = buildPreviewDoc();
}

function setStatus(text, cls){
  statusEl.textContent = text;
  statusEl.className = 'save-status ' + (cls || '');
}

const previewToggle = document.getElementById('previewToggle');
if (previewToggle){
  previewToggle.addEventListener('click', () => {
    bodyEl.classList.toggle('preview-on');
    previewToggle.textContent = bodyEl.classList.contains('preview-on') ? 'Code' : 'Preview';
    if (bodyEl.classList.contains('preview-on')) updatePreview();
  });
}

// Tools button — remember project to return to
document.getElementById('toolsBtn').addEventListener('click', async () => {
  await saveNow();
  location.href = 'tools.html?return=' + encodeURIComponent(project.id);
});

document.getElementById('backBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await saveNow();
  location.href = 'index.html';
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  await saveNow();
  toast('Saved');
});

// Download as standalone HTML
document.getElementById('downloadBtn')?.addEventListener('click', async () => {
  await saveNow();
  const html = buildPreviewDoc();
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (nameEl.value.trim() || 'project').replace(/[^a-z0-9-_]/gi,'_') + '.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=> URL.revokeObjectURL(url), 1000);
  toast('Downloaded');
});

document.getElementById('publishBtn').addEventListener('click', async () => {
  await saveNow();
  location.href = 'publish.html?id=' + project.id;
});

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 2200);
}

window.addEventListener('beforeunload', (e) => {
  if (dirty){ e.preventDefault(); e.returnValue = ''; }
});

initEditor();
