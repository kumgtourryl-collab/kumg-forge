// KUMG Forge — Project CRUD

async function getCurrentUser(){
  const { data } = await db.auth.getSession();
  return data.session?.user || null;
}

async function listProjects(){
  const user = await getCurrentUser();
  if (!user) return [];
  const { data, error } = await db
    .from('projects')
    .select('id, name, is_published, subdomain, updated_at')
    .order('updated_at', { ascending: false });
  if (error){ console.error(error); return []; }
  return data || [];
}

async function createProject(name){
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in');

  const starterHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
</head>
<body style="font-family:system-ui;background:#0B3D2E;color:#E8F5EE;padding:2rem">
  <h1>${name}</h1>
  <p>Edit me in KUMG Forge.</p>
</body>
</html>`;

  const { data, error } = await db.from('projects').insert({
    owner: user.id,
    name,
    html: starterHtml,
    css: '',
    js: ''
  }).select().single();

  if (error) throw error;
  return data;
}

async function deleteProject(id){
  const { error } = await db.from('projects').delete().eq('id', id);
  if (error) throw error;
}

async function getProject(id){
  const { data, error } = await db
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

async function updateProject(id, patch){
  const { error } = await db.from('projects').update(patch).eq('id', id);
  if (error) throw error;
}

// Helpers used by index.html
function timeAgo(iso){
  const s = Math.floor((Date.now() - new Date(iso).getTime())/1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}