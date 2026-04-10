/* ================================================================
   PROJECTS.JS — Gestion des projets (carrousel + grille + popup)
   ----------------------------------------------------------------
   MODIFIER : Les données dans data/projects.json
   MODIFIER : Les procédures disponibles dans PROCEDURES_DATA ci-dessous
   ================================================================ */

'use strict';

/* ── Données des procédures (pour les ouvrir depuis la popup projet)
   MODIFIER : Ajouter/modifier des procédures ici.
   Le champ "titre" doit correspondre exactement à celui dans projects.json
   ── */
const PROCEDURES_DATA = {
  "Installation Debian": `<h2>Installation Debian</h2><p><strong>Catégorie :</strong> Système</p><hr>
    <h3>Prérequis</h3><ul><li>ISO Debian 12 (Bookworm)</li><li>VirtualBox ou machine physique</li><li>Minimum 20 Go d'espace disque</li></ul>
    <h3>Étapes</h3><ol><li>Télécharger l'ISO sur <code>debian.org</code></li><li>Créer une VM VirtualBox (2 Go RAM min)</li><li>Démarrer sur l'ISO → <em>Graphical Install</em></li><li>Configurer langue, clavier, fuseau horaire</li><li>Partitionner le disque (méthode guidée)</li><li>Installer GRUB sur le MBR</li></ol>
    <h3>Post-installation</h3><pre>apt update && apt upgrade -y\napt install sudo vim -y\nusermod -aG sudo monuser</pre>`,

  "Configuration SSH": `<h2>Configuration SSH</h2><p><strong>Catégorie :</strong> Système</p><hr>
    <h3>Installation</h3><pre>apt install openssh-server -y\nsystemctl enable ssh && systemctl start ssh</pre>
    <h3>Paramètres (/etc/ssh/sshd_config)</h3><pre>Port 22\nPermitRootLogin no\nPasswordAuthentication yes</pre>
    <h3>Connexion client</h3><pre>ssh utilisateur@adresse_ip</pre>
    <h3>Clés SSH</h3><pre>ssh-keygen -t ed25519\nssh-copy-id utilisateur@serveur</pre>`,

  "Configuration réseau Debian": `<h2>Configuration réseau Debian</h2><p><strong>Catégorie :</strong> Réseau</p><hr>
    <h3>Fichier de config</h3><pre>/etc/network/interfaces</pre>
    <h3>IP statique</h3><pre>auto eth0\niface eth0 inet static\n  address 192.168.1.10\n  netmask 255.255.255.0\n  gateway 192.168.1.1\n  dns-nameservers 8.8.8.8</pre>
    <h3>Redémarrer</h3><pre>systemctl restart networking</pre>
    <h3>Vérifier</h3><pre>ip a && ping 8.8.8.8</pre>`,

  "Installation Apache2": `<h2>Installation Apache2</h2><p><strong>Catégorie :</strong> Web</p><hr>
    <h3>Installation</h3><pre>apt install apache2 -y\nsystemctl enable apache2</pre>
    <h3>Dossiers clés</h3><pre>/etc/apache2/     → configuration\n/var/www/html/    → racine web</pre>
    <h3>VirtualHost</h3><pre>&lt;VirtualHost *:80&gt;\n  ServerName monsite.local\n  DocumentRoot /var/www/monsite\n&lt;/VirtualHost&gt;</pre>
    <h3>Activer</h3><pre>a2ensite monsite.conf && systemctl reload apache2</pre>`,

  "Docker — bases": `<h2>Docker — bases</h2><p><strong>Catégorie :</strong> Web</p><hr>
    <h3>Installation</h3><pre>apt install docker.io -y\nsystemctl enable docker\nusermod -aG docker monuser</pre>
    <h3>Commandes essentielles</h3><pre>docker pull image:tag\ndocker run -d -p 80:80 --name monc image\ndocker ps && docker stop monc</pre>
    <h3>Docker Compose</h3><pre>docker-compose up -d\ndocker-compose down</pre>`,

  "Installation MySQL": `<h2>Installation MySQL</h2><p><strong>Catégorie :</strong> Base de données</p><hr>
    <h3>Installation</h3><pre>apt install mysql-server -y\nmysql_secure_installation</pre>
    <h3>Connexion</h3><pre>mysql -u root -p</pre>
    <h3>Commandes SQL</h3><pre>SHOW DATABASES;\nCREATE DATABASE mabase;\nUSE mabase;\nSHOW TABLES;</pre>
    <h3>Créer un utilisateur</h3><pre>CREATE USER 'user'@'localhost' IDENTIFIED BY 'mdp';\nGRANT ALL PRIVILEGES ON mabase.* TO 'user'@'localhost';\nFLUSH PRIVILEGES;</pre>`,

  "Git — commandes essentielles": `<h2>Git — commandes essentielles</h2><p><strong>Catégorie :</strong> Outils</p><hr>
    <h3>Configuration</h3><pre>git config --global user.name 'Prénom Nom'\ngit config --global user.email 'mail@exemple.com'</pre>
    <h3>Workflow</h3><pre>git status\ngit add .\ngit commit -m 'message'\ngit push origin main</pre>
    <h3>Branches</h3><pre>git branch ma-branche\ngit checkout ma-branche\ngit merge ma-branche</pre>`,

  "Commandes réseau utiles": `<h2>Commandes réseau utiles</h2><p><strong>Catégorie :</strong> Réseau</p><hr>
    <h3>Diagnostic</h3><pre>ping adresse\ntraceroute adresse\nnslookup domaine</pre>
    <h3>Interfaces</h3><pre>ip a\nip route show</pre>
    <h3>Ports</h3><pre>ss -tuln\nnmap -sV adresse</pre>`,

  "VirtualBox — créer une VM": `<h2>VirtualBox — créer une VM</h2><p><strong>Catégorie :</strong> Outils</p><hr>
    <h3>Création</h3><ol><li>Cliquer sur Nouvelle</li><li>Choisir Linux/Debian</li><li>Allouer 1 Go RAM minimum</li><li>Créer un disque VDI de 20 Go</li></ol>
    <h3>Modes réseau</h3><ul><li><strong>NAT</strong> : Internet depuis la VM</li><li><strong>Réseau interne</strong> : entre VMs</li><li><strong>Pont</strong> : VM sur réseau local</li></ul>`,

  "Gestion des utilisateurs": `<h2>Gestion des utilisateurs Linux</h2><p><strong>Catégorie :</strong> Système</p><hr>
    <h3>Créer</h3><pre>adduser nomutilisateur\nusermod -aG sudo nomutilisateur</pre>
    <h3>Supprimer</h3><pre>deluser --remove-home nomutilisateur</pre>
    <h3>Lister</h3><pre>cat /etc/passwd</pre>`
};

/* ── Helpers ── */
const catLabel = c => c === 'entreprise' ? 'Entreprise' : c === 'ecole' ? 'École' : 'Perso';
const catClass = c => c === 'ecole' ? 'tag tag--blue' : c === 'perso' ? 'tag tag--green' : 'tag tag--gold';

/* ── Popup projet ── */
const overlay      = document.getElementById('overlay');
const popupProject = document.getElementById('popupProject');
const ppTitle      = document.getElementById('ppTitle');
const ppMeta       = document.getElementById('ppMeta');
const ppStack      = document.getElementById('ppStack');
const ppBody       = document.getElementById('ppBody');
const ppClose      = document.getElementById('ppClose');

/* Popup procédure */
const overlayProc = document.getElementById('overlayProc');
const popupProc   = document.getElementById('popupProc');
const procTitle   = document.getElementById('procTitle');
const procBody    = document.getElementById('procBody');
const procClose   = document.getElementById('procClose');

function openProject(p) {
  ppTitle.textContent = p.title;
  ppStack.textContent = p.stack;
  ppMeta.innerHTML    = `<span class="${catClass(p.category)}">${catLabel(p.category)}</span>
    <span style="font-size:.72rem;font-family:var(--font-mono);color:var(--text-sub)">${(p.date||'').slice(0,4)}</span>`;

  /* Corps : sections du projet */
  const sections = [
    { label: 'Contexte',                  key: 'context'     },
    { label: 'Objectifs',                 key: 'objectifs'   },
    { label: 'Étapes réalisées',          key: 'etapes'      },
    { label: 'Difficultés rencontrées',   key: 'difficultes' },
    { label: 'Résultat',                  key: 'resultat',  full: true }
  ];

  const sectionsHTML = sections.map(s => `
    <div class="popup__section ${s.full ? 'popup__section--full' : ''}">
      <div class="popup__section-label">${s.label}</div>
      <p>${p[s.key] || '—'}</p>
    </div>
  `).join('');

  /* Procédures liées */
  /* MODIFIER : Ajouter des procédures dans PROCEDURES_DATA et dans projects.json */
  let procsHTML = '';
  if (p.procedures && p.procedures.length) {
    const chips = p.procedures.map(proc => `
      <button class="proc-link" data-proc="${proc.titre}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        ${proc.titre}
      </button>
    `).join('');

    procsHTML = `
      <div class="popup__section popup__section--full">
        <div class="popup__section-label">Procédures liées</div>
        <div class="popup__procs-list">${chips}</div>
      </div>`;
  }

  ppBody.innerHTML = sectionsHTML + procsHTML;

  /* Listener sur les chips procédure */
  ppBody.querySelectorAll('.proc-link').forEach(btn => {
    btn.addEventListener('click', () => openProc(btn.dataset.proc));
  });

  overlay.classList.add('is-visible');
  popupProject.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeProject() {
  overlay.classList.remove('is-visible');
  popupProject.classList.remove('is-open');
  if (!popupProc.classList.contains('is-open')) {
    document.body.style.overflow = '';
  }
}

function openProc(titre) {
  const content = PROCEDURES_DATA[titre];
  procTitle.textContent = titre;
  procBody.innerHTML = content || `<p>Procédure "${titre}" non trouvée. Vérifiez PROCEDURES_DATA dans projects.js.</p>`;
  overlayProc.classList.add('is-visible');
  popupProc.classList.add('is-open');
}

function closeProc() {
  overlayProc.classList.remove('is-visible');
  popupProc.classList.remove('is-open');
}

if (ppClose)    ppClose.addEventListener('click', closeProject);
if (overlay)    overlay.addEventListener('click', closeProject);
if (procClose)  procClose.addEventListener('click', closeProc);
if (overlayProc) overlayProc.addEventListener('click', closeProc);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (popupProc && popupProc.classList.contains('is-open')) closeProc();
    else if (popupProject && popupProject.classList.contains('is-open')) closeProject();
  }
});

/* ── Chargement des projets ── */
(async function() {
  const featuredTrack = document.getElementById('featuredTrack');
  const projectsGrid  = document.getElementById('projectsGrid');

  const base    = document.baseURI;
  const jsonUrl = featuredTrack
    ? new URL('data/projects.json', base)
    : new URL('../data/projects.json', base);

  let projects = [];
  try {
    const res = await fetch(jsonUrl.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    projects = await res.json();
    if (!Array.isArray(projects)) throw new Error('JSON invalide');
  } catch(err) {
    if (featuredTrack) featuredTrack.innerHTML = '<p style="color:var(--text-sub);padding:.5rem">Impossible de charger les projets.</p>';
    if (projectsGrid)  projectsGrid.innerHTML  = '<p style="color:var(--text-sub);padding:.5rem">Impossible de charger les projets.</p>';
    return;
  }

  projects.sort((a,b) => (b.date||'').localeCompare(a.date||''));

  /* ── CARROUSEL (page index) ── */
  if (featuredTrack) {
    featuredTrack.innerHTML = projects.slice(0,8).map(p => `
      <div class="feature-card" role="button" tabindex="0" data-id="${p.id}" aria-label="${p.title}">
        <div class="feature-top">
          <span class="f-title">${p.title}</span>
          <span class="${catClass(p.category)}">${catLabel(p.category)}</span>
        </div>
        <p class="f-desc">${p.summary}</p>
        <div class="feature-bottom">
          <span>${p.stack}</span>
          <span>${(p.date||'').slice(0,4)}</span>
        </div>
      </div>
    `).join('');

    featuredTrack.querySelectorAll('.feature-card').forEach(card => {
      const id = card.dataset.id;
      const p  = projects.find(x => x.id === id);
      if (!p) return;
      card.addEventListener('click', () => openProject(p));
      card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject(p);} });
    });

    /* Auto-scroll */
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let raf = null;
      const tick = () => {
        featuredTrack.scrollLeft += 0.4;
        if (featuredTrack.scrollLeft >= featuredTrack.scrollWidth - featuredTrack.clientWidth)
          featuredTrack.scrollLeft = 0;
        raf = requestAnimationFrame(tick);
      };
      const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
      const stop  = () => { if (raf)  { cancelAnimationFrame(raf); raf = null; } };
      featuredTrack.addEventListener('mouseenter', stop);
      featuredTrack.addEventListener('mouseleave', start);
      start();
    }
  }

  /* ── GRILLE (page projets) ── */
  if (!projectsGrid) return;

  let activeFilter = 'all';

  function render(filter) {
    const list = filter === 'all' ? projects : projects.filter(p => p.category === filter);
    if (!list.length) {
      projectsGrid.innerHTML = '<p style="color:var(--text-sub);grid-column:1/-1">Aucun projet pour ce filtre.</p>';
      return;
    }
    projectsGrid.innerHTML = list.map((p, i) => `
      <button class="proj-card" data-id="${p.id}" aria-label="${p.title}" style="animation-delay:${i*40}ms">
        <div class="proj-card__top">
          <span class="proj-card__title">${p.title}</span>
          <span class="${catClass(p.category)}">${catLabel(p.category)}</span>
        </div>
        <p class="proj-card__desc">${p.summary}</p>
        <div class="proj-card__footer">
          <span class="proj-card__stack">${p.stack}</span>
          <span class="proj-card__year">${(p.date||'').slice(0,4)}</span>
          <span class="proj-card__open">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Détails
          </span>
        </div>
      </button>
    `).join('');

    projectsGrid.querySelectorAll('.proj-card').forEach(card => {
      const p = projects.find(x => x.id === card.dataset.id);
      if (!p) return;
      card.addEventListener('click', () => openProject(p));
    });
  }

  render(activeFilter);

  document.querySelectorAll('.proj-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.proj-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render(activeFilter);
    });
  });

})();
