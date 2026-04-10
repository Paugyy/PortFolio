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

  /* ── Injection HTML du widget ── */
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

    <!-- Popup de données (note 0) -->
    <div id="dataBlast" class="data-blast" style="display:none"></div>
  `);

  const cbToggle = document.getElementById('cbToggle');
  const cbPanel  = document.getElementById('cbPanel');
  const cbBadge  = document.getElementById('cbBadge');
  const cbMsg    = document.getElementById('cbMsg');
  const cbSub    = document.getElementById('cbSub');
  const cbResp   = document.getElementById('cbResp');
  const cbScale  = document.getElementById('cbScale');
  const dataBlast= document.getElementById('dataBlast');

  /* ── Ouvrir/fermer le panel ── */
  cbToggle.addEventListener('click', () => cbPanel.classList.toggle('is-open'));

  /* ── Lire/écrire la note persistante ── */
  function saveRating(v) { localStorage.setItem(STORAGE_KEY, v); }
  function loadRating()  { const v = localStorage.getItem(STORAGE_KEY); return v !== null ? parseInt(v,10) : null; }

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

  /* ── Récupérer les infos de l'utilisateur (note 0) ── */
  async function gatherUserInfo() {
    const info = {
      ip: 'Récupération...',
      org: '',
      city: '', region: '', country: '',
      ua:   navigator.userAgent,
      lang: navigator.language || navigator.languages?.join(', '),
      screen: `${screen.width}×${screen.height} (dpr:${devicePixelRatio})`,
      inner: `${innerWidth}×${innerHeight}`,
      platform: navigator.platform || navigator.userAgentData?.platform || 'Inconnu',
      cores:  navigator.hardwareConcurrency || '?',
      mem:    navigator.deviceMemory ? navigator.deviceMemory + ' Go' : 'Non disponible',
      tz:     Intl.DateTimeFormat().resolvedOptions().timeZone,
      conn:   navigator.connection ? `${navigator.connection.effectiveType} / ${navigator.connection.downlink}Mbps` : 'Non disponible',
      battery:'Non disponible',
      online: navigator.onLine ? 'Oui' : 'Non',
      cookies:navigator.cookieEnabled ? 'Activés' : 'Désactivés',
      touch:  navigator.maxTouchPoints > 0 ? `Oui (${navigator.maxTouchPoints} points)` : 'Non',
      gpu:    'Non disponible',
      hostname: location.hostname,
      referrer: document.referrer || 'Direct',
    };

    // GPU via WebGL
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) info.gpu = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    } catch(e) {}

    // Batterie
    try {
      const b = await navigator.getBattery?.();
      if (b) info.battery = `${Math.round(b.level*100)}% — ${b.charging ? '⚡ En charge' : '🔋 Sur batterie'}`;
    } catch(e) {}

    // IP + géolocalisation
    try {
      const r = await fetch('https://ipapi.co/json/');
      const d = await r.json();
      info.ip      = d.ip;
      info.org     = d.org || '';
      info.city    = d.city || '';
      info.region  = d.region || '';
      info.country = d.country_name || '';
      info.postal  = d.postal || '';
      info.lat     = d.latitude || '';
      info.lon     = d.longitude || '';
    } catch(e) {}

    return info;
  }

  /* ── Afficher les données de l'utilisateur — note 0 ── */
  async function showDataBlast() {
    dataBlast.style.display = 'flex';
    dataBlast.innerHTML = `
      <div class="db-inner">
        <div class="db-skull">☠</div>
        <h1 class="db-title">ACCÈS NON AUTORISÉ DÉTECTÉ</h1>
        <p class="db-sub">Toutes vos données ont été collectées</p>
        <div class="db-grid" id="dbGrid">
          <div class="db-row"><span class="db-label">Adresse IP</span><span class="db-value db-blink" id="dbIp">Récupération en cours...</span></div>
          <div class="db-row"><span class="db-label">Localisation</span><span class="db-value" id="dbLoc">...</span></div>
          <div class="db-row"><span class="db-label">Fournisseur</span><span class="db-value" id="dbOrg">...</span></div>
          <div class="db-row"><span class="db-label">Coordonnées GPS</span><span class="db-value" id="dbGps">...</span></div>
          <div class="db-row"><span class="db-label">Appareil</span><span class="db-value">${navigator.platform || 'Inconnu'}</span></div>
          <div class="db-row"><span class="db-label">Navigateur</span><span class="db-value">${navigator.userAgent.split(') ').slice(-1)[0] || navigator.userAgent.slice(0,80)}</span></div>
          <div class="db-row"><span class="db-label">Langue</span><span class="db-value">${navigator.language}</span></div>
          <div class="db-row"><span class="db-label">Résolution</span><span class="db-value">${screen.width}×${screen.height} px</span></div>
          <div class="db-row"><span class="db-label">Processeur</span><span class="db-value">${navigator.hardwareConcurrency || '?'} cœurs logiques</span></div>
          <div class="db-row"><span class="db-label">RAM</span><span class="db-value">${navigator.deviceMemory ? navigator.deviceMemory+' Go détectés' : 'Non communiquée'}</span></div>
          <div class="db-row"><span class="db-label">GPU</span><span class="db-value" id="dbGpu">Détection...</span></div>
          <div class="db-row"><span class="db-label">Batterie</span><span class="db-value" id="dbBat">Vérification...</span></div>
          <div class="db-row"><span class="db-label">Fuseau horaire</span><span class="db-value">${Intl.DateTimeFormat().resolvedOptions().timeZone}</span></div>
          <div class="db-row"><span class="db-label">Connexion</span><span class="db-value">${navigator.connection ? navigator.connection.effectiveType+' / '+navigator.connection.downlink+'Mbps' : 'Non disponible'}</span></div>
          <div class="db-row"><span class="db-label">Tactile</span><span class="db-value">${navigator.maxTouchPoints > 0 ? 'Oui — '+navigator.maxTouchPoints+' points' : 'Non'}</span></div>
          <div class="db-row"><span class="db-label">Cookies</span><span class="db-value">${navigator.cookieEnabled ? '✓ Activés' : '✗ Désactivés'}</span></div>
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
      const gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'Non détecté';
      document.getElementById('dbGpu').textContent = gpu;
    } catch(e) { document.getElementById('dbGpu').textContent = 'Non détecté'; }

    // Batterie
    try {
      const b = await navigator?.getBattery?.();
      if (b) document.getElementById('dbBat').textContent =
        `${Math.round(b.level*100)}% — ${b.charging?'⚡ En charge':'🔋 Sur batterie'}`;
      else document.getElementById('dbBat').textContent = 'Non disponible';
    } catch(e) { document.getElementById('dbBat').textContent = 'Non disponible'; }

    // IP + géo
    try {
      const r = await fetch('https://ipapi.co/json/');
      const d = await r.json();
      document.getElementById('dbIp').textContent  = d.ip || 'Non obtenu';
      document.getElementById('dbLoc').textContent = [d.city, d.region, d.country_name].filter(Boolean).join(', ') || 'Non obtenu';
      document.getElementById('dbOrg').textContent = d.org || 'Non obtenu';
      document.getElementById('dbGps').textContent = d.latitude && d.longitude ? `${d.latitude}° N, ${d.longitude}° E` : 'Non obtenu';
    } catch(e) {
      document.getElementById('dbIp').textContent  = 'Non obtenu';
      document.getElementById('dbLoc').textContent = 'Non obtenu';
      document.getElementById('dbOrg').textContent = 'Non obtenu';
      document.getElementById('dbGps').textContent = 'Non obtenu';
    }

    // Barre de progression fausse
    let p = 0;
    const bar = document.getElementById('dbBar');
    const warn = document.getElementById('dbWarn');
    const msgs = [
      '⚠ Transmission des données en cours...',
      '📡 Connexion au serveur distant...',
      '🔍 Analyse du système...',
      '📂 Extraction des fichiers...',
      '✅ Données transmises avec succès.'
    ];
    const iv = setInterval(() => {
      p += Math.random() * 3;
      if (p >= 100) { p = 100; clearInterval(iv); warn.textContent = msgs[4]; }
      else warn.textContent = msgs[Math.min(Math.floor(p/25), 3)];
      bar.style.width = p + '%';
    }, 120);

    document.getElementById('dbClose').addEventListener('click', () => {
      clearInterval(iv);
      dataBlast.style.display = 'none';
      cbPanel.classList.add('is-open');
    });
  }

  /* ── Application de l'effet selon la note ── */
  const styleTag = (() => {
    const s = document.createElement('style');
    s.id = 'effect-style';
    document.head.appendChild(s);
    return s;
  })();

  function clearEffects() {
    styleTag.textContent = '';
    document.body.className = document.body.className
      .replace(/\beffect-\S+/g,'').trim();
    // Supprimer confettis
    document.querySelectorAll('.confetti-particle').forEach(e=>e.remove());
  }

  function applyEffect(score) {
    clearEffects();
    if      (score === 0)  applyChaos();
    else if (score <= 3)   applyRuin(score);
    else if (score <= 7)   applyMeh(score);
    else                   applyNice(score);
  }

  /* ── EFFET 0 : EXPLOSION TOTALE ── */
  function applyChaos() {
    styleTag.textContent = `
      @keyframes strobe{0%,49%{filter:invert(1)saturate(0)brightness(5);background:#fff}50%,100%{filter:invert(0)saturate(0)brightness(0.1);background:#000}}
      @keyframes nuke{0%{transform:translate(0,0)rotate(0)scale(1)}5%{transform:translate(-20px,15px)rotate(-8deg)scale(1.03)}10%{transform:translate(18px,-22px)rotate(6deg)scale(0.97)}15%{transform:translate(-15px,20px)rotate(-5deg)scale(1.05)}20%{transform:translate(22px,-10px)rotate(9deg)scale(0.95)}25%{transform:translate(-18px,14px)rotate(-7deg)scale(1.02)}30%{transform:translate(16px,-20px)rotate(5deg)scale(0.98)}35%{transform:translate(-22px,18px)rotate(-9deg)scale(1.04)}40%{transform:translate(20px,-15px)rotate(7deg)scale(0.96)}45%{transform:translate(-16px,22px)rotate(-6deg)scale(1.03)}50%{transform:translate(14px,-18px)rotate(8deg)scale(0.97)}100%{transform:translate(0,0)rotate(0)scale(1)}}
      @keyframes kaleid{0%{clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)}20%{clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)}40%{clip-path:polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)}60%{clip-path:polygon(50% 5%,95% 35%,80% 90%,20% 90%,5% 35%)}80%{clip-path:polygon(30% 0%,70% 0%,100% 40%,80% 100%,20% 100%,0% 40%)}100%{clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)}}
      @keyframes glitch1{0%,100%{clip-path:inset(0 0 95% 0)}20%{clip-path:inset(40% 0 40% 0)}40%{clip-path:inset(80% 0 5% 0)}60%{clip-path:inset(20% 0 60% 0)}80%{clip-path:inset(60% 0 20% 0)}}
      @keyframes glitch2{0%,100%{clip-path:inset(80% 0 0 0);transform:translate(-8px,0)}25%{clip-path:inset(0 0 70% 0);transform:translate(8px,0)}50%{clip-path:inset(50% 0 30% 0);transform:translate(-5px,0)}75%{clip-path:inset(20% 0 60% 0);transform:translate(5px,0)}}
      body.effect-chaos{animation:strobe 0.08s infinite,nuke 0.3s infinite!important;overflow:hidden!important}
      body.effect-chaos::before{content:'';position:fixed;inset:0;z-index:9990;pointer-events:none;
        background:repeating-conic-gradient(#000 0deg,#fff 8deg,#000 16deg,#f00 24deg,#000 32deg);
        animation:kaleid 0.4s infinite,strobe 0.06s infinite;mix-blend-mode:exclusion;opacity:0.95}
      body.effect-chaos::after{content:'☢ ERREUR CRITIQUE ☢';position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%)rotate(-20deg);z-index:9991;pointer-events:none;
        font-size:clamp(3rem,10vw,7rem);font-weight:900;color:rgba(255,0,0,0.5);
        text-shadow:0 0 30px red,0 0 60px red;white-space:nowrap;
        animation:nuke 0.2s infinite}
      body.effect-chaos *{animation:nuke 0.25s infinite!important;font-family:'Courier New',monospace!important}
    `;
    document.body.classList.add('effect-chaos');
    showDataBlast();
  }

  /* ── EFFET 1-3 : RUINE PROGRESSIVE ── */
  function applyRuin(score) {
    const s = (4 - score) / 3; // 1.0 pour score=1
    styleTag.textContent = `
      @keyframes rot{0%{transform:rotate(0)skew(0)}25%{transform:rotate(${s*3}deg)skew(${s*2}deg)}75%{transform:rotate(-${s*2}deg)skew(-${s}deg)}100%{transform:rotate(0)skew(0)}}
      @keyframes desat{0%,100%{filter:sepia(${s*0.9})saturate(${0.3-s*0.2})brightness(${0.65+s*0.05})contrast(1.3)}50%{filter:sepia(1)saturate(0.05)brightness(0.45)contrast(1.6)}}
      @keyframes crack-pulse{0%,100%{opacity:0.12}50%{opacity:${s*0.5+0.1}}}
      @keyframes tilt{0%{transform:translateY(0)rotate(0)}50%{transform:translateY(${s*8}px)rotate(${s*2}deg)}100%{transform:translateY(0)rotate(0)}}
      body.effect-ruin{animation:desat ${3-s}s infinite!important}
      body.effect-ruin main,body.effect-ruin section,body.effect-ruin .card{animation:tilt ${2-s*0.5}s infinite alternate!important;background:rgba(20,0,0,0.85)!important;border-color:rgba(255,40,40,0.25)!important}
      body.effect-ruin *{font-family:'Courier New',monospace!important;letter-spacing:${s*0.03}em}
      body.effect-ruin h1,body.effect-ruin h2,body.effect-ruin h3{animation:rot ${1.5-s*0.3}s infinite!important;color:rgba(200,80,80,0.9)!important}
      body.effect-ruin::after{content:'⚠ SITE EN RUINE ⚠';position:fixed;top:50%;left:50%;
        transform:translate(-50%,-50%)rotate(${-10-s*5}deg);z-index:9998;pointer-events:none;
        font-size:clamp(1.5rem,${3+s*3}vw,${3+s*2}rem);font-weight:900;
        color:rgba(255,${60-s*40},${60-s*40},${0.2+s*0.2});
        text-shadow:2px 2px 12px rgba(255,0,0,${0.4+s*0.3});white-space:nowrap;
        animation:crack-pulse ${2-s}s infinite}
    `;
    document.body.classList.add('effect-ruin');
  }

  /* ── EFFET 4-7 : BOF, TERNE ── */
  function applyMeh(score) {
    // 4=très bof, 7=légèrement bof
    const desat = (8 - score) / 8; // 0.5 pour score=4, 0.125 pour score=7
    const dim   = 1 - desat * 0.18;
    styleTag.textContent = `
      @keyframes float-meh{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      @keyframes flicker{0%,100%{opacity:1}${score<=5?'50%{opacity:0.88}':'50%{opacity:0.95}'}}
      body.effect-meh{
        filter:saturate(${1-desat*0.7})brightness(${dim})sepia(${desat*0.25})!important;
        transition:filter 1.2s!important
      }
      body.effect-meh main{animation:float-meh ${5-score*0.3}s ease-in-out infinite}
      body.effect-meh .card,body.effect-meh .proj-card,body.effect-meh section{
        border-color:rgba(255,255,255,${0.04+desat*0.04})!important;
        animation:flicker ${2+score*0.3}s ease-in-out infinite
      }
      ${score<=5?`body.effect-meh::after{content:'Mouais...';position:fixed;bottom:6rem;left:50%;
        transform:translateX(-50%);z-index:9998;pointer-events:none;
        font-size:1rem;font-weight:700;color:rgba(200,180,100,0.18);
        font-family:'Courier New',monospace;letter-spacing:0.2em}`:''}
    `;
    document.body.classList.add('effect-meh');
  }

  /* ── EFFET 8-10 : MAGNIFIQUE ── */
  function applyNice(score) {
    const i = (score - 8) / 2;
    styleTag.textContent = `
      @keyframes shimmer{0%,100%{filter:brightness(1)saturate(1)}50%{filter:brightness(${1+i*0.1})saturate(${1+i*0.25})}}
      @keyframes confetti-fall{0%{transform:translateY(-80px)rotate(0deg)scale(1);opacity:1}100%{transform:translateY(110vh)rotate(${360+Math.random()*360}deg)scale(0.8);opacity:0}}
      body.effect-nice{animation:shimmer 2.5s ease-in-out infinite}
      body.effect-nice .card,body.effect-nice .proj-card{box-shadow:0 0 ${12+i*20}px rgba(200,169,110,${0.08+i*0.06})!important}
    `;
    document.body.classList.add('effect-nice');

    // Confettis dorés en continu
    const colors = ['#C8A96E','#F0D080','#A8854A','#FFE0A0','#D4AA60','#fff9e6'];
    let ci = 0;
    function spawnConfetti() {
      const el = document.createElement('div');
      el.className = 'confetti-particle';
      const size = 5 + Math.random() * 8;
      el.style.cssText = `
        position:fixed;top:-20px;left:${Math.random()*100}%;
        width:${size}px;height:${size}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        border-radius:${Math.random()>0.5?'50%':'2px'};
        z-index:9999;pointer-events:none;
        animation:confetti-fall ${1.8+Math.random()*2.5}s linear forwards;
      `;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), 5000);
    }
    // Vague initiale
    for(let j=0;j<40;j++) setTimeout(spawnConfetti, j*60);
    // Confettis continus
    const confInterval = setInterval(spawnConfetti, 300 - score * 20);
    // Stocker pour pouvoir annuler si changement de note
    window._confInterval = confInterval;
  }

  /* ── Gestion des intervalles précédents ── */
  function stopPreviousEffects() {
    if (window._confInterval) { clearInterval(window._confInterval); window._confInterval = null; }
  }

  /* ── Affichage de la réponse textuelle dans le panel ── */
  function showResponse(score) {
    const responses = {
      0:  '😱 NOTE 0 ! Vous avez déclenché quelque chose...',
      1:  '💀 1/10. Le site s\'effondre sous le poids du mépris.',
      2:  '😭 2/10. C\'est presque douloureux à lire.',
      3:  '😬 3/10. Il y a clairement du travail à faire.',
      4:  '😐 4/10. Mouais. Ça pourrait être mieux.',
      5:  '🤷 5/10. Dans la moyenne... basse.',
      6:  '🙄 6/10. Pas terrible, mais pas catastrophique.',
      7:  '😑 7/10. Honnêtement correct. Juste correct.',
      8:  '🙂 8/10 — Merci, ça fait vraiment plaisir !',
      9:  '😊 9/10 — Wow, super ! Merci infiniment !',
      10: '🤩 10/10 — Vous êtes formidable, merci !'
    };
    const cls = score >= 8 ? 'positive' : score >= 4 ? 'neutral' : 'negative';
    cbResp.textContent  = responses[score];
    cbResp.className    = `cb-resp ${cls}`;
    cbResp.style.display = 'block';
    cbMsg.textContent   = 'Votre note : ' + score + ' / 10';
    cbSub.textContent   = '— Cliquez pour changer';
    cbBadge.textContent = score;
    cbBadge.style.display = 'flex';
    cbBadge.style.background = score===0?'#8B0000':score<=3?'#6B1A00':score<=7?'#5A5000':'#1A5C00';
  }

  /* ── Clic sur une note ── */
  cbScale.addEventListener('click', e => {
    const btn = e.target.closest('.cb-nb');
    if (!btn) return;
    const score = parseInt(btn.dataset.v, 10);

    stopPreviousEffects();
    dataBlast.style.display = 'none';
    clearEffects();

    saveRating(score);
    sendRating(score);
    applyEffect(score);
    showResponse(score);
    cbPanel.classList.remove('is-open');
  });

  /* ── Restaurer l'effet au chargement de page ── */
  const saved = loadRating();
  if (saved !== null) {
    showResponse(saved);
    // Petit délai pour laisser la page se charger
    requestAnimationFrame(() => {
      setTimeout(() => {
        clearEffects();
        applyEffect(saved);
      }, 100);
    });
  }

})();
