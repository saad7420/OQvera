// Builds the static portfolio into ../site from data.js.  Run: node build.js
const fs = require('fs');
const path = require('path');
const { profile: P, skills, experience, projects, KINDS } = require('./data');
const OUT = path.join(__dirname, 'site');
fs.rmSync(OUT, { recursive: true, force: true });

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const csList = projects.filter(p => p.caseStudy);
const csUrl = p => `/case-studies/${p.slug}.html`;

const I = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  agent: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 7V4M9 12h.01M15 12h.01M9 16h6"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.6A8 8 0 1 1 21 12z"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  menu: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
};

function head({ title, desc, url }){
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#000000">
<link rel="canonical" href="${P.site}${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${P.site}${url}">
<meta property="og:image" content="${P.site}/assets/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=JetBrains+Mono:wght@500&display=swap">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
<a class="skip" href="#main">Skip to content</a>`;
}

const NAV = [['/', 'Home'], ['/projects.html', 'Projects'], ['/case-studies.html', 'Case studies'], ['/#about', 'About'], ['/#contact', 'Contact']];
function header(active){
  return `<header class="site-head"><div class="wrap head-in">
  <a class="logo" href="/" aria-label="Saad Mehmood, home"><span class="logo-mark" aria-hidden="true">SM</span><span>Saad Mehmood</span></a>
  <nav class="nav" id="nav" aria-label="Main">${NAV.map(([h, l]) => `<a href="${h}"${active === h ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
  <a class="btn btn-primary btn-sm head-cta" href="/#contact">Hire me</a>
  <button class="menu-btn" type="button" aria-controls="nav" aria-expanded="false" aria-label="Menu">${I.menu}</button>
</div></header>`;
}

function footer(){
  return `<footer class="site-foot"><div class="wrap foot-in">
  <span>© ${new Date().getFullYear()} ${P.name} · AI/ML Engineer · Founder of OQVERA</span>
  <div class="foot-links"><a href="/projects.html">Projects</a><a href="/case-studies.html">Case studies</a><a href="${P.github}" target="_blank" rel="noopener">GitHub</a><a href="${P.linkedin}" target="_blank" rel="noopener">LinkedIn</a><a href="${P.x}" target="_blank" rel="noopener">X</a><a href="mailto:${P.email}">Email</a></div>
</div></footer>
<button class="chat-fab" type="button" aria-controls="chat" aria-expanded="false"><span class="dot">${I.chat}</span><span>Ask my AI assistant</span></button>
<section class="chat" id="chat" hidden aria-label="Chat with Saad's AI assistant">
  <div class="chat-head"><img src="/assets/saad.webp" alt="" width="36" height="36"><div><b>Saad's assistant</b><span><i></i>Answers about my work, usually instantly</span></div><button class="chat-close" type="button" aria-label="Close chat">${I.close}</button></div>
  <div class="chat-log" role="log" aria-live="polite"></div>
  <div class="chat-sugs"><button type="button">What has Saad built with LangGraph?</button><button type="button">Tell me about DeepTruth</button><button type="button">Is he available for freelance work?</button></div>
  <form class="chat-form"><label class="hp" for="chatIn">Message</label><input id="chatIn" type="text" placeholder="Ask about projects, skills, hiring…" autocomplete="off" maxlength="1500"><button type="submit" aria-label="Send">${I.send}</button></form>
  <div class="chat-note">AI can make mistakes. For anything important, use the contact form.</div>
</section>
<script src="/assets/kb.js" defer></script>
<script src="/assets/site.js" defer></script>
</body>
</html>`;
}

const flow = (steps, cls = '') => `<ol class="flow ${cls}" aria-label="How it works, step by step">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`;
const tags = (list, n) => `<ul class="tags" aria-label="Technologies">${(n ? list.slice(0, n) : list).map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
function buttons(p, { withCs = true, size = 'btn-sm' } = {}){
  const b = [];
  if (withCs && p.caseStudy) b.push(`<a class="btn btn-primary ${size}" href="${csUrl(p)}">Read the case study ${I.arrow}</a>`);
  if (p.links.demo) b.push(`<a class="btn btn-ghost ${size}" href="${p.links.demo}" target="_blank" rel="noopener">Live demo</a>`);
  if (p.links.github) b.push(`<a class="btn btn-quiet ${size}" href="${p.links.github}" target="_blank" rel="noopener">${I.github} Code</a>`);
  if (p.links.contact) b.push(`<a class="btn btn-ghost ${size}" href="/?topic=demo&project=${encodeURIComponent(p.title)}#contact">Request a demo</a>`);
  return `<div class="actions">${b.join('')}</div>`;
}
const kindLabel = p => p.kind.map(k => KINDS[k]).join(' and ');

function contactSection(){
  return `<section class="sec" id="contact"><div class="wrap contact">
  <div class="rv">
    <h2>Get in touch</h2>
    <p class="lede">Hiring for an AI role, or have a process you want an agent to handle? Tell me about it — every message comes straight to me.</p>
    <ul class="cinfo">
      <li><span class="ic">${I.mail}</span><div><b>Email</b><a href="mailto:${P.email}">${P.email}</a></div></li>
      <li><span class="ic">${I.pin}</span><div><b>Based in</b><span>${esc(P.location)}</span></div></li>
      <li><span class="ic">${I.clock}</span><div><b>Response time</b><span>Within one business day</span></div></li>
    </ul>
    <div class="socials"><a href="${P.github}" target="_blank" rel="noopener" aria-label="GitHub">${I.github}</a><a href="${P.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn">${I.linkedin}</a><a href="${P.x}" target="_blank" rel="noopener" aria-label="X">${I.x}</a></div>
  </div>
  <form class="form rv" id="contactForm" novalidate data-endpoint="${P.formEndpoint}" data-email="${P.email}">
    <h3>Send me a message</h3>
    <p>Fill in the form and I'll get back to you within one business day.</p>
    <div class="fgrid">
      <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" autocomplete="name" required><span class="err">Enter your name.</span></div>
      <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" required><span class="err">Enter a valid email address.</span></div>
      <div class="field"><label for="f-company">Company <small>(optional)</small></label><input id="f-company" name="company" autocomplete="organization"></div>
      <div class="field"><label for="f-phone">Phone or WhatsApp <small>(optional)</small></label><input id="f-phone" name="phone" type="tel" autocomplete="tel"></div>
      <div class="field"><label for="f-service">What's it about?</label><select id="f-service" name="service" required>
        <option value="">Choose one</option>
        <option value="hire">Hiring for a full-time or contract role</option>
        <option value="agents">AI agent or voice agent</option>
        <option value="automation">Workflow automation</option>
        <option value="rag">RAG or document AI</option>
        <option value="vision">Computer vision or ML model</option>
        <option value="web">Web or AR app</option>
        <option value="demo">Project demo</option>
        <option value="other">Something else</option>
      </select><span class="err">Pick the closest option.</span></div>
      <div class="field"><label for="f-timeline">Timeline <small>(optional)</small></label><select id="f-timeline" name="timeline"><option value="">Not sure yet</option><option>As soon as possible</option><option>Within a month</option><option>1–3 months</option><option>Just exploring</option></select></div>
      <div class="field full"><label for="f-message">Message</label><textarea id="f-message" name="message" required placeholder="What are you building, or what should the system do?"></textarea><span class="err">Tell me a little more (at least 10 characters).</span></div>
      <div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
    </div>
    <div class="form-foot"><button class="btn btn-primary" type="submit"><span>Send message</span>${I.arrow}</button><small>Your details are only used to reply to you.</small></div>
    <div class="form-status" id="formStatus" role="status" aria-live="polite"></div>
  </form>
</div></section>`;
}

/* ---------------- home ---------------- */
function home(){
  const feat = projects.filter(p => p.featured);
  const marquee = ['LangGraph', 'PyTorch', 'FastAPI', 'FAISS', 'ChromaDB', 'Groq', 'Vapi', 'Make', 'n8n', 'Celery', 'Redis', 'Next.js', 'Docker', 'TensorFlow', 'OpenCV'];
  const mq = marquee.map(t => `<span><b>◆</b>${t}</span>`).join('');
  return head({ title: `${P.name} — AI/ML Engineer`, desc: 'AI/ML engineer building AI agents, RAG systems, computer vision and automation. Case studies, projects and contact.', url: '/' }) + header('/') + `
<main id="main">
<section class="hero"><div class="wrap hero-grid">
  <div>
    <h1>Building AI systems that do the work.</h1>
    <p class="lede">I'm ${P.name}, an AI/ML engineer. I build agents that answer calls and qualify leads, retrieval systems that cite their sources, and vision models that run behind real APIs.</p>
    <div class="hero-actions"><a class="btn btn-primary" href="#contact">Let's work together ${I.arrow}</a><a class="btn btn-ghost" href="/projects.html">Explore my work</a></div>
    <ul class="hero-points">
      <li>${I.agent}<span>AI agents &amp;<br>automation</span></li>
      <li>${I.doc}<span>RAG &amp;<br>document AI</span></li>
      <li>${I.eye}<span>Computer vision<br>&amp; deep learning</span></li>
    </ul>
  </div>
  <div class="stage" aria-hidden="true">
    <div class="grid-dots"></div><div class="halo"></div><div class="ring r1"></div><div class="ring r2"></div>
    <svg class="circuit" viewBox="0 0 600 600" preserveAspectRatio="none">
      <defs><linearGradient id="gB" x1="0" x2="1"><stop offset="0" stop-color="#1f6bff" stop-opacity="0"/><stop offset=".6" stop-color="#4c9bff"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <linearGradient id="gV" x1="1" x2="0"><stop offset="0" stop-color="#6a4bff" stop-opacity="0"/><stop offset=".6" stop-color="#9d86ff"/><stop offset="1" stop-color="#fff"/></linearGradient></defs>
      <path class="bus" d="M70 125 H170 Q200 125 215 160 L262 250"/>
      <path class="bus" d="M545 80 H430 Q395 80 380 115 L338 240"/>
      <path class="bus" d="M40 330 H150 Q185 330 205 300 L250 285"/>
      <path class="bus" d="M560 300 H455 Q420 300 400 285 L352 275"/>
      <path class="beam b1" stroke="url(#gB)" d="M70 125 H170 Q200 125 215 160 L262 250"/>
      <path class="beam b2" stroke="url(#gV)" d="M545 80 H430 Q395 80 380 115 L338 240"/>
      <path class="beam b3" stroke="url(#gV)" d="M40 330 H150 Q185 330 205 300 L250 285"/>
      <path class="beam b4" stroke="url(#gB)" d="M560 300 H455 Q420 300 400 285 L352 275"/>
      <circle class="jdot" cx="215" cy="160" r="3.5"/><circle class="jdot alt" cx="380" cy="115" r="3.5"/><circle class="jdot alt" cx="205" cy="300" r="3.5"/><circle class="jdot" cx="400" cy="285" r="3.5"/>
    </svg>
    <span class="chip c1"><i></i>LangGraph agents</span>
    <span class="chip c2"><i></i>RAG · FAISS</span>
    <span class="chip c3"><i></i>Vapi voice AI</span>
    <span class="chip c4"><i></i>PyTorch · ViT</span>
    <img class="portrait" src="/assets/saad.webp" alt="" width="706" height="805" fetchpriority="high">
  </div>
</div></section>
<div class="horizon" aria-hidden="true"></div>
<section class="band" aria-labelledby="tools-h"><div class="wrap">
  <h2 id="tools-h">The tools I ship with</h2>
  <p>From model to production: orchestration, retrieval, inference, automation.</p>
</div>
<div class="marquee" aria-hidden="true"><div class="marquee-track">${mq}${mq}</div></div>
<p class="hp">${marquee.join(', ')}</p>
</section>

<section class="sec" id="about"><div class="wrap about-grid">
  <h2 class="rv">About me</h2>
  <div>
    <div class="scrub">${P.bio.map(b => `<p>${esc(b)}</p>`).join('')}</div>
    <div class="facts rv">
      <div><b>23</b><span>public repositories on GitHub</span></div>
      <div><b>${csList.length}</b><span>detailed case studies</span></div>
      <div><b>3+</b><span>years building software</span></div>
    </div>
  </div>
</div></section>

<section class="sec" id="work" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><h2 class="rv">Selected work</h2><p class="rv">Four systems that show how I work: from a client's phone line to transformer inference behind a queue.</p></div>
  <div class="work-list">
  ${feat.map(p => `<article class="work rv">
    <div>
      <div class="meta">${esc(kindLabel(p))}${p.year ? ` · ${p.year}` : ''}${p.client ? ' · Client project' : ''}</div>
      <h3>${esc(p.title)}</h3>
      <p class="sub">${esc(p.subtitle)}</p>
      <p class="one">${esc(p.oneLiner)}</p>
      ${tags(p.stack, 6)}
      ${buttons(p)}
    </div>
    ${flow(p.flow)}
  </article>`).join('\n  ')}
  </div>
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:28px" class="rv"><a class="btn btn-ghost" href="/projects.html">See all ${projects.length} projects ${I.arrow}</a><a class="btn btn-quiet" href="/case-studies.html">All case studies</a></div>
</div></section>

<section class="sec" id="skills" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><h2 class="rv">What I work with</h2><p class="rv">Models are one layer. Most of the work is the system around them.</p></div>
  <div class="stack-stage">
    <div class="stack-core-wrap" aria-hidden="true"><div class="orbit o1"></div><div class="orbit o2"></div><span class="sig s1"></span><span class="sig s2"></span><span class="sig s3"></span><span class="sig s4"></span><div class="core"><b>SM</b><span>AI systems</span></div></div>
    ${skills.map(s => `<div class="skill rv"><h3>${esc(s.group)}</h3>${tags(s.items)}</div>`).join('\n    ')}
  </div>
</div></section>

<section class="sec" id="process" style="padding-top:0"><div class="wrap dome">
  <h2 class="rv">How I work with clients</h2>
  <p class="lede rv">I start from the business problem, then build the smallest system that measurably helps — and grow it from there.</p>
  <ol class="steps">
    <li class="rv"><span class="n">Step 1</span><h3>Discover</h3><p>Map the workflow, the bottleneck and the tools you already use.</p></li>
    <li class="rv"><span class="n">Step 2</span><h3>Design</h3><p>Plan the architecture, what the AI decides and what stays deterministic.</p></li>
    <li class="rv"><span class="n">Step 3</span><h3>Build</h3><p>Develop, integrate and test against real data, then deploy.</p></li>
    <li class="rv"><span class="n">Step 4</span><h3>Improve</h3><p>Monitor how it performs and tighten it with each iteration.</p></li>
  </ol>
</div></section>

<section class="sec" id="experience" style="padding-top:clamp(48px,6vw,80px)"><div class="wrap">
  <div class="sec-head"><h2 class="rv">Experience</h2></div>
  <ol class="timeline">${experience.map(e => `<li class="rv"><span class="when">${esc(e.when)}</span><div><h3>${esc(e.what)}</h3><div class="where">${esc(e.where)}</div></div><p>${esc(e.note)}</p></li>`).join('')}</ol>
</div></section>

<section class="wrap cta">
  <div class="rv"><h2>Ready to build something?</h2><p class="lede">Tell me what's repetitive, slow or hard to scale. I'll tell you honestly where AI helps and where it doesn't.</p><div class="actions"><a class="btn btn-primary" href="#contact">Start your project ${I.arrow}</a><button class="btn btn-ghost" type="button" data-open-chat>Ask my AI assistant</button></div></div>
  <div class="discs" aria-hidden="true">${[0,1,2,3,4,5,6].map(i => `<span class="disc" style="left:${4 + i * 13}%;--a:${i * 50}deg;animation-delay:${-i * .45}s;transform:translateY(${Math.round(Math.sin(i / 1.2) * 40)}px)"></span>`).join('')}</div>
</section>
${contactSection()}
</main>` + footer();
}

/* ---------------- projects ---------------- */
function projectsPage(){
  const kinds = Object.entries(KINDS).filter(([k]) => projects.some(p => p.kind.includes(k)));
  return head({ title: `Projects — ${P.name}`, desc: `All ${projects.length} projects by ${P.name}: AI agents, RAG, computer vision, machine learning, web and AR.`, url: '/projects.html' }) + header('/projects.html') + `
<main id="main">
<section class="page-hero"><div class="wrap">
  <h1>Projects that turn ideas into working systems.</h1>
  <p class="lede">Everything I've published, from production-style AI platforms to the early programs where I learned to build. Each one links to its code; the bigger ones have a full case study.</p>
</div></section>
<section class="wrap" style="padding-bottom:clamp(64px,8vw,110px)">
  <div class="filters" role="group" aria-label="Filter projects"><button type="button" data-k="all" aria-pressed="true">All</button>${kinds.map(([k, l]) => `<button type="button" data-k="${k}" aria-pressed="false">${l}</button>`).join('')}</div>
  <p class="count" aria-live="polite">${projects.length} projects</p>
  <div class="cards">
  ${projects.map(p => `<article class="card${p.featured ? ' is-feat' : ''}" data-kind="${p.kind.join(' ')}">
    <div class="kind">${esc(kindLabel(p))}${p.client ? ' · Client project' : ''}</div>
    <h3>${esc(p.title)}</h3><p class="sub">${esc(p.subtitle)}</p>
    <p class="one">${esc(p.oneLiner)}</p>
    ${tags(p.stack, 5)}
    ${buttons(p)}
  </article>`).join('\n  ')}
  </div>
</section>
${contactSection()}
</main>` + footer();
}

/* ---------------- case studies index ---------------- */
function caseIndex(){
  return head({ title: `Case studies — ${P.name}`, desc: `In-depth case studies: the problem, architecture, decisions and stack behind ${csList.length} AI and software projects.`, url: '/case-studies.html' }) + header('/case-studies.html') + `
<main id="main">
<section class="page-hero"><div class="wrap">
  <h1>How the systems actually work.</h1>
  <p class="lede">The problem each project solves, how it's built, the decisions that mattered and what's still left to do — written from the code.</p>
</div></section>
<section class="wrap work-list" style="padding-bottom:clamp(64px,8vw,110px)">
  ${csList.map(p => `<article class="work rv">
    <div>
      <div class="meta">${esc(kindLabel(p))}${p.year ? ` · ${p.year}` : ''}${p.client ? ' · Client project' : ''}</div>
      <h3>${esc(p.title)}</h3><p class="sub">${esc(p.subtitle)}</p>
      <p class="one">${esc(p.oneLiner)}</p>
      ${tags(p.stack, 6)}
      ${buttons(p)}
    </div>
    ${flow(p.flow)}
  </article>`).join('\n  ')}
</section>
</main>` + footer();
}

/* ---------------- case study page ---------------- */
function caseStudy(p, i){
  const prev = csList[(i - 1 + csList.length) % csList.length], next = csList[(i + 1) % csList.length];
  const secs = [['problem', 'The problem'], ['how', 'How it works'], ['features', 'What it does'], ...(p.decisions ? [['decisions', 'Engineering decisions']] : []), ['stack', 'Stack'], ...(p.limits ? [['status', 'Current status']] : [])];
  return head({ title: `${p.title} — case study — ${P.name}`, desc: p.oneLiner, url: csUrl(p) }) + header('/case-studies.html') + `
<main id="main">
<section class="page-hero"><div class="wrap">
  <div class="crumbs"><a href="/case-studies.html">Case studies</a> / ${esc(p.title)}</div>
  <div class="cs-hero">
    <div>
      <h1>${esc(p.title)}</h1>
      <p class="sub">${esc(p.subtitle)}</p>
      <p class="lede">${esc(p.oneLiner)}</p>
      ${buttons(p, { withCs: false, size: '' })}
    </div>
    ${flow(p.flow)}
  </div>
  <div class="nums">${p.numbers.map(n => `<div><b>${esc(n.v)}</b><span>${esc(n.l)}</span></div>`).join('')}</div>
</div></section>
<div class="wrap cs-body">
  <ul class="toc" aria-label="On this page">${secs.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join('')}</ul>
  <div>
    <section class="cs-sec" id="problem"><h2>The problem</h2><p>${esc(p.problem)}</p></section>
    <section class="cs-sec" id="how"><h2>How it works</h2>${p.approach.map(a => `<p>${esc(a)}</p>`).join('')}</section>
    <section class="cs-sec" id="features"><h2>What it does</h2><ul class="ticks">${p.features.map(f => `<li>${esc(f)}</li>`).join('')}</ul></section>
    ${p.decisions ? `<section class="cs-sec" id="decisions"><h2>Engineering decisions</h2><div class="decs">${p.decisions.map(([t, d]) => `<div><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}</div></section>` : ''}
    <section class="cs-sec" id="stack"><h2>Stack</h2>${tags(p.stack)}</section>
    ${p.limits ? `<section class="cs-sec" id="status"><h2>Current status</h2><p class="note">${esc(p.limits)}</p></section>` : ''}
  </div>
</div>
<nav class="wrap pager" aria-label="More case studies">
  <a href="${csUrl(prev)}"><small>Previous</small>${esc(prev.title)}</a>
  <a class="next" href="${csUrl(next)}"><small>Next</small>${esc(next.title)}</a>
</nav>
${contactSection()}
</main>` + footer();
}

function notFound(){
  return head({ title: `Page not found — ${P.name}`, desc: 'This page does not exist.', url: '/404.html' }) + header('') + `
<main id="main"><section class="page-hero" style="min-height:55vh"><div class="wrap">
  <h1>This page doesn't exist.</h1>
  <p class="lede" style="margin-bottom:28px">The link may be old. Everything I've built is on the projects page.</p>
  <div class="actions"><a class="btn btn-primary" href="/projects.html">Browse projects ${I.arrow}</a><a class="btn btn-ghost" href="/">Go home</a></div>
</div></section></main>` + footer();
}

/* ---------------- knowledge for the assistant ---------------- */
function knowledge(){
  const base = [];
  base.push(`ABOUT: ${P.name}, ${P.role}. ${P.location}. Email ${P.email}. GitHub ${P.github}. LinkedIn ${P.linkedin}. X ${P.x}. Contact form: /#contact (replies within one business day). Education: ${P.education}.`);
  base.push('BIO: ' + P.bio.join(' '));
  base.push('AVAILABILITY: Open to full-time or contract AI/ML roles and to freelance projects (AI agents, voice agents, automation, RAG/document AI, computer vision, web/AR). For rates and start dates, use the contact form — do not quote numbers.');
  base.push('EXPERIENCE: ' + experience.map(e => `${e.what} at ${e.where} (${e.when}): ${e.note}`).join(' | '));
  base.push('SKILLS: ' + skills.map(s => `${s.group}: ${s.items.join(', ')}`).join(' | '));
  base.push('HOW HE WORKS: Discover the workflow and bottleneck → design the architecture → build and test with real data → monitor and improve.');
  base.push('ALL PROJECTS (title — summary): ' + projects.map(p => `${p.title} — ${p.subtitle}${p.caseStudy ? ` [${csUrl(p)}]` : ''}`).join('; '));
  const docs = projects.map(p => ({
    keys: `${p.title} ${p.subtitle} ${p.stack.join(' ')} ${p.kind.map(k => KINDS[k]).join(' ')} ${p.slug.replace(/-/g, ' ')}`.toLowerCase(),
    text: `PROJECT ${p.title} — ${p.subtitle}. ${p.oneLiner} Stack: ${p.stack.join(', ')}.` +
      (p.caseStudy ? ` Case study: ${csUrl(p)}.` : '') + (p.links.github ? ` Code: ${p.links.github}.` : '') + (p.links.demo ? ` Live demo: ${p.links.demo}.` : '') +
      (p.client ? ' Client project, private code; demos on request via the contact form.' : '') +
      (p.numbers ? ' Facts: ' + p.numbers.map(n => `${n.v} ${n.l}`).join('; ') + '.' : '') +
      (p.problem ? ` Problem: ${p.problem}` : '') + (p.approach ? ` Approach: ${p.approach.join(' ')}` : '') + (p.features ? ` Features: ${p.features.join('; ')}.` : '') + (p.limits ? ` Status: ${p.limits}` : ''),
  }));
  return { base: base.join('\n'), docs };
}
// browser-side fallback: retrieve the best matching facts, or hand over to contact (like the Smart FAQ bot)
function kbJs(){
  const docs = [
    { k: 'contact email reach hire hiring available availability freelance rate rates price cost quote job role work together', a: `You can reach Saad through the [contact form](/#contact) or at ${P.email} — he replies within one business day. He's open to full-time or contract AI/ML roles and freelance projects; for rates and timing, send a short brief through the form.` },
    { k: 'who about saad background education university study degree comsats location where based pakistan islamabad', a: `${P.name} is an ${P.role} based in Islamabad, Pakistan, working remotely worldwide. He's studying for a ${P.education.replace(/\s*\(.*\)/, '')}, and founded OQVERA, an AI automation and agents studio.` },
    { k: 'skills stack tech technologies tools languages python framework know', a: 'Main skills: ' + skills.map(s => `**${s.group}** — ${s.items.slice(0, 6).join(', ')}`).join('; ') + '.' },
    { k: 'experience work history omni digitals oqvera founder job', a: experience.map(e => `**${e.what}**, ${e.where} (${e.when})`).join('; ') + '.' },
    ...projects.map(p => ({ k: `${p.title} ${p.subtitle} ${p.stack.join(' ')} ${p.kind.map(k => KINDS[k]).join(' ')} ${p.slug.replace(/-/g, ' ')}`.toLowerCase(),
      a: `**${p.title}** — ${p.oneLiner}` + (p.caseStudy ? ` Read the [case study](${csUrl(p)}).` : '') + (p.links.github ? ` Code: ${p.links.github}` : '') + (p.links.demo ? ` · Live demo: ${p.links.demo}` : '') + (p.links.contact ? ' Ask for a demo through the [contact form](/#contact).' : '') })),
  ];
  return `/* Offline answers for the chat assistant, generated by build.js. Used only when /api/chat is unavailable. */
(() => {
  const DOCS = ${JSON.stringify(docs)};
  const stop = new Set('a an the is are was what which who how does do did can could he his him saad me tell about of for to in on with and or any has have you your i it this that there show give'.split(' '));
  const toks = s => (s.toLowerCase().match(/[a-z0-9.+#]+/g) || []).filter(t => !stop.has(t) && t.length > 1);
  window.SM_LOCAL_ANSWER = q => {
    const qt = toks(q); if (!qt.length) return "Ask me about Saad's projects, skills, experience or how to work with him.";
    let best = [];
    for (const d of DOCS){ const dt = new Set(toks(d.k)); let s = 0; for (const t of qt){ if (dt.has(t)) s += 1; else if ([...dt].some(x => x.length > 3 && (x.startsWith(t) || t.startsWith(x)))) s += .5; } if (s > 0) best.push([s, d]); }
    best.sort((a, b) => b[0] - a[0]);
    if (!best.length || best[0][0] < 1) return "I don't have that in my notes. You can ask Saad directly through the [contact form](/#contact) or at ${P.email}.";
    const top = best.filter(b => b[0] >= best[0][0] * .8).slice(0, 3).map(b => b[1].a);
    return top.join('\\n\\n');
  };
})();
`;
}

/* ---------------- write ---------------- */
fs.mkdirSync(path.join(OUT, 'case-studies'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
const w = (f, s) => fs.writeFileSync(path.join(OUT, f), s);
w('index.html', home());
w('projects.html', projectsPage());
w('case-studies.html', caseIndex());
csList.forEach((p, i) => w(`case-studies/${p.slug}.html`, caseStudy(p, i)));
w('404.html', notFound());
for (const f of ['site.css', 'site.js', 'favicon.svg', 'saad.webp']) if (fs.existsSync(path.join(__dirname, 'assets', f))) fs.copyFileSync(path.join(__dirname, 'assets', f), path.join(OUT, 'assets', f));
w('assets/kb.js', kbJs());
const K = knowledge();
fs.writeFileSync(path.join(__dirname, 'netlify/functions/chat-knowledge.mjs'), `// Generated by build.js from data.js — edit data.js and rebuild.\nexport const BASE = ${JSON.stringify(K.base)};\nexport const DOCS = ${JSON.stringify(K.docs)};\n`);
const urls = ['/', '/projects.html', '/case-studies.html', ...csList.map(csUrl)];
w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${P.site}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
w('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${P.site}/sitemap.xml\n`);
// private finance app → /saadi/ (not linked anywhere, noindex)
const FIN = path.join(__dirname, 'finance', 'public');
if (fs.existsSync(FIN)){
  fs.mkdirSync(path.join(OUT, 'saadi'), { recursive: true });
  let html = fs.readFileSync(path.join(FIN, 'index.html'), 'utf8');
  if (!html.includes('name="robots"')) html = html.replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex, nofollow, noarchive">\n<meta name="referrer" content="no-referrer">');
  fs.writeFileSync(path.join(OUT, 'saadi', 'index.html'), html);
  fs.copyFileSync(path.join(FIN, 'config.js'), path.join(OUT, 'saadi', 'config.js'));
}
console.log(`Built ${4 + csList.length} pages into ${OUT}`);
