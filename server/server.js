// KUMG Forge — Backend server
// Publish + AI (Groq) + Paynow + site serving

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// ===== CONFIG =====
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const BASE_DOMAIN = process.env.BASE_DOMAIN || 'kumg.app';
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://kumg-forge-server-fg88.onrender.com';
const APP_URL = process.env.APP_URL || 'https://kumgtourryl-collab.github.io/kumg-forge';

// AI (Groq)
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const AI_FREE_LIMIT = 5;

// Paynow
let Paynow = null;
try {
  Paynow = require('paynow').Paynow;
} catch(e) {
  console.warn('Paynow SDK not installed yet — /api/paynow endpoints will be disabled.');
}
const PAYNOW_ID  = process.env.PAYNOW_INTEGRATION_ID;
const PAYNOW_KEY = process.env.PAYNOW_INTEGRATION_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY){
  console.error('⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ===== Health =====
app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'KUMG Forge backend',
    ai: GROQ_KEY ? 'groq' : 'not configured',
    paynow: (PAYNOW_ID && PAYNOW_KEY) ? 'configured' : 'not configured'
  });
});

// ============================================================
// PUBLISH
// ============================================================
app.post('/api/publish', async (req, res) => {
  try {
    const { projectId, subdomain, userId } = req.body || {};
    if (!projectId || !subdomain || !userId){
      return res.status(400).json({ error: 'Missing projectId, subdomain, or userId' });
    }

    const reserved = ['www','api','app','admin','mail','blog','docs','help','support','status'];
    const clean = String(subdomain).toLowerCase().trim();
    if (!/^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/.test(clean)){
      return res.status(400).json({ error: 'Invalid subdomain. Use 3-30 chars: a-z, 0-9, and -.' });
    }
    if (reserved.includes(clean)){
      return res.status(400).json({ error: 'That subdomain is reserved.' });
    }

    const { data: project, error: pErr } = await db
      .from('projects').select('id, owner, name')
      .eq('id', projectId).single();
    if (pErr || !project) return res.status(404).json({ error: 'Project not found' });
    if (project.owner !== userId) return res.status(403).json({ error: 'Not your project' });

    const { data: profile } = await db
      .from('profiles').select('plan').eq('id', userId).single();
    const plan = profile?.plan || 'free';

    if (plan === 'free'){
      const { data: existing } = await db
        .from('projects').select('id')
        .eq('owner', userId).eq('is_published', true).neq('id', projectId);
      if (existing && existing.length > 0){
        return res.status(402).json({
          error: 'Free plan allows 1 published site. Upgrade to Pro for unlimited.',
          upgrade: true
        });
      }
    }

    const { data: taken } = await db
      .from('projects').select('id, owner')
      .eq('subdomain', clean).neq('id', projectId).maybeSingle();
    if (taken) return res.status(409).json({ error: 'That subdomain is already taken.' });

    const { error: uErr } = await db.from('projects').update({
      subdomain: clean,
      is_published: true,
      updated_at: new Date().toISOString()
    }).eq('id', projectId);
    if (uErr) return res.status(500).json({ error: 'Failed to save publish state' });

    res.json({
      ok: true,
      url: `https://${clean}.${BASE_DOMAIN}`,
      preview: `${PUBLIC_URL}/s/${clean}`
    });
  } catch (err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// UNPUBLISH
// ============================================================
app.post('/api/unpublish', async (req, res) => {
  try {
    const { projectId, userId } = req.body || {};
    if (!projectId || !userId) return res.status(400).json({ error: 'Missing fields' });

    const { data: project } = await db
      .from('projects').select('id, owner').eq('id', projectId).single();
    if (!project || project.owner !== userId) return res.status(403).json({ error: 'Not allowed' });

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

// ============================================================
// AI CHAT (Groq)
// ============================================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    if (!GROQ_KEY){
      return res.status(500).json({
        error: 'AI not configured yet. Set GROQ_API_KEY in Render → Environment.'
      });
    }

    const { userId, messages, projectContext } = req.body || {};
    if (!userId || !Array.isArray(messages) || !messages.length){
      return res.status(400).json({ error: 'Missing userId or messages' });
    }

    // Plan + rate limit
    const { data: profile } = await db
      .from('profiles').select('plan').eq('id', userId).single();
    const plan = profile?.plan || 'free';

    if (plan === 'free'){
      const { data: todayCount } = await db.rpc('ai_messages_today', { uid: userId });
      if ((todayCount || 0) >= AI_FREE_LIMIT){
        return res.status(402).json({
          error: `Free plan includes ${AI_FREE_LIMIT} AI messages per day. Upgrade to Pro for unlimited.`,
          upgrade: true
        });
      }
    }

    // Save user's last message
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser){
      await db.from('ai_messages').insert({
        user_id: userId,
        role: 'user',
        content: lastUser.content
      });
    }

    // Build system prompt
    const systemPrompt =
      'You are KUMG AI, a friendly coding assistant inside the KUMG Forge mobile app. ' +
      'Users are building websites on their phones. ' +
      'Help them write HTML, CSS, and JavaScript. Keep answers short and clear — 2-3 short paragraphs max, then code. ' +
      'When you provide code, put it in triple-backtick fenced blocks with a language tag (```html, ```css, ```js). ' +
      'Assume beginner level unless the user is clearly advanced. ' +
      'Never invent KUMG features that do not exist.';

    const contextNote = projectContext
      ? '\n\nCurrent project context (for reference — do not repeat it back):\n' +
        'HTML: ' + (projectContext.html || '').slice(0, 800) + '\n' +
        'CSS: '  + (projectContext.css  || '').slice(0, 800) + '\n' +
        'JS: '   + (projectContext.js   || '').slice(0, 800)
      : '';

    const groqMessages = [
      { role: 'system', content: systemPrompt + contextNote },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content)
      }))
    ];

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + GROQ_KEY
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    if (!groqRes.ok){
      const errTxt = await groqRes.text();
      console.error('Groq error:', errTxt);
      return res.status(500).json({ error: 'AI request failed. Try again.' });
    }

    const groqJson = await groqRes.json();
    const reply = groqJson?.choices?.[0]?.message?.content || 'Sorry, I could not generate a reply.';

    // Save assistant reply
    await db.from('ai_messages').insert({
      user_id: userId,
      role: 'assistant',
      content: reply
    });

    res.json({ ok: true, reply });
  } catch (err){
    console.error('AI chat error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== AI usage =====
app.post('/api/ai/usage', async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    const { data: profile } = await db
      .from('profiles').select('plan').eq('id', userId).single();

    const plan = profile?.plan || 'free';
    if (plan === 'pro'){
      return res.json({ ok: true, plan, used: 0, limit: null });
    }

    const { data: used } = await db.rpc('ai_messages_today', { uid: userId });
    res.json({ ok: true, plan, used: used || 0, limit: AI_FREE_LIMIT });
  } catch (err){
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// PAYNOW
// ============================================================
app.post('/api/paynow/initiate', async (req, res) => {
  try {
    if (!Paynow || !PAYNOW_ID || !PAYNOW_KEY){
      return res.status(500).json({ error: 'Paynow not configured yet.' });
    }
    const { userId, plan } = req.body || {};
    if (!userId || !plan) return res.status(400).json({ error: 'Missing fields' });

    const amount = plan === 'pro' ? 5.00 : 15.00;
    const reference = 'KUMG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    const { error: insErr } = await db.from('payments').insert({
      user_id: userId, reference, amount, currency: 'USD', status: 'pending'
    });
    if (insErr) return res.status(500).json({ error: 'Failed to create payment' });

    const paynow = new Paynow(PAYNOW_ID, PAYNOW_KEY);
    paynow.resultUrl = PUBLIC_URL + '/api/paynow/webhook';
    paynow.returnUrl = PUBLIC_URL + '/api/paynow/return?ref=' + reference;

    const payment = paynow.createPayment(reference);
    payment.add(plan === 'pro' ? 'KUMG Forge Pro' : 'KUMG Forge Studio', amount);

    const response = await paynow.send(payment);
    if (!response.success){
      await db.from('payments').update({ status: 'failed' }).eq('reference', reference);
      return res.status(500).json({ error: response.error || 'Paynow failed' });
    }

    await db.from('payments').update({ poll_url: response.pollUrl }).eq('reference', reference);
    res.json({ ok: true, redirectUrl: response.redirectUrl, reference });
  } catch (err){
    console.error('Paynow initiate error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/paynow/webhook', async (req, res) => {
  try {
    const body = req.body || {};
    const status = (body.status || '').toLowerCase();
    const reference = body.reference;
    if (!reference) return res.status(400).send('Missing reference');

    const { data: payment } = await db
      .from('payments').select('id, user_id, status')
      .eq('reference', reference).maybeSingle();
    if (!payment) return res.status(404).send('Unknown reference');
    if (payment.status === 'paid') return res.send('OK');

    if (['paid','awaiting delivery','delivered'].includes(status)){
      await db.from('profiles').update({ plan: 'pro' }).eq('id', payment.user_id);
      await db.from('payments').update({
        status: 'paid', paid_at: new Date().toISOString()
      }).eq('id', payment.id);
    } else if (['cancelled','failed'].includes(status)){
      await db.from('payments').update({ status }).eq('id', payment.id);
    }
    res.send('OK');
  } catch (err){
    console.error('Paynow webhook error:', err);
    res.status(500).send('Error');
  }
});

app.get('/api/paynow/return', (req, res) => {
  const ref = req.query.ref || '';
  res.redirect(APP_URL + '/settings.html?paid=' + encodeURIComponent(ref));
});

// ============================================================
// SERVE PUBLISHED SITES
// ============================================================
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

  if (!project) return res.status(404).send(render404(sub));
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
  return html;
}

function render404(sub){
  return `<!doctype html><html><head><meta charset="utf-8"><title>Not found</title>
<style>body{font-family:system-ui;background:#0A0A0A;color:#E8F5EE;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
h1{font-size:56px;margin:0;color:#1F9D62}p{color:#A8BAB1}a{color:#1F9D62}</style></head>
<body><div><h1>404</h1><p>No site at <strong>${sub}.kumg.app</strong> yet.</p>
<p><a href="https://kumg.app">Build yours free →</a></p></div></body></html>`;
}

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('KUMG Forge server running on port ' + PORT);
});
