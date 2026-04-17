'use strict';

const PROCEDURES_DATA = {

  /* ════════════════════════════════════════
     SYSTÈME
  ════════════════════════════════════════ */
  "Installation Debian": `<h2>Installation Debian 12</h2><p><strong>Catégorie :</strong> Système</p><hr>
    <h3>Prérequis</h3>
    <ul><li>ISO Debian 12 Bookworm : <code>debian.org/distrib/</code></li><li>VirtualBox / Proxmox ou machine physique</li><li>Minimum 20 Go disque, 2 Go RAM</li></ul>
    <h3>Création VM VirtualBox</h3>
    <pre>Nouvelle VM → Linux → Debian 64-bit
RAM : 2048 Mo minimum
Disque : VDI dynamique 20 Go
Réseau : Adaptateur pont (Bridged)</pre>
    <h3>Installation</h3>
    <ol><li>Démarrer sur l'ISO → <em>Graphical Install</em></li><li>Langue : Français / Fuseau : Europe/Paris</li><li>Partitionnement : méthode guidée — disque entier</li><li>Miroir réseau : deb.debian.org</li><li>Cocher : utilitaires système standard + serveur SSH</li><li>Installer GRUB sur le MBR (/dev/sda)</li></ol>
    <h3>Post-installation</h3>
    <pre>apt update && apt upgrade -y
apt install sudo curl wget vim git net-tools -y
usermod -aG sudo votre_utilisateur
reboot</pre>`,

  "Configuration SSH": `<h2>Configuration SSH</h2><p><strong>Catégorie :</strong> Système</p><hr>
    <h3>Installation du serveur SSH</h3>
    <pre>apt install openssh-server -y
systemctl enable ssh
systemctl start ssh
systemctl status ssh</pre>
    <h3>Configuration (/etc/ssh/sshd_config)</h3>
    <pre>Port 22
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys</pre>
    <h3>Redémarrer après modification</h3>
    <pre>systemctl restart ssh</pre>
    <h3>Connexion depuis un client</h3>
    <pre>ssh utilisateur@adresse_ip
ssh -p 22 utilisateur@192.168.1.10</pre>
    <h3>Générer une paire de clés (côté client)</h3>
    <pre>ssh-keygen -t ed25519 -C "mon@email.com"
ssh-copy-id utilisateur@192.168.1.10</pre>`,

  "Clé SSH Windows → VM Debian": `<h2>Clé SSH Windows → VM Debian</h2><p><strong>Catégorie :</strong> Système</p><hr>
    <h3>Contexte</h3>
    <p>Ce tutoriel explique comment générer une paire de clés SSH sur Windows et la copier sur une VM Debian pour se connecter sans mot de passe.</p>
    <h3>1. Générer la clé SSH sur Windows</h3>
    <p>Ouvrez PowerShell (ou Windows Terminal) :</p>
    <pre>ssh-keygen -t ed25519 -C "votre@email.com"</pre>
    <p>Appuyez sur Entrée pour accepter le chemin par défaut :<br><code>C:\Users\VotreNom\.ssh\id_ed25519</code><br>Laissez la passphrase vide (ou définissez-en une).</p>
    <h3>2. Vérifier les clés générées</h3>
    <pre>ls $env:USERPROFILE\.ssh\
# Vous devez voir : id_ed25519 (clé privée) et id_ed25519.pub (clé publique)</pre>
    <h3>3. Copier la clé publique sur la VM Debian</h3>
    <p>Depuis PowerShell Windows :</p>
    <pre>type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh utilisateur@192.168.1.10 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"</pre>
    <p>Ou manuellement : copiez le contenu de id_ed25519.pub, connectez-vous en SSH avec mot de passe, puis :</p>
    <pre># Sur la VM Debian :
mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/authorized_keys
# Collez la clé publique, sauvegardez
chmod 600 ~/.ssh/authorized_keys</pre>
    <h3>4. Configurer SSH sur la VM pour accepter les clés</h3>
    <pre># Vérifier dans /etc/ssh/sshd_config :
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
# Redémarrer SSH :
systemctl restart ssh</pre>
    <h3>5. Connexion sans mot de passe depuis Windows</h3>
    <pre>ssh utilisateur@192.168.1.10
# → Connexion directe sans mot de passe</pre>
    <h3>6. Optionnel : fichier config SSH Windows</h3>
    <p>Créez <code>C:\Users\VotreNom\.ssh\config</code> :</p>
    <pre>Host mavm
    HostName 192.168.1.10
    User utilisateur
    IdentityFile ~/.ssh/id_ed25519</pre>
    <p>Ensuite : <code>ssh mavm</code> suffit.</p>`,

  "Gestion des utilisateurs": `<h2>Gestion des utilisateurs Linux</h2><p><strong>Catégorie :</strong> Système</p><hr>
    <h3>Créer un utilisateur</h3>
    <pre>adduser nomutilisateur
# Ou sans interaction :
useradd -m -s /bin/bash nomutilisateur
passwd nomutilisateur</pre>
    <h3>Ajouter au groupe sudo</h3>
    <pre>usermod -aG sudo nomutilisateur</pre>
    <h3>Supprimer un utilisateur</h3>
    <pre>deluser --remove-home nomutilisateur</pre>
    <h3>Lister les utilisateurs</h3>
    <pre>cat /etc/passwd
getent passwd</pre>
    <h3>Changer de groupe</h3>
    <pre>usermod -aG docker,sudo nomutilisateur
groups nomutilisateur</pre>`,

  /* ════════════════════════════════════════
     RÉSEAU
  ════════════════════════════════════════ */
  "Configuration réseau Debian": `<h2>Configuration réseau Debian</h2><p><strong>Catégorie :</strong> Réseau</p><hr>
    <h3>Voir les interfaces disponibles</h3>
    <pre>ip a
ip link show</pre>
    <h3>IP statique (/etc/network/interfaces)</h3>
    <pre>auto eth0
iface eth0 inet static
  address 192.168.1.10
  netmask 255.255.255.0
  gateway 192.168.1.1
  dns-nameservers 8.8.8.8 1.1.1.1</pre>
    <h3>Redémarrer le réseau</h3>
    <pre>systemctl restart networking
ifdown eth0 && ifup eth0</pre>
    <h3>Vérification</h3>
    <pre>ip a
ping -c 4 8.8.8.8
ping -c 4 google.com</pre>`,

  "Commandes réseau utiles": `<h2>Commandes réseau utiles</h2><p><strong>Catégorie :</strong> Réseau</p><hr>
    <h3>Afficher la configuration réseau</h3>
    <pre>ip a               # Adresses IP
ip route show      # Table de routage
ip neigh           # Table ARP</pre>
    <h3>Diagnostics</h3>
    <pre>ping -c 4 8.8.8.8
traceroute 8.8.8.8
nslookup google.com
dig google.com</pre>
    <h3>Ports ouverts</h3>
    <pre>ss -tuln           # Ports en écoute
ss -tunp           # Avec processus
netstat -tulnp     # Alternative
nmap -sV 192.168.1.0/24  # Scanner un réseau</pre>
    <h3>Test de bande passante</h3>
    <pre>apt install iperf3 -y
# Serveur : iperf3 -s
# Client  : iperf3 -c IP_SERVEUR</pre>
    <h3>Capture de paquets</h3>
    <pre>tcpdump -i eth0 -n
tcpdump -i eth0 port 80</pre>`,

  /* ════════════════════════════════════════
     DOCKER
  ════════════════════════════════════════ */
  "Docker — bases et commandes": `<h2>Docker — bases et commandes</h2><p><strong>Catégorie :</strong> Docker</p><hr>
    <h3>Installation Docker sur Debian/Ubuntu</h3>
    <pre>apt update
apt install ca-certificates curl gnupg -y
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list
apt update
apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y
systemctl enable docker && systemctl start docker
usermod -aG docker $USER</pre>
    <h3>Commandes essentielles</h3>
    <pre>docker ps                    # Containers actifs
docker ps -a                 # Tous les containers
docker images                # Images locales
docker pull nginx:latest     # Télécharger une image
docker run -d -p 80:80 --name monsite nginx   # Lancer
docker stop monsite          # Arrêter
docker start monsite         # Démarrer
docker rm monsite            # Supprimer le container
docker rmi nginx             # Supprimer l'image
docker logs monsite          # Voir les logs
docker exec -it monsite bash # Shell dans le container</pre>
    <h3>Docker Compose</h3>
    <pre>docker compose up -d         # Lancer en arrière-plan
docker compose down          # Arrêter et supprimer
docker compose ps            # État des services
docker compose logs -f       # Suivre les logs
docker compose pull          # Mettre à jour les images</pre>
    <h3>Volumes et réseau</h3>
    <pre>docker volume ls             # Lister les volumes
docker volume create monvol  # Créer un volume
docker network ls            # Lister les réseaux
docker network create monreseau  # Créer un réseau</pre>`,

  "Docker WordPress + MySQL — Docker Compose": `<h2>Docker WordPress + MySQL — Docker Compose</h2><p><strong>Catégorie :</strong> Docker</p><hr>
    <h3>Architecture</h3>
    <p>Deux containers séparés dans deux dossiers distincts, interconnectés via un réseau Docker <strong>external</strong> partagé nommé <code>wp_network</code>.</p>
    <pre>projet/
├── mysql/
│   └── docker-compose.yml
└── wordpress/
    └── docker-compose.yml</pre>
    <h3>Étape 1 — Créer le réseau partagé</h3>
    <pre>docker network create wp_network</pre>
    <h3>Étape 2 — docker-compose.yml MySQL</h3>
    <pre>services:
  mysql:
    image: mysql:8.0
    container_name: mysql_wp
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wpuser
      MYSQL_PASSWORD: wppassword
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - wp_network

volumes:
  mysql_data:

networks:
  wp_network:
    external: true</pre>
    <h3>Étape 3 — docker-compose.yml WordPress</h3>
    <pre>services:
  wordpress:
    image: wordpress:latest
    container_name: wordpress_app
    restart: always
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: mysql_wp:3306
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_DB_USER: wpuser
      WORDPRESS_DB_PASSWORD: wppassword
    volumes:
      - wordpress_data:/var/www/html
    depends_on:
      - mysql
    networks:
      - wp_network

volumes:
  wordpress_data:

networks:
  wp_network:
    external: true</pre>
    <h3>Étape 4 — Démarrage</h3>
    <pre># 1. D'abord MySQL :
cd mysql/
docker compose up -d

# 2. Ensuite WordPress :
cd ../wordpress/
docker compose up -d

# 3. Vérifier :
docker ps</pre>
    <h3>Accès</h3>
    <pre>http://localhost:8080
# Suivre l'assistant d'installation WordPress
# Les credentials DB sont déjà configurés</pre>
    <h3>Arrêt</h3>
    <pre>cd wordpress/ && docker compose down
cd mysql/    && docker compose down</pre>`,

  "Apache2 + Docker Compose + SSH GitHub": `<h2>Apache2 + Docker Compose + Déploiement via GitHub SSH</h2><p><strong>Catégorie :</strong> Services / Docker</p><hr>
    <h3>Architecture</h3>
    <p>Apache2 dans un container Docker, le site web est cloné depuis GitHub via SSH et monté comme volume.</p>
    <h3>Étape 1 — Générer une clé SSH sur la VM pour GitHub</h3>
    <pre>ssh-keygen -t ed25519 -C "deploy@monserveur"
# Clé générée dans ~/.ssh/id_ed25519.pub
cat ~/.ssh/id_ed25519.pub
# Copier cette clé publique</pre>
    <h3>Étape 2 — Ajouter la clé dans GitHub</h3>
    <ol>
      <li>GitHub → Settings → SSH and GPG keys → New SSH key</li>
      <li>Coller la clé publique</li>
      <li>Tester : <code>ssh -T git@github.com</code></li>
    </ol>
    <h3>Étape 3 — Cloner le dépôt sur la VM</h3>
    <pre>cd /opt
git clone git@github.com:VotreUser/votre-repo.git monsite
ls /opt/monsite</pre>
    <h3>Étape 4 — docker-compose.yml Apache2</h3>
    <pre>services:
  apache:
    image: httpd:2.4
    container_name: apache_site
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /opt/monsite:/usr/local/apache2/htdocs/
      - ./httpd.conf:/usr/local/apache2/conf/httpd.conf
    environment:
      - TZ=Europe/Paris</pre>
    <h3>Étape 5 — Démarrer Apache2</h3>
    <pre>docker compose up -d
docker logs apache_site</pre>
    <h3>Étape 6 — Déployer les mises à jour</h3>
    <pre># Sur la VM, dans le dossier du site :
cd /opt/monsite
git pull origin main
# Apache sert automatiquement les nouveaux fichiers (volume monté)</pre>
    <h3>Commandes Git utiles pour le déploiement</h3>
    <pre>git status              # État des fichiers
git pull origin main    # Récupérer les MAJ
git log --oneline -5    # Derniers commits
git diff                # Voir les changements</pre>`,

  /* ════════════════════════════════════════
     BASE DE DONNÉES
  ════════════════════════════════════════ */
  "Installation MySQL": `<h2>Installation MySQL</h2><p><strong>Catégorie :</strong> Base de données</p><hr>
    <h3>Installation</h3>
    <pre>apt install mysql-server -y
systemctl enable mysql
systemctl start mysql
mysql_secure_installation</pre>
    <h3>Connexion root</h3>
    <pre>mysql -u root -p</pre>
    <h3>Commandes SQL essentielles</h3>
    <pre>SHOW DATABASES;
CREATE DATABASE mabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mabase;
SHOW TABLES;
DESCRIBE matable;</pre>
    <h3>Gestion des utilisateurs</h3>
    <pre>CREATE USER 'monuser'@'localhost' IDENTIFIED BY 'motdepasse';
GRANT ALL PRIVILEGES ON mabase.* TO 'monuser'@'localhost';
GRANT SELECT, INSERT ON mabase.* TO 'lecteur'@'localhost';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'monuser'@'localhost';</pre>
    <h3>Import / Export</h3>
    <pre>mysqldump -u root -p mabase > sauvegarde.sql
mysql -u root -p mabase < sauvegarde.sql</pre>`,

  /* ════════════════════════════════════════
     SERVICES WEB
  ════════════════════════════════════════ */
  "Installation Apache2": `<h2>Installation Apache2</h2><p><strong>Catégorie :</strong> Services</p><hr>
    <h3>Installation</h3>
    <pre>apt install apache2 -y
systemctl enable apache2
systemctl start apache2</pre>
    <h3>Structure des dossiers</h3>
    <pre>/etc/apache2/          → configuration principale
/etc/apache2/sites-available/  → sites disponibles
/etc/apache2/sites-enabled/    → sites actifs
/var/www/html/         → racine web par défaut</pre>
    <h3>Créer un VirtualHost</h3>
    <pre>nano /etc/apache2/sites-available/monsite.conf</pre>
    <pre>&lt;VirtualHost *:80&gt;
    ServerName monsite.local
    ServerAdmin admin@monsite.local
    DocumentRoot /var/www/monsite
    ErrorLog \${APACHE_LOG_DIR}/monsite_error.log
    CustomLog \${APACHE_LOG_DIR}/monsite_access.log combined
    &lt;Directory /var/www/monsite&gt;
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    &lt;/Directory&gt;
&lt;/VirtualHost&gt;</pre>
    <h3>Activer le site</h3>
    <pre>mkdir -p /var/www/monsite
a2ensite monsite.conf
a2dissite 000-default.conf
systemctl reload apache2</pre>
    <h3>Modules utiles</h3>
    <pre>a2enmod rewrite    # URL rewriting
a2enmod ssl        # HTTPS
a2enmod headers    # Headers HTTP
systemctl restart apache2</pre>`,

  /* ════════════════════════════════════════
     OUTILS
  ════════════════════════════════════════ */
  "Git — commandes essentielles": `<h2>Git — commandes essentielles</h2><p><strong>Catégorie :</strong> Outils</p><hr>
    <h3>Configuration initiale</h3>
    <pre>git config --global user.name "Prénom Nom"
git config --global user.email "email@exemple.com"
git config --global init.defaultBranch main</pre>
    <h3>Initialiser un dépôt</h3>
    <pre>git init
git remote add origin git@github.com:user/repo.git</pre>
    <h3>Workflow quotidien</h3>
    <pre>git status           # État du dépôt
git add .            # Ajouter tous les fichiers
git add fichier.txt  # Ajouter un fichier
git commit -m "Description du commit"
git push origin main</pre>
    <h3>Récupérer les modifications</h3>
    <pre>git pull origin main
git fetch origin
git merge origin/main</pre>
    <h3>Branches</h3>
    <pre>git branch                    # Lister les branches
git branch ma-branche         # Créer une branche
git checkout ma-branche        # Changer de branche
git checkout -b nouvelle      # Créer + basculer
git merge ma-branche          # Fusionner
git branch -d ma-branche      # Supprimer</pre>
    <h3>Clé SSH pour GitHub</h3>
    <pre>ssh-keygen -t ed25519 -C "email@exemple.com"
cat ~/.ssh/id_ed25519.pub     # Copier dans GitHub
ssh -T git@github.com         # Tester la connexion</pre>`,

  "VirtualBox — créer une VM": `<h2>VirtualBox — créer une VM</h2><p><strong>Catégorie :</strong> Outils</p><hr>
    <h3>Création</h3>
    <ol><li>Nouveau → Nom et OS → Linux / Debian 64-bit</li><li>RAM : 2048 Mo minimum</li><li>Disque dur : VDI, dynamique, 20 Go</li></ol>
    <h3>Configuration réseau</h3>
    <ul><li><strong>NAT</strong> : Internet depuis la VM (accès internet uniquement)</li><li><strong>Réseau interne</strong> : communication entre VMs</li><li><strong>Pont (Bridged)</strong> : VM sur le réseau local physique</li><li><strong>Hôte uniquement</strong> : VM ↔ hôte uniquement</li></ul>
    <h3>Raccourcis VirtualBox</h3>
    <pre>Ctrl Droit + F   → Plein écran
Ctrl Droit + S   → Snapshot
Ctrl Droit + Del → Ctrl+Alt+Suppr
Ctrl Droit + R   → Redémarrer</pre>`
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

  const sections = [
    { label: 'Contexte',                key: 'context'     },
    { label: 'Objectifs',               key: 'objectifs'   },
    { label: 'Réalisation du projet',   key: 'etapes'      },
    { label: 'Difficultés rencontrées', key: 'difficultes' },
    { label: 'Résultat',                key: 'resultat', full: true }
  ];

  const sectionsHTML = sections.map(s => `
    <div class="popup__section ${s.full ? 'popup__section--full' : ''}">
      <div class="popup__section-label">${s.label}</div>
      <p>${p[s.key] || '—'}</p>
    </div>
  `).join('');

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
  procBody.innerHTML = content || `<p>Procédure introuvable pour : "${titre}".</p>`;
  overlayProc.classList.add('is-visible');
  popupProc.classList.add('is-open');
}

function closeProc() {
  overlayProc.classList.remove('is-visible');
  popupProc.classList.remove('is-open');
}

if (ppClose)     ppClose.addEventListener('click', closeProject);
if (overlay)     overlay.addEventListener('click', closeProject);
if (procClose)   procClose.addEventListener('click', closeProc);
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

  /* ── CARROUSEL (index) ── */
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
      const p = projects.find(x => x.id === card.dataset.id);
      if (!p) return;
      card.addEventListener('click', () => openProject(p));
      card.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();openProject(p);} });
    });

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let raf = null;
      const tick = () => {
        featuredTrack.scrollLeft += 0.4;
        if (featuredTrack.scrollLeft >= featuredTrack.scrollWidth - featuredTrack.clientWidth)
          featuredTrack.scrollLeft = 0;
        raf = requestAnimationFrame(tick);
      };
      const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
      const stop  = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
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
            Voir le projet
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
