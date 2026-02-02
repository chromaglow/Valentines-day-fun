# Valentine NFC Project - Architecture & Maintenance

## Overview
This project is a static web page ("The Valentine") that unlocks a personalized experience when a user visits a specific URL (e.g., via NFC tag).
It uses a **Hybrid Architecture**:
1.  **Frontend (GitHub Pages)**: Handles the animation, "glitch" effect, music, and display.
2.  **Backend (Google Sheets)**: Stores the codes, names, and custom messages.
3.  **Notification (ntfy.sh)**: Sends a push notification to your phone when someone visits.

## 1. How It Works
*   User taps NFC tag -> Opens URL: `https://.../?code=A01`
*   **Step 1**: The site loads the "Glitch" animation.
*   **Step 2**: The site secretly contacts your **Google Sheet** (via Apps Script).
    *   It sends the code (`A01`).
    *   The Script logs the visit in the `Logs` tab.
    *   The Script looks up the name in the `Data` tab.
    *   The Script sends a notification: *"Alice just opened their Valentine!"*
    *   The Script returns any **Custom Message** you wrote for them.
*   **Step 3**: The site combines your Custom Message with the default message and reveals it.

## 2. Managing Data
You do **not** need to touch the code to update messages.
1.  Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1FgLvvp.../).
2.  Go to the **Data** tab.
3.  Update the **Recipient Name** (for your notifications).
4.  Update the **Message** (what they see on screen).
    *   *Note: If you leave "Message" blank, they just see the default poem.*

## 3. Project Structure
*   `index.html`: Main entry point. Loads styles and scripts.
*   `js/app.js`: The brain. Handles animations and logic.
    *   *Note: This file looks for `GOOGLE_SCRIPT_URL` in `secrets.js`.*
*   `js/secrets.js`: **Private file** (ignored by Git). Contains your actual Google Script URL.
*   `js/secrets.example.js`: A template for anyone else cloning the repo.
*   `css/styles.css`: All the styling and animations.

## 4. Google Apps Script (The Backend)
Since the backend lives in Google Cloud, here is a copy of the script for safekeeping.
**If you ever need to redeploy the backend:**
1.  Open Google Sheet > Extensions > Apps Script.
2.  Paste this code:

```javascript
/* VALENTINE BACKEND SCRIPT */
const NTFY_TOPIC = "val-ping-ezras-unique"; 

function doGet(e) {
  const code = e.parameter.code;
  const userAgent = e.parameter.ua || "Unknown";
  
  if (!code) return ContentService.createTextOutput(JSON.stringify({ error: "No code" })).setMimeType(ContentService.MimeType.JSON);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName("Data");
  const logSheet = ss.getSheetByName("Logs");

  // 1. Log the Visit
  if (logSheet) logSheet.appendRow([new Date(), code, userAgent]);

  // 2. Find Data (Header-Smart)
  const data = dataSheet.getDataRange().getValues();
  const headers = data[0]; 
  const codeIdx = headers.indexOf("Code");
  const nameIdx = headers.indexOf("Recipient Name");
  let msgIdx = headers.indexOf("Message");
  if (msgIdx === -1) msgIdx = headers.indexOf("Custom Message");

  let result = { found: false, name: "Unknown" }; 
  if (codeIdx > -1) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][codeIdx]).trim() === String(code).trim()) {
        result = {
          found: true,
          name: (nameIdx > -1) ? data[i][nameIdx] : "Unknown",
          message: (msgIdx > -1) ? data[i][msgIdx] : ""
        };
        break;
      }
    }
  }

  // 3. Send Notification
  try {
    let msgBody = `Code ${code} just accessed the site.`;
    if (result.found && result.name && result.name !== "Unknown") {
        msgBody = `${result.name} just opened their Valentine!`;
    }

    UrlFetchApp.fetch("https://ntfy.sh/" + NTFY_TOPIC, {
      method: "post",
      payload: JSON.stringify({
        topic: NTFY_TOPIC, 
        message: msgBody, 
        title: "Valentine Visit Detected", 
        priority: 4,
        tags: ["heart"]
      })
    });
  } catch (err) {}

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
```
3.  **Deploy** > New Deployment > Web App > "Anyone".

## 5. Deployment & Git
*   **GitHub**: The repo checks in `js/app.js` but ignores `js/secrets.js`.
*   **To Deploy**: Just push to GitHub. GitHub Pages will serve `index.html`.
*   **Locally**: You must have `js/secrets.js` with your URL to test.
