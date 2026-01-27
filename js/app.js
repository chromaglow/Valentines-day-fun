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
    hit1: document.getElementById('audio-hit1'),
    hit2: document.getElementById('audio-hit2'),
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

    const params = new URLSearchParams(window.location.search);

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
    if (state.hasUnlocked) {
        const content = setupRevealContent('return');
        showPhase(3); // Jump to Reveal

        document.getElementById('reveal-body').innerText = content.mainBody;

        playMusic();
    } else {
        // First run or Unlocked but fresh session
        showPhase(0); // Tap to Connect
    }

    // Attach Start Listener
    document.getElementById('start-btn').addEventListener('click', handleStart);
}

// --- CORE FLOW ---

// --- LOCKED PHASE LOGIC ---
function updateLockedMessage() {
    state.clickCount++;
    saveState();

    const time = setupTheme(); // 'morning' or 'evening'
    const prefix = time === 'morning' ? "Good Morning." : "Good Evening.";

    let msg = "";
    // Attempt 1
    if (state.clickCount === 1) {
        msg = "Patience is a virtue.";
    }
    // Attempt 2
    else if (state.clickCount === 2) {
        msg = "Relax, it's not time yet.";
    }
    // Attempt 3+
    else {
        msg = "I will turn this valentine around and send it back home.";
    }

    document.getElementById('gate-message').innerText = prefix;
    document.getElementById('gate-subtext').innerText = msg;
}

function handleStart() {
    // 1. Initialize Audio Context (Mobile Requirement)
    // We play minimal volume on both new sfx to unlock them
    audio.hit1.volume = 0;
    audio.hit2.volume = 0;

    Promise.all([audio.hit1.play(), audio.hit2.play()]).then(() => {
        audio.hit1.pause();
        audio.hit2.pause();
        audio.hit1.currentTime = 0;
        audio.hit2.currentTime = 0;
        // Reset Volume
        audio.hit1.volume = 1.0;
        audio.hit2.volume = 1.0;
        console.log("Audio Unlocked");
    }).catch(e => console.error("Audio Init Failed:", e));

    // 2. Request Motion Permissions (iOS 13+)
    requestMotion();

    // 3. Start Sequence
    startCinematicGlitch();
}

async function startCinematicGlitch() {
    showPhase(2); // Glitch Screen
    const app = document.getElementById('app-container');
    const term = document.querySelector('.terminal-view');
    term.innerHTML = ""; // Clear start

    // Helper for timing
    const wait = ms => new Promise(r => setTimeout(r, ms));

    // Async Typewriter for Terminal
    const typeLine = async (txt, style = "") => {
        const div = document.createElement('div');
        div.className = "status-line " + style + " typing-cursor"; // Start with cursor
        term.appendChild(div);

        for (let i = 0; i < txt.length; i++) {
            div.innerText += txt.charAt(i);
            // Targeted 2.0s duration per line (approx 100ms/char)
            await wait(100 + Math.random() * 30);
        }

        // Remove cursor after typing is done (so it doesn't blink on all lines)
        div.classList.remove('typing-cursor');
    };

    // T=0: Dark start
    await wait(500);

    // T=0.5: Line 1
    await typeLine("SYSTEM UNSTABLE...");

    // Play "Hit Two" (First impact) - Play AFTER text starts or during? 
    // User wants "Hit Two is the first sample to be played after the first line"
    audio.hit2.play().catch(e => console.log("Hit2 Fail", e));

    await wait(1500);

    // T=2.5: Line 2
    await typeLine("ATTEMPTING RECOVERY...");
    await wait(1500);

    // T=4.5: CHAOS MODE
    // Start pulsing audio loop (Hit One) - Slower Loop
    let thumpCount = 0;
    const thumpLoop = setInterval(() => {
        audio.hit1.currentTime = 0;
        audio.hit1.play().catch(e => console.log("Hit1 fail", e));
        thumpCount++;
        // Stop after 4 hits (spaced out more)
        if (thumpCount > 4) clearInterval(thumpLoop);
    }, 1200); // Increased from 800 to 1200ms to let sample play out

    // Visual Chaos
    app.classList.add('shake-screen');
    const strobe = setInterval(() => {
        app.style.backgroundColor = app.style.backgroundColor === 'white' ? 'black' : 'white';
    }, 100);

    term.innerHTML += "<br><div class='status-line dim'>CRITICAL FAILURE</div>";

    await wait(4000);

    // T=7.5: Stop Chaos
    clearInterval(strobe);
    clearInterval(thumpLoop);
    app.classList.remove('shake-screen');
    app.style.backgroundColor = 'black';
    term.innerHTML = ""; // Clear all

    await wait(1000);

    // T=8.5: The Drop (Silence)
    await typeLine("OVERLOAD IMMINENT", "accent-red");

    await wait(2500);

    // T=11.0: REVEAL
    showPhase(3);

    // Fade In Music (Over 2s)
    playMusic(2000);

    // Mark as unlocked
    state.hasUnlocked = true;
    saveState();
    sendMagicPing();

    // Prepare Content
    const content = setupRevealContent('first_run');

    // Start Ghost Typing - SLOW SPEED (150ms)
    typewriterEffect(content.mainBody, 'reveal-body', 150).then(async () => {
        await wait(1000);
        // Then show the personalized P.S.
        const footer = document.getElementById('reveal-footer');
        footer.innerHTML = content.mainBody + "<br><br>" + content.footer;
        footer.style.opacity = 1;
    });
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

    return { mainBody, footer };
}

async function typewriterEffect(text, elementId, baseSpeed = 50) {
    const element = document.getElementById(elementId);
    element.innerHTML = ''; // Clear

    let cursor = 0;
    const variance = 20; // Randomize speed slightly for human feel

    while (cursor < text.length) {
        element.innerHTML += text.charAt(cursor);
        cursor++;

        // Random pause
        const delay = baseSpeed + (Math.random() * variance);
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
