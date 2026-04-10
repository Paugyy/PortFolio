/* ================================================================
   SHARED.JS — Navigation + Chatbot de notation persistant
   ================================================================ */
'use strict';

/* ── 1. NAVIGATION MOBILE ── */
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));
})();

/* ── 2. CHATBOT DE NOTATION ── */
(function () {

  const RATING_ENDPOINT = 'https://formspree.io/f/xaqpqdnk';
  const STORAGE_KEY = 'portfolio_rating';
  const NICE_DONE_KEY = 'portfolio_nice_done';

  /* ── HTML du widget ── */
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
          ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<button class="cb-nb" data-v="${n}">${n}</button>`).join('')}
        </div>
        <p class="cb-resp" id="cbResp"></p>
      </div>
    </div>

    <!-- Conteneur des éléments flottants (note 0) -->
    <div id="chaosLayer" class="chaos-layer" aria-hidden="true" style="display:none"></div>
  `);

  const cbToggle   = document.getElementById('cbToggle');
  const cbPanel    = document.getElementById('cbPanel');
  const cbBadge    = document.getElementById('cbBadge');
  const cbMsg      = document.getElementById('cbMsg');
  const cbSub      = document.getElementById('cbSub');
  const cbResp     = document.getElementById('cbResp');
  const cbScale    = document.getElementById('cbScale');
  const chaosLayer = document.getElementById('chaosLayer');

  cbToggle.addEventListener('click', () => cbPanel.classList.toggle('is-open'));

  /* ── Persistance ── */
  function saveRating(v) { try { localStorage.setItem(STORAGE_KEY, v); } catch (e) {} }
  function loadRating()  { try { const v = localStorage.getItem(STORAGE_KEY); return v !== null ? parseInt(v, 10) : null; } catch (e) { return null; } }
  function isNiceDone()  { try { return localStorage.getItem(NICE_DONE_KEY) === '1'; } catch (e) { return false; } }
  function markNiceDone(){ try { localStorage.setItem(NICE_DONE_KEY, '1'); } catch (e) {} }

  /* ── Envoi serveur ── */
  async function sendRating(score) {
    try {
      await fetch(RATING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: score, page: location.href, date: new Date().toISOString() })
      });
    } catch (e) {}
  }

  /* ── Style tag unique pour les effets ── */
  const styleTag = document.createElement('style');
  styleTag.id = 'effect-style';
  document.head.appendChild(styleTag);

  function clearEffects() {
    styleTag.textContent = '';
    document.body.classList.remove('effect-chaos', 'effect-ruin', 'effect-meh', 'effect-nice');
    document.querySelectorAll('.confetti-p').forEach(e => e.remove());
    if (window._confInterval) { clearInterval(window._confInterval); window._confInterval = null; }
    stopChaos();
  }

  /* ================================================================
     EFFET NOTE 0 — CHAOS
     Éléments DVD flottants + stroboscope inversé + blocage de page
     ================================================================ */
  let chaosRunning = false;
  let chaosRAF = null;
  let strobeInterval = null;
  const chaosItems = []; // { el, x, y, vx, vy, w, h }

  /* Données qui défilent (inoffensives mais intimidantes) */
  const CHAOS_TEXTS = [
    '☢ ERREUR CRITIQUE', '⚠ ACCÈS REFUSÉ', '0x4E756C6C',
    'NULL POINTER', 'STACK OVERFLOW', 'KERNEL PANIC',
    'SEGFAULT', '0xDEADBEEF', 'FATAL ERROR',
    '☠ SYSTEM FAILURE', 'CORE DUMP', 'EXCEPTION: 0x0000',
    'ABORT SIGNAL', 'MEMORY LEAK', '> rm -rf /',
    'BSOD INCOMING', 'NO SIGNAL', '☢ MELTDOWN',
  ];

  function spawnChaosItem() {
    const el = document.createElement('div');
    el.className = 'chaos-item';
    const text = CHAOS_TEXTS[Math.floor(Math.random() * CHAOS_TEXTS.length)];
    el.textContent = text;
    el.style.fontSize = (10 + Math.random() * 18) + 'px';
    el.style.opacity  = (0.25 + Math.random() * 0.55).toString();
    chaosLayer.appendChild(el);

    const w = el.offsetWidth  || 120;
    const h = el.offsetHeight || 20;
    const x = Math.random() * (window.innerWidth  - w);
    const y = Math.random() * (window.innerHeight - h);
    const speed = 0.6 + Math.random() * 1.4;
    const angle = Math.random() * Math.PI * 2;

    chaosItems.push({ el, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, w, h });
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
  }

  function tickChaos() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    for (const item of chaosItems) {
      item.x += item.vx;
      item.y += item.vy;
      if (item.x <= 0 || item.x + item.w >= W) { item.vx *= -1; item.x = Math.max(0, Math.min(W - item.w, item.x)); }
      if (item.y <= 0 || item.y + item.h >= H) { item.vy *= -1; item.y = Math.max(0, Math.min(H - item.h, item.y)); }
      item.el.style.left = item.x + 'px';
      item.el.style.top  = item.y + 'px';
    }
    if (chaosRunning) chaosRAF = requestAnimationFrame(tickChaos);
  }

  function startChaos() {
    chaosLayer.style.display = 'block';
    chaosLayer.innerHTML = '';
    chaosItems.length = 0;

    /* Spawner 18 éléments */
    for (let i = 0; i < 18; i++) spawnChaosItem();

    /* Stroboscope : flash très rapide, couleur INVERSÉE par rapport au fond */
    /* Fond normal = sombre → flash BLANC ; fond flash blanc → flash NOIR */
    let strobePhase = 0;
    strobeInterval = setInterval(() => {
      strobePhase = (strobePhase + 1) % 4;
      /* 3 frames sombres, 1 frame flash blanc */
      if (strobePhase === 0) {
        chaosLayer.style.background = 'rgba(255,255,255,0.92)'; /* Flash blanc */
      } else {
        chaosLayer.style.background = 'transparent';
      }
    }, 55); /* ~18 Hz */

    chaosRunning = true;
    chaosRAF = requestAnimationFrame(tickChaos);

    /* Bloquer la page */
    styleTag.textContent = `
      @keyframes ruin-shake {
        0%,100%{transform:translate(0,0) rotate(0);}
        20%{transform:translate(-4px,3px) rotate(-0.6deg);}
        40%{transform:translate(4px,-3px) rotate(0.5deg);}
        60%{transform:translate(-3px,4px) rotate(-0.4deg);}
        80%{transform:translate(3px,-2px) rotate(0.6deg);}
      }
      body.effect-chaos { filter: saturate(0.15) brightness(0.7) contrast(1.3) !important; }
      body.effect-chaos main { animation: ruin-shake 0.45s infinite; }
      body.effect-chaos * { cursor: not-allowed !important; }
    `;
    document.body.classList.add('effect-chaos');
  }

  function stopChaos() {
    chaosRunning = false;
    if (chaosRAF)        { cancelAnimationFrame(chaosRAF); chaosRAF = null; }
    if (strobeInterval)  { clearInterval(strobeInterval); strobeInterval = null; }
    chaosLayer.style.display = 'none';
    chaosLayer.innerHTML = '';
    chaosItems.length = 0;
    chaosLayer.style.background = 'transparent';
  }

  /* Bloquer le refresh (Ctrl+R / F5) quand note = 0 */
  function onBeforeUnload(e) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
  function onKeyDown(e) {
    /* Bloquer F5, Ctrl+R, Ctrl+Shift+R */
    if (
      e.key === 'F5' ||
      (e.ctrlKey && e.key === 'r') ||
      (e.ctrlKey && e.shiftKey && e.key === 'R') ||
      (e.metaKey && e.key === 'r')
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function enableRefreshBlock() {
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('keydown', onKeyDown, true);
  }
  function disableRefreshBlock() {
    window.removeEventListener('beforeunload', onBeforeUnload);
    window.removeEventListener('keydown', onKeyDown, true);
  }

  /* Visibilité de l'onglet : si on revient sur l'onglet et note=0, relancer */
  document.addEventListener('visibilitychange', () => {
    const saved = loadRating();
    if (saved === 0) {
      if (document.hidden) {
        /* Onglet caché → maintenir l'effet, rien de spécial */
      } else {
        /* Retour sur l'onglet → s'assurer que le chaos est actif */
        if (!chaosRunning) startChaos();
      }
    }
  });

  /* ── EFFETS PAR NOTE ── */
  function applyEffect(score) {
    clearEffects();

    if (score === 0) {
      startChaos();
      enableRefreshBlock();
      return;
    }

    disableRefreshBlock();

    if (score <= 3) {
      const s = (4 - score) / 3;
      styleTag.textContent = `
        @keyframes ruin-filter {
          0%,100% { filter: sepia(${s * 0.85}) saturate(${0.35 - s * 0.25}) brightness(${0.75 + s * 0.04}) contrast(1.25); }
          50%      { filter: sepia(1) saturate(0.05) brightness(${0.55 - s * 0.05}) contrast(1.5); }
        }
        @keyframes ruin-shake {
          0%,100%{transform:translate(0,0) rotate(0);}
          25%{transform:translate(-${s*4}px,${s*3}px) rotate(${s*1.2}deg);}
          75%{transform:translate(${s*3}px,-${s*2}px) rotate(-${s*0.8}deg);}
        }
        @keyframes crack-pulse{0%,100%{opacity:0.1;}50%{opacity:${0.08+s*0.28};}}
        body.effect-ruin { animation: ruin-filter ${2.5-s}s ease-in-out infinite !important; }
        body.effect-ruin main { animation: ruin-shake ${1.8-s*0.5}s infinite alternate; }
        body.effect-ruin .card, body.effect-ruin .proj-card, body.effect-ruin .res-card {
          border-color: rgba(200,40,40,${0.12+s*0.2}) !important;
          background: rgba(16,3,3,0.92) !important;
        }
        body.effect-ruin * { font-family: 'Courier New', monospace !important; }
        body.effect-ruin::after {
          content: '⚠ SITE EN RUINE ⚠';
          position: fixed; top: 50%; left: 50%;
          transform: translate(-50%,-50%) rotate(${-8-s*5}deg);
          z-index: 9000; pointer-events: none;
          font-size: clamp(1rem,${1.8+s*1.8}vw,${2+s}rem);
          font-weight: 900;
          color: rgba(255,${55-s*35},${55-s*35},${0.15+s*0.18});
          text-shadow: 2px 2px 10px rgba(255,0,0,${0.28+s*0.28});
          white-space: nowrap;
          font-family: 'Courier New', monospace;
          animation: crack-pulse ${2-s*0.4}s infinite;
        }
      `;
      document.body.classList.add('effect-ruin');

    } else if (score <= 7) {
      const desat = (8 - score) / 8;
      const dim   = 1 - desat * 0.14;
      styleTag.textContent = `
        @keyframes float-meh { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-3px);} }
        body.effect-meh {
          filter: saturate(${1-desat*0.65}) brightness(${dim}) sepia(${desat*0.18});
          transition: filter 1.2s;
        }
        body.effect-meh main { animation: float-meh ${4+score*0.4}s ease-in-out infinite; }
        ${score <= 5 ? `body.effect-meh::after {
          content: 'Mouais...';
          position: fixed; bottom: 5.5rem; left: 50%;
          transform: translateX(-50%);
          z-index: 9000; pointer-events: none;
          font-size: 0.9rem; font-weight: 700;
          color: rgba(200,180,100,0.14);
          font-family: 'Courier New', monospace;
          letter-spacing: 0.2em;
        }` : ''}
      `;
      document.body.classList.add('effect-meh');

    } else {
      /* 7-10 : shimmer + confettis UNE SEULE FOIS */
      const i = Math.max(0, (score - 7) / 3);
      styleTag.textContent = `
        @keyframes shimmer {
          0%,100% { filter: brightness(1) saturate(1); }
          50%      { filter: brightness(${1+i*0.08}) saturate(${1+i*0.2}); }
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(-60px) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(110vh) rotate(540deg) scale(0.7); opacity: 0; }
        }
        body.effect-nice { animation: shimmer 2.5s ease-in-out infinite; }
        body.effect-nice .card, body.effect-nice .proj-card {
          box-shadow: 0 0 ${8+i*18}px rgba(200,169,110,${0.05+i*0.06}) !important;
        }
      `;
      document.body.classList.add('effect-nice');

      if (!isNiceDone()) {
        markNiceDone();
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
        for (let j = 0; j < 40; j++) setTimeout(spawnOne, j * 55);
      }
    }
  }

  /* ── Texte de réponse ── */
  function showResponse(score) {
    const msgs = {
      0:  '😱 Note 0 — Vous avez tout déclenché...',
      1:  '💀 1/10 — Le site s\'effondre.',
      2:  '😭 2/10 — Presque douloureux.',
      3:  '😬 3/10 — Du travail à faire.',
      4:  '😐 4/10 — Mouais.',
      5:  '🤷 5/10 — Dans la moyenne basse.',
      6:  '🙄 6/10 — Pas terrible.',
      7:  '😑 7/10 — Juste correct.',
      8:  '🙂 8/10 — Merci, ça fait plaisir !',
      9:  '😊 9/10 — Super, merci !',
      10: '🤩 10/10 — Formidable !'
    };
    const cls = score >= 7 ? 'positive' : score >= 4 ? 'neutral' : 'negative';
    cbResp.textContent   = msgs[score];
    cbResp.className     = `cb-resp ${cls}`;
    cbResp.style.display = 'block';
    cbMsg.textContent    = `Votre note : ${score} / 10`;
    cbSub.textContent    = '— Cliquer pour changer';
    cbBadge.textContent  = score;
    cbBadge.style.display = 'flex';
    cbBadge.style.background = score === 0 ? '#8B0000' : score <= 3 ? '#6B1A00' : score <= 7 ? '#5A5000' : '#1A5C00';
  }

  /* ── Clic sur une note ── */
  cbScale.addEventListener('click', e => {
    const btn = e.target.closest('.cb-nb');
    if (!btn) return;
    const score = parseInt(btn.dataset.v, 10);

    if (score !== 0) {
      try { localStorage.removeItem('portfolio_scream_done'); } catch (_) {}
    }
    if (score < 7) {
      try { localStorage.removeItem(NICE_DONE_KEY); } catch (_) {}
    }

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
