/* ==========================================================================
   SPIDER-COMM HUD // APPLICATION CONTROLLER & SPRITE ENGINE
   ========================================================================== */

class SpideyAppController {
  constructor() {
    this.activeSpiderIndex = 0;
    this.spiders = [
      {
        id: 'peter',
        name: 'PETER PARKER',
        alias: 'Spider-Man',
        earth: 'EARTH-616',
        suit: 'Classic Red & Blue',
        power: '98 / 100',
        webs: 'Synthetic Web Fluid',
        tech: 'Spider-Tracer v4 & Web Wings',
        bio: 'Bitten by a radioactive spider, Peter Parker protects NYC with agility, wall-crawling, and spider-sense! With great power comes great responsibility.',
        primaryColor: '#ff2a4b',
        secondaryColor: '#0066cc',
        city: 'NEW YORK'
      },
      {
        id: 'miles',
        name: 'MILES MORALES',
        alias: 'Spider-Man (Brooklyn)',
        earth: 'EARTH-1610',
        suit: 'Black & Red Spray Suit',
        power: '99 / 100',
        webs: 'Electric Web Blast',
        tech: 'Venom Strike & Camouflage',
        bio: 'Hailing from Brooklyn, Miles possesses bio-electric Venom Blast and active camouflage cloaking abilities, forging his own Spidey legacy.',
        primaryColor: '#ff0033',
        secondaryColor: '#1a1a1a',
        city: 'BROOKLYN'
      },
      {
        id: 'gwen',
        name: 'GWEN STACY',
        alias: 'Ghost-Spider',
        earth: 'EARTH-65',
        suit: 'White Hood & Cyan Webbing',
        power: '95 / 100',
        webs: 'Multi-directional Silk',
        tech: 'Dimensional Watch',
        bio: 'Drummer for The Mary Janes and protector of Earth-65. Gwen uses acrobatic grace and dimensional web-slipping to stop crime.',
        primaryColor: '#ffffff',
        secondaryColor: '#00e5ff',
        city: 'CHELSEA'
      },
      {
        id: 'miguel',
        name: "MIGUEL O'HARA",
        alias: 'Spider-Man 2099',
        earth: 'EARTH-928',
        suit: 'Futuristic Nanotech Suit',
        power: '100 / 100',
        webs: 'Organic Plasma Webs',
        tech: 'Lyla AI & Accelerated Decoy',
        bio: 'Genetics leader of Nueva York 2099. Miguel commands claws, fang venom, plasma webs, and leads the Multiverse Spider-Society.',
        primaryColor: '#0055ff',
        secondaryColor: '#ff0044',
        city: 'NUEVA YORK'
      }
    ];

    this.villains = [
      {
        id: 'goblin',
        name: 'GREEN GOBLIN',
        real: 'Norman Osborn',
        threat: 'THREAT: OMEGA',
        desc: 'Genius Oscorp CEO transformed by Goblin Formula. Attacks on a jet glider with explosive Pumpkin Bombs.',
        lat: 40.7589,
        lon: -73.9851,
        color: '#00e65c'
      },
      {
        id: 'dockock',
        name: 'DOC OCK',
        real: 'Otto Octavius',
        threat: 'THREAT: HIGH',
        desc: 'Mastermind scientist wields 4 cybernetic titanium-steel tentacles with artificial intelligence.',
        lat: 40.7128,
        lon: -74.0060,
        color: '#ff9900'
      },
      {
        id: 'venom',
        name: 'VENOM',
        real: 'Eddie Brock',
        threat: 'THREAT: CRITICAL',
        desc: 'Alien Symbiote host with superhuman strength, immunity to Spider-Sense, and razor-sharp fangs.',
        lat: 40.6782,
        lon: -73.9442,
        color: '#ff0033'
      },
      {
        id: 'spot',
        name: 'THE SPOT',
        real: 'Dr. Jonathan Ohnn',
        threat: 'THREAT: MULTIVERSAL',
        desc: 'Alchemax scientist covered in interdimensional portal spots capable of travelling anywhere across space-time.',
        lat: 40.7465,
        lon: -74.0014,
        color: '#ffffff'
      }
    ];

    this.activeVillainIndex = 0;
    this.isCrtOn = true;

    this.init();
  }

  init() {
    // 1. Initialize Globe
    spideyGlobe = new SpideyGlobeEngine('globe-canvas');

    // 2. Start Clock Timer
    this.startClock();

    // 3. Render Pixel Sprites
    this.renderPodSprite();
    this.renderModalAvatar();
    this.renderVillainList();
    this.renderVillainCanvas();

    // 4. Setup Event Listeners
    this.bindEvents();

    // 5. Initial HUD update
    this.updateHudInfo();
  }

  startClock() {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      document.getElementById('timer-left').innerText = `${hrs}:${mins}`;
      document.getElementById('timer-right').innerText = `:${secs}`;
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  // Draw Pixel-Art Spidey in Dock
  renderPodSprite() {
    const canvas = document.getElementById('spidey-sprite-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const spider = this.spiders[this.activeSpiderIndex];

    // Canvas center
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 + 6;

    // Draw Pixel Body
    // Head
    ctx.fillStyle = spider.primaryColor;
    ctx.fillRect(cx - 10, cy - 30, 20, 18);
    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 7, cy - 24, 5, 5);
    ctx.fillRect(cx + 2, cy - 24, 5, 5);

    // Torso
    ctx.fillStyle = spider.primaryColor;
    ctx.fillRect(cx - 12, cy - 10, 24, 20);
    // Secondary Color / Chest Spider
    ctx.fillStyle = spider.secondaryColor;
    ctx.fillRect(cx - 6, cy - 10, 12, 20);
    ctx.fillStyle = '#000';
    ctx.fillRect(cx - 2, cy - 6, 4, 8); // Spider symbol

    // Legs
    ctx.fillStyle = spider.secondaryColor;
    ctx.fillRect(cx - 10, cy + 10, 8, 18);
    ctx.fillRect(cx + 2, cy + 10, 8, 18);
    // Boots
    ctx.fillStyle = spider.primaryColor;
    ctx.fillRect(cx - 10, cy + 22, 8, 6);
    ctx.fillRect(cx + 2, cy + 22, 8, 6);
  }

  // Draw Modal Avatar
  renderModalAvatar() {
    const canvas = document.getElementById('modal-spidey-avatar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const spider = this.spiders[this.activeSpiderIndex];

    // High detail pixel head portrait
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Head Base
    ctx.fillStyle = spider.primaryColor;
    ctx.fillRect(cx - 36, cy - 45, 72, 80);

    // Eyes Black Border
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 30, cy - 20, 26, 30);
    ctx.fillRect(cx + 4, cy - 20, 26, 30);

    // Eyes White Fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 26, cy - 16, 18, 22);
    ctx.fillRect(cx + 8, cy - 16, 18, 22);

    // Web Lines Detail
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(cx - 2, cy - 45, 4, 80);
    ctx.fillRect(cx - 36, cy - 5, 72, 4);
  }

  // Draw Villain Canvas
  renderVillainCanvas() {
    const canvas = document.getElementById('villain-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const v = this.villains[this.activeVillainIndex];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.fillStyle = v.color;
    ctx.fillRect(cx - 25, cy - 30, 50, 50);

    // Evil eyes
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(cx - 18, cy - 15, 12, 8);
    ctx.fillRect(cx + 6, cy - 15, 12, 8);

    // Mouth / Fangs
    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 15, cy + 8, 30, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 12, cy + 8, 4, 4);
    ctx.fillRect(cx + 8, cy + 8, 4, 4);
  }

  renderVillainList() {
    const container = document.getElementById('villain-list');
    if (!container) return;
    container.innerHTML = '';

    this.villains.forEach((v, idx) => {
      const item = document.createElement('div');
      item.className = `villain-item ${idx === this.activeVillainIndex ? 'active' : ''}`;
      item.innerHTML = `<span>⚠️</span> <span>${v.name}</span>`;
      item.addEventListener('click', () => {
        this.activeVillainIndex = idx;
        this.updateVillainDetail();
        spideyAudio.playClick();
      });
      container.appendChild(item);
    });
  }

  updateVillainDetail() {
    const v = this.villains[this.activeVillainIndex];
    document.getElementById('villain-name').innerText = v.name;
    document.getElementById('villain-real').innerText = `Real Name: ${v.real}`;
    document.getElementById('villain-threat').innerText = v.threat;
    document.getElementById('villain-desc').innerText = v.desc;
    this.renderVillainList();
    this.renderVillainCanvas();
  }

  // Update HUD elements
  updateHudInfo() {
    const spider = this.spiders[this.activeSpiderIndex];
    document.getElementById('pod-label').innerText = spider.name.split(' ')[0];
    document.getElementById('multiverse-hud').innerText = `DIMENSION: ${spider.earth}`;
    document.getElementById('banner-loc').innerText = `LOCATION: ${spider.city} (${spider.earth})`;

    this.renderPodSprite();
    this.renderModalAvatar();
  }

  selectMarker(index) {
    const marker = spideyGlobe.markers[index];
    document.getElementById('banner-loc').innerText = `SIGHTING: ${marker.city} (${marker.dimension})`;

    // Show Popover Tooltip
    const pop = document.getElementById('sighting-popover');
    pop.classList.remove('hidden');
    document.getElementById('popover-hero').innerText = marker.name;
    document.getElementById('popover-detail').innerText = marker.detail;
    document.getElementById('popover-threat').innerText = `THREAT: ${marker.threat}`;
    document.getElementById('popover-dim').innerText = marker.dimension;
    document.getElementById('coords-hud').innerText = `LAT: ${marker.lat.toFixed(4)} | LON: ${marker.lon.toFixed(4)}`;
  }

  bindEvents() {
    // 1. Profile Buttons
    document.getElementById('btn-prof1').addEventListener('click', () => {
      this.activeSpiderIndex = 0;
      this.updateHudInfo();
      this.openModal('modal-profile');
      spideyGlobe.centerOnMarker(0);
      spideyAudio.playClick();
    });

    document.getElementById('btn-prof2').addEventListener('click', () => {
      this.activeSpiderIndex = 1;
      this.updateHudInfo();
      this.openModal('modal-profile');
      spideyGlobe.centerOnMarker(1);
      spideyAudio.playClick();
    });

    document.getElementById('btn-prof3').addEventListener('click', () => {
      this.activeSpiderIndex = 2;
      this.updateHudInfo();
      this.openModal('modal-profile');
      spideyGlobe.centerOnMarker(2);
      spideyAudio.playClick();
    });

    document.getElementById('btn-next-spider').addEventListener('click', () => {
      this.activeSpiderIndex = (this.activeSpiderIndex + 1) % this.spiders.length;
      this.updateHudInfo();
      this.updateProfileModal();
      spideyAudio.playClick();
    });

    document.getElementById('spidey-pod-dock').addEventListener('click', () => {
      this.openModal('modal-profile');
      this.updateProfileModal();
      spideyAudio.playWebZip();
    });

    // 2. Alert Buttons
    document.getElementById('btn-a1').addEventListener('click', () => {
      spideyGlobe.mapMode = 'NIGHT_SCAN';
      document.getElementById('zoom-hud').innerText = 'MODE: THERMAL SCAN';
      spideyAudio.playAlarm();
    });

    document.getElementById('btn-a2').addEventListener('click', () => {
      spideyGlobe.mapMode = 'WIREFRAME';
      document.getElementById('zoom-hud').innerText = 'MODE: 3D WIREFRAME';
      spideyAudio.playAlarm();
    });

    // 3. Yellow Action Buttons
    document.getElementById('btn-terrain').addEventListener('click', () => {
      const modes = ['GLOBE_3D', 'TERRAIN', 'NIGHT_SCAN', 'WIREFRAME'];
      const curIdx = modes.indexOf(spideyGlobe.mapMode);
      spideyGlobe.mapMode = modes[(curIdx + 1) % modes.length];
      document.getElementById('zoom-hud').innerText = `MODE: ${spideyGlobe.mapMode}`;
      spideyAudio.playClick();
    });

    document.getElementById('btn-3dview').addEventListener('click', () => {
      spideyGlobe.isAutoSpinning = !spideyGlobe.isAutoSpinning;
      spideyAudio.playClick();
    });

    document.getElementById('btn-centerloc').addEventListener('click', () => {
      spideyGlobe.centerOnMarker(spideyGlobe.activeMarkerIndex);
      spideyAudio.playRadarPing();
    });

    document.getElementById('btn-chat').addEventListener('click', () => {
      this.openModal('modal-chat');
      spideyAudio.playClick();
    });

    document.getElementById('btn-archive').addEventListener('click', () => {
      this.openModal('modal-archive');
      this.updateVillainDetail();
      spideyAudio.playClick();
    });

    document.getElementById('btn-share').addEventListener('click', () => {
      const marker = spideyGlobe.markers[spideyGlobe.activeMarkerIndex];
      document.getElementById('share-report-text').innerText = 
`[SPIDEY-RADAR-REPORT]
Location: ${marker.city}, ${marker.dimension}
Hero: ${marker.name}
Threat Level: ${marker.threat}
Details: ${marker.detail}
Frequency: 98.4 MHz`;

      this.openModal('modal-share');
      spideyAudio.playClick();
    });

    // 4. Side Buttons (O, S, T)
    document.getElementById('btn-ost').addEventListener('click', () => {
      const playing = spideyAudio.toggleMusic();
      document.getElementById('btn-ost').classList.toggle('active', playing);
    });

    document.getElementById('btn-sfx').addEventListener('click', () => {
      spideyAudio.isMuted = !spideyAudio.isMuted;
      document.getElementById('btn-sfx').classList.toggle('active', spideyAudio.isMuted);
    });

    document.getElementById('btn-crt').addEventListener('click', () => {
      this.isCrtOn = !this.isCrtOn;
      document.getElementById('scanlines-overlay').style.display = this.isCrtOn ? 'block' : 'none';
      spideyAudio.playClick();
    });

    // Popover Close
    document.getElementById('popover-close').addEventListener('click', () => {
      document.getElementById('sighting-popover').classList.add('hidden');
    });

    document.getElementById('popover-dispatch-btn').addEventListener('click', () => {
      spideyAudio.playWebZip();
      alert('🕸️ SPIDER DISPATCHED TO LOCATION! Hold tight citizen!');
      document.getElementById('sighting-popover').classList.add('hidden');
    });

    // Top Spider Badge / Mask click
    document.getElementById('head-badge-btn').addEventListener('click', () => {
      spideyAudio.playAlarm();
    });

    document.getElementById('top-spider-btn').addEventListener('click', () => {
      spideyAudio.playWebZip();
      spideyGlobe.isAutoSpinning = !spideyGlobe.isAutoSpinning;
    });

    // Modal Close buttons
    ['profile', 'chat', 'archive', 'share'].forEach(name => {
      const closeBtn = document.getElementById(`${name}-modal-close`);
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeModal(`modal-${name}`);
          spideyAudio.playClick();
        });
      }
    });

    // Select Spider in dossier
    document.getElementById('btn-select-spider').addEventListener('click', () => {
      this.closeModal('modal-profile');
      spideyAudio.playWebZip();
    });

    // Track Villain in Radar
    document.getElementById('btn-track-villain').addEventListener('click', () => {
      const v = this.villains[this.activeVillainIndex];
      this.closeModal('modal-archive');
      spideyGlobe.rotY = -((v.lon + 180) * (Math.PI / 180)) - Math.PI / 2;
      spideyGlobe.rotX = (v.lat) * (Math.PI / 180);
      spideyGlobe.isAutoSpinning = false;
      document.getElementById('banner-loc').innerText = `VILLAIN TRACKED: ${v.name}`;
      spideyAudio.playAlarm();
    });

    // Chat functionality
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');

    const handleSend = () => {
      const text = chatInput.value.trim();
      if (!text) return;
      this.appendChat('user', text);
      chatInput.value = '';

      setTimeout(() => {
        this.processAiResponse(text);
      }, 500);
    };

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    // Quick Question Buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const query = e.target.getAttribute('data-query');
        chatInput.value = query;
        handleSend();
      });
    });

    // Copy Report
    document.getElementById('btn-copy-report').addEventListener('click', () => {
      const text = document.getElementById('share-report-text').innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert('📋 Relatório copiado para a área de transferência!');
      });
    });
  }

  updateProfileModal() {
    const s = this.spiders[this.activeSpiderIndex];
    document.getElementById('profile-name-tag').innerText = s.name;
    document.getElementById('profile-earth-tag').innerText = s.earth;
    document.getElementById('profile-alias').innerText = s.alias;
    document.getElementById('profile-suit').innerText = s.suit;
    document.getElementById('profile-power').innerText = s.power;
    document.getElementById('profile-webs').innerText = s.webs;
    document.getElementById('profile-tech').innerText = s.tech;
    document.getElementById('profile-bio').innerText = s.bio;

    this.renderModalAvatar();
  }

  openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  closeModal(id) {
    document.getElementById(id).classList.add('hidden');
  }

  appendChat(sender, msg) {
    const logs = document.getElementById('chat-logs');
    const div = document.createElement('div');
    div.className = `chat-msg ${sender}`;
    const label = sender === 'user' ? 'YOU:' : 'KAREN AI:';
    div.innerHTML = `<span class="chat-sender">${label}</span> ${msg}`;
    logs.appendChild(div);
    logs.scrollTop = logs.scrollHeight;
  }

  processAiResponse(query) {
    const q = query.toLowerCase();
    let reply = "Spider-Comm recebido! O radar está monitorando o Aranhaverso em tempo real.";

    if (q.includes('crime') || q.includes('ocorrendo') || q.includes('ativos')) {
      reply = "🚨 ALERTA: Green Goblin atacando a Oscorp Tower em NY (Earth-616) e Venom causando confusão no Brooklyn (Earth-1610)!";
    } else if (q.includes('miles')) {
      reply = "🕷️ Miles Morales é o Homem-Aranha da Earth-1610! Suas habilidades incluem Rajada Venom bio-elétrica e camuflagem invisível.";
    } else if (q.includes('vilao') || q.includes('perigoso') || q.includes('super')) {
      reply = "⚠️ O vilão mais perigoso detectado é O SPOT (Interdimensional) e GREEN GOBLIN (Threat Level: OMEGA).";
    } else if (q.includes('musica') || q.includes('som')) {
      const state = spideyAudio.toggleMusic();
      reply = state ? "🎵 Tocando o tema clássico do Homem-Aranha 8-bit!" : "🎵 Música pausada.";
    } else if (q.includes('oi') || q.includes('ola') || q.includes('aranha')) {
      reply = "🕸️ Olá parceiro! Com grandes poderes vêm grandes responsabilidades. Como posso ajudar no radar hoje?";
    }

    this.appendChat('system', reply);
    spideyAudio.playRadarPing();
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  window.spideyApp = new SpideyAppController();
});
