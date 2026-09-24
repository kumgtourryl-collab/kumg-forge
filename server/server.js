// KUMG Forge + TouRryl Store — Backend server
// Publish + AI (Groq) + Paynow + Public shops

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
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://kumg-forge.onrender.com';
const APP_URL = process.env.APP_URL || 'https://kumgtourryl-collab.github.io/kumg-forge';

// AI (Groq)
const GROQ_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const AI_FREE_LIMIT = 250;
const AI_IMAGE_LIMIT = 50;

// Paynow
let Paynow = null;
try {
  Paynow = require('paynow').Paynow;
} catch(e) {
  console.warn('Paynow SDK not installed — /api/paynow endpoints disabled.');
}
const PAYNOW_ID  = process.env.PAYNOW_INTEGRATION_ID;
const PAYNOW_KEY = process.env.PAYNOW_INTEGRATION_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY){
  console.error('⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
}

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ===== Helpers =====
function escapeHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// ===== Health =====
app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'KUMG Forge backend',
    ai: GROQ_KEY ? 'groq' : 'not configured',
    aiModel: GROQ_MODEL,
    aiMessageLimit: AI_FREE_LIMIT,
    aiImageLimit: AI_IMAGE_LIMIT,
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

    const reserved = ['www','api','app','admin','mail','blog','docs','help','support','status','store'];
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
// AI CHAT
// ============================================================
app.post('/api/ai/chat', async (req, res) => {
  try {
    if (!GROQ_KEY){
      return res.status(500).json({ error: 'AI not configured yet.' });
    }

    const { userId, messages, projectContext, wantsImage } = req.body || {};
    if (!userId || !Array.isArray(messages) || !messages.length){
      return res.status(400).json({ error: 'Missing userId or messages' });
    }

    const { data: profile } = await db
      .from('profiles').select('plan').eq('id', userId).single();
    const plan = profile?.plan || 'free';

    if (plan === 'free'){
      const { data: todayCount } = await db.rpc('ai_messages_today', { uid: userId });
      if ((todayCount || 0) >= AI_FREE_LIMIT){
        return res.status(402).json({
          error: `Free plan includes ${AI_FREE_LIMIT} AI messages per day.`,
          upgrade: true, reason: 'messages'
        });
      }
    }

    if (wantsImage && plan === 'free'){
      const { data: imgCount } = await db.rpc('ai_images_today', { uid: userId });
      if ((imgCount || 0) >= AI_IMAGE_LIMIT){
        return res.status(402).json({
          error: `Free plan includes ${AI_IMAGE_LIMIT} AI images per day.`,
          upgrade: true, reason: 'images'
        });
      }
    }

    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser){
      await db.from('ai_messages').insert({
        user_id: userId, role: 'user', content: lastUser.content
      });
    }

    if (wantsImage && lastUser){
      await db.from('ai_images').insert({
        user_id: userId, prompt: lastUser.content.slice(0, 400)
      });
    }

    const systemPrompt = [
      'You are KUMG AI, a friendly coding assistant inside the KUMG Forge mobile app.',
      'Users are building websites on their phones. Help with HTML, CSS, JavaScript.',
      'Assume beginner level unless clearly advanced. Never invent KUMG features.',
      '',
      'STYLE: Keep answers short — 2-3 short paragraphs, then code.',
      'Wrap code in triple-backtick fences with a language tag: ```html, ```css, ```js.',
      '',
      'MATH: Show calculations like Google — clean steps, no $ signs.',
      'Example: "15% of 200" →',
      '  15% of 200',
      '  = 15 ÷ 100 × 200',
      '  = 0.15 × 200',
      '  = 30',
      '',
      'IMAGE: When asked for an image/picture/photo, respond with:',
      '  ![short description](https://image.pollinations.ai/prompt/WORDS+JOINED+BY+PLUS?width=1024&height=768&nologo=true)',
      '',
      'VIDEO: When asked for a video, respond with:',
      '  🎥 [Watch videos about TOPIC](https://www.pexels.com/search/videos/TOPIC%20ENCODED/)'
    ].join('\n');

    const contextNote = projectContext
      ? '\n\nProject context (do not repeat back):\n' +
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

    await db.from('ai_messages').insert({
      user_id: userId, role: 'assistant', content: reply
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
      return res.json({
        ok: true, plan, used: 0, limit: null, images: 0, imageLimit: null
      });
    }

    const { data: used } = await db.rpc('ai_messages_today', { uid: userId });
    const { data: images } = await db.rpc('ai_images_today', { uid: userId });

    res.json({
      ok: true, plan,
      used: used || 0, limit: AI_FREE_LIMIT,
      images: images || 0, imageLimit: AI_IMAGE_LIMIT
    });
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
<body><div><h1>404</h1><p>No site at <strong>${escapeHtml(sub)}.kumg.app</strong> yet.</p>
<p><a href="https://kumg.app">Build yours free →</a></p></div></body></html>`;
}

// ============================================================
// SERVE PUBLIC SHOPS
// ============================================================
app.get('/store/:slug', servePublicShop);

async function servePublicShop(req, res){
  const slug = String(req.params.slug || '').toLowerCase();
  if (!slug) return res.status(400).send('Missing slug');

  const { data: shop } = await db
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();

  if (!shop) return res.status(404).send(renderShop404(slug));

  const { data: products } = await db
    .from('shop_products')
    .select('*')
    .eq('shop_id', shop.id)
    .order('sort_order', { ascending: true });

  // Fire-and-forget view count
  db.from('shops').update({ views: (shop.views || 0) + 1 }).eq('id', shop.id).then(()=>{}).catch(()=>{});

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(buildShopPage(shop, products || []));
}

function buildShopPage(shop, products){
  const themes = {
    green: { bg: '#0A0A0A', accent: '#1F9D62', accentDark: '#0B3D2E', text: '#E8F5EE' },
    dark:  { bg: '#000000', accent: '#4A4A4A', accentDark: '#1A1A1A', text: '#FFFFFF' },
    light: { bg: '#F5F7F5', accent: '#148A56', accentDark: '#0B3D2E', text: '#0A1F17' },
    gold:  { bg: '#0F0A00', accent: '#E5B93D', accentDark: '#7A5A10', text: '#FFF8E5' },
    red:   { bg: '#1A0A0A', accent: '#E5484D', accentDark: '#6B1F1F', text: '#FFE8E8' }
  };
  const t = themes[shop.theme] || themes.green;

  const waNum = String(shop.whatsapp || '').replace(/[^\d]/g, '').replace(/^0/, '263');
  const waLink = waNum ? 'https://wa.me/' + waNum : '#';

  const initial = (shop.name || '?')[0].toUpperCase();
  const logo = shop.logo_url
    ? '<img src="' + escapeHtml(shop.logo_url) + '" alt="">'
    : initial;

  const fmt = (n, cur) => {
    const num = Number(n || 0);
    return cur === 'ZWG' ? 'ZWG ' + num.toFixed(2) : '$' + num.toFixed(2);
  };

  const productCards = products.length
    ? products.map(p => {
        const pInit = (p.name || '?')[0].toUpperCase();
        const pic = p.image_url
          ? '<img src="' + escapeHtml(p.image_url) + '" alt="">'
          : pInit;
        const out = p.in_stock ? '' : '<span class="out">Out</span>';
        return '<div class="pcard" data-id="' + p.id + '" ' +
          'data-name="' + escapeHtml(p.name) + '" ' +
          'data-price="' + Number(p.price) + '" ' +
          'data-currency="' + escapeHtml(p.currency) + '" ' +
          'data-stock="' + (p.in_stock ? '1' : '0') + '">' +
          '<div class="pic">' + pic + '</div>' +
          '<div class="info"><div class="nm">' + escapeHtml(p.name) + '</div>' +
          '<div class="pr">' + fmt(p.price, p.currency) + ' ' + out + '</div></div></div>';
      }).join('')
    : '<div class="empty-shop"><h3>No products yet</h3><p>The shop owner hasn\'t added products.</p></div>';

  const productsJson = JSON.stringify(products.map(p => ({
    id: p.id, name: p.name, price: Number(p.price),
    currency: p.currency, in_stock: p.in_stock
  })));

  const shopJson = JSON.stringify({
    id: shop.id, name: shop.name,
    whatsapp: shop.whatsapp, ecocash: shop.ecocash
  });

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="${t.accent}">
<title>${escapeHtml(shop.name)} — Shop</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:${t.bg};color:${t.text};font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:16px;line-height:1.5}
.shop-top{padding:22px 20px 26px;background:linear-gradient(160deg,${t.accentDark},${t.accent});color:#fff;border-radius:0 0 24px 24px;text-align:center}
.shop-logo{width:80px;height:80px;border-radius:20px;background:rgba(255,255,255,.15);display:grid;place-items:center;margin:0 auto 12px;font-size:32px;font-weight:900;color:#fff;overflow:hidden;border:2px solid rgba(255,255,255,.3)}
.shop-logo img{width:100%;height:100%;object-fit:cover}
.shop-top h1{margin:0 0 6px;font-size:22px;font-weight:800;color:#fff;letter-spacing:-.4px}
.tagline{margin:0 0 16px;font-size:13.5px;color:rgba(255,255,255,.85)}
.wa-btn{display:inline-flex;align-items:center;gap:8px;background:#25D366;color:#04140C;padding:12px 20px;border-radius:999px;font-weight:800;font-size:14px;text-decoration:none}
.delivery-info{background:rgba(0,0,0,.2);border-radius:12px;padding:10px 14px;margin:14px 0 0;font-size:12.5px;color:rgba(255,255,255,.9)}
.shop-body{padding:20px 16px 120px;max-width:640px;margin:0 auto}
.prod-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(min-width:560px){.prod-grid{grid-template-columns:1fr 1fr 1fr}}
.pcard{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;overflow:hidden;cursor:pointer;transition:transform .05s}
.pcard:active{transform:scale(.98)}
.pcard .pic{width:100%;aspect-ratio:1/1;background:linear-gradient(135deg,${t.accentDark},${t.accent});display:grid;place-items:center;color:#fff;font-weight:900;font-size:36px;overflow:hidden}
.pcard .pic img{width:100%;height:100%;object-fit:cover}
.pcard .info{padding:10px 12px}
.pcard .nm{font-weight:700;font-size:13.5px;margin-bottom:4px;line-height:1.3}
.pcard .pr{font-weight:800;color:${t.accent};font-size:14px}
.pcard .out{font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;background:#E5484D;color:#fff;padding:2px 6px;border-radius:6px;margin-left:6px}
.empty-shop{text-align:center;padding:40px 20px;opacity:.6}
.cart-bar{position:fixed;left:12px;right:12px;bottom:12px;z-index:40;background:${t.accent};color:#04140C;border-radius:16px;padding:14px 18px;display:none;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,.4);font-weight:800}
.cart-bar.show{display:flex}
.cart-bar .count{font-size:13px;opacity:.85}
.cart-bar .total{font-size:16px}
.cart-bar button{background:#04140C;color:#fff;border:0;padding:10px 16px;border-radius:12px;font-weight:800;font-size:13.5px}
.cart-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:60;display:none;align-items:flex-end;justify-content:center}
.cart-bg.show{display:flex}
.cart-sheet{background:${t.bg};border-top-left-radius:20px;border-top-right-radius:20px;width:100%;max-width:560px;padding:16px 16px calc(16px + env(safe-area-inset-bottom));max-height:85vh;overflow-y:auto;color:${t.text}}
.cart-sheet h3{margin:0 0 12px;font-size:18px}
.ci{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.08);font-size:14px}
.ci .qty-ctrl{display:flex;align-items:center;gap:8px}
.ci .qty-ctrl button{width:30px;height:30px;border-radius:8px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:${t.text};font-weight:800;padding:0}
.ci .qty-ctrl .q{font-weight:800;min-width:22px;text-align:center}
.cart-total{display:flex;justify-content:space-between;padding:14px 0;margin-top:8px;border-top:2px solid ${t.accent};font-weight:800;font-size:16px}
.cart-actions{display:flex;gap:8px;margin-top:8px}
.cart-actions button{flex:1;padding:14px;border-radius:12px;font-weight:800;font-size:15px;border:0}
.cart-actions #closeCart{background:transparent;color:${t.text};border:1px solid rgba(255,255,255,.15)}
.cart-actions #checkoutBtn{background:${t.accent};color:#04140C}
</style>
</head>
<body>

<div class="shop-top">
  <div class="shop-logo">${logo}</div>
  <h1>${escapeHtml(shop.name)}</h1>
  ${shop.tagline ? `<p class="tagline">${escapeHtml(shop.tagline)}</p>` : ''}
  <a class="wa-btn" href="${waLink}" target="_blank" rel="noopener">💬 Chat on WhatsApp</a>
  ${shop.delivery_info ? `<div class="delivery-info">🚚 ${escapeHtml(shop.delivery_info)}</div>` : ''}
</div>

<div class="shop-body">
  ${products.length ? '<div class="prod-grid">' + productCards + '</div>' : productCards}
</div>

<div class="cart-bar" id="cartBar">
  <div>
    <div class="count" id="cartCount">0 items</div>
    <div class="total" id="cartTotal">$0.00</div>
  </div>
  <button id="viewCartBtn">View cart →</button>
</div>

<div class="cart-bg" id="cartBg">
  <div class="cart-sheet">
    <h3>Your cart</h3>
    <div id="cartItems"></div>
    <div class="cart-total">
      <span>Total</span>
      <span id="cartTotalSheet">$0.00</span>
    </div>
    <div class="cart-actions">
      <button id="closeCart">Keep shopping</button>
      <button id="checkoutBtn">Order on WhatsApp</button>
    </div>
  </div>
</div>

<script>
const SHOP = ${shopJson};
const PRODUCTS = ${productsJson};

var cart = {};

function fmtMoney(n, cur){
  n = Number(n || 0);
  return cur === 'ZWG' ? 'ZWG ' + n.toFixed(2) : '$' + n.toFixed(2);
}
function cartTotal(){
  var t = 0;
  Object.entries(cart).forEach(function(e){
    var p = PRODUCTS.find(function(x){ return x.id === e[0]; });
    if (p) t += p.price * e[1];
  });
  return t;
}
function cartCount(){ return Object.values(cart).reduce(function(a,b){return a+b;},0); }

function updateCartBar(){
  var c = cartCount();
  var bar = document.getElementById('cartBar');
  if (c === 0){ bar.classList.remove('show'); return; }
  bar.classList.add('show');
  document.getElementById('cartCount').textContent = c + (c === 1 ? ' item' : ' items');
  var cur = PRODUCTS[0] ? PRODUCTS[0].currency : 'USD';
  var t = fmtMoney(cartTotal(), cur);
  document.getElementById('cartTotal').textContent = t;
  document.getElementById('cartTotalSheet').textContent = t;
}

function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function renderCartItems(){
  var items = Object.entries(cart);
  var el = document.getElementById('cartItems');
  if (!items.length){
    el.innerHTML = '<p style="opacity:.6;font-size:14px;padding:12px 0">Your cart is empty.</p>';
    return;
  }
  el.innerHTML = items.map(function(e){
    var p = PRODUCTS.find(function(x){ return x.id === e[0]; });
    if (!p) return '';
    return '<div class="ci"><div><div style="font-weight:700">' + esc(p.name) + '</div>' +
      '<div style="opacity:.6;font-size:12.5px">' + fmtMoney(p.price, p.currency) + ' each</div></div>' +
      '<div class="qty-ctrl"><button data-dec="' + p.id + '">−</button>' +
      '<span class="q">' + e[1] + '</span>' +
      '<button data-inc="' + p.id + '">+</button></div></div>';
  }).join('');

  el.querySelectorAll('[data-inc]').forEach(function(b){
    b.onclick = function(){
      cart[b.dataset.inc] = (cart[b.dataset.inc] || 0) + 1;
      renderCartItems(); updateCartBar();
    };
  });
  el.querySelectorAll('[data-dec]').forEach(function(b){
    b.onclick = function(){
      var id = b.dataset.dec;
      cart[id] = (cart[id] || 0) - 1;
      if (cart[id] <= 0) delete cart[id];
      renderCartItems(); updateCartBar();
      if (!Object.keys(cart).length) document.getElementById('cartBg').classList.remove('show');
    };
  });
}

document.querySelectorAll('.pcard').forEach(function(card){
  card.onclick = function(){
    if (card.dataset.stock !== '1'){ alert('Out of stock'); return; }
    cart[card.dataset.id] = (cart[card.dataset.id] || 0) + 1;
    updateCartBar();
  };
});

document.getElementById('viewCartBtn').onclick = function(){
  renderCartItems();
  document.getElementById('cartBg').classList.add('show');
};

document.getElementById('closeCart').onclick = function(){
  document.getElementById('cartBg').classList.remove('show');
};

document.getElementById('checkoutBtn').onclick = function(){
  var items = Object.entries(cart).map(function(e){
    var p = PRODUCTS.find(function(x){ return x.id === e[0]; });
    return { name: p.name, price: p.price, currency: p.currency, qty: e[1] };
  });
  if (!items.length) return;

  var num = String(SHOP.whatsapp || '').replace(/[^0-9]/g, '').replace(/^0/, '263');
  if (!num){ alert('Shop has no WhatsApp number'); return; }

  var lines = ['Hi ' + SHOP.name + '! I want to order:', ''];
  var total = 0;
  items.forEach(function(it){
    var lt = it.price * it.qty;
    total += lt;
    lines.push('• ' + it.qty + 'x ' + it.name + ' — ' + fmtMoney(lt, it.currency));
  });
  lines.push('');
  lines.push('Total: ' + fmtMoney(total, items[0].currency || 'USD'));
  if (SHOP.ecocash){
    lines.push('');
    lines.push("I'll pay via EcoCash to " + SHOP.ecocash + '.');
  }
  lines.push('');
  lines.push('My details:');
  lines.push('Name: ');
  lines.push('Address: ');

  location.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(lines.join('\\n'));
};
</script>
</body>
</html>`;
}

function renderShop404(slug){
  return `<!doctype html><html><head><meta charset="utf-8"><title>Shop not found</title>
<style>body{font-family:system-ui;background:#0A0A0A;color:#E8F5EE;display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
h1{font-size:56px;margin:0;color:#1F9D62}p{color:#A8BAB1}a{color:#1F9D62}</style></head>
<body><div><h1>404</h1><p>No shop at <strong>/store/${escapeHtml(slug)}</strong>.</p>
<p><a href="https://kumg.app">Create your own free shop →</a></p></div></body></html>`;
}

// ===== START =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('KUMG Forge + TouRryl Store running on port ' + PORT);
  console.log('AI model: ' + GROQ_MODEL);
});
