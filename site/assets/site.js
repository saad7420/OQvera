/* Portfolio interactions: header, menu, reveal, scroll-lit text, filters, contact form, chat. */
(() => {
  'use strict';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header + mobile menu */
  const head = $('.site-head');
  const onScroll = () => head && head.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menu = $('.menu-btn'), nav = $('.nav');
  if (menu && nav){
    menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); });
    $$('a', nav).forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }));
  }

  /* reveal once on scroll */
  if (!reduce && 'IntersectionObserver' in window){
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(el => io.observe(el));
  } else $$('.rv').forEach(el => el.classList.add('in'));

  /* about text lights up word by word as it scrolls through the viewport */
  const scrub = $('.scrub');
  if (scrub){
    $$('p', scrub).forEach(p => { p.innerHTML = p.textContent.split(/(\s+)/).map(t => /\s+/.test(t) ? t : `<span class="w">${t.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</span>`).join(''); });
    const words = $$('.w', scrub);
    if (reduce) words.forEach(w => w.classList.add('lit'));
    else {
      let ticking = false;
      const update = () => { ticking = false; const r = scrub.getBoundingClientRect(); const vh = innerHeight;
        const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
        const n = Math.round(p * words.length); words.forEach((w, i) => w.classList.toggle('lit', i < n)); };
      addEventListener('scroll', () => { if (!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive: true }); update();
    }
  }

  /* case-study table of contents highlight */
  const toc = $$('.toc a');
  if (toc.length && 'IntersectionObserver' in window){
    const map = new Map(toc.map(a => [a.getAttribute('href').slice(1), a]));
    const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ toc.forEach(a => a.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); } }), { rootMargin: '-30% 0px -60% 0px' });
    map.forEach((a, id) => { const s = document.getElementById(id); if (s) io2.observe(s); });
  }

  /* project filters */
  const filters = $('.filters');
  if (filters){
    const cards = $$('.card'); const count = $('.count');
    const apply = k => { let n = 0; cards.forEach(c => { const show = k === 'all' || c.dataset.kind.split(' ').includes(k); c.hidden = !show; if (show) n++; });
      $$('button', filters).forEach(b => b.setAttribute('aria-pressed', b.dataset.k === k)); if (count) count.textContent = `${n} ${n === 1 ? 'project' : 'projects'}`;
      try { history.replaceState(null, '', k === 'all' ? location.pathname : `#${k}`); } catch {} };
    filters.addEventListener('click', e => { const b = e.target.closest('button'); if (b) apply(b.dataset.k); });
    const h = location.hash.slice(1); apply($$('button', filters).some(b => b.dataset.k === h) ? h : 'all');
  }

  /* contact form → Make webhook (same payload shape as the OQVERA site) */
  const form = $('#contactForm');
  if (form){
    const status = $('#formStatus'); const btn = $('button[type=submit]', form);
    const setBad = (name, bad) => form.elements[name].closest('.field').classList.toggle('bad', bad);
    // prefill the inquiry type when arriving from a "Request a demo" button
    const pre = new URLSearchParams(location.search).get('topic'); if (pre && form.elements.service){ const o = [...form.elements.service.options].find(o => o.value === pre); if (o) form.elements.service.value = pre; }
    const pm = new URLSearchParams(location.search).get('project'); if (pm && !form.elements.message.value) form.elements.message.value = `I'd like a demo of: ${pm}\n\n`;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.elements.website.value) return; // bot trap
      const name = form.elements.name.value.trim(), email = form.elements.email.value.trim(), service = form.elements.service.value, message = form.elements.message.value.trim();
      const bad = { name: name.length < 2, email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email), service: !service, message: message.length < 10 };
      Object.entries(bad).forEach(([k, v]) => setBad(k, v));
      const first = Object.keys(bad).find(k => bad[k]); if (first){ form.elements[first].focus(); return; }
      const payload = { name, email, company: form.elements.company.value.trim() || '—', phone: form.elements.phone.value.trim() || '—', service, timeline: form.elements.timeline.value || '—', message,
        status: 'New', source: 'Portfolio website', page: location.pathname, submitted_at: new Date().toISOString() };
      btn.disabled = true; const label = btn.querySelector('span'); const old = label.textContent; label.textContent = 'Sending…';
      status.className = 'form-status';
      try {
        const res = await fetch(form.dataset.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(String(res.status));
        status.className = 'form-status show ok'; status.textContent = `Thanks, ${name.split(' ')[0]}. Your message is on its way — I reply within one business day at ${email}.`;
        form.reset();
      } catch {
        status.className = 'form-status show err'; status.innerHTML = `Your message didn't send. Check your connection and try again, or email me at <a href="mailto:${form.dataset.email}">${form.dataset.email}</a>.`;
      } finally { btn.disabled = false; label.textContent = old; }
    });
    $$('input,select,textarea', form).forEach(el => el.addEventListener('input', () => el.closest('.field')?.classList.remove('bad')));
  }

  /* ---------- chat assistant ---------- */
  const fab = $('.chat-fab'), chat = $('#chat');
  if (fab && chat){
    const log = $('.chat-log', chat), input = $('.chat-form input', chat), sugs = $('.chat-sugs', chat);
    const KEY = 'sm.chat.v1'; let history = [];
    try { history = JSON.parse(sessionStorage.getItem(KEY)) || []; } catch {}
    const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(history.slice(-20))); } catch {} };
    const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const linkify = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+|mailto:[^)\s]+)\)/g, '<a href="$2">$1</a>').replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    const add = (role, text) => { const d = document.createElement('div'); d.className = 'msg ' + (role === 'user' ? 'me' : 'bot'); d.innerHTML = role === 'user' ? esc(text) : linkify(text); log.appendChild(d); log.scrollTop = log.scrollHeight; return d; };
    const greet = "Hi! I'm Saad's assistant. Ask me about his projects, skills, or how to hire him — I can also point you to the right case study.";
    const render = () => { log.innerHTML = ''; add('assistant', greet); history.forEach(m => add(m.role, m.content)); sugs.hidden = history.length > 0; };
    const open = () => { chat.hidden = false; fab.setAttribute('aria-expanded', 'true'); if (!log.children.length) render(); setTimeout(() => input.focus(), 50); };
    const close = () => { chat.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); };
    fab.addEventListener('click', open); $('.chat-close', chat).addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !chat.hidden) close(); });
    let busy = false;
    async function send(text){
      text = text.trim(); if (!text || busy) return; busy = true; sugs.hidden = true;
      add('user', text); history.push({ role: 'user', content: text }); input.value = '';
      const t = add('assistant', ''); t.classList.add('typing'); t.innerHTML = '<i></i><i></i><i></i>';
      let reply = '';
      try {
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-12) }) });
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) reply = data.error || "You're sending messages quickly — give it a few seconds and try again.";
        else if (!res.ok || !data.reply) throw new Error('offline');
        else reply = data.reply;
      } catch { reply = window.SM_LOCAL_ANSWER ? window.SM_LOCAL_ANSWER(text) : "I can't reach the assistant right now. You can email Saad at mehmoodsaad042@gmail.com."; }
      t.classList.remove('typing'); t.innerHTML = linkify(reply); log.scrollTop = log.scrollHeight;
      history.push({ role: 'assistant', content: reply }); save(); busy = false; input.focus();
    }
    $('.chat-form', chat).addEventListener('submit', e => { e.preventDefault(); send(input.value); });
    sugs.addEventListener('click', e => { const b = e.target.closest('button'); if (b) send(b.textContent); });
    $$('[data-open-chat]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); open(); }));
  }
})();
