// KUMG Forge — Publish server
// Serves published sites + handles /api/publish

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ===== CONFIG (set these in Render → Environment) =====
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // NOT the publishable key
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'kumg.app';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY){
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ===== Health check =====
app.get('/', (req, res) => {
  res.send('KUMG Forge publish server is live.');
});

// ===== Publish API =====
app.post('/api/publish', async (req, res) => {
  try {
    const { projectId, subdomain, userId } = req.body || {};

    if (!projectId || !subdomain || !userId){
      return res.status(400).json({ error: 'Missing projectId, subdomain, or userId' });
    }

    // Validate subdomain: 3-30 chars, a-z 0-9 and dashes only, not reserved
    const reserved = ['www','api','app','admin','mail','blog','docs','help','support','status'];
    const clean = String(subdomain).toLowerCase().trim();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(clean)){
      return res.status(400).json({ error: 'Invalid subdomain. Use 3-30 chars: a-z, 0-9, and -.' });
    }
    if (reserved.includes(clean)){
      return res.status(400).json({ error: 'That subdomain is reserved.' });
    }

    // Verify the project belongs to the user
    const { data: project, error: pErr } = await db
      .from('projects')
      .select('id, owner, name, html')
      .eq('id', projectId)
      .single();
    if (pErr || !project){
      return res.status(404).json({ error: 'Project not found' });
    }
    if (project.owner !== userId){
      return res.status(403).json({ error: 'Not your project' });
    }

    // Check plan
    const { data: profile } = await db
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single();
    const plan = profile?.plan || 'free';

    // Free users: 1 published site max
    if (plan === 'free'){
      const { data: existing } = await db
        .from('projects')
        .select('id')
        .eq('owner', userId)
        .eq('is_published', true)
        .neq('id', projectId);
      if (existing && existing.length > 0){
        return res.status(402).json({
          error: 'Free plan allows 1 published site. Upgrade to Pro for unlimited.',
          upgrade: true
        });
      }
    }

    // Check subdomain isn't taken by someone else
    const { data: taken } = await db
      .from('projects')
      .select('id, owner')
      .eq('subdomain', clean)
      .neq('id', projectId)
      .maybeSingle();
    if (taken){
      return res.status(409).json({ error: 'That subdomain is already taken.' });
    }

    // Save publish state
    const { error: uErr } = await db
      .from('projects')
      .update({
        subdomain: clean,
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);
    if (uErr){
      return res.status(500).json({ error: 'Failed to save publish state' });
    }

    res.json({
      ok: true,
      url: `https://${clean}.${BASE_DOMAIN}`,
      preview: `https://${clean}.${BASE_DOMAIN}`
    });
  } catch (err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== Unpublish =====
app.post('/api/unpublish', async (req, res) => {
  try {
    const { projectId, userId } = req.body || {};
    if (!projectId || !userId) return res.status(400).json({ error: 'Missing fields' });

    const { data: project } = await db
      .from('projects')
      .select('id, owner')
      .eq('id', projectId)
      .single();
    if (!project || project.owner !== userId){
      return res.status(403).json({ error: 'Not allowed' });
    }

    await db.from('projects').update({
      is_published: false,
      subdomain: null
    }).eq('id', projectId);

    res.json({ ok: true });
  } catch (err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== Serve a published site =====
// URL forms supported:
//   /s/:subdomain          (works on any Render URL)
//   /:subdomain            (works with a wildcard domain later)
app.get('/s/:subdomain', serveSite);
app.get('/site/:subdomain', serveSite);

async function serveSite(req, res){
  const sub = String(req.params.subdomain || '').toLowerCase();
  if (!sub) return res.status(400).send('Missing subdomain');

  const { data: project } = await db
    .from('projects')
    .select('name, html, css, js, is_published')
    .eq('subdomain', sub)
    .eq('is_published', true)
    .maybeSingle();

  if (!project){
    return res.status(404).send(render404(sub));
  }

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(buildPage(project));
}

function buildPage(project){
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
  // KUMG badge for free users (we'll branch later by plan)
  return html;
}

function render404(sub){
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Not found</title>
<style>
body{font-family:system-ui;background:#0A0A0A;color:#E8F5EE;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
h1{font-size:56px;margin:0;color:#1F9D62}
p{color:#A8BAB1}
a{color:#1F9D62}
</style></head>
<body><div>
<h1>404</h1>
<p>No site at <strong>${sub}.kumg.app</strong> yet.</p>
<p><a href="https://kumg.app">Build yours free →</a></p>
</div></body></html>`;
}

// ===== Start =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('KUMG Forge publish server running on port ' + PORT);
});
