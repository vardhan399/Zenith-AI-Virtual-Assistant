<div align="center">

# 🎙️ ZENITH AI

### *Speak. Think. Respond. In real time.*

**A voice-controlled AI assistant that bridges human speech and machine intelligence** — powered by the Gemini API, Web Speech API, and a full-stack Node/React pipeline. Say something, and Zenith hears it, thinks about it, and speaks back. No typing. No lag. No friction.

![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)

![Status](https://img.shields.io/badge/Status-Live-58f5a0?style=flat-square)
![Voice](https://img.shields.io/badge/Voice-Real--time-00e5ff?style=flat-square)
![AI](https://img.shields.io/badge/AI-Gemini_Powered-ff2dd1?style=flat-square)
![Speech](https://img.shields.io/badge/TTS-Web_Speech_API-a855f7?style=flat-square)

---

</div>

## ⚡ Quick Start

```bash
npm install && npm run dev
```

Open `http://localhost:5173` — the frontend loads and connects to the backend on port `5000`.

```bash
npm run build    # production bundle
npm run preview  # preview the build locally
```

---

## 🧭 Routes

| Path | Purpose |
|------|---------|
| **`/`** | Landing / login page |
| **`/home`** | Main voice assistant interface |
| **`/customize`** | Customize your AI assistant's name, avatar, and voice |

---

## 🚀 Features

<table>
<tr>
<td width="50" align="center">🎤</td>
<td>

### Voice Input
Continuous speech recognition powered by the Web Speech API. Speak naturally — Zenith listens for your assistant's wake name and activates on detection. Supports **English** and **Hindi (hi-IN)** with automatic language switching. Clap detection as a secondary activation trigger.

**Tech** — `webkitSpeechRecognition`, continuous mode, interim results filtered, name-gated activation.

</td>
</tr>
<tr>
<td align="center">🧠</td>
<td>

### Gemini AI Brain
Every voice query is routed to the Gemini API via the backend. Gemini classifies the intent — search, navigate, message, answer — and returns both a spoken response and a structured action payload. The frontend executes the action (open YouTube, send a WhatsApp, show weather) immediately after speaking.

**Tech** — Google Gemini API, intent classification, structured JSON response, action dispatch.

</td>
</tr>
<tr>
<td align="center">🔊</td>
<td>

### Text-to-Speech Output
AI responses are spoken aloud using the Web Speech API. Voice gender (male/female) and language are configurable at runtime. Smart voice selection picks the best available browser voice — Google UK English Female, Microsoft Zira, Samantha, and more — with graceful fallbacks.

**Tech** — `SpeechSynthesisUtterance`, dynamic voice picker, pitch tuning per gender, language-aware.

</td>
</tr>
<tr>
<td align="center">🌊</td>
<td>

### Live Waveform Visualiser
A canvas-based real-time waveform that changes shape depending on the assistant's state. Idle shows a quiet sine pulse. Listening shows animated frequency bars with sonar rings. Speaking shows a radial spike visualiser. All rendered at 60 FPS via `requestAnimationFrame` — no libraries.

**Modes** — `idle` / `listening` / `speaking`, each with distinct canvas draw routines.

</td>
</tr>
<tr>
<td align="center">🪐</td>
<td>

### Orbital UI
Four control buttons (Customize, History, Settings, Logout) orbit the assistant avatar in a continuous circular path. Buttons are fully draggable — fling them anywhere on screen and they spring back to orbit after 3 seconds. The orbit loop never pauses; only the dragged button is temporarily freed.

**Tech** — Framer Motion `useMotionValue`, spring animation, per-button free/orbit flag, `setInterval`-driven angle.

</td>
</tr>
<tr>
<td align="center">☁️</td>
<td>

### Media & File Handling
Assistant avatar images are uploaded via Multer and stored on Cloudinary. The backend returns a CDN URL that's persisted to the user's profile. Supports JPEG, PNG, and WebP with size validation.

**Tech** — Multer middleware, Cloudinary SDK, CDN-backed image delivery.

</td>
</tr>
</table>

---

## ⌨️ Voice Commands

<table>
<tr><td><kbd>Search [query]</kbd></td><td>Opens Google search results in a new tab</td></tr>
<tr><td><kbd>Play [song/video]</kbd></td><td>Opens YouTube search for that query</td></tr>
<tr><td><kbd>Weather in [city]</kbd></td><td>Opens Google weather for the location</td></tr>
<tr><td><kbd>Open Instagram / Facebook</kbd></td><td>Navigates to the requested platform</td></tr>
<tr><td><kbd>Open calculator</kbd></td><td>Opens Google's inline calculator</td></tr>
<tr><td><kbd>Message [contact]</kbd></td><td>Opens WhatsApp with the pre-saved number</td></tr>
</table>

---

## 🏗️ Project Structure

```
/
├── client/                          React frontend
│   └── src/
│       ├── App.jsx                  Router — Landing + Home + Customize
│       ├── context/
│       │   └── UserContext.jsx      Global user state + Gemini fetch
│       ├── pages/
│       │   ├── Home.jsx             Main assistant UI — orbit, waveform, voice
│       │   ├── Customize.jsx        Avatar + name + voice configuration
│       │   └── SignIn.jsx           Auth entry point
│       └── assets/                  Background images
│
├── server/                          Node.js / Express backend
│   ├── index.js                     Entry point — Express + middleware
│   ├── routes/
│   │   ├── auth.js                  Login / logout / session
│   │   ├── user.js                  Profile update, avatar upload
│   │   └── gemini.js                AI query endpoint
│   ├── controllers/
│   │   ├── authController.js        Auth logic
│   │   ├── userController.js        User CRUD
│   │   └── geminiController.js      Gemini API integration + intent parsing
│   └── utils/
│       ├── cloudinary.js            Cloudinary config + upload helper
│       └── voiceUtils.js            Voice selection helpers
│
└── .env                             API keys (see setup below)
```

---

## ⚙️ Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/your-username/zenith-ai.git
cd zenith-ai
```

**2. Install dependencies**
```bash
npm install
cd client && npm install
```

**3. Configure environment variables**

Create a `.env` file in the root:
```env
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

**4. Run the application**
```bash
npm run dev        # starts both frontend and backend concurrently
```

---

## 🔬 How It Works

```
User speaks  →  Web Speech API transcribes  →  Name gate check
     ↓
Text sent to backend  →  Gemini classifies intent + generates response
     ↓
Frontend receives { type, response, userInput, whatsapp? }
     ↓
TTS speaks the response  +  Action dispatched (open tab, send message, etc.)
     ↓
Waveform returns to idle  →  Recognition restarts automatically
```

The name gate means Zenith only wakes when it hears the assistant's configured name in the transcript — reducing false triggers from background audio.

---

## 🎨 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Frontend**
- React 18 — component-driven UI
- Framer Motion — orbital animation + spring physics
- Web Speech API — voice input + TTS output
- Canvas API — real-time waveform renderer
- React Router 6 — client-side routing
- Tailwind CSS — utility styling

</td>
<td valign="top" width="50%">

**Backend**
- Node.js + Express — REST API server
- Google Gemini API — AI brain + intent engine
- MongoDB + Mongoose — user data persistence
- Multer — file upload middleware
- Cloudinary — avatar image CDN
- express-session — auth session management

</td>
</tr>
</table>

---

## ⚡ Performance

- **60 FPS waveform** — pure canvas, zero DOM writes per frame, single `requestAnimationFrame` loop.
- **Zero-gap voice loop** — recognition restarts within 300 ms of any end/error event, keeping the mic always live.
- **Non-blocking TTS** — speech synthesis runs independently; recognition pauses only while speaking, then auto-resumes.
- **Orbit never stops** — drag a button off-orbit and the other three keep spinning; the dragged one springs back via a single per-button flag, no interval restart.

---

## 🎯 Design Philosophy

Most voice assistants make you wait for a wake word, show a spinner, then read a wall of text.

Zenith is different.

- **The mic is always open** — name-gated, not wake-word-blocked.
- **Every state has a visual** — the waveform tells you exactly what Zenith is doing without any status text.
- **Actions, not just answers** — Zenith doesn't just reply; it opens tabs, fires WhatsApp messages, and navigates the web on your behalf.
- **The UI is the assistant** — the orbital buttons, the avatar, the scan lines — it's all one instrument, not a chatbox with a mic button bolted on.

<div align="center">

---

**You don't talk to Zenith. You command it.**

[![Try Zenith](https://img.shields.io/badge/▸-Launch_Zenith_AI-00e5ff?style=for-the-badge)](https://github.com/your-username/zenith-ai)

</div>