# NFC Valentine: When Physical Meets Digital

> A 3D-printed Valentine's card with embedded NFC that updates remotely, roasts you for opening early, and sends me push notifications when you tap it.

**[📖 Read the full technical breakdown →](https://yourusername.github.io/nfc-valentine/)**

![NFC Valentine Card](IMG_0725.png)

## Overview

This project breaks the container of what a "Valentine's card" can be by creating a physical object that:
- ✨ Updates its message remotely after being given
- 🎭 Has personality and responds differently based on timing
- 🔔 Sends push notifications when opened
- 🎨 Features a choreographed glitch sequence with audio sync
- 💰 Costs $0/month to run (serverless architecture)

## The Stack

**Physical:**
- CAD-designed translucent 3D printed housing
- Embedded NFC-215 tags
- Braille embossing
- Postcard dimensions (5" x 7")

**Frontend:**
- Vanilla JavaScript
- Web Audio API
- CSS animations
- Context-aware personalization

**Backend:**
- Google Sheets as headless CMS
- Google Apps Script as serverless API
- ntfy.sh for push notifications

## Key Features

### 1. Time-Based Gate Logic
The card refuses to unlock before Valentine's Day with increasingly sassy responses:
```javascript
"Patience is a virtue. Try again on Valentine's Day."
"Relax. It's not time yet."
"So help me, if you don't stop this, I'll turn this Valentine around..."
```

### 2. Dynamic Message Delivery
Messages can be updated remotely through Google Sheets even after the card has been given.

### 3. Context-Aware Personalization
- Time-of-day greetings (morning/afternoon/evening)
- Visit tracking (return visits get different messages)
- Unique code per card for personalization

### 4. Glitch Performance
A 4.5-second choreographed chaos sequence before the reveal:
- Screen shakes
- Color strobing
- Audio glitches synchronized to the millisecond
- Terminal-style "SYSTEM FAILURE" messages

### 5. Bidirectional Feedback
Push notifications alert the creator when someone opens their card, creating a feedback loop.

## Project Documentation

- **[Full Blog Post](https://yourusername.github.io/nfc-valentine/)** - Complete technical breakdown
- **Architecture Diagrams** - See images in this repo
- **Source Code** - Coming soon

## Architecture

![System Architecture](IMG_0728.png)

The complete data flow from NFC tap to push notification.

## Skills Applied

![Skills Matrix](IMG_0727.png)

38 distinct skill applications across 6 project layers.

## Cost

**Total recurring cost: $0/month**

- NFC tags: ~$15 one-time
- PLA filament: ~$5 one-time
- Hosting: Free (static)
- Backend: Free (Google Apps Script)
- Notifications: Free (ntfy.sh)

## Future Improvements

- [ ] E-ink display integration
- [ ] Haptic feedback via NFC
- [ ] Geofencing for location-aware messages
- [ ] Multi-recipient group cards
- [ ] End-to-end encryption

## License

MIT License - Feel free to build your own!

## Author

[Your Name](https://github.com/yourusername)

---

**Want to build something that refuses to stay static?**

This project demonstrates that the boundary between physical and digital isn't a wall—it's a design space waiting to be explored.
