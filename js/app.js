// App Configuration
// App Configuration
const CONFIG = {
    unlockDate: new Date('2024-02-14T00:00:00'), // TARGET DATE
    debugMode: new URLSearchParams(window.location.search).has('debug'), // Auto-enable if ?debug in URL
    visitThreshold: 3 // Hours between visits to count as "Return"
};

// DOM Elements
const phases = {
    0: document.getElementById('phase-0'),
    1: document.getElementById('phase-1'),
    2: document.getElementById('phase-2'),
    3: document.getElementById('phase-3')
};
const audio = {
    thump: document.getElementById('audio-thump'),
    song: document.getElementById('audio-song')
};

// State
let state = {
    hasUnlocked: false,
    clickCount: 0,
    visitCount: 0
};

// --- INITIALIZATION ---
function init() {
    loadState();
    setupTheme();

    // Check Date Gate immediately
    // Check Date Gate immediately
    if (!CONFIG.debugMode && new Date() < CONFIG.unlockDate) {
        showPhase(1); // Locked

        // Setup Click Listener for Locked Messages
        document.getElementById('phase-1').addEventListener('click', updateLockedMessage);
        // Run once to set initial state
        updateLockedMessage();

        return;
    }

    // If unlocked and "Safe Mode" applies (seen before), skip to end?
    // User requested "Safe Mode" logic: if unlocked before, skip glitch.
    if (state.hasUnlocked) {
        const content = setupRevealContent('return');
        showPhase(3); // Jump to Reveal

        // Just show text immediately or ghost type fast?
        document.getElementById('reveal-body').innerText = content.mainBody;

        playMusic(); // Might be blocked until interaction, but try.
    } else {
        // First run or Unlocked but fresh session
        showPhase(0); // Tap to Connect
    }

    // Attach Start Listener
    document.getElementById('start-btn').addEventListener('click', handleStart);
}

// --- CORE FLOW ---

function handleStart() {
    // 1. Initialize Audio Context (Mobile Requirement)
    audio.thump.play().then(() => {
        audio.thump.pause();
        audio.thump.currentTime = 0;
    }).catch(e => console.log('Audio init', e));

    // 2. Request Motion Permissions (iOS 13+)
    requestMotion();

    // 3. Start Sequence
    startGlitchSequence();
}

function startGlitchSequence() {
    showPhase(2); // Glitch Screen

    // Queue Audio Haptic
    setTimeout(() => audio.thump.play(), 500);
    setTimeout(() => audio.thump.play(), 1200);

    // Shake Effect
    document.getElementById('app-container').classList.add('shake-screen');

    // Transitions
    setTimeout(() => {
        // END GLITCH
        document.getElementById('app-container').classList.remove('shake-screen');
        showPhase(3); // Reveal
        playMusic();

        // Mark as unlocked in storage
        state.hasUnlocked = true;
        saveState();

        // Magic Ping (Notify Creator)
        sendMagicPing();

        // Prepare Content
        const content = setupRevealContent('first_run');

        // Start Ghost Typing
        typewriterEffect(content.mainBody, 'reveal-body').then(() => {
            // Show footer after typing is done
            const footerEl = document.getElementById('reveal-footer');
            footerEl.innerText = content.footer;
            footerEl.style.opacity = 1; // Assume CSS handles fade in
        });

    }, 3500); // 3.5s Glitch Duration
}

function playMusic(fadeInDuration = 2000) {
    audio.song.volume = 0;
    audio.song.play().catch(e => console.log("Music play blocked", e));

    // Fade in
    let vol = 0;
    const stepTime = 100; // Update every 100ms
    const steps = fadeInDuration / stepTime;
    const volStep = 0.8 / steps; // Target 0.8 volume

    const fade = setInterval(() => {
        if (vol < 0.8) {
            vol += volStep;
            audio.song.volume = Math.min(vol, 0.8);
        } else {
            clearInterval(fade);
        }
    }, stepTime);
}

// --- UTILS ---

function showPhase(id) {
    // Hide all
    Object.values(phases).forEach(el => {
        el.classList.remove('active');
        el.classList.add('hidden');
    });
    // Show target
    const target = phases[id];
    target.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => target.classList.add('active'), 10);
}

function requestMotion() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleParallax);
                }
            })
            .catch(console.error);
    } else {
        // Non-iOS 13+ devices
        window.addEventListener('deviceorientation', handleParallax);
    }
}

function handleParallax(e) {
    // Basic parallax logic placeholder
    const x = e.gamma / 5; // Left/Right
    const y = e.beta / 5;  // Front/Back
    document.documentElement.style.setProperty('--tiltX', `${x}deg`);
    document.documentElement.style.setProperty('--tiltY', `${y}deg`);
}

function loadState() {
    // Debug/Reset Check
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('reset') || urlParams.has('debug')) {
        console.log("Debug Mode: Clearing State");
        localStorage.removeItem('nfc_valentine_state');
    }

    const saved = localStorage.getItem('nfc_valentine_state');
    if (saved) {
        state = JSON.parse(saved);
        state.visitCount++;
    } else {
        state.visitCount = 1;
    }
    localStorage.setItem('nfc_valentine_state', JSON.stringify(state));
}

function saveState() {
    localStorage.setItem('nfc_valentine_state', JSON.stringify(state));
}

// --- COPY DICTIONARY ---
const MESSAGES = {
    locked: {
        default: ["Not yet.", "Patience is a virtue."],
        morning: ["Good morning.", "Too early for this."]
    },
    glitch: [
        "SYSTEM UNSTABLE...",
        "ERROR: HEART.EXE NOT FOUND",
        "ATTEMPTING RECOVERY...",
        "OVERLOAD IMMINENT"
    ],
    reveal: {
        codes: {
            'A01': "You make rooms warmer just by being in them.",
            'A02': "I knew you'd be curious enough to tap this.",
            'default': "This was meant for someone specific, but I'm glad you're here."
        },
        time: {
            morning: "Good morning. I'm glad you started your day here.",
            evening: "I'm glad you found this tonight."
        },
        visit: {
            second: "Tap this any time you need a reminder: The world is full of love, and it will triumph.", // Safe Mode / Reminder
            third: "You really like pressing buttons, don't you?",
            return: "I was wondering when you'd come back."
        }
    }
};

function setupTheme() {
    const hour = new Date().getHours();
    const isEvening = hour < 5 || hour >= 17;

    // Set Theme Variables
    if (isEvening) {
        document.documentElement.style.setProperty('--reveal-bg', '#1a0b14'); // Dark Purple
        document.documentElement.style.setProperty('--reveal-text', '#ffe3f1'); // Soft Pink
        document.documentElement.style.setProperty('--reveal-accent', '#ff70a6'); // Neon Pink
    } else {
        document.documentElement.style.setProperty('--reveal-bg', '#fffcf2'); // Cream
        document.documentElement.style.setProperty('--reveal-text', '#2c2c2c'); // Charcoal
        document.documentElement.style.setProperty('--reveal-accent', '#d62828'); // Deep Red
    }

    // Return time-of-day string for logic
    return isEvening ? 'evening' : 'morning';
}

function setupRevealContent(mode) {
    // 1. Get Code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code') || 'default';

    // 2. Determine Message Parts
    let mainBody = "";
    let footer = "";

    if (mode === 'return') {
        // Safe Mode / Return Visit
        mainBody = MESSAGES.reveal.visit.second; // "The world is full of love..."
        footer = "";
    } else {
        // First Run
        mainBody = MESSAGES.reveal.codes[code] || MESSAGES.reveal.codes['default'];

        // Time specific footer (Morning/Evening)
        const timeOfDay = setupTheme();
        footer = MESSAGES.reveal.time[timeOfDay];
    }

    // 3. Set Text (Title is static in HTML: "Just kidding.")
    // We don't set innerText here because Ghost Typing will handle the Body.
    // We just prepare the data.
    return { mainBody, footer };
}

async function typewriterEffect(text, elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = ''; // Clear

    let cursor = 0;
    const speed = 50; // ms per char
    const variance = 20; // Randomize speed slightly for human feel

    // Parse for "backspace" events? 
    // Simple implementation: Just type straight for now. 
    // Advanced: To add backspaces, we'd need a script array.
    // Let's stick to straight typing for the MVP to ensure reliability, 
    // unless spec requires specific backspace script.

    while (cursor < text.length) {
        element.innerHTML += text.charAt(cursor);
        cursor++;

        // Random pause
        const delay = speed + (Math.random() * variance);
        await new Promise(r => setTimeout(r, delay));
    }
}

function sendMagicPing() {
    // Determine user code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code') || 'Unknown';

    // Webhook URL (You will need to replace this with your actual ntfy.sh or discord url)
    // For now, we log it. 
    const WEBHOOK_URL = "";

    if (!WEBHOOK_URL) {
        console.log(`[Magic Ping] Code ${code} unlocked the valentine.`);
        return;
    }

    fetch(WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify({
            topic: "valentine_tracker",
            message: `Code ${code} just opened the experience.`,
            title: "Someone found love!",
            priority: 3
        })
    }).catch(err => console.error("Ping failed", err));
}

// Run
init();
