// KUMG Tap — dashboard sponsored card logic

let currentSponsor = null;

async function loadSponsorCard(){
  const cardEl = document.getElementById('sponsorCard');
  if (!cardEl) return;

  const { data: { session } } = await db.auth.getSession();
  if (!session) return;

  // Check daily tap cap
  const { data: todayCount } = await db.rpc('taps_today', { uid: session.user.id });
  if ((todayCount || 0) >= 50){
    cardEl.innerHTML = `
      <div style="font-size:12.5px;color:var(--muted);text-align:center;padding:10px">
        You've reached today's tap limit (50). Come back tomorrow.
      </div>`;
    return;
  }

  // Pick a random active sponsor with balance
  const { data: sponsors } = await db
    .from('sponsors')
    .select('id, business_name, card_title, card_description, card_image_url, target_url, bid_per_tap, balance')
    .eq('is_active', true)
    .gt('balance', 0)
    .limit(20);

  if (!sponsors || !sponsors.length){
    cardEl.innerHTML = `
      <div style="font-size:12.5px;color:var(--muted);text-align:center;padding:10px">
        No sponsored cards yet. Check back soon.
      </div>`;
    return;
  }

  // Prefer a sponsor this user hasn't tapped today
  const { data: recent } = await db
    .from('taps')
    .select('sponsor_id')
    .eq('user_id', session.user.id)
    .gte('created_at', new Date().toISOString().slice(0,10));
  const tapped = new Set((recent || []).map(t => t.sponsor_id));
  const fresh = sponsors.filter(s => !tapped.has(s.id));
  const pool = fresh.length ? fresh : sponsors;

  currentSponsor = pool[Math.floor(Math.random() * pool.length)];
  renderSponsorCard(cardEl, currentSponsor);
}

function renderSponsorCard(cardEl, sponsor){
  const initial = (sponsor.business_name || '?')[0].toUpperCase();
  const img = sponsor.card_image_url
    ? `<img src="${sponsor.card_image_url}" alt="">`
    : initial;

  cardEl.innerHTML = `
    <div class="sponsor-head">
      <div class="sponsor-badge">Sponsored</div>
      <div class="sponsor-reward">Earn $${(sponsor.bid_per_tap / 2).toFixed(3)}</div>
    </div>
    <div class="sponsor-body">
      <div class="sponsor-img">${img}</div>
      <div class="sponsor-txt">
        <div class="sponsor-name">${escapeHtml(sponsor.business_name)}</div>
        <div class="sponsor-title">${escapeHtml(sponsor.card_title || '')}</div>
        <div class="sponsor-desc">${escapeHtml(sponsor.card_description || '')}</div>
      </div>
    </div>
    <button class="sponsor-btn" id="tapBtn">Tap to earn &amp; visit</button>
  `;

  document.getElementById('tapBtn').addEventListener('click', async () => {
    const btn = document.getElementById('tapBtn');
    btn.disabled = true;
    btn.textContent = 'Processing…';

    try {
      const { data, error } = await db.rpc('record_tap', {
        p_user_id: (await db.auth.getSession()).data.session.user.id,
        p_sponsor_id: sponsor.id
      });

      if (error || !data?.ok){
        btn.disabled = false;
        btn.textContent = 'Tap to earn & visit';
        if (data?.reason === 'daily_limit') alert('You reached today\'s tap limit.');
        else if (data?.reason === 'sponsor_broke') alert('This sponsor ran out of balance.');
        else alert('Could not record tap. Try again.');
        return;
      }

      btn.textContent = '✅ Earned $' + (data.user_share_cents / 100).toFixed(2);
      if (sponsor.target_url){
        setTimeout(() => window.open(sponsor.target_url, '_blank'), 600);
      }
      setTimeout(() => loadSponsorCard(), 2000);
    } catch (err){
      console.error(err);
      btn.disabled = false;
      btn.textContent = 'Tap to earn & visit';
    }
  });
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}
