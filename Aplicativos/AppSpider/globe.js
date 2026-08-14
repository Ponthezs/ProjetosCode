/* ==========================================================================
   SPIDER-COMM HUD // CLEAN RETRO PIXEL DOT-GRID EARTH RADAR (ORIGINAL STYLE)
   ========================================================================== */

class SpideyGlobeEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Engine state
    this.width = 0;
    this.height = 0;
    this.rotX = 0.35; // Tilt angle (rad)
    this.rotY = 1.1;  // Longitude spin angle (rad)
    this.autoSpinSpeed = 0.005;
    this.isAutoSpinning = true;
    this.mapMode = 'GLOBE_3D'; // GLOBE_3D, TERRAIN, NIGHT_SCAN, WIREFRAME

    // Dragging controls
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Multiverse Sighting Markers
    this.markers = [
      {
        id: 'nyc-peter',
        name: 'Spider-Man (Peter Parker)',
        dimension: 'EARTH-616',
        city: 'NEW YORK',
        lat: 40.7128,
        lon: -74.0060,
        threat: 'HIGH',
        detail: 'Fighting Green Goblin near Oscorp Tower!',
        suit: 'Classic Red & Blue'
      },
      {
        id: 'bk-miles',
        name: 'Spider-Man (Miles Morales)',
        dimension: 'EARTH-1610',
        city: 'BROOKLYN',
        lat: 40.6782,
        lon: -73.9442,
        threat: 'MEDIUM',
        detail: 'Stopping a heist with Venom Blast electricity!',
        suit: 'Upgraded Miles Suit'
      },
      {
        id: 'gwen-chelsea',
        name: 'Ghost-Spider (Gwen Stacy)',
        dimension: 'EARTH-65',
        city: 'CHELSEA',
        lat: 40.7465,
        lon: -74.0014,
        threat: 'CRITICAL',
        detail: 'Infiltrating Alchemax labs on high alert.',
        suit: 'Spider-Gwen Hood'
      },
      {
        id: 'miguel-2099',
        name: "Spider-Man 2099 (Miguel O'Hara)",
        dimension: 'EARTH-928',
        city: 'NUEVA YORK',
        lat: 19.4326,
        lon: -99.1332,
        threat: 'OMEGA',
        detail: 'Tracking Multiverse anomalies with plasma cape.',
        suit: '2099 Nano-Suit'
      },
      {
        id: 'london-punk',
        name: 'Spider-Punk (Hobie Brown)',
        dimension: 'EARTH-138',
        city: 'LONDON',
        lat: 51.5074,
        lon: -0.1278,
        threat: 'MODERATE',
        detail: 'Shredding an electric guitar concussive blast!',
        suit: 'Spiked Vest & Boots'
      },
      {
        id: 'tokyo-peni',
        name: 'Peni Parker & SP//dr',
        dimension: 'EARTH-14512',
        city: 'TOKYO',
        lat: 35.6762,
        lon: 139.6503,
        threat: 'HIGH',
        detail: 'Deploying SP//dr Mech suit against Kaiju bio-slimes.',
        suit: 'SP//dr Mech Interface'
      }
    ];

    this.activeMarkerIndex = 0;
    this.landPoints = [];

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.generateCleanDotEarth();
    this.setupInteractivity();
    this.renderLoop();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  // Precise Land Check for Dot-Grid Generation
  isLand(lat, lon) {
    // North America & Greenland
    if (lat >= 58 && lat <= 72 && lon >= -170 && lon <= -130) return true; // Alaska
    if (lat >= 48 && lat <= 78 && lon >= -140 && lon <= -55 && !(lat < 52 && lon > -80 && lon < -60)) return true; // Canada
    if (lat >= 25 && lat <= 49 && lon >= -125 && lon <= -67) {
      if (lon < -120 && lat > 45) return true;
      if (lon > -82 && lat < 29) return false;
      return true; // USA
    }
    if (lat >= 15 && lat <= 32 && lon >= -117 && lon <= -86 && (lat > (lon + 130) * 0.6 + 10)) return true; // Mexico
    if (lat >= 7 && lat <= 17 && lon >= -92 && lon <= -77) return true; // Central America
    if (lat >= 60 && lat <= 83 && lon >= -73 && lon <= -12) return true; // Greenland
    if (lat >= 18 && lat <= 24 && lon >= -85 && lon <= -65) return true; // Caribbean

    // South America
    if (lat >= -56 && lat <= 13 && lon >= -82 && lon <= -34) {
      if (lat > 0 && lon < -76) return false;
      if (lat < -42 && lon > -62) return false;
      if (lat < -15 && lon < -75) return false;
      return true;
    }

    // Europe
    if (lat >= 50 && lat <= 59 && lon >= -10 && lon <= 2) return true; // UK & Ireland
    if (lat >= 55 && lat <= 71 && lon >= 5 && lon <= 32) return true; // Scandinavia
    if (lat >= 36 && lat <= 55 && lon >= -10 && lon <= 25) {
      if (lat < 42 && lon > 1 && lon < 12) return false;
      return true; // Western Europe
    }
    if (lat >= 42 && lat <= 66 && lon >= 25 && lon <= 45) return true; // Eastern Europe
    if (lat >= 63 && lat <= 67 && lon >= -25 && lon <= -13) return true; // Iceland

    // Africa
    if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 51) {
      if (lat > 18 && lon < -16) return false;
      if (lat > 12 && lon > 43 && lat < 30) return false;
      if (lat < -10 && lon < 11) return false;
      return true;
    }
    if (lat >= -26 && lat <= -12 && lon >= 43 && lon <= 51) return true; // Madagascar

    // Asia & Middle East
    if (lat >= 12 && lat <= 32 && lon >= 34 && lon <= 60) return true; // Arabia
    if (lat >= 8 && lat <= 36 && lon >= 68 && lon <= 90) return true; // India
    if (lat >= 18 && lat <= 55 && lon >= 75 && lon <= 135) return true; // China & East Asia
    if (lat >= 50 && lat <= 78 && lon >= 30 && lon <= 180) return true; // Russia & Siberia
    if (lat >= 30 && lat <= 46 && lon >= 129 && lon <= 146) return true; // Japan
    if (lat >= 8 && lat <= 24 && lon >= 95 && lon <= 109) return true; // Indochina
    if (lat >= -10 && lat <= 7 && lon >= 95 && lon <= 141) return true; // Indonesia
    if (lat >= 5 && lat <= 19 && lon >= 117 && lon <= 127) return true; // Philippines

    // Oceania
    if (lat >= -44 && lat <= -10 && lon >= 112 && lon <= 154) return true; // Australia
    if (lat >= -47 && lat <= -34 && lon >= 165 && lon <= 179) return true; // New Zealand
    if (lat >= -11 && lat <= -1 && lon >= 130 && lon <= 152) return true; // PNG

    // Antarctica
    if (lat <= -64) return true;

    return false;
  }

  // Generate neat, evenly-spaced pixel land points
  generateCleanDotEarth() {
    this.landPoints = [];
    const latStep = 2.5;
    const lonStep = 3.0;

    for (let lat = -88; lat <= 88; lat += latStep) {
      for (let lon = -180; lon < 180; lon += lonStep) {
        if (this.isLand(lat, lon)) {
          this.landPoints.push({ lat, lon });
        }
      }
    }
  }

  setupInteractivity() {
    const c = this.canvas;

    c.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.isAutoSpinning = false;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;

      this.rotY += dx * 0.008;
      this.rotX += dy * 0.008;
      this.rotX = Math.max(-1.3, Math.min(1.3, this.rotX));

      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    // Touch support
    c.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        this.isAutoSpinning = false;
      }
    });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;

      this.rotY += dx * 0.008;
      this.rotX += dy * 0.008;
      this.rotX = Math.max(-1.3, Math.min(1.3, this.rotX));

      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    });

    // Pin Click Detection
    c.addEventListener('click', (e) => {
      const rect = c.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const radius = Math.min(this.width, this.height) * 0.38;
      const cx = this.width / 2;
      const cy = this.height / 2;

      this.markers.forEach((m, idx) => {
        const p3d = this.latLonTo3D(m.lat, m.lon, radius);
        if (p3d.z > 0) {
          const dist = Math.hypot(clickX - (cx + p3d.x), clickY - (cy + p3d.y));
          if (dist < 22) {
            this.activeMarkerIndex = idx;
            if (window.spideyApp) {
              window.spideyApp.selectMarker(idx);
            }
            if (window.spideyAudio) {
              window.spideyAudio.playRadarPing();
            }
          }
        }
      });
    });
  }

  latLonTo3D(lat, lon, sphereRadius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    let x = -(sphereRadius * Math.sin(phi) * Math.cos(theta));
    let z = (sphereRadius * Math.sin(phi) * Math.sin(theta));
    let y = (sphereRadius * Math.cos(phi));

    // Rotate Y (Spin)
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotate X (Tilt)
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const y2 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    return { x: x1, y: y2, z: z2 };
  }

  centerOnMarker(index) {
    if (index < 0 || index >= this.markers.length) return;
    this.activeMarkerIndex = index;
    const m = this.markers[index];

    const targetRotY = -((m.lon + 180) * (Math.PI / 180)) - Math.PI / 2;
    const targetRotX = (m.lat) * (Math.PI / 180);

    this.rotY = targetRotY;
    this.rotX = targetRotX;
    this.isAutoSpinning = false;
  }

  renderLoop() {
    if (this.isAutoSpinning && !this.isDragging) {
      this.rotY += this.autoSpinSpeed;
    }

    this.draw();
    requestAnimationFrame(() => this.renderLoop());
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const R = Math.min(this.width, this.height) * 0.38;

    // 1. Deep Space Navy Background
    ctx.fillStyle = '#040d21';
    ctx.fillRect(0, 0, this.width, this.height);

    // Stars
    ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % this.width;
      const sy = (i * 53) % this.height;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // 2. Cyan Ocean Sphere Base (Uncolored / Clean Radar Background)
    ctx.beginPath();
    ctx.arc(cx, cy, R + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.1)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    if (this.mapMode === 'NIGHT_SCAN') {
      ctx.fillStyle = '#002611';
    } else {
      ctx.fillStyle = '#0a2e5c'; // Clean Navy Ocean
    }
    ctx.fill();

    ctx.lineWidth = 3;
    ctx.strokeStyle = this.mapMode === 'NIGHT_SCAN' ? '#00ff66' : '#00e5ff';
    ctx.stroke();

    // 3. Draw Dotted Lat/Lon Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.mapMode === 'NIGHT_SCAN' ? 'rgba(0, 255, 102, 0.25)' : 'rgba(0, 229, 255, 0.25)';
    ctx.setLineDash([3, 4]);

    for (let lon = -180; lon < 180; lon += 45) {
      ctx.beginPath();
      let first = true;
      for (let lat = -90; lat <= 90; lat += 10) {
        const p = this.latLonTo3D(lat, lon, R);
        if (p.z > 0) {
          if (first) { ctx.moveTo(cx + p.x, cy + p.y); first = false; }
          else { ctx.lineTo(cx + p.x, cy + p.y); }
        }
      }
      ctx.stroke();
    }

    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 180; lon += 15) {
        const p = this.latLonTo3D(lat, lon, R);
        if (p.z > 0) {
          if (first) { ctx.moveTo(cx + p.x, cy + p.y); first = false; }
          else { ctx.lineTo(cx + p.x, cy + p.y); }
        }
      }
      ctx.stroke();
    }

    ctx.setLineDash([]); // Reset line dash

    // 4. Draw Clean Pixel Dot Landmasses (Neat & Drawn, No Heavy Color Fills!)
    this.landPoints.forEach(pt => {
      const p = this.latLonTo3D(pt.lat, pt.lon, R);
      if (p.z > 0) { // Front hemisphere
        const px = cx + p.x;
        const py = cy + p.y;

        // Clean Radar Dot Color
        const dotColor = (this.mapMode === 'NIGHT_SCAN') ? '#00ff66' : '#00e66b';
        ctx.fillStyle = dotColor;

        // Depth-scaled crisp pixel square
        const size = Math.max(2, Math.floor(3 * (p.z / R)));
        ctx.fillRect(px, py, size, size);
      }
    });

    // 5. Draw Red Spider Pin Target Marker (Matching Reference Image)
    const time = Date.now() * 0.005;
    this.markers.forEach((m, idx) => {
      const p = this.latLonTo3D(m.lat, m.lon, R);
      if (p.z > 0) {
        const px = cx + p.x;
        const py = cy + p.y;
        const isActive = (idx === this.activeMarkerIndex);

        if (isActive) {
          // Red Pulsing Target Ring
          ctx.beginPath();
          const pulse = 12 + Math.sin(time * 4) * 4;
          ctx.arc(px, py, pulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 42, 75, 0.4)';
          ctx.fill();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#ff2a4b';
          ctx.stroke();

          // Red Center Badge
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#ff2a4b';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#000000';
          ctx.stroke();

          // Spider legs / icon
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(px - 6, py - 3); ctx.lineTo(px + 6, py + 3);
          ctx.moveTo(px - 6, py + 3); ctx.lineTo(px + 6, py - 3);
          ctx.moveTo(px - 7, py);     ctx.lineTo(px + 7, py);
          ctx.stroke();

          // City Label Tag
          ctx.font = '8px "Press Start 2P"';
          ctx.fillStyle = '#ff2a4b';
          ctx.fillText(`🕷️ ${m.city}`, px + 14, py + 3);
        } else {
          // Inactive Pin
          ctx.beginPath();
          ctx.arc(px, py, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffcc00';
          ctx.fill();
          ctx.strokeStyle = '#000';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    });
  }
}

let spideyGlobe = null;
