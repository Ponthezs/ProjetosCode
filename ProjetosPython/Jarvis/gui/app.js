// J.A.R.V.I.S FUTURISTIC HUD FRONTEND LOGIC

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const liveTimeEl = document.getElementById('live-time');
    const liveDateEl = document.getElementById('live-date');
    const welcomeTimeEl = document.getElementById('welcome-time');
    
    const cpuValEl = document.getElementById('cpu-val');
    const cpuBarEl = document.getElementById('cpu-bar');
    const cpuNumEl = document.getElementById('cpu-num');
    
    const ramValEl = document.getElementById('ram-val');
    const ramBarEl = document.getElementById('ram-bar');
    const ramNumEl = document.getElementById('ram-num');
    
    const diskNumEl = document.getElementById('disk-num');
    
    const uptimeClockEl = document.getElementById('uptime-clock');
    const uptimeMiniEl = document.getElementById('uptime-mini');
    const cmdCountEl = document.getElementById('cmd-count');
    
    const voiceOrbEl = document.getElementById('voice-orb');
    const voiceStatusTextEl = document.getElementById('voice-status-text');
    
    const chatMessagesEl = document.getElementById('chat-messages');
    const chatInputEl = document.getElementById('chat-input');
    const btnSendEl = document.getElementById('btn-send');
    const btnClearChatEl = document.getElementById('btn-clear-chat');
    
    const btnToggleCam = document.getElementById('btn-toggle-cam');
    const ctrlCam = document.getElementById('ctrl-cam');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const cameraStream = document.getElementById('camera-stream');
    const gestureStatusBar = document.getElementById('gesture-status-bar');
    const gestureBadge = document.getElementById('gesture-badge');

    // Profile & Modal Elements
    const profilePillEl = document.getElementById('profile-pill');
    const profileNameEl = document.getElementById('profile-name');
    const btnSettingsEl = document.getElementById('btn-settings');
    const settingsModalEl = document.getElementById('settings-modal');
    const btnCloseModalEl = document.getElementById('btn-close-modal');
    const btnCancelSettingsEl = document.getElementById('btn-cancel-settings');
    const btnSaveSettingsEl = document.getElementById('btn-save-settings');

    const settingCityEl = document.getElementById('setting-city');
    const settingProfileEl = document.getElementById('setting-profile');
    const settingVoiceEl = document.getElementById('setting-voice');
    const settingSmoothingEl = document.getElementById('setting-smoothing');
    const smoothingValLabelEl = document.getElementById('smoothing-val-label');

    let commandCounter = 0;
    let cameraActive = false;
    const profiles = ["Geral", "Trabalho", "Jogos"];
    let currentProfileIdx = 0;

    // Clock and Date Update Loop
    function updateClock() {
        const now = new Date();
        
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedHours = String(hours).padStart(2, '0');

        liveTimeEl.textContent = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
        
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        liveDateEl.textContent = now.toLocaleDateString('pt-BR', options);

        if (welcomeTimeEl && welcomeTimeEl.textContent === '00:00') {
            welcomeTimeEl.textContent = `${formattedHours}:${minutes} ${ampm}`;
        }
    }

    setInterval(updateClock, 1000);
    updateClock();

    // Add Message to Chat Log with Avatars
    window.addMessage = function(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender === 'user' ? 'user-msg' : 'jarvis-msg'}`;
        
        const now = new Date();
        const hours = String(now.getHours() % 12 || 12).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
        const timeStr = `${hours}:${minutes} ${ampm}`;

        const avatarIcon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
        const senderName = sender === 'user' ? 'VOCÊ' : 'J.A.R.V.I.S';

        msgDiv.innerHTML = `
            <div class="msg-avatar">${avatarIcon}</div>
            <div class="msg-bubble-container">
                <div class="msg-sender">${senderName}</div>
                <div class="msg-content">${escapeHTML(text)}</div>
                <div class="msg-time">${timeStr}</div>
            </div>
        `;
        
        chatMessagesEl.appendChild(msgDiv);
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

        if (sender === 'user') {
            commandCounter++;
            cmdCountEl.textContent = commandCounter;
        }
    };

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Update System Stats
    window.updateSystemStats = function(data) {
        if (!data) return;
        
        if (data.cpu_percent !== undefined) {
            cpuValEl.textContent = `${Math.round(data.cpu_percent)}%`;
            cpuNumEl.textContent = `${Math.round(data.cpu_percent)}%`;
            cpuBarEl.style.width = `${data.cpu_percent}%`;
        }

        if (data.ram_used_gb !== undefined) {
            ramValEl.textContent = `${data.ram_used_gb} GB`;
            ramNumEl.textContent = `${Math.round(data.ram_percent)}%`;
            ramBarEl.style.width = `${data.ram_percent}%`;
        }

        if (data.disk_used_gb !== undefined) {
            diskNumEl.textContent = `${data.disk_used_gb}/${data.disk_total_gb} GB`;
        }

        if (data.uptime) {
            uptimeClockEl.textContent = data.uptime;
            uptimeMiniEl.textContent = data.uptime;
        }
    };

    // Update Weather Widget
    window.updateWeather = function(data) {
        if (!data) return;
        if (data.temp) {
            document.getElementById('weather-temp').textContent = data.temp;
            document.getElementById('top-temp').textContent = data.temp;
        }
        if (data.city) {
            document.getElementById('weather-city').textContent = data.city;
            document.getElementById('top-city').textContent = data.city;
        }
        if (data.desc) document.getElementById('weather-desc').textContent = data.desc;
        if (data.humidity) document.getElementById('weather-humidity').textContent = data.humidity;
        if (data.wind) document.getElementById('weather-wind').textContent = data.wind;
        if (data.feels_like) document.getElementById('weather-feels').textContent = data.feels_like;
    };

    // Voice State Animation
    window.setVoiceState = function(state, text) {
        voiceOrbEl.classList.remove('listening', 'speaking');
        
        if (state === 'listening') {
            voiceOrbEl.classList.add('listening');
            voiceStatusTextEl.textContent = text || 'Escutando comandos...';
        } else if (state === 'speaking') {
            voiceOrbEl.classList.add('speaking');
            voiceStatusTextEl.textContent = text || 'Falando...';
        } else if (state === 'processing') {
            voiceStatusTextEl.textContent = text || 'Processando...';
        } else {
            voiceStatusTextEl.textContent = text || 'Pronto...';
        }
    };

    // Update Gesture Status Badge
    window.updateGestureStatus = function(gestureText) {
        if (gestureBadge && gestureText) {
            gestureBadge.textContent = gestureText;
        }
    };

    // Send Message Handler
    function handleSendMessage(customText) {
        const text = (customText || chatInputEl.value).trim();
        if (!text) return;
        
        window.addMessage('user', text);
        if (!customText) chatInputEl.value = '';

        if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.process_user_message(text);
        }
    }

    btnSendEl.addEventListener('click', () => handleSendMessage());
    chatInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    btnClearChatEl.addEventListener('click', () => {
        chatMessagesEl.innerHTML = '';
    });

    // Quick Command Pills Event Listener
    document.querySelectorAll('.cmd-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const cmd = pill.getAttribute('data-cmd');
            if (cmd) handleSendMessage(cmd);
        });
    });

    // Profile Switcher Pill
    profilePillEl.addEventListener('click', () => {
        currentProfileIdx = (currentProfileIdx + 1) % profiles.length;
        const newProfile = profiles[currentProfileIdx];
        profileNameEl.textContent = newProfile;

        if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.set_profile(newProfile);
        }
        window.addMessage('jarvis', `Perfil alterado para: ${newProfile}`);
    });

    // Settings Modal Open / Close
    btnSettingsEl.addEventListener('click', () => {
        settingsModalEl.classList.remove('hidden');
    });

    function closeModal() {
        settingsModalEl.classList.add('hidden');
    }

    btnCloseModalEl.addEventListener('click', closeModal);
    btnCancelSettingsEl.addEventListener('click', closeModal);

    settingSmoothingEl.addEventListener('input', (e) => {
        smoothingValLabelEl.textContent = `Nível ${e.target.value}`;
    });

    btnSaveSettingsEl.addEventListener('click', () => {
        const newCity = settingCityEl.value.trim() || "Maringá";
        const newProfile = settingProfileEl.value;
        const newVoice = settingVoiceEl.value;
        const newSmoothing = parseInt(settingSmoothingEl.value);

        profileNameEl.textContent = newProfile;
        
        if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.save_settings({
                city: newCity,
                profile: newProfile,
                voice: newVoice,
                smoothing: newSmoothing
            });
        }

        window.addMessage('jarvis', `Configurações salvas! Cidade: ${newCity}, Perfil: ${newProfile}`);
        closeModal();
    });

    // Camera & Gesture Toggle Handler
    function toggleCameraGestures() {
        cameraActive = !cameraActive;

        if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.toggle_gestures(cameraActive);
        }

        if (cameraActive) {
            cameraPlaceholder.classList.add('hidden');
            cameraStream.classList.remove('hidden');
            gestureStatusBar.classList.remove('hidden');
            btnToggleCam.style.color = "#00f0ff";
            ctrlCam.classList.add('active');
        } else {
            cameraPlaceholder.classList.remove('hidden');
            cameraStream.classList.add('hidden');
            gestureStatusBar.classList.add('hidden');
            btnToggleCam.style.color = "";
            ctrlCam.classList.remove('active');
        }
    }

    btnToggleCam.addEventListener('click', toggleCameraGestures);
    ctrlCam.addEventListener('click', toggleCameraGestures);

    document.getElementById('ctrl-keyboard').addEventListener('click', () => {
        chatInputEl.focus();
    });

    // Periodic Stat Polling
    setInterval(() => {
        if (window.pywebview && window.pywebview.api) {
            window.pywebview.api.get_system_stats().then(window.updateSystemStats);
            window.pywebview.api.get_gesture_status().then(window.updateGestureStatus);
        }
    }, 1000);
});
