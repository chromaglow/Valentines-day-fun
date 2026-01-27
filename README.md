# Interactive NFC Valentine Experience 💝

**Created:** Jan 2026 for Ezra Shively.

## 📖 Project Overview
This is a Single Page Application (SPA) designed to be triggered by an NFC tag. It features a "Date Gate" (locks before Feb 14), a cinematic "Glitch" intro, and a personalized "Reveal" phase with music and quotes.

**Live Demo:** [https://chromaglow.github.io/Valentines-day-fun/](https://chromaglow.github.io/Valentines-day-fun/)

---

## 🚀 Key Resources

### **📡 Notification System (Magic Ping)**
*   **Service:** [ntfy.sh](https://ntfy.sh)
*   **Alert Dashboard:** [https://ntfy.sh/val-ping-ezras-unique](https://ntfy.sh/val-ping-ezras-unique)
    *   *Subscribe here to get push alerts when tags are scanned.*

### **📋 Distribution List**
*   **Master File:** `valentine_codes.csv` (Located in repo root)
    *   Contains 60 unique codes (`A01` - `A60`).
    *   **Usage:** Assign each code to a person in the CSV as you write the tags.

---

## 🛠️ Testing & Operation Guide

### **Standard Links**
| User State | Link Pattern | Description |
| :--- | :--- | :--- |
| **Recipient (Locked)** | `.../?code=A01` | Shows "Patience is a virtue" until Feb 14, 2026. |
| **Recipient (Unlocked)** | `.../?code=A01` | *On/After Feb 14:* Plays Glitch -> Reveal. |
| **Recipient (Return)** | `.../?code=A01` | *Second Visit:* Skips Glitch -> Shows "I missed you too". |

### **Developer / Testing Links**
*Use these to see the content NOW, bypassing the date lock.*

| Goal | URL Parameters | Full Link (Click to Test) |
| :--- | :--- | :--- |
| **Force Unlock** | `?debug=true&reset=true` | [Click Here](https://chromaglow.github.io/Valentines-day-fun/?debug=true&reset=true) <br> *Simulates a user's FIRST unlocked visit.* |
| **Test Return Visit** | `?debug=true` | [Click Here](https://chromaglow.github.io/Valentines-day-fun/?debug=true) <br> *Simulates a RETURNING user.* |
| **Reset Memory** | `?reset=true` | Clears the "visited" flag from your browser. |

> **Note:** `debug=true` ignores the date check.

---

## 📂 Configuration (How to Edit)

All text content is centrally located in `js/app.js` within the `MESSAGES` object.

*   **Locked Messages:** `MESSAGES.locked`
*   **Glitch Text:** `MESSAGES.glitch`
*   **Reveal / Quotes:** `MESSAGES.reveal`
    *   **Greetings:** `MESSAGES.reveal.time` (Morning/Afternoon/Evening).
    *   **Return Msg:** `MESSAGES.reveal.visit.second` ("AWWWWW you came back...").
    *   **Quotes:** `MESSAGES.reveal.quotes` (The list of Rumi quotes).

### **Date & Time Settings**
To change the unlock date, edit `CONFIG.unlockDate` at the top of `js/app.js`:
```javascript
const CONFIG = {
    unlockDate: new Date('2026-02-14T00:00:00'), // YYYY-MM-DD
    // ...
};
```

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
