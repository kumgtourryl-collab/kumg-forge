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

// ---------- INIT ----------
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

// ---------- TABS ----------
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Save current tab's value into project
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

// ---------- EDIT ----------
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
  // Debounced save — 1.5s after typing stops
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 1500);
  // Preview — 400ms after typing stops
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updatePreview, 400);
}

// ---------- SAVE ----------
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

// ---------- PREVIEW ----------
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

// ---------- STATUS ----------
function setStatus(text, cls){
  statusEl.textContent = text;
  statusEl.className = 'save-status ' + (cls || '');
}

// ---------- MOBILE PREVIEW TOGGLE ----------
const previewToggle = document.getElementById('previewToggle');
if (previewToggle){
  previewToggle.addEventListener('click', () => {
    bodyEl.classList.toggle('preview-on');
    previewToggle.textContent = bodyEl.classList.contains('preview-on') ? 'Code' : 'Preview';
    if (bodyEl.classList.contains('preview-on')) updatePreview();
  });
}

// ---------- BUTTONS ----------
document.getElementById('backBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  await saveNow();
  location.href = 'index.html';
});

document.getElementById('saveBtn').addEventListener('click', async () => {
  await saveNow();
  toast('Saved');
});

document.getElementById('publishBtn').addEventListener('click', async () => {
  await saveNow();
  location.href = 'publish.html?id=' + project.id;
});

// ---------- TOAST ----------
function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 2200);
}

// ---------- WARN ON LEAVE ----------
window.addEventListener('beforeunload', (e) => {
  if (dirty){ e.preventDefault(); e.returnValue = ''; }
});

// ---------- GO ----------
initEditor();
