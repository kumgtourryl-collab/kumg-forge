// KUMG Forge — HTML tag reference
const KUMG_HTML_TAGS = [
  // === Text ===
  { tag:'h1', cat:'Text', desc:'Top-level heading', example:'<h1>Hello world</h1>' },
  { tag:'h2', cat:'Text', desc:'Second-level heading', example:'<h2>Section title</h2>' },
  { tag:'h3', cat:'Text', desc:'Third-level heading', example:'<h3>Subsection</h3>' },
  { tag:'p', cat:'Text', desc:'Paragraph of text', example:'<p>Some text here.</p>' },
  { tag:'br', cat:'Text', desc:'Line break', example:'Line one<br>Line two' },
  { tag:'hr', cat:'Text', desc:'Horizontal divider', example:'<hr>' },
  { tag:'strong', cat:'Text', desc:'Bold/important text', example:'<strong>Important</strong>' },
  { tag:'em', cat:'Text', desc:'Italic/emphasis', example:'<em>Emphasis</em>' },
  { tag:'mark', cat:'Text', desc:'Highlighted text', example:'<mark>Highlighted</mark>' },
  { tag:'small', cat:'Text', desc:'Smaller text', example:'<small>Fine print</small>' },
  { tag:'blockquote', cat:'Text', desc:'Quoted block', example:'<blockquote>Wise words.</blockquote>' },
  { tag:'code', cat:'Text', desc:'Inline code', example:'<code>console.log()</code>' },
  { tag:'pre', cat:'Text', desc:'Preformatted text', example:'<pre>  spaced\n  text</pre>' },

  // === Links & Media ===
  { tag:'a', cat:'Links & Media', desc:'Hyperlink', example:'<a href="https://example.com">Visit</a>' },
  { tag:'img', cat:'Links & Media', desc:'Image', example:'<img src="photo.jpg" alt="Photo">' },
  { tag:'video', cat:'Links & Media', desc:'Video player', example:'<video src="clip.mp4" controls></video>' },
  { tag:'audio', cat:'Links & Media', desc:'Audio player', example:'<audio src="song.mp3" controls></audio>' },
  { tag:'iframe', cat:'Links & Media', desc:'Embed another page', example:'<iframe src="https://example.com"></iframe>' },
  { tag:'picture', cat:'Links & Media', desc:'Responsive image', example:'<picture><source srcset="big.jpg" media="(min-width:800px)"><img src="small.jpg"></picture>' },

  // === Lists ===
  { tag:'ul', cat:'Lists', desc:'Unordered (bullet) list', example:'<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>' },
  { tag:'ol', cat:'Lists', desc:'Ordered (numbered) list', example:'<ol>\n  <li>First</li>\n  <li>Second</li>\n</ol>' },
  { tag:'li', cat:'Lists', desc:'List item', example:'<li>Item</li>' },
  { tag:'dl', cat:'Lists', desc:'Description list', example:'<dl>\n  <dt>Term</dt>\n  <dd>Definition</dd>\n</dl>' },

  // === Structure ===
  { tag:'div', cat:'Structure', desc:'Generic container', example:'<div class="box">Content</div>' },
  { tag:'span', cat:'Structure', desc:'Inline container', example:'<span class="highlight">Text</span>' },
  { tag:'header', cat:'Structure', desc:'Page/section header', example:'<header><h1>Site</h1></header>' },
  { tag:'footer', cat:'Structure', desc:'Page/section footer', example:'<footer>© 2026</footer>' },
  { tag:'nav', cat:'Structure', desc:'Navigation links', example:'<nav><a href="/">Home</a></nav>' },
  { tag:'main', cat:'Structure', desc:'Main content area', example:'<main>...</main>' },
  { tag:'section', cat:'Structure', desc:'Thematic section', example:'<section><h2>About</h2></section>' },
  { tag:'article', cat:'Structure', desc:'Self-contained content', example:'<article><h2>Post</h2></article>' },
  { tag:'aside', cat:'Structure', desc:'Sidebar content', example:'<aside>Related links</aside>' },

  // === Forms ===
  { tag:'form', cat:'Forms', desc:'Form container', example:'<form action="/submit" method="post">...</form>' },
  { tag:'input', cat:'Forms', desc:'Input field', example:'<input type="text" placeholder="Name">' },
  { tag:'textarea', cat:'Forms', desc:'Multi-line input', example:'<textarea rows="4"></textarea>' },
  { tag:'button', cat:'Forms', desc:'Clickable button', example:'<button type="submit">Send</button>' },
  { tag:'select', cat:'Forms', desc:'Dropdown', example:'<select>\n  <option>One</option>\n</select>' },
  { tag:'option', cat:'Forms', desc:'Dropdown option', example:'<option value="1">One</option>' },
  { tag:'label', cat:'Forms', desc:'Input label', example:'<label for="name">Name</label>' },

  // === Tables ===
  { tag:'table', cat:'Tables', desc:'Table', example:'<table><tr><td>Cell</td></tr></table>' },
  { tag:'tr', cat:'Tables', desc:'Table row', example:'<tr><td>Data</td></tr>' },
  { tag:'td', cat:'Tables', desc:'Table cell', example:'<td>Cell</td>' },
  { tag:'th', cat:'Tables', desc:'Table header cell', example:'<th>Header</th>' },

  // === Meta (in <head>) ===
  { tag:'title', cat:'Meta', desc:'Page title (tab text)', example:'<title>My Site</title>' },
  { tag:'meta', cat:'Meta', desc:'Metadata (charset, viewport)', example:'<meta charset="utf-8">' },
  { tag:'link', cat:'Meta', desc:'Link external file (CSS)', example:'<link rel="stylesheet" href="style.css">' },
  { tag:'script', cat:'Meta', desc:'Include JavaScript', example:'<script src="app.js"><\/script>' },
  { tag:'style', cat:'Meta', desc:'Inline CSS', example:'<style>body{color:red}</style>' },

  // === Common CSS ===
  { tag:'color', cat:'CSS', desc:'Text color', example:'color: #1F9D62;' },
  { tag:'background', cat:'CSS', desc:'Background color/image', example:'background: #0A0A0A;' },
  { tag:'font-size', cat:'CSS', desc:'Text size', example:'font-size: 18px;' },
  { tag:'padding', cat:'CSS', desc:'Inner spacing', example:'padding: 16px;' },
  { tag:'margin', cat:'CSS', desc:'Outer spacing', example:'margin: 8px auto;' },
  { tag:'border-radius', cat:'CSS', desc:'Rounded corners', example:'border-radius: 14px;' },
  { tag:'flex', cat:'CSS', desc:'Flexbox display', example:'display: flex; gap: 12px;' },
  { tag:'grid', cat:'CSS', desc:'Grid display', example:'display: grid; gap: 12px;' },
  { tag:'media', cat:'CSS', desc:'Responsive breakpoint', example:'@media (min-width: 800px) { ... }' }
];