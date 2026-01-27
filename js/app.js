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

        spawnFloatingHearts();
        startQuoteSequence();

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
    // Play "Hit Two" (First impact) - START WITH TEXT
    audio.hit2.currentTime = 0;
    audio.hit2.play().catch(e => console.log("Hit2 Fail", e));

    await typeLine("SYSTEM UNSTABLE...");

    await wait(1500);

    // T=2.5: Line 2 - Split for audio sync
    // "ATTEMPTING"
    audio.hit1.currentTime = 0;
    audio.hit1.play().catch(e => console.log("Hit1-A", e));
    await typeLine("ATTEMPTING ");

    // "RECOVERY..."
    audio.hit1.currentTime = 0;
    audio.hit1.play().catch(e => console.log("Hit1-B", e));
    await typeLine("RECOVERY...");

    await wait(1000);

    // T=4.5: CHAOS MODE
    // Visual Chaos Only (Audio is now manual)
    app.classList.add('shake-screen');
    const strobe = setInterval(() => {
        app.style.backgroundColor = app.style.backgroundColor === 'white' ? 'black' : 'white';
    }, 100);

    // T=4.5: CHAOS MODE (continued)
    // Third line split for audio sync
    // "CRITICAL"
    audio.hit1.currentTime = 0;
    audio.hit1.play().catch(e => console.log("Hit1-C", e));
    await typeLine("CRITICAL ", "dim");

    // "FAILURE"
    audio.hit1.currentTime = 0;
    audio.hit1.play().catch(e => console.log("Hit1-D", e));
    await typeLine("FAILURE", "dim");

    await wait(3000);

    // T=7.5: Stop Chaos
    clearInterval(strobe);
    app.classList.remove('shake-screen');
    app.style.backgroundColor = 'black';
    term.innerHTML = ""; // Clear all

    await wait(1000);

    // T=8.5: The Drop (Silence)
    // Play "Hit Two" Again (Meltdown End)
    audio.hit2.currentTime = 0;
    audio.hit2.play().catch(e => console.log("Hit2 End Fail", e));

    await typeLine("OVERLOAD IMMINENT", "accent-red");

    await wait(2500);

    // T=11.0: REVEAL
    showPhase(3);
    spawnFloatingHearts();

    // Fade In Music (Over 2s)
    playMusic(2000);

    // Mark as unlocked
    state.hasUnlocked = true;
    saveState();
    sendMagicPing();

    // Start Quote Sequence
    startQuoteSequence();
}

function playMusic(fadeInDuration = 2000) {
    audio.song.volume = 0;
    audio.song.play().catch(e => console.log("Music play blocked", e));

    // Fade in
    let vol = 0;
    const stepTime = 100; // Update every 100ms
    const steps = fadeInDuration / stepTime;
    const volStep = 1.0 / steps; // Target 1.0 volume

    const fade = setInterval(() => {
        if (vol < 1.0) {
            vol += volStep;
            audio.song.volume = Math.min(vol, 1.0);
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
    // Clamp tilt to avoiding extreme shifting
    const limit = 45;
    const gamma = Math.min(Math.max(e.gamma, -limit), limit); // Left/Right
    const beta = Math.min(Math.max(e.beta, -limit), limit);  // Front/Back

    // Convert to pixels (Invert for "depth" feel - background moves opposite to tilt)
    const moveX = -(gamma / limit) * 40; // Max 40px shift
    const moveY = -(beta / limit) * 40;  // Max 40px shift

    document.documentElement.style.setProperty('--bg-x', `${moveX}px`);
    document.documentElement.style.setProperty('--bg-y', `${moveY}px`);
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
        },
        quotes: [
            "Love is not just a feeling, it's a practice.",
            "You are worthy of the love you keep trying to give everyone else.",
            "To love and be loved is to feel the sun from both sides.",
            "Wherever you are, you are exactly where you need to be."
        ],
        quotes: [
            "Let yourself be silently drawn by the strange pull of what you really love. It will not lead you astray.” – Rumi",
            "There is a candle in your heart, ready to be kindled. There is a void in your soul, ready to be filled. You feel it, don’t you?” ― Rumi",
            "Reason is powerless in the expression of Love.” ― Rumi",
            "In your light I learn how to love. In your beauty, how to make poems. You dance inside my chest where no-one sees you, but sometimes I do, and that sight becomes this art.” ― Rumi",
            "Everyone has been made for some particular work, and the desire for that work has been put in every heart.” – Rumi",
            "Wherever you are, and whatever you do, be in love.” ― Rumi",
            "Close your eyes, fall in love, stay there.” – Rumi",
            "Why are you knocking at every other door? Go, knock at the door of your own heart.” ― Rumi",
            "I looked in temples, churches, and mosques. But I found the Divine within my heart.” ― Rumi",
            "Loving me will not be easy, loving me will be war. You will hold the gun and I will hand you the bullets. So breathe, and embrace the beauty of the massacre that lies ahead.",
            "Love rests on no foundation. It is an endless ocean, with no beginning or end.” ― Rumi",
            "Goodbyes are only for those who love with their eyes. Because for those who love with heart and soul there is no such thing as separation.” ― Rumi",
            "Lovers don’t finally meet somewhere. They’re in each other all along.” ― Rumi",
            "We are born of love; Love is our mother.” – Rumi",
            "You have within you more love than you could ever understand.” – Rumi",
            "Would you become a pilgrim on the road of love? The first condition is that you make yourself humble as dust and ashes.” ― Rumi",
            "Be certain in the religion of Love there are no believers or unbelievers. Love embraces all.” – Rumi",
            "You are the soul of the soul of the Universe, and your name is Love.” ― Rumi",
            "The only lasting beauty is the beauty of the heart.” – Rumi",
            "A pen went scribbling along. When it tried to write love, it broke.” – Rumi",
            "You have to keep breaking your heart until it opens.” ― Rumi",
            "They say there is a doorway from heart to heart, but what is the use of a door when there are no walls?” ― Rumi",
            "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.” ― Rumi",
            "I love you. - Ezra",
            "The devil doesn't come dressed in a red cape and horns, they come dressed as everything you ever secretly wished for.",
            "Love never hesitates to draw blood. Love has neither friends or children. - Rumi"
        ]
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

    // Webhook URL (ntfy.sh active)
    const WEBHOOK_URL = "https://ntfy.sh/val-ping-ezras-unique";

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

// --- QUOTE SEQUENCE LOGIC ---
async function startQuoteSequence() {
    const container = document.getElementById('reveal-body');
    // Clear initial content
    container.style.opacity = 0;
    container.innerHTML = "";

    // Restore Footer with SMS Link
    const footer = document.getElementById('reveal-footer');
    if (footer) {
        footer.innerHTML = '<a href="sms:&body=I found the hidden valentine!" class="sms-link">Tell Ezra you found his love</a>';
        footer.style.opacity = 1;
        // Ensure it's clickable (z-index fix)
        footer.style.position = 'relative';
        footer.style.zIndex = '100';
    }

    // 1. Show Greeting
    const greeting = "Just kidding, take this moment to know I see you and you are loved.";
    container.innerText = greeting;

    // Fade In Greeting
    container.style.transition = "opacity 2s ease";
    container.style.opacity = 1;

    // Hold Greeting for 4s
    await new Promise(r => setTimeout(r, 4000));

    // Fade Out Greeting
    container.style.opacity = 0;
    await new Promise(r => setTimeout(r, 2000));

    // 2. Start Quote Loop
    // Default quotes if none provided yet
    const quotes = MESSAGES.reveal.quotes || [
        "Love is not just a feeling, it's a practice.",
        "You are worthy of the love you keep trying to give everyone else."
    ];

    let qIndex = 0;

    while (true) {
        if (qIndex >= quotes.length) qIndex = 0; // Loop

        const quote = quotes[qIndex];
        container.innerText = quote;

        // Fade In (1s)
        container.style.transition = "opacity 1s ease";
        container.style.opacity = 1;
        await new Promise(r => setTimeout(r, 1000 + 2000)); // Fade(1) + Hold(2)

        // Fade Out (2s)
        container.style.transition = "opacity 2s ease";
        container.style.opacity = 0;
        await new Promise(r => setTimeout(r, 2000));

        qIndex++;
    }
}

function spawnFloatingHearts() {
    const container = document.getElementById('heart-bg');
    const symbols = ['❤', '♥'];

    // Spawn a heart every 400ms
    setInterval(() => {
        const heart = document.createElement('div');
        heart.classList.add('bg-heart');

        // Random Color Class
        if (Math.random() > 0.5) {
            heart.classList.add('heart-red');
        } else {
            heart.classList.add('heart-pink');
        }

        heart.innerText = symbols[Math.floor(Math.random() * symbols.length)];

        // Randomize
        const left = Math.random() * 100; // 0-100% width
        const size = 5 + Math.random() * 10; // LARGE: 5rem to 15rem
        const duration = 10 + Math.random() * 10; // Slow float (10-20s)

        heart.style.left = `${left}%`;
        heart.style.fontSize = `${size}rem`;
        heart.style.animationDuration = `${duration}s`;

        container.appendChild(heart);

        // Cleanup
        setTimeout(() => heart.remove(), duration * 1000);
    }, 400);
}

// Run
init();
