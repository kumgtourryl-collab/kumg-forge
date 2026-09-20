// KUMG Forge — Starter templates
// Each template is a complete standalone HTML doc (styles inline).
// Later, users can edit them like any other project.

const KUMG_TEMPLATES = [
  {
    id: 'hero',
    name: 'Hero Landing',
    tag: 'Landing',
    desc: 'Big headline, subtext, call-to-action. Perfect for a product or waitlist.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Product</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .wrap{max-width:560px;text-align:center}
  .badge{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1F9D62;margin-bottom:20px}
  h1{font-size:clamp(36px,8vw,56px);line-height:1.05;font-weight:800;letter-spacing:-1px;margin-bottom:20px}
  h1 span{color:#1F9D62}
  p{font-size:18px;line-height:1.6;color:#A8BAB1;margin-bottom:32px}
  .cta{display:inline-block;background:#1F9D62;color:#04140C;font-weight:800;padding:16px 32px;border-radius:14px;text-decoration:none;font-size:16px}
  .cta:hover{background:#25B874}
  .foot{margin-top:32px;font-size:13px;color:#5A6E65}
</style>
</head>
<body>
  <div class="wrap">
    <div class="badge">Coming Soon</div>
    <h1>Build the web<br>from your <span>pocket</span>.</h1>
    <p>KUMG Forge lets you design, preview, and publish real websites — right from your phone.</p>
    <a class="cta" href="#">Join the waitlist</a>
    <div class="foot">No credit card. No installs. Just your phone.</div>
  </div>
</body>
</html>`
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    tag: 'Personal',
    desc: 'Show your work. Photo, bio, and a grid of projects.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Name — Portfolio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;padding:32px 20px;line-height:1.6}
  .wrap{max-width:720px;margin:0 auto}
  header{display:flex;align-items:center;gap:18px;margin-bottom:40px}
  .avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#0B3D2E,#1F9D62);display:grid;place-items:center;font-weight:900;font-size:24px;color:#04140C;flex-shrink:0}
  h1{font-size:28px;font-weight:800;letter-spacing:-0.5px}
  .role{color:#1F9D62;font-size:14px;font-weight:600}
  .about{color:#A8BAB1;margin-bottom:40px;font-size:16px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:1.5px;color:#7A8C84;margin-bottom:16px;font-weight:700}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
  .card{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:20px;transition:border-color .15s}
  .card:hover{border-color:#1F9D62}
  .card h3{font-size:17px;margin-bottom:6px}
  .card p{font-size:13px;color:#7A8C84;margin:0}
  footer{margin-top:56px;padding-top:24px;border-top:1px solid #1B2A24;font-size:13px;color:#5A6E65}
  footer a{color:#1F9D62;text-decoration:none;margin-right:16px}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="avatar">Y</div>
      <div>
        <h1>Your Name</h1>
        <div class="role">Designer &amp; Developer</div>
      </div>
    </header>

    <p class="about">I design and build clean, fast websites for small businesses and creators. Based in Harare. Working worldwide.</p>

    <h2>Selected work</h2>
    <div class="grid">
      <div class="card"><h3>Project One</h3><p>Brand identity for a coffee shop.</p></div>
      <div class="card"><h3>Project Two</h3><p>Landing page for a mobile app.</p></div>
      <div class="card"><h3>Project Three</h3><p>E-commerce site for a boutique.</p></div>
      <div class="card"><h3>Project Four</h3><p>Portfolio for a photographer.</p></div>
    </div>

    <footer>
      <a href="mailto:you@example.com">Email</a>
      <a href="#">Twitter</a>
      <a href="#">GitHub</a>
    </footer>
  </div>
</body>
</html>`
  },
  {
    id: 'linkinbio',
    name: 'Link in Bio',
    tag: 'Social',
    desc: 'One clean page with all your links. Perfect for Instagram or TikTok bio.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>@yourhandle</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
  .wrap{width:100%;max-width:400px;text-align:center}
  .avatar{width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#0B3D2E,#1F9D62);display:grid;place-items:center;font-weight:900;font-size:32px;color:#04140C;margin:0 auto 16px}
  h1{font-size:22px;font-weight:800;margin-bottom:4px}
  .handle{color:#7A8C84;font-size:14px;margin-bottom:8px}
  .bio{color:#A8BAB1;font-size:14px;margin-bottom:28px;line-height:1.5}
  .links{display:flex;flex-direction:column;gap:10px}
  .link{display:block;background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:16px;color:#E8F5EE;text-decoration:none;font-weight:600;font-size:15px;transition:all .15s}
  .link:hover{border-color:#1F9D62;background:#0B3D2E;transform:translateY(-1px)}
  .link.primary{background:#1F9D62;color:#04140C;border-color:#1F9D62}
  .link.primary:hover{background:#25B874}
  .foot{margin-top:32px;font-size:12px;color:#5A6E65}
</style>
</head>
<body>
  <div class="wrap">
    <div class="avatar">Y</div>
    <h1>Your Name</h1>
    <div class="handle">@yourhandle</div>
    <p class="bio">Creator · Designer · Building things on the internet.</p>

    <div class="links">
      <a class="link primary" href="#">🎬 My latest video</a>
      <a class="link" href="#">📸 Instagram</a>
      <a class="link" href="#">🐦 Twitter / X</a>
      <a class="link" href="#">💼 Hire me</a>
      <a class="link" href="mailto:you@example.com">✉️ Email me</a>
    </div>

    <div class="foot">Made with KUMG Forge</div>
  </div>
</body>
</html>`
  },
  {
    id: 'service',
    name: 'Service Business',
    tag: 'Business',
    desc: 'List your services, prices, and contact. For freelancers and small business.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Business</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;line-height:1.6;padding:32px 20px}
  .wrap{max-width:720px;margin:0 auto}
  .badge{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1F9D62;margin-bottom:14px}
  h1{font-size:clamp(28px,6vw,42px);font-weight:800;letter-spacing:-0.8px;margin-bottom:12px;line-height:1.15}
  .lead{color:#A8BAB1;font-size:17px;margin-bottom:40px;max-width:520px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#7A8C84;margin-bottom:16px;font-weight:700}
  .services{display:grid;gap:12px;margin-bottom:40px}
  .service{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:20px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
  .service h3{font-size:17px;margin-bottom:4px}
  .service p{font-size:14px;color:#7A8C84;margin:0}
  .price{color:#1F9D62;font-weight:800;font-size:16px;white-space:nowrap}
  .cta{display:block;background:#1F9D62;color:#04140C;text-align:center;font-weight:800;padding:18px;border-radius:14px;text-decoration:none;font-size:16px}
  .cta:hover{background:#25B874}
  footer{margin-top:40px;padding-top:24px;border-top:1px solid #1B2A24;font-size:13px;color:#5A6E65;text-align:center}
</style>
</head>
<body>
  <div class="wrap">
    <div class="badge">Now taking clients</div>
    <h1>Clean websites,<br>built fast.</h1>
    <p class="lead">I build beautiful, mobile-friendly websites for small businesses and independent creators.</p>

    <h2>Services</h2>
    <div class="services">
      <div class="service">
        <div><h3>Landing Page</h3><p>One-page site, ready in 3 days.</p></div>
        <div class="price">$150</div>
      </div>
      <div class="service">
        <div><h3>Full Website</h3><p>Up to 5 pages, SEO-ready.</p></div>
        <div class="price">$450</div>
      </div>
      <div class="service">
        <div><h3>Redesign</h3><p>Give your old site a modern look.</p></div>
        <div class="price">$250</div>
      </div>
    </div>

    <a class="cta" href="mailto:you@example.com">Get a quote</a>
    <footer>Available Mon–Fri · Harare &amp; remote</footer>
  </div>
</body>
</html>`
  },
  {
    id: 'product',
    name: 'Product Showcase',
    tag: 'Product',
    desc: 'Showcase a product with features, price, and buy button.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Product</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;line-height:1.6;padding:32px 20px}
  .wrap{max-width:720px;margin:0 auto}
  .hero{text-align:center;margin-bottom:48px}
  .tag{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1F9D62;margin-bottom:14px}
  h1{font-size:clamp(32px,7vw,48px);font-weight:800;letter-spacing:-1px;line-height:1.1;margin-bottom:16px}
  .lead{color:#A8BAB1;font-size:17px;margin-bottom:28px;max-width:480px;margin-left:auto;margin-right:auto}
  .buy{display:inline-block;background:#1F9D62;color:#04140C;font-weight:800;padding:16px 32px;border-radius:14px;text-decoration:none}
  .buy:hover{background:#25B874}
  .price{font-size:13px;color:#7A8C84;margin-top:10px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#7A8C84;margin-bottom:16px;font-weight:700}
  .features{display:grid;gap:12px;margin-bottom:40px}
  .feature{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:20px;display:flex;gap:14px}
  .feature .icon{width:36px;height:36px;border-radius:10px;background:#0B3D2E;display:grid;place-items:center;font-size:18px;flex-shrink:0}
  .feature h3{font-size:16px;margin-bottom:4px}
  .feature p{font-size:14px;color:#7A8C84;margin:0}
  .quote{background:#0F1512;border-left:3px solid #1F9D62;padding:20px;border-radius:0 14px 14px 0;color:#A8BAB1;font-style:italic}
  .quote .who{display:block;margin-top:10px;font-style:normal;font-size:13px;color:#7A8C84}
</style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <div class="tag">New Release</div>
      <h1>Your amazing<br>product.</h1>
      <p class="lead">A short, punchy description of what your product does and why it matters.</p>
      <a class="buy" href="#">Buy now</a>
      <div class="price">$29 · one-time payment</div>
    </div>

    <h2>What you get</h2>
    <div class="features">
      <div class="feature"><div class="icon">⚡</div><div><h3>Fast setup</h3><p>Up and running in under 2 minutes.</p></div></div>
      <div class="feature"><div class="icon">🔒</div><div><h3>Secure by default</h3><p>Your data stays yours. Always.</p></div></div>
      <div class="feature"><div class="icon">📱</div><div><h3>Works on mobile</h3><p>Designed for the phone in your hand.</p></div></div>
      <div class="feature"><div class="icon">💬</div><div><h3>Real support</h3><p>Talk to a human, not a bot.</p></div></div>
    </div>

    <h2>What people say</h2>
    <div class="quote">
      "I built my whole business site in an afternoon. Nothing else comes close."
      <span class="who">— Happy customer</span>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'event',
    name: 'Event Page',
    tag: 'Event',
    desc: 'Announce an event with date, location, and RSVP button.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Event Name</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;min-height:100vh;padding:32px 20px;display:flex;align-items:center;justify-content:center;line-height:1.6}
  .wrap{max-width:560px;width:100%}
  .tag{display:inline-block;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#1F9D62;margin-bottom:16px}
  h1{font-size:clamp(32px,7vw,48px);font-weight:800;letter-spacing:-1px;line-height:1.1;margin-bottom:20px}
  .meta{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:20px;margin-bottom:20px}
  .row{display:flex;align-items:center;gap:14px;padding:10px 0}
  .row + .row{border-top:1px solid #1B2A24}
  .row .icon{font-size:20px;width:28px;text-align:center}
  .row .label{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#7A8C84}
  .row .value{font-size:15px;font-weight:600}
  .desc{color:#A8BAB1;margin-bottom:28px}
  .cta{display:block;background:#1F9D62;color:#04140C;text-align:center;font-weight:800;padding:18px;border-radius:14px;text-decoration:none;font-size:16px}
  .cta:hover{background:#25B874}
  .foot{margin-top:20px;text-align:center;font-size:13px;color:#5A6E65}
</style>
</head>
<body>
  <div class="wrap">
    <div class="tag">You're invited</div>
    <h1>Event Name<br>2026</h1>
    <p class="desc">A one-day gathering for builders, makers, and the curious. Talks, workshops, and good food.</p>

    <div class="meta">
      <div class="row"><div class="icon">📅</div><div><div class="label">Date</div><div class="value">Sat, 14 March 2026</div></div></div>
      <div class="row"><div class="icon">🕐</div><div><div class="label">Time</div><div class="value">10:00 — 18:00</div></div></div>
      <div class="row"><div class="icon">📍</div><div><div class="label">Location</div><div class="value">Harare, Zimbabwe</div></div></div>
    </div>

    <a class="cta" href="#">RSVP now</a>
    <div class="foot">Limited to 100 seats</div>
  </div>
</body>
</html>`
  }
];

// Expose a lookup helper
function findTemplate(id){
  return KUMG_TEMPLATES.find(t => t.id === id) || null;
}