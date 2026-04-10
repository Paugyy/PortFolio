/* ================================================================
   SHARED.JS — Navigation + Chatbot de notation persistant
   ================================================================ */
'use strict';

/* ── 1. NAVIGATION MOBILE ── */
(function() {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));
})();

/* ── 2. CHATBOT DE NOTATION PERSISTANT ── */
(function() {

  const RATING_ENDPOINT = 'https://formspree.io/f/xaqpqdnk';
  const STORAGE_KEY     = 'portfolio_rating';

  /* ── Injection HTML ── */
  document.body.insertAdjacentHTML('beforeend', `
    <button class="cb-btn" id="cbToggle" aria-label="Donner votre avis" title="Donner votre avis">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <span id="cbBadge" class="cb-badge" style="display:none"></span>
    </button>
    <div class="cb-panel" id="cbPanel">
      <div class="cb-head">
        <span class="cb-dot"></span>
        <span class="cb-name">Votre avis</span>
        <span class="cb-sub" id="cbSub">Notez ce portfolio</span>
      </div>
      <div class="cb-body">
        <p class="cb-msg" id="cbMsg">Comment trouvez-vous ce portfolio ?</p>
        <div class="cb-scale" id="cbScale">
          ${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<button class="cb-nb" data-v="${n}">${n}</button>`).join('')}
        </div>
        <p class="cb-resp" id="cbResp"></p>
      </div>
    </div>
    <div id="dataBlast" class="data-blast" style="display:none"></div>
  `);

  const cbToggle  = document.getElementById('cbToggle');
  const cbPanel   = document.getElementById('cbPanel');
  const cbBadge   = document.getElementById('cbBadge');
  const cbMsg     = document.getElementById('cbMsg');
  const cbSub     = document.getElementById('cbSub');
  const cbResp    = document.getElementById('cbResp');
  const cbScale   = document.getElementById('cbScale');
  const dataBlast = document.getElementById('dataBlast');

  /* ── Toggle panel ── */
  cbToggle.addEventListener('click', () => cbPanel.classList.toggle('is-open'));

  /* ── Persistance ── */
  function saveRating(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch(e) {} }
  function loadRating()  { try { const v = localStorage.getItem(STORAGE_KEY); return v !== null ? parseInt(v,10) : null; } catch(e) { return null; } }

  /* ── Envoi serveur ── */
  async function sendRating(score) {
    try {
      await fetch(RATING_ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ note: score, page: location.href, date: new Date().toISOString() })
      });
    } catch(e) {}
  }

  /* ── Style tag unique pour les effets ── */
  const styleTag = document.createElement('style');
  styleTag.id = 'effect-style';
  document.head.appendChild(styleTag);

  /* ── Nettoyage effets ── */
  function clearEffects() {
    styleTag.textContent = '';
    document.body.classList.remove('effect-chaos','effect-ruin','effect-meh','effect-nice');
    document.querySelectorAll('.confetti-p').forEach(e => e.remove());
    if (window._confInterval) { clearInterval(window._confInterval); window._confInterval = null; }
    // Remettre overflow normal
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }

  /* ================================================================
     EFFETS VISUELS
     RÈGLE : le contenu reste LISIBLE et le bouton toujours accessible.
     Les effets s'appliquent via un ::before/::after overlay ou filter,
     jamais en bloquant les interactions ou l'overflow de la page.
     ================================================================ */

  /* ── NOTE 0 : Chaos — overlay animé PAR-DESSUS, site lisible dessous ── */
  function applyChaos() {
    styleTag.textContent = `
      @keyframes strobe-bg {
        0%,45%  { opacity: 0.92; }
        50%,95% { opacity: 0.75; }
        100%    { opacity: 0.92; }
      }
      @keyframes shake-overlay {
        0%   { transform: translate(0,0)   rotate(0deg);    }
        10%  { transform: translate(-6px,4px)  rotate(-1.5deg); }
        20%  { transform: translate(7px,-5px)  rotate(1deg);    }
        30%  { transform: translate(-5px,6px)  rotate(-1deg);   }
        40%  { transform: translate(6px,-4px)  rotate(1.5deg);  }
        50%  { transform: translate(-7px,5px)  rotate(-0.5deg); }
        60%  { transform: translate(5px,-6px)  rotate(1deg);    }
        70%  { transform: translate(-6px,4px)  rotate(-1.5deg); }
        80%  { transform: translate(4px,-5px)  rotate(0.5deg);  }
        90%  { transform: translate(-5px,6px)  rotate(-1deg);   }
        100% { transform: translate(0,0)    rotate(0deg);    }
      }
      @keyframes kaleid {
        0%  { clip-path: polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%); }
        25% { clip-path: polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%); }
        50% { clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        75% { clip-path: polygon(50% 5%,95% 35%,80% 90%,20% 90%,5% 35%); }
        100%{ clip-path: polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%); }
      }
      @keyframes glitch-text {
        0%,100% { text-shadow: 0 0 0 transparent; transform: translate(0,0); }
        20%     { text-shadow: -3px 0 #f00, 3px 0 #0ff; transform: translate(-2px,0); }
        40%     { text-shadow: 3px 0 #f00, -3px 0 #0ff; transform: translate(2px,0); }
        60%     { text-shadow: -2px 0 #ff0, 2px 0 #f0f; transform: translate(-1px,0); }
        80%     { text-shadow: 2px 0 #ff0, -2px 0 #f0f; transform: translate(1px,0); }
      }

      /* Overlay kaléidoscopique par-dessus le contenu, pointer-events:none */
      body.effect-chaos::before {
        content: '';
        position: fixed;
        inset: 0;
        z-index: 9000;
        pointer-events: none;
        background: repeating-conic-gradient(
          rgba(0,0,0,0.85) 0deg,
          rgba(255,255,255,0.05) 8deg,
          rgba(0,0,0,0.85) 16deg,
          rgba(180,0,0,0.1) 24deg,
          rgba(0,0,0,0.85) 32deg
        );
        animation: kaleid 0.5s infinite, strobe-bg 0.1s infinite;
        mix-blend-mode: overlay;
      }

      /* Texte d'alerte centré, également pointer-events:none */
      body.effect-chaos::after {
        content: '☢ ERREUR CRITIQUE ☢';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        z-index: 9001;
        pointer-events: none;
        font-size: clamp(1.5rem,5vw,3.5rem);
        font-weight: 900;
        color: rgba(255,30,30,0.35);
        text-shadow: 0 0 20px rgba(255,0,0,0.5);
        white-space: nowrap;
        font-family: 'Courier New', monospace;
        animation: glitch-text 0.25s infinite, shake-overlay 0.4s infinite;
        letter-spacing: 0.05em;
      }

      /* Légère agitation du contenu — sans bloquer le scroll ni les clics */
      body.effect-chaos main {
        animation: shake-overlay 0.35s infinite;
      }

      /* Filtre discret sur le body — assez visible mais pas aveuglant */
      body.effect-chaos {
        filter: saturate(0.3) brightness(0.82) contrast(1.15);
      }
    `;
    document.body.classList.add('effect-chaos');
    showDataBlast();
  }

  /* ── NOTES 1-3 : Ruine — désaturation + tremblement progressif ── */
  function applyRuin(score) {
    const s = (4 - score) / 3; // 1.0 pour score=1, 0.33 pour score=3
    styleTag.textContent = `
      @keyframes ruin-shake {
        0%,100% { transform: translate(0,0) rotate(0); }
        25%     { transform: translate(-${s*4}px,${s*3}px) rotate(${s*1.2}deg); }
        75%     { transform: translate(${s*3}px,-${s*2}px) rotate(-${s*0.8}deg); }
      }
      @keyframes ruin-filter {
        0%,100% { filter: sepia(${s*0.8}) saturate(${0.4-s*0.25}) brightness(${0.78+s*0.05}) contrast(1.2); }
        50%     { filter: sepia(1) saturate(0.1) brightness(${0.6-s*0.05}) contrast(1.4); }
      }
      @keyframes crack-pulse { 0%,100% { opacity:0.12; } 50% { opacity:${0.1+s*0.3}; } }

      body.effect-ruin {
        animation: ruin-filter ${2.5-s}s ease-in-out infinite !important;
      }
      body.effect-ruin main {
        animation: ruin-shake ${1.8-s*0.5}s infinite alternate;
      }
      body.effect-ruin .card,
      body.effect-ruin .proj-card,
      body.effect-ruin .res-card {
        border-color: rgba(200,40,40,${0.15+s*0.2}) !important;
        background: rgba(18,4,4,0.9) !important;
      }
      body.effect-ruin * {
        font-family: 'Courier New', monospace !important;
      }
      body.effect-ruin::after {
        content: '⚠ SITE EN RUINE ⚠';
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%) rotate(${-8-s*6}deg);
        z-index: 9000;
        pointer-events: none;
        font-size: clamp(1.2rem,${2+s*2}vw,${2.5+s}rem);
        font-weight: 900;
        color: rgba(255,${50-s*30},${50-s*30},${0.18+s*0.18});
        text-shadow: 2px 2px 10px rgba(255,0,0,${0.3+s*0.3});
        white-space: nowrap;
        font-family: 'Courier New', monospace;
        animation: crack-pulse ${2-s*0.5}s infinite;
      }
    `;
    document.body.classList.add('effect-ruin');
  }

  /* ── NOTES 4-7 : Bof — terne et flottant ── */
  function applyMeh(score) {
    const desat = (8 - score) / 8;
    const dim   = 1 - desat * 0.15;
    styleTag.textContent = `
      @keyframes float-meh {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-3px); }
      }
      @keyframes flicker {
        0%,100% { opacity: 1; }
        50%     { opacity: ${0.88 + score * 0.01}; }
      }
      body.effect-meh {
        filter: saturate(${1-desat*0.65}) brightness(${dim}) sepia(${desat*0.2});
        transition: filter 1s;
      }
      body.effect-meh main {
        animation: float-meh ${4+score*0.4}s ease-in-out infinite;
      }
      ${score <= 5 ? `
      body.effect-meh::after {
        content: 'Mouais...';
        position: fixed;
        bottom: 5.5rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9000;
        pointer-events: none;
        font-size: 0.95rem;
        font-weight: 700;
        color: rgba(200,180,100,0.15);
        font-family: 'Courier New', monospace;
        letter-spacing: 0.2em;
        animation: flicker 3s ease-in-out infinite;
      }` : ''}
    `;
    document.body.classList.add('effect-meh');
  }

  /* ── NOTES 8-10 : Super — shimmer + confettis ── */
  function applyNice(score) {
    const i = (score - 8) / 2;
    styleTag.textContent = `
      @keyframes shimmer {
        0%,100% { filter: brightness(1) saturate(1); }
        50%     { filter: brightness(${1+i*0.08}) saturate(${1+i*0.2}); }
      }
      @keyframes confetti-fall {
        0%   { transform: translateY(-60px) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translateY(110vh) rotate(540deg) scale(0.7); opacity: 0; }
      }
      body.effect-nice {
        animation: shimmer 2.5s ease-in-out infinite;
      }
      body.effect-nice .card,
      body.effect-nice .proj-card {
        box-shadow: 0 0 ${10+i*18}px rgba(200,169,110,${0.06+i*0.06}) !important;
      }
    `;
    document.body.classList.add('effect-nice');

    const colors = ['#C8A96E','#F0D080','#A8854A','#FFE0A0','#D4AA60','#fff5cc'];
    function spawnOne() {
      const el = document.createElement('div');
      el.className = 'confetti-p';
      const size = 5 + Math.random() * 7;
      el.style.cssText = `
        position:fixed;top:-20px;left:${Math.random()*100}%;
        width:${size}px;height:${size}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        border-radius:${Math.random()>0.5?'50%':'2px'};
        z-index:9000;pointer-events:none;
        animation:confetti-fall ${1.8+Math.random()*2}s linear forwards;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 5000);
    }
    for (let j = 0; j < 35; j++) setTimeout(spawnOne, j * 55);
    window._confInterval = setInterval(spawnOne, 320 - score * 18);
  }

  /* ── Popup données (note 0) ── */
  async function showDataBlast() {
    dataBlast.style.display = 'flex';
    dataBlast.innerHTML = `
      <div class="db-inner">
        <div class="db-skull">☠</div>
        <h1 class="db-title">ACCÈS NON AUTORISÉ DÉTECTÉ</h1>
        <p class="db-sub">Toutes vos données ont été collectées</p>
        <div class="db-grid">
          <div class="db-row"><span class="db-label">Adresse IP</span><span class="db-value db-blink" id="dbIp">Récupération...</span></div>
          <div class="db-row"><span class="db-label">Localisation</span><span class="db-value" id="dbLoc">...</span></div>
          <div class="db-row"><span class="db-label">Fournisseur</span><span class="db-value" id="dbOrg">...</span></div>
          <div class="db-row"><span class="db-label">Coordonnées GPS</span><span class="db-value" id="dbGps">...</span></div>
          <div class="db-row"><span class="db-label">Appareil</span><span class="db-value">${navigator.platform||'Inconnu'}</span></div>
          <div class="db-row"><span class="db-label">Navigateur</span><span class="db-value">${navigator.userAgent.slice(0,70)}...</span></div>
          <div class="db-row"><span class="db-label">Langue</span><span class="db-value">${navigator.language}</span></div>
          <div class="db-row"><span class="db-label">Résolution</span><span class="db-value">${screen.width}×${screen.height} px</span></div>
          <div class="db-row"><span class="db-label">Processeur</span><span class="db-value">${navigator.hardwareConcurrency||'?'} cœurs logiques</span></div>
          <div class="db-row"><span class="db-label">RAM</span><span class="db-value">${navigator.deviceMemory?navigator.deviceMemory+' Go':'Non disponible'}</span></div>
          <div class="db-row"><span class="db-label">GPU</span><span class="db-value" id="dbGpu">Détection...</span></div>
          <div class="db-row"><span class="db-label">Batterie</span><span class="db-value" id="dbBat">Vérification...</span></div>
          <div class="db-row"><span class="db-label">Fuseau horaire</span><span class="db-value">${Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div>
          <div class="db-row"><span class="db-label">Connexion</span><span class="db-value">${navigator.connection?navigator.connection.effectiveType+' / '+navigator.connection.downlink+'Mbps':'Non disponible'}</span></div>
          <div class="db-row"><span class="db-label">Écran tactile</span><span class="db-value">${navigator.maxTouchPoints>0?'Oui — '+navigator.maxTouchPoints+' points':'Non'}</span></div>
          <div class="db-row"><span class="db-label">Cookies</span><span class="db-value">${navigator.cookieEnabled?'✓ Activés':'✗ Désactivés'}</span></div>
        </div>
        <div class="db-progress"><div class="db-bar" id="dbBar"></div></div>
        <p class="db-warn" id="dbWarn">⚠ Transmission des données en cours...</p>
        <button class="db-close" id="dbClose">Changer ma note</button>
      </div>
    `;

    // GPU
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl')||c.getContext('experimental-webgl');
      const ext = gl&&gl.getExtension('WEBGL_debug_renderer_info');
      document.getElementById('dbGpu').textContent = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'Non détecté';
    } catch(e) { document.getElementById('dbGpu').textContent = 'Non détecté'; }

    // Batterie
    try {
      const b = await navigator?.getBattery?.();
      document.getElementById('dbBat').textContent = b
        ? `${Math.round(b.level*100)}% — ${b.charging?'⚡ En charge':'🔋 Sur batterie'}`
        : 'Non disponible';
    } catch(e) { document.getElementById('dbBat').textContent = 'Non disponible'; }

    // IP + géo
    try {
      const r = await fetch('https://ipapi.co/json/');
      const d = await r.json();
      document.getElementById('dbIp').textContent  = d.ip||'Non obtenu';
      document.getElementById('dbLoc').textContent = [d.city,d.region,d.country_name].filter(Boolean).join(', ')||'Non obtenu';
      document.getElementById('dbOrg').textContent = d.org||'Non obtenu';
      document.getElementById('dbGps').textContent = d.latitude&&d.longitude ? `${d.latitude}° N, ${d.longitude}° E` : 'Non obtenu';
    } catch(e) {
      ['dbIp','dbLoc','dbOrg','dbGps'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent='Non obtenu'; });
    }

    // Barre de progression fictive
    let p = 0;
    const bar  = document.getElementById('dbBar');
    const warn = document.getElementById('dbWarn');
    const msgs = ['⚠ Transmission des données...','📡 Connexion au serveur...','🔍 Analyse du système...','📂 Extraction...','✅ Données transmises.'];
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.random()*2.5);
      if (bar)  bar.style.width = p+'%';
      if (warn) warn.textContent = msgs[Math.min(Math.floor(p/25),4)];
      if (p >= 100) clearInterval(iv);
    }, 130);

    document.getElementById('dbClose').addEventListener('click', () => {
      clearInterval(iv);
      dataBlast.style.display = 'none';
      cbPanel.classList.add('is-open');
    });
  }

  /* ── Appliquer un effet ── */
  function applyEffect(score) {
    clearEffects();
    if      (score === 0) applyChaos();
    else if (score <= 3)  applyRuin(score);
    else if (score <= 7)  applyMeh(score);
    else                  applyNice(score);
  }

  /* ── Texte de réponse dans le panel ── */
  function showResponse(score) {
    const msgs = {
      0:'😱 Note 0 — Vous avez tout déclenché...',
      1:'💀 1/10 — Le site s\'effondre.',
      2:'😭 2/10 — Presque douloureux.',
      3:'😬 3/10 — Du travail à faire.',
      4:'😐 4/10 — Mouais.',
      5:'🤷 5/10 — Dans la moyenne basse.',
      6:'🙄 6/10 — Pas terrible.',
      7:'😑 7/10 — Juste correct.',
      8:'🙂 8/10 — Merci, ça fait plaisir !',
      9:'😊 9/10 — Super, merci beaucoup !',
      10:'🤩 10/10 — Vous êtes formidable !'
    };
    const cls = score>=8?'positive':score>=4?'neutral':'negative';
    cbResp.textContent   = msgs[score];
    cbResp.className     = `cb-resp ${cls}`;
    cbResp.style.display = 'block';
    cbMsg.textContent    = `Votre note : ${score} / 10`;
    cbSub.textContent    = '— Cliquer pour changer';
    cbBadge.textContent  = score;
    cbBadge.style.display= 'flex';
    cbBadge.style.background = score===0?'#8B0000':score<=3?'#6B1A00':score<=7?'#5A5000':'#1A5C00';
  }

  /* ── Clic sur une note ── */
  cbScale.addEventListener('click', e => {
    const btn = e.target.closest('.cb-nb');
    if (!btn) return;
    const score = parseInt(btn.dataset.v, 10);

    // Fermer la popup data si ouverte
    dataBlast.style.display = 'none';

    saveRating(score);
    sendRating(score);
    applyEffect(score);
    showResponse(score);
    cbPanel.classList.remove('is-open');
  });

  /* ── Restaurer au chargement ── */
  const saved = loadRating();
  if (saved !== null) {
    showResponse(saved);
    requestAnimationFrame(() => setTimeout(() => applyEffect(saved), 150));
  }

})();
