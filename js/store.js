// TouRryl Store — shared helpers

// Convert any phone to WhatsApp format: 263773599014
function waNumber(phone){
  if (!phone) return '';
  return String(phone).replace(/[^\d]/g, '').replace(/^0/, '263');
}

// Format money
function fmtMoney(amount, currency){
  const n = Number(amount || 0);
  const cur = currency || 'USD';
  if (cur === 'USD') return '$' + n.toFixed(2);
  if (cur === 'ZWG') return 'ZWG ' + n.toFixed(2);
  return cur + ' ' + n.toFixed(2);
}

// Theme colors
const STORE_THEMES = {
  green: { bg: '#0A0A0A', accent: '#1F9D62', accentDark: '#0B3D2E', text: '#E8F5EE', muted: '#7A8C84' },
  dark:  { bg: '#000000', accent: '#4A4A4A', accentDark: '#1A1A1A', text: '#FFFFFF', muted: '#888888' },
  light: { bg: '#F5F7F5', accent: '#148A56', accentDark: '#0B3D2E', text: '#0A1F17', muted: '#5F6E66' },
  gold:  { bg: '#0F0A00', accent: '#E5B93D', accentDark: '#7A5A10', text: '#FFF8E5', muted: '#A08850' },
  red:   { bg: '#1A0A0A', accent: '#E5484D', accentDark: '#6B1F1F', text: '#FFE8E8', muted: '#A06060' }
};

function themeFor(name){
  return STORE_THEMES[name] || STORE_THEMES.green;
}

// Escape HTML
function escHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

// Slugify
function storeSlugify(str){
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

// Build WhatsApp checkout link
function buildWhatsAppOrder(shop, cart){
  const num = waNumber(shop.whatsapp);
  if (!num) return null;

  let lines = [`Hi ${shop.name}! I want to order:`, ''];
  let total = 0;

  cart.forEach(item => {
    const lineTotal = item.price * item.qty;
    total += lineTotal;
    lines.push(`• ${item.qty}x ${item.name} — ${fmtMoney(lineTotal, item.currency)}`);
  });

  lines.push('');
  lines.push(`Total: ${fmtMoney(total, cart[0]?.currency || 'USD')}`);

  if (shop.ecocash){
    lines.push('');
    lines.push(`I'll pay via EcoCash to ${shop.ecocash}.`);
  }

  lines.push('');
  lines.push('My details:');
  lines.push('Name: ');
  lines.push('Address: ');

  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/${num}?text=${text}`;
}
