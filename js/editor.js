// KUMG Forge — Editor

let project = null;
let currentTab = 'html';
let saveTimer = null;
let previewTimer = null;
let dirty = false;
let vvCleanup = null;

const editorEl   = document.getElementById('editor');
const previewEl  = document.getElementById('preview');
const nameEl     = document.getElementById('nameInput');
const statusEl   = document.getElementById('saveStatus');
const tabBtns    = document.querySelectorAll('.tab-btn');
const bodyEl     = document.body;
const codeKeysEl = document.getElementById('codeKeys');
const ckScrollEl = document.getElementById('ckScroll');

// ===== CODE KEYS =====
const KEY_SETS = {
  html: [
    '<', '>', '/', '</', '/>', '=', '"', "'", '&', ';',
    ':', '#', '<br>', '<div></div>', '<p></p>',
    '<a href=""></a>', '<img src="" alt="">', '<!-- -->'
  ],
  css: [
    '{', '}', ':', ';', '.', '#', '(', ')', '"', "'",
    'px', 'em', 'rem', '%', ':hover', '@media', '!important'
  ],
  js: [
    '(', ')', '{', '}', '[', ']', ';', '=', '=>', '"',
    "'", '`', 'const ', 'let ', 'console.log()',
    'function ', 'return '
  ]
};

function escapeHtmlKey(s){
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

function renderKeys(){
  const keys = KEY_SETS[currentTab] || KEY_SETS.html;
  ckScrollEl.innerHTML = keys.map(k =>
    `<button class="ck-key" data-insert="${encodeURIComponent(k)}" type="button">${escapeHtmlKey(k)}</button>`
  ).join('');

  ckScrollEl.querySelectorAll('.ck-key').forEach(btn => {
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      btn.classList.add('pressed');
      insertAtCursor(decodeURIComponent(btn.dataset.insert));
    });
    btn.addEventListener('pointerup', () => btn.classList.remove('pressed'));
    btn.addEventListener('pointercancel', () => btn.classList.remove('pressed'));
    btn.addEventListener('pointerleave', () => btn.classList.remove('pressed'));
  });
}

function insertAtCursor(text){
  const start = editorEl.selectionStart ?? 0;
  const end   = editorEl.selectionEnd   ?? 0;
  const val   = editorEl.value;
  const before = val.slice(0, start);
  const after  = val.slice(end);
  editorEl.value = before + text + after;

  let caret = start + text.length;
  const pairs = [
    ['<div></div>', '<div>'.length],
    ['<p></p>', '<p>'.length],
    ['<a href=""></a>', '<a href="'.length],
    ['<img src="" alt="">', '<img src="'.length],
    ['console.log()', 'console.log('.length],
    ['<!-- -->', '<!-- '.length],
    ['()', 1], ['[]', 1], ['{}', 1], ['""', 1], ["''", 1]
  ];
  for (const [pattern, offset] of pairs){
    if (text === pattern){ caret = start + offset; break; }
  }

  editorEl.focus();
  editorEl.setSelectionRange(caret, caret);

  project[currentTab] = editorEl.value;
  markDirty();
}

function showKeys(on){
  if (window.innerWidth >= 820) return;
  codeKeysEl.classList.toggle('show', on);
}

// ===== GLUE CODE-KEYS TO KEYBOARD =====
function pinKeys(){
  if (!window.visualViewport) return;
  const vv = window.visualViewport;

  const update = () => {
    const visibleBottom = vv.height + vv.offsetTop;
    const kb = Math.max(0, window.innerHeight - visibleBottom);
    codeKeysEl.style.transform = `translate3d(0, -${kb}px, 0)`;
    editorEl.style.paddingBottom = (70 + kb) + 'px';
  };

  vv.addEventListener('resize', update);
  vv.addEventListener('scroll', update);
  window.addEventListener('orientationchange', update);

  // Settle loop for keyboard open animation
  let settleCount = 0;
  const settle = setInterval(() => {
    update();
    settleCount++;
    if (settleCount > 12) clearInterval(settle);
  }, 40);

  update();

  vvCleanup = () => {
    vv.removeEventListener('resize', update);
    vv.removeEventListener('scroll', update);
    window.removeEventListener('orientationchange', update);
    clearInterval(settle);
  };
}

function unpinKeys(){
  if (vvCleanup){ vvCleanup(); vvCleanup = null; }
  codeKeysEl.style.transform = 'translate3d(0, 0, 0)';
  editorEl.style.paddingBottom = '70px';
}

editorEl.addEventListener('focus', () => {
  showKeys(true);
  pinKeys();
});

editorEl.addEventListener('blur', () => {
  setTimeout(() => {
    const stillFocused =
      document.activeElement === editorEl ||
      document.activeElement?.classList?.contains('ck-key');
    if (!stillFocused){
      showKeys(false);
      unpinKeys();
    }
  }, 180);
});

// ===== INIT =====
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
  renderKeys();
  updatePreview();
}

// ===== TABS =====
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    project[currentTab] = editorEl.value;
    currentTab = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.toggle('active', b === btn));
    editorEl.value = project[currentTab] || '';
    editorEl.placeholder = placeholderFor(currentTab);
    renderKeys();
  });
});

function placeholderFor(tab){
  if (tab === 'html') return '<!-- Your HTML here -->';
  if (tab === 'css')  return '/* Your CSS here */';
  return '// Your JavaScript here';
}

// ===== EDIT =====
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

// ===== SAVE =====
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

// ===== PREVIEW =====
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

// ===== MOBILE PREVIEW TOGGLE =====
const previewToggle = document.getElementById('previewToggle');
if (previewToggle){
  previewToggle.addEventListener('click', () => {
    bodyEl.classList.toggle('preview-on');
    previewToggle.textContent = bodyEl.classList.contains('preview-on') ? 'Code' : 'Preview';
    if (bodyEl.classList.contains('preview-on')){
      updatePreview();
      showKeys(false);
      unpinKeys();
    }
  });
}

// ===== BUTTONS =====
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