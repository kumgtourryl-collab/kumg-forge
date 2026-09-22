// KUMG Forge — Editor

let project = null;
let currentTab = 'html';
let saveTimer = null;
let previewTimer = null;
let dirty = false;
let vvCleanup = null;

// Find state
let findMatches = [];
let findIndex = -1;

// AI insert from ai.html
const aiInsertParam = new URLSearchParams(location.search).get('aiInsert');

const editorEl   = document.getElementById('editor');
const previewEl  = document.getElementById('preview');
const nameEl     = document.getElementById('nameInput');
const statusEl   = document.getElementById('saveStatus');
const tabBtns    = document.querySelectorAll('.tab-btn');
const bodyEl     = document.body;
const codeKeysEl = document.getElementById('codeKeys');
const ckScrollEl = document.getElementById('ckScroll');

const findBar     = document.getElementById('findBar');
const findInput   = document.getElementById('findInput');
const replaceInput= document.getElementById('replaceInput');
const findCount   = document.getElementById('findCount');

const sheetBg  = document.getElementById('sheetBg');
const sheetEl  = document.getElementById('sheet');

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
  refreshFind();
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

  // Handle AI code insert
  if (aiInsertParam){
    try {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(aiInsertParam))));
      const lang = (decoded.lang || 'html').toLowerCase();
      const target = (lang === 'css' || lang === 'js') ? lang : 'html';

      if (target !== currentTab){
        project[currentTab] = editorEl.value;
        currentTab = target;
        tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === target));
        editorEl.value = project[currentTab] || '';
        renderKeys();
      }

      const sep = editorEl.value.trim() ? '\n\n' : '';
      editorEl.value = editorEl.value + sep + decoded.code;
      project[currentTab] = editorEl.value;
      markDirty();

      history.replaceState({}, '', 'editor.html?id=' + project.id);
      toast('Code inserted by KUMG AI');
    } catch(err){
      console.warn('aiInsert parse failed', err);
    }
  }
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
    refreshFind();
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
  refreshFind();
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

// ===== FIND & REPLACE =====
function refreshFind(){
  const q = findInput.value;
  findMatches = [];
  findIndex = -1;

  if (!q){
    findCount.textContent = '0/0';
    return;
  }

  const text = editorEl.value;
  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  let i = 0;

  while (true){
    const at = lowerText.indexOf(lowerQ, i);
    if (at === -1) break;
    findMatches.push(at);
    i = at + Math.max(1, lowerQ.length);
    if (findMatches.length > 2000) break;
  }

  findCount.textContent = findMatches.length
    ? `1/${findMatches.length}`
    : '0/0';

  if (findMatches.length){
    findIndex = 0;
    selectMatch(0);
  }
}

function selectMatch(idx){
  if (!findMatches.length) return;
  const at = findMatches[idx];
  const len = findInput.value.length;

  editorEl.focus();
  editorEl.setSelectionRange(at, at + len);

  const before = editorEl.value.slice(0, at);
  const line = (before.match(/\n/g) || []).length;
  const lineHeight = 22;
  const target = line * lineHeight - editorEl.clientHeight / 2;
  editorEl.scrollTop = Math.max(0, target);

  findCount.textContent = `${idx + 1}/${findMatches.length}`;
}

document.getElementById('findBtn').addEventListener('click', () => {
  const open = findBar.classList.toggle('show');
  if (open){
    findInput.focus();
    refreshFind();
  }
});

document.getElementById('findClose').addEventListener('click', () => {
  findBar.classList.remove('show');
  findInput.value = '';
  replaceInput.value = '';
  findCount.textContent = '0/0';
  editorEl.focus();
});

document.getElementById('findNext').addEventListener('click', () => {
  if (!findMatches.length) return;
  findIndex = (findIndex + 1) % findMatches.length;
  selectMatch(findIndex);
});

document.getElementById('findPrev').addEventListener('click', () => {
  if (!findMatches.length) return;
  findIndex = (findIndex - 1 + findMatches.length) % findMatches.length;
  selectMatch(findIndex);
});

findInput.addEventListener('input', refreshFind);

findInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter'){
    e.preventDefault();
    if (e.shiftKey) document.getElementById('findPrev').click();
    else document.getElementById('findNext').click();
  }
});

document.getElementById('replaceOne').addEventListener('click', () => {
  const q = findInput.value;
  if (!q) return;
  const selStart = editorEl.selectionStart;
  const selEnd = editorEl.selectionEnd;
  const selected = editorEl.value.slice(selStart, selEnd);

  if (selected.toLowerCase() === q.toLowerCase()){
    const rep = replaceInput.value;
    editorEl.value =
      editorEl.value.slice(0, selStart) + rep + editorEl.value.slice(selEnd);
    project[currentTab] = editorEl.value;
    markDirty();
    refreshFind();
    document.getElementById('findNext').click();
  } else {
    document.getElementById('findNext').click();
  }
});

document.getElementById('replaceAll').addEventListener('click', () => {
  const q = findInput.value;
  if (!q) return;
  const rep = replaceInput.value;
  const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const before = editorEl.value;
  const after = before.replace(re, rep);
  if (after === before){
    toast('No matches');
    return;
  }
  editorEl.value = after;
  project[currentTab] = after;
  markDirty();
  refreshFind();
  toast('Replaced all');
});

// ===== BOTTOM SHEET =====
function openSheet(){ sheetBg.classList.add('show'); }
function closeSheet(){ sheetBg.classList.remove('show'); }

document.getElementById('moreBtn').addEventListener('click', openSheet);
sheetBg.addEventListener('click', (e) => {
  if (e.target === sheetBg) closeSheet();
});

sheetEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('.sheet-item');
  if (!btn) return;
  const act = btn.dataset.act;
  closeSheet();

  if (act === 'close') return;
  if (act === 'copy') await doCopy();
  if (act === 'paste') await doPaste();
  if (act === 'selectAll') doSelectAll();
  if (act === 'duplicate') await doDuplicate();
  if (act === 'downloadHtml') await doDownloadHtml();
  if (act === 'downloadZip') await doDownloadZip();
});

async function doCopy(){
  const sel = editorEl.value.slice(
    editorEl.selectionStart ?? 0,
    editorEl.selectionEnd ?? 0
  );
  const payload = sel || editorEl.value;
  if (!payload){ toast('Nothing to copy'); return; }
  try {
    await navigator.clipboard.writeText(payload);
    toast(sel ? 'Selection copied' : 'Tab copied');
  } catch {
    fallbackCopy(payload);
  }
}

function fallbackCopy(text){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '-1000px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); toast('Copied'); }
  catch { toast('Copy failed'); }
  document.body.removeChild(ta);
}

async function doPaste(){
  try {
    const text = await navigator.clipboard.readText();
    if (!text){ toast('Clipboard is empty'); return; }
    insertAtCursor(text);
    toast('Pasted');
  } catch {
    toast('Paste blocked — long-press the editor and paste');
  }
}

function doSelectAll(){
  editorEl.focus();
  editorEl.setSelectionRange(0, editorEl.value.length);
  toast('Selected');
}

async function doDuplicate(){
  const name = prompt('Save as — new project name:', (nameEl.value || 'Untitled') + ' copy');
  if (!name) return;

  try {
    await saveNow();
    const copy = await createProject(name.trim());
    await updateProject(copy.id, {
      html: project.html || '',
      css:  project.css  || '',
      js:   project.js   || ''
    });
    toast('Saved as "' + name.trim() + '"');
    setTimeout(()=> location.href = 'editor.html?id=' + copy.id, 500);
  } catch(err){
    toast(err.message || 'Save as failed');
  }
}

async function doDownloadHtml(){
  await saveNow();
  const html = buildPreviewDoc();
  const blob = new Blob([html], { type: 'text/html' });
  triggerDownload(blob, safeName() + '.html');
  toast('Downloaded .html');
}

async function doDownloadZip(){
  await saveNow();
  if (typeof JSZip === 'undefined'){
    toast('ZIP not available — use .html');
    return;
  }
  const zip = new JSZip();

  let html = project.html || '';
  if (!html.trim()) html = '<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>' + safeName() + '</title>\n<link rel="stylesheet" href="style.css">\n</head>\n<body>\n\n<script src="script.js"><\/script>\n</body>\n</html>';

  zip.file('index.html', html);
  zip.file('style.css', project.css || '/* Your CSS here */');
  zip.file('script.js', project.js || '// Your JS here');
  zip.file('README.txt',
`Project: ${nameEl.value || 'Untitled'}
Exported from KUMG Forge on ${new Date().toISOString()}

Open index.html in any browser to view your site.`);

  const blob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(blob, safeName() + '.zip');
  toast('Downloaded .zip');
}

function safeName(){
  return (nameEl.value.trim() || 'project').replace(/[^a-z0-9-_]/gi,'_');
}

function triggerDownload(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(()=> URL.revokeObjectURL(url), 1500);
}

// ===== PREVIEW TOGGLE =====
const previewToggle = document.getElementById('previewToggle');
if (previewToggle){
  previewToggle.addEventListener('click', () => {
    bodyEl.classList.toggle('preview-on');
    previewToggle.textContent = bodyEl.classList.contains('preview-on') ? 'Code' : 'Preview';
    if (bodyEl.classList.contains('preview-on')){
      updatePreview();
      showKeys(false);
      unpinKeys();
      findBar.classList.remove('show');
    }
  });
}

// ===== BUTTONS =====
document.getElementById('aiBtn').addEventListener('click', async () => {
  await saveNow();
  location.href = 'ai.html?return=' + encodeURIComponent(project.id);
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
