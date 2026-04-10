/* ================================================================
   SHARED.JS — Composants partagés sur toutes les pages
   ----------------------------------------------------------------
   Ce fichier gère :
   1. Navigation mobile (hamburger)
   2. Chatbot de notation (widget flottant)
   3. Système de popups projet + procédure
   4. Effets visuels selon la note (0=chaos, 1-3=ruine, 4-7=bof, 8-10=merci)

   MODIFIER : Les textes du chatbot dans CHATBOT_MESSAGES
   MODIFIER : L'URL Formspree dans RATING_ENDPOINT pour recevoir les notes
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

  // Fermer le menu en cliquant sur un lien
  nav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('is-open'));
  });
})();

/* ── 2. CHATBOT DE NOTATION ── */
(function() {

  /* MODIFIER : Remplacer l'URL par votre endpoint Formspree ou autre service
     Exemple Formspree : https://formspree.io/f/VOTRE_ID
     Les notes vous seront envoyées par email. */
  const RATING_ENDPOINT = 'https://formspree.io/f/xaqpqdnk';

  /* MODIFIER : Personnaliser les messages */
  const CHATBOT_MESSAGES = {
    question: "Comment trouvez-vous ce portfolio ?<br><small style='color:var(--text-sub)'>Donnez une note de 0 à 10</small>",
    responses: {
      positive: [
        "Merci infiniment ! 🙏 Ça me motive vraiment à continuer.",
        "Super, je suis ravi que ça vous plaise ! 🌟",
        "Merci beaucoup ! C'est exactement ce que je visais. ✨"
      ],
      neutral: [
        "Merci pour votre retour. Je vais continuer à améliorer le portfolio !",
        "Noted ! J'ai encore du chemin mais je progresse. 💪",
        "Merci ! Je vais travailler sur les points à améliorer."
      ],
      negative: [
        "Je comprends... Je vais revoir tout ça sérieusement. 🔧",
        "Aïe, c'est noté. Le portfolio va passer en mode révision totale.",
        "Merci pour l'honnêteté. Il y a du travail ! 😅"
      ]
    }
  };

  /* Injecter le widget dans le DOM */
  const chatHTML = `
    <button class="chatbot-btn" id="chatbotToggle" aria-label="Ouvrir le chatbot de notation" aria-expanded="false">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
    <div class="chatbot-panel" id="chatbotPanel" role="dialog" aria-label="Chatbot de notation">
      <div class="chatbot-header">
        <div class="chatbot-dot"></div>
        <span class="chatbot-name">Votre avis</span>
        <span class="chatbot-status">En ligne</span>
      </div>
      <div class="chatbot-body" id="chatbotBody">
        <p class="chatbot-msg" id="chatbotMsg">${CHATBOT_MESSAGES.question}</p>
        <div class="rating-scale" id="ratingScale">
          ${[0,1,2,3,4,5,6,7,8,9,10].map(n => `<button class="rating-btn" data-v="${n}" aria-label="Note ${n}">${n}</button>`).join('')}
        </div>
        <p class="chatbot-response" id="chatbotResponse" style="display:none"></p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', chatHTML);

  const toggle   = document.getElementById('chatbotToggle');
  const panel    = document.getElementById('chatbotPanel');
  const msgEl    = document.getElementById('chatbotMsg');
  const scale    = document.getElementById('ratingScale');
  const respEl   = document.getElementById('chatbotResponse');

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });

  /* Effets visuels selon la note */
  function applyEffect(score) {
    // Supprimer effets précédents
    document.body.classList.remove('effect-chaos','effect-ruin','effect-meh','effect-nice');
    removeAllEffectStyles();

    if (score === 0) applyChaos();
    else if (score <= 3) applyRuin(score);
    else if (score <= 7) applyMeh(score);
    else applyNice(score);
  }

  function removeAllEffectStyles() {
    const old = document.getElementById('effect-style');
    if (old) old.remove();
  }

  function injectStyle(css, id = 'effect-style') {
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  /* EFFET 0 — Chaos total, stroboscopique, kaléidoscopique */
  function applyChaos() {
    injectStyle(`
      @keyframes strobe { 0%,49%{filter:invert(1) hue-rotate(0deg) saturate(0);background:#000}
        50%,100%{filter:invert(0) hue-rotate(180deg) saturate(0);background:#fff} }
      @keyframes shake {
        0%{transform:translate(0,0) rotate(0)}10%{transform:translate(-8px,5px) rotate(-4deg)}
        20%{transform:translate(10px,-7px) rotate(3deg)}30%{transform:translate(-6px,9px) rotate(-2deg)}
        40%{transform:translate(8px,-4px) rotate(5deg)}50%{transform:translate(-10px,6px) rotate(-3deg)}
        60%{transform:translate(7px,-8px) rotate(2deg)}70%{transform:translate(-9px,4px) rotate(-5deg)}
        80%{transform:translate(5px,-6px) rotate(4deg)}90%{transform:translate(-7px,8px) rotate(-1deg)}
        100%{transform:translate(0,0) rotate(0)} }
      @keyframes kaleido {
        0%{clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)}
        25%{clip-path:polygon(50% 10%,90% 50%,70% 90%,30% 90%,10% 50%)}
        50%{clip-path:polygon(20% 0%,80% 0%,100% 60%,50% 100%,0% 60%)}
        75%{clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%)}
        100%{clip-path:polygon(50% 0%,100% 38%,82% 100%,18% 100%,0% 38%)} }
      body.effect-chaos {
        animation: strobe 0.12s infinite, shake 0.4s infinite !important;
        overflow: hidden;
      }
      body.effect-chaos::before {
        content:''; position:fixed; inset:0; z-index:9999; pointer-events:none;
        background: repeating-conic-gradient(#000 0deg,#fff 10deg,#000 20deg,#fff 30deg,#000 40deg);
        animation: kaleido 0.5s infinite, strobe 0.08s infinite;
        mix-blend-mode: exclusion; opacity:0.9;
      }
      body.effect-chaos * { font-family: monospace !important; }
      body.effect-chaos h1,body.effect-chaos h2,body.effect-chaos h3 {
        animation: shake 0.15s infinite !important;
        transform-origin:center;
      }
    `);
    document.body.classList.add('effect-chaos');

    // Reposer la question après 5 secondes
    setTimeout(() => {
      removeAllEffectStyles();
      document.body.classList.remove('effect-chaos');
      resetChatbot();
    }, 5000);
  }

  /* EFFET 1-3 — Le site tombe en ruine */
  function applyRuin(score) {
    const intensity = (4 - score) / 3; // 1.0 pour score=1, 0.33 pour score=3
    injectStyle(`
      @keyframes crumble {
        0%{transform:translateY(0) rotate(0) skew(0)}
        20%{transform:translateY(${intensity*4}px) rotate(${intensity*1.5}deg) skew(${intensity}deg)}
        40%{transform:translateY(${intensity*2}px) rotate(-${intensity}deg) skew(-${intensity*0.5}deg)}
        60%{transform:translateY(${intensity*6}px) rotate(${intensity*2}deg)}
        80%{transform:translateY(${intensity*3}px) rotate(-${intensity*0.8}deg)}
        100%{transform:translateY(${intensity*5}px) rotate(${intensity}deg) skew(${intensity*0.5}deg)} }
      @keyframes discolor {
        0%,100%{filter:sepia(${intensity*0.8}) saturate(0.3) brightness(0.7)}
        50%{filter:sepia(1) saturate(0.1) brightness(0.5) contrast(1.3)} }
      @keyframes crack {
        0%,100%{opacity:0.15} 50%{opacity:${intensity*0.6}} }
      body.effect-ruin {
        animation: crumble ${2-intensity}s infinite alternate, discolor 2s infinite !important;
      }
      body.effect-ruin * { font-family: 'Courier New', monospace !important; }
      body.effect-ruin .card, body.effect-ruin .project-card, body.effect-ruin section {
        animation: crumble ${1.5-intensity*0.5}s infinite alternate !important;
        border-color: rgba(255,50,50,0.3) !important;
        background: rgba(30,0,0,0.8) !important;
      }
      body.effect-ruin::after {
        content:'⚠ SITE EN RUINE ⚠'; position:fixed; top:50%; left:50%;
        transform:translate(-50%,-50%) rotate(-15deg); z-index:9998;
        font-size:clamp(2rem,6vw,4rem); font-weight:900; color:rgba(255,40,40,0.3);
        pointer-events:none; white-space:nowrap;
        text-shadow:2px 2px 8px rgba(255,0,0,0.5);
        animation:crack 1.5s infinite;
      }
    `);
    document.body.classList.add('effect-ruin');

    // Reposer la question après 6 secondes
    setTimeout(() => {
      removeAllEffectStyles();
      document.body.classList.remove('effect-ruin');
      resetChatbot();
    }, 6000);
  }

  /* EFFET 4-7 — Site bof, légèrement désaturé et flottant */
  function applyMeh(score) {
    const desat = 1 - (score - 4) / 10; // plus désaturé pour les basses notes
    injectStyle(`
      @keyframes float-meh {
        0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
      body.effect-meh {
        filter: saturate(${1 - desat * 0.5}) brightness(0.92) !important;
        transition: filter 1s !important;
      }
      body.effect-meh main { animation: float-meh 4s ease-in-out infinite; }
    `);
    document.body.classList.add('effect-meh');
  }

  /* EFFET 8-10 — Site magnifié, confettis dorés */
  function applyNice(score) {
    const intensity = (score - 8) / 2;
    injectStyle(`
      @keyframes shimmer {
        0%,100%{filter:brightness(1) saturate(1)}
        50%{filter:brightness(${1 + intensity*0.12}) saturate(${1 + intensity*0.3})} }
      @keyframes confetti-fall {
        0%{transform:translateY(-100px) rotate(0deg);opacity:1}
        100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
      body.effect-nice { animation: shimmer 2s ease-in-out infinite; }
    `);
    document.body.classList.add('effect-nice');

    // Confettis dorés
    const colors = ['#C8A96E','#F0D080','#A8854A','#FFE0A0','#D4AA60'];
    for(let i=0; i<30; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.style.cssText = `
          position:fixed; top:-10px; left:${Math.random()*100}%;
          width:${6+Math.random()*6}px; height:${6+Math.random()*6}px;
          background:${colors[Math.floor(Math.random()*colors.length)]};
          border-radius:${Math.random()>0.5?'50%':'2px'};
          z-index:9999; pointer-events:none;
          animation:confetti-fall ${1.5+Math.random()*2}s linear forwards;
          transform-origin:center;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
      }, i * 80);
    }
  }

  /* Reset chatbot — reposer la question */
  function resetChatbot() {
    msgEl.innerHTML = CHATBOT_MESSAGES.question;
    respEl.style.display = 'none';
    respEl.textContent = '';
    scale.style.display = 'flex';
    respEl.className = 'chatbot-response';
  }

  /* Envoi de la note */
  async function sendRating(score) {
    try {
      await fetch(RATING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: score, page: location.href, date: new Date().toISOString() })
      });
    } catch(e) { /* silencieux si offline */ }
  }

  /* Gestion des clics sur les boutons de note */
  scale.addEventListener('click', e => {
    const btn = e.target.closest('.rating-btn');
    if (!btn) return;
    const score = parseInt(btn.dataset.v, 10);

    // Appliquer l'effet visuel
    applyEffect(score);

    // Envoyer la note
    sendRating(score);

    // Afficher la réponse dans le panel
    let resp, cls;
    if (score >= 8) {
      resp = CHATBOT_MESSAGES.responses.positive[Math.floor(Math.random()*3)];
      cls = 'positive';
    } else if (score >= 4) {
      resp = CHATBOT_MESSAGES.responses.neutral[Math.floor(Math.random()*3)];
      cls = 'neutral';
    } else {
      resp = CHATBOT_MESSAGES.responses.negative[Math.floor(Math.random()*3)];
      cls = 'negative';
    }

    scale.style.display = 'none';
    respEl.innerHTML = resp;
    respEl.className = `chatbot-response ${cls}`;
    respEl.style.display = 'block';
    msgEl.innerHTML = score === 0
      ? '😱 Note catastrophique !'
      : score <= 3 ? '😬 Oh non...'
      : score <= 7 ? '😐 Ok, merci !'
      : '😊 Merci pour votre avis !';
  });

})();
