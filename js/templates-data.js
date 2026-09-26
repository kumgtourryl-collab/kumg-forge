// KUMG Forge — Starter templates
// Each template is a complete standalone HTML doc (styles inline).

const KUMG_TEMPLATES = [

  // ============================================================
  // 1. HERO LANDING
  // ============================================================
  {
    id: 'hero',
    name: 'Hero Landing',
    tag: 'Landing',
    desc: 'Bold headline, subtext, call-to-action. For products, waitlists, or launches.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Product</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:28px;line-height:1.5}
  .wrap{max-width:560px;text-align:center}
  .eyebrow{font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1F9D62;margin-bottom:22px}
  h1{font-size:clamp(34px,7vw,52px);line-height:1.05;font-weight:800;letter-spacing:-1.2px;margin-bottom:22px}
  h1 em{font-style:normal;color:#1F9D62}
  p.lead{font-size:17px;line-height:1.6;color:#A8BAB1;margin-bottom:32px}
  .cta{display:inline-block;background:#1F9D62;color:#04140C;font-weight:800;padding:16px 32px;border-radius:14px;text-decoration:none;font-size:15.5px;letter-spacing:.2px}
  .cta:hover{background:#25B874}
  .meta{margin-top:24px;font-size:13px;color:#5A6E65}
</style>
</head>
<body>
  <div class="wrap">
    <div class="eyebrow">Now Live</div>
    <h1>Build the web from your <em>pocket</em>.</h1>
    <p class="lead">The mobile-first editor that lets anyone design, preview, and publish real websites. No laptop. No installs.</p>
    <a class="cta" href="#">Get started free</a>
    <div class="meta">No credit card required</div>
  </div>
</body>
</html>`
  },

  // ============================================================
  // 2. PORTFOLIO
  // ============================================================
  {
    id: 'portfolio',
    name: 'Portfolio',
    tag: 'Personal',
    desc: 'Show your work with a photo, bio, and a clean grid of projects.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Name — Portfolio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;padding:36px 20px;line-height:1.6}
  .wrap{max-width:760px;margin:0 auto}
  header{display:flex;align-items:center;gap:18px;margin-bottom:44px}
  .avatar{width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#0B3D2E,#1F9D62);display:grid;place-items:center;font-weight:900;font-size:26px;color:#04140C;flex-shrink:0}
  h1{font-size:28px;font-weight:800;letter-spacing:-.6px;line-height:1.1}
  .role{color:#1F9D62;font-size:13.5px;font-weight:700;letter-spacing:.4px;margin-top:4px}
  .about{color:#A8BAB1;font-size:16px;margin-bottom:44px;max-width:560px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7A8C84;margin-bottom:18px;font-weight:800}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
  .card{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:22px;transition:border-color .15s}
  .card:hover{border-color:#1F9D62}
  .card h3{font-size:16.5px;margin-bottom:6px;font-weight:800}
  .card p{font-size:13.5px;color:#7A8C84;margin:0}
  footer{margin-top:60px;padding-top:24px;border-top:1px solid #1B2A24;font-size:13px;color:#5A6E65}
  footer a{color:#1F9D62;text-decoration:none;margin-right:18px;font-weight:600}
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

  // ============================================================
  // 3. LINK IN BIO
  // ============================================================
  {
    id: 'linkinbio',
    name: 'Link in Bio',
    tag: 'Social',
    desc: 'One page with all your links. Perfect for Instagram or TikTok bio.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>@yourhandle</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:28px}
  .wrap{width:100%;max-width:400px;text-align:center}
  .avatar{width:92px;height:92px;border-radius:50%;background:linear-gradient(135deg,#0B3D2E,#1F9D62);display:grid;place-items:center;font-weight:900;font-size:34px;color:#04140C;margin:0 auto 16px}
  h1{font-size:22px;font-weight:800;margin-bottom:4px}
  .handle{color:#7A8C84;font-size:13.5px;margin-bottom:10px}
  .bio{color:#A8BAB1;font-size:14px;margin-bottom:28px;line-height:1.55}
  .links{display:flex;flex-direction:column;gap:10px}
  .link{display:block;background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:16px;color:#E8F5EE;text-decoration:none;font-weight:700;font-size:14.5px;transition:all .15s}
  .link:hover{border-color:#1F9D62;background:#0B3D2E}
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
    <p class="bio">Creator. Designer. Building things on the internet.</p>

    <div class="links">
      <a class="link primary" href="#">Latest video</a>
      <a class="link" href="#">Instagram</a>
      <a class="link" href="#">Twitter / X</a>
      <a class="link" href="#">Hire me</a>
      <a class="link" href="mailto:you@example.com">Email me</a>
    </div>

    <div class="foot">Made with KUMG Forge</div>
  </div>
</body>
</html>`
  },

  // ============================================================
  // 4. SERVICE BUSINESS
  // ============================================================
  {
    id: 'service',
    name: 'Service Business',
    tag: 'Business',
    desc: 'List your services, prices, and contact. For freelancers and studios.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Business</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;line-height:1.6;padding:36px 20px}
  .wrap{max-width:720px;margin:0 auto}
  .eyebrow{display:inline-block;font-size:11.5px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#1F9D62;margin-bottom:16px}
  h1{font-size:clamp(28px,5.5vw,40px);font-weight:800;letter-spacing:-.8px;margin-bottom:14px;line-height:1.15}
  .lead{color:#A8BAB1;font-size:16.5px;margin-bottom:44px;max-width:520px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7A8C84;margin-bottom:18px;font-weight:800}
  .services{display:grid;gap:12px;margin-bottom:44px}
  .service{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:22px;display:flex;justify-content:space-between;align-items:flex-start;gap:20px}
  .service h3{font-size:17px;margin-bottom:5px;font-weight:800}
  .service p{font-size:14px;color:#7A8C84;margin:0}
  .price{color:#1F9D62;font-weight:800;font-size:16.5px;white-space:nowrap}
  .cta{display:block;background:#1F9D62;color:#04140C;text-align:center;font-weight:800;padding:18px;border-radius:14px;text-decoration:none;font-size:16px}
  .cta:hover{background:#25B874}
  footer{margin-top:44px;padding-top:24px;border-top:1px solid #1B2A24;font-size:13px;color:#5A6E65;text-align:center}
</style>
</head>
<body>
  <div class="wrap">
    <div class="eyebrow">Now taking clients</div>
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

  // ============================================================
  // 5. PRODUCT SHOWCASE
  // ============================================================
  {
    id: 'product',
    name: 'Product Showcase',
    tag: 'Product',
    desc: 'Features, price, buy button. For selling one product.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Product</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;line-height:1.6;padding:36px 20px}
  .wrap{max-width:720px;margin:0 auto}
  .hero{text-align:center;margin-bottom:52px}
  .tag{display:inline-block;font-size:11.5px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#1F9D62;margin-bottom:14px}
  h1{font-size:clamp(32px,6.5vw,46px);font-weight:800;letter-spacing:-1px;line-height:1.1;margin-bottom:16px}
  .lead{color:#A8BAB1;font-size:17px;margin-bottom:28px;max-width:480px;margin-left:auto;margin-right:auto}
  .buy{display:inline-block;background:#1F9D62;color:#04140C;font-weight:800;padding:16px 34px;border-radius:14px;text-decoration:none;font-size:15.5px}
  .buy:hover{background:#25B874}
  .price{margin-top:12px;font-size:13px;color:#7A8C84}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#7A8C84;margin-bottom:18px;font-weight:800}
  .features{display:grid;gap:12px;margin-bottom:44px}
  .feature{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:20px;display:flex;gap:16px}
  .feature .ic{width:38px;height:38px;border-radius:10px;background:#0B3D2E;display:grid;place-items:center;color:#1F9D62;flex-shrink:0;font-weight:900;font-size:16px}
  .feature h3{font-size:15.5px;margin-bottom:4px;font-weight:800}
  .feature p{font-size:13.5px;color:#7A8C84;margin:0}
  .quote{background:#0F1512;border-left:3px solid #1F9D62;padding:22px;border-radius:0 14px 14px 0;color:#A8BAB1;font-style:italic;line-height:1.65}
  .quote .who{display:block;margin-top:12px;font-style:normal;font-size:13px;color:#7A8C84}
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
      <div class="feature"><div class="ic">01</div><div><h3>Fast setup</h3><p>Up and running in under 2 minutes.</p></div></div>
      <div class="feature"><div class="ic">02</div><div><h3>Secure by default</h3><p>Your data stays yours. Always.</p></div></div>
      <div class="feature"><div class="ic">03</div><div><h3>Works on mobile</h3><p>Designed for the phone in your hand.</p></div></div>
      <div class="feature"><div class="ic">04</div><div><h3>Real support</h3><p>Talk to a human, not a bot.</p></div></div>
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

  // ============================================================
  // 6. EVENT
  // ============================================================
  {
    id: 'event',
    name: 'Event Page',
    tag: 'Event',
    desc: 'Date, location, RSVP button. For conferences, workshops, church events.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Event Name</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;min-height:100vh;padding:36px 20px;display:flex;align-items:center;justify-content:center;line-height:1.6}
  .wrap{max-width:560px;width:100%}
  .tag{display:inline-block;font-size:11.5px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#1F9D62;margin-bottom:16px}
  h1{font-size:clamp(32px,6.5vw,46px);font-weight:800;letter-spacing:-1px;line-height:1.08;margin-bottom:20px}
  .meta{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:22px;margin-bottom:22px}
  .row{display:flex;align-items:center;gap:16px;padding:12px 0}
  .row + .row{border-top:1px solid #1B2A24}
  .row .dot{width:8px;height:8px;border-radius:50%;background:#1F9D62;flex-shrink:0}
  .row .label{font-size:10.5px;text-transform:uppercase;letter-spacing:1.2px;color:#7A8C84;font-weight:800}
  .row .value{font-size:15px;font-weight:700;margin-top:2px}
  .desc{color:#A8BAB1;margin-bottom:30px;font-size:15.5px}
  .cta{display:block;background:#1F9D62;color:#04140C;text-align:center;font-weight:800;padding:18px;border-radius:14px;text-decoration:none;font-size:16px}
  .cta:hover{background:#25B874}
  .foot{margin-top:22px;text-align:center;font-size:13px;color:#5A6E65}
</style>
</head>
<body>
  <div class="wrap">
    <div class="tag">You're invited</div>
    <h1>Event Name<br>2026</h1>
    <p class="desc">A one-day gathering for builders, makers, and the curious. Talks, workshops, and good food.</p>

    <div class="meta">
      <div class="row"><div class="dot"></div><div><div class="label">Date</div><div class="value">Sat, 14 March 2026</div></div></div>
      <div class="row"><div class="dot"></div><div><div class="label">Time</div><div class="value">10:00 — 18:00</div></div></div>
      <div class="row"><div class="dot"></div><div><div class="label">Location</div><div class="value">Harare, Zimbabwe</div></div></div>
    </div>

    <a class="cta" href="#">RSVP now</a>
    <div class="foot">Limited to 100 seats</div>
  </div>
</body>
</html>`
  },

  // ============================================================
  // 7. RESTAURANT MENU
  // ============================================================
  {
    id: 'menu',
    name: 'Restaurant Menu',
    tag: 'Food',
    desc: 'Prices, categories, WhatsApp order button. For restaurants and takeaways.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Your Restaurant</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;padding:36px 20px;line-height:1.6}
  .wrap{max-width:680px;margin:0 auto}
  header{text-align:center;margin-bottom:44px}
  .logo{width:76px;height:76px;border-radius:20px;background:linear-gradient(135deg,#0B3D2E,#1F9D62);display:grid;place-items:center;font-weight:900;font-size:28px;color:#04140C;margin:0 auto 16px}
  h1{font-size:30px;font-weight:800;letter-spacing:-.6px;margin-bottom:6px}
  .sub{color:#A8BAB1;font-size:14.5px}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#1F9D62;margin:32px 0 14px;font-weight:800}
  .item{display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-bottom:1px solid #1B2A24}
  .item:last-child{border-bottom:0}
  .item .nm{font-weight:700;font-size:15.5px;margin-bottom:3px}
  .item .dsc{color:#7A8C84;font-size:13.5px}
  .item .pr{color:#1F9D62;font-weight:800;font-size:15.5px;white-space:nowrap}
  .cta{display:block;background:#25D366;color:#04140C;text-align:center;font-weight:800;padding:18px;border-radius:14px;text-decoration:none;font-size:16px;margin-top:32px}
  footer{margin-top:24px;text-align:center;font-size:13px;color:#5A6E65}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="logo">Y</div>
      <h1>Your Restaurant</h1>
      <div class="sub">Home cooking, done right.</div>
    </header>

    <h2>Starters</h2>
    <div class="item"><div><div class="nm">Sadza &amp; Greens</div><div class="dsc">Classic. Simple. Perfect.</div></div><div class="pr">$4</div></div>
    <div class="item"><div><div class="nm">Beef Stew</div><div class="dsc">Slow-cooked, tender.</div></div><div class="pr">$7</div></div>

    <h2>Mains</h2>
    <div class="item"><div><div class="nm">Grilled Chicken</div><div class="dsc">With rice and salad.</div></div><div class="pr">$10</div></div>
    <div class="item"><div><div class="nm">Beef Curry</div><div class="dsc">Served with pap.</div></div><div class="pr">$9</div></div>
    <div class="item"><div><div class="nm">Fish &amp; Chips</div><div class="dsc">Crispy, fresh, hot.</div></div><div class="pr">$8</div></div>

    <h2>Drinks</h2>
    <div class="item"><div><div class="nm">Soft Drink</div><div class="dsc">Cold cans.</div></div><div class="pr">$2</div></div>
    <div class="item"><div><div class="nm">Fresh Juice</div><div class="dsc">Seasonal fruit.</div></div><div class="pr">$3</div></div>

    <a class="cta" href="https://wa.me/263771234567">Order on WhatsApp</a>
    <footer>Open Mon–Sat · 10:00–21:00</footer>
  </div>
</body>
</html>`
  },

  // ============================================================
  // 8. COMMUNITY / CHURCH
  // ============================================================
  {
    id: 'community',
    name: 'Community Page',
    tag: 'Community',
    desc: 'For churches, clubs, or community groups. Events, contact, giving.',
    html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Community</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;background:#0A0A0A;color:#E8F5EE;padding:36px 20px;line-height:1.6}
  .wrap{max-width:680px;margin:0 auto}
  header{text-align:center;margin-bottom:44px}
  .badge{width:76px;height:76px;border-radius:50%;background:linear-gradient(135deg,#0B3D2E,#1F9D62);display:grid;place-items:center;margin:0 auto 18px;color:#04140C;font-weight:900;font-size:28px}
  h1{font-size:30px;font-weight:800;letter-spacing:-.6px;margin-bottom:8px}
  .sub{color:#A8BAB1;font-size:15px;max-width:480px;margin:0 auto}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#1F9D62;margin:36px 0 14px;font-weight:800}
  .event{background:#0F1512;border:1px solid #1B2A24;border-radius:14px;padding:20px;margin-bottom:12px}
  .event h3{font-size:16.5px;font-weight:800;margin-bottom:4px}
  .event .when{font-size:13px;color:#7A8C84}
  .cta-row{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}
  .cta-row a{flex:1;min-width:140px;text-align:center;padding:16px;border-radius:14px;text-decoration:none;font-weight:800;font-size:14.5px}
  .cta-row .primary{background:#1F9D62;color:#04140C}
  .cta-row .ghost{background:transparent;border:1px solid #1B2A24;color:#E8F5EE}
  footer{margin-top:36px;padding-top:22px;border-top:1px solid #1B2A24;text-align:center;font-size:13px;color:#5A6E65}
</style>
</head>
<body>
  <div class="wrap">
    <header>
      <div class="badge">C</div>
      <h1>Your Community</h1>
      <p class="sub">A place to belong. Weekly gatherings, service, and community.</p>
    </header>

    <h2>Upcoming</h2>
    <div class="event"><h3>Sunday Service</h3><div class="when">Every Sunday · 10:00 AM</div></div>
    <div class="event"><h3>Mid-Week Bible Study</h3><div class="when">Wednesdays · 6:00 PM</div></div>
    <div class="event"><h3>Youth Night</h3><div class="when">First Friday of the month · 5:30 PM</div></div>

    <div class="cta-row">
      <a class="primary" href="#">Join us Sunday</a>
      <a class="ghost" href="mailto:hello@example.com">Contact us</a>
    </div>

    <footer>123 Example St, Harare, Zimbabwe</footer>
  </div>
</body>
</html>`
  }

];

// Lookup helper
function findTemplate(id){
  return KUMG_TEMPLATES.find(function(t){ return t.id === id; }) || null;
}
