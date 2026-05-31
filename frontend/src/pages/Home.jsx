import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, animate as motionAnimate } from "framer-motion";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import p3 from "../assets/p3.jpg";

const STRINGS = {
  "hi-IN": {
    greeting:  (name)       => "\u0939\u093E\u0901 " + name + "? \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u0915\u0948\u0938\u0947 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u0940 \u0939\u0942\u0901?",
    testVoice: (name, asst) => "\u0928\u092E\u0938\u094D\u0924\u0947 " + name + "! \u092E\u0948\u0902 " + asst + " \u0939\u0942\u0901\u0964",
    noContact: (contact)    => "\u092E\u093E\u092B\u093C \u0915\u0930\u0947\u0902, \u092E\u0947\u0930\u0947 \u092A\u093E\u0938 " + contact + " \u0915\u093E \u0928\u0902\u092C\u0930 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964",
  },
  "en-IN": {
    greeting:  (name)       => "Yes " + name + "? How can I help you?",
    testVoice: (name, asst) => "Hello " + name + "! I am " + asst + ".",
    noContact: (contact)    => "Sorry, I don't have " + contact + "'s number saved.",
  },
};
function getString(lang, key, ...args) {
  const s = STRINGS[lang] || STRINGS["en-IN"];
  const fn = s[key] || STRINGS["en-IN"][key];
  return fn ? fn(...args) : "";
}

function useOrbitRadius() {
  const [radius, setRadius] = useState(160);
  useEffect(() => {
    const update = () => setRadius(window.innerWidth <= 420 ? 115 : 160);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return radius;
}

function pickVoice(synth, gender, lang) {
  const voices = synth.getVoices();
  if (!voices.length) return null;
  if (lang === "hi-IN") {
    return (
      voices.find(v => v.lang === "hi-IN" && gender === "female" && /female|woman/i.test(v.name)) ||
      voices.find(v => v.lang === "hi-IN" && gender === "male"   && /male|man/i.test(v.name))    ||
      voices.find(v => v.lang === "hi-IN") ||
      voices.find(v => v.lang.startsWith("hi"))
    ) || null;
  }
  if (gender === "female") {
    return (
      voices.find(v => v.name === "Google UK English Female")                                       ||
      voices.find(v => v.name === "Microsoft Zira - English (United States)")                       ||
      voices.find(v => /google.*female/i.test(v.name))                                             ||
      voices.find(v => /female/i.test(v.name))                                                     ||
      voices.find(v => ["Samantha","Karen","Moira","Tessa","Veena"].some(n => v.name.includes(n))) ||
      voices.find(v => v.lang.startsWith("en")) || voices[0]
    );
  }
  return (
    voices.find(v => v.name === "Google UK English Male")                                         ||
    voices.find(v => v.name === "Microsoft David - English (United States)")                      ||
    voices.find(v => /google.*male/i.test(v.name))                                               ||
    voices.find(v => /\bmale\b/i.test(v.name))                                                   ||
    voices.find(v => ["Daniel","Alex","Fred","Tom","Aaron"].some(n => v.name.includes(n)))       ||
    voices.find(v => v.lang.startsWith("en")) || voices[1] || voices[0]
  );
}

function Waveform({ mode }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    function drawIdle() {
      ctx.clearRect(0, 0, W, H);
      const t = tRef.current;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0,255,255,0.18)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < W; x++) {
        const y = cy + Math.sin((x / W) * Math.PI * 2 + t * 0.5) * 2;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function drawListening() {
      ctx.clearRect(0, 0, W, H);
      const t = tRef.current;
      const BARS = 28;
      const barW = 3;
      const gap  = (W - BARS * barW) / (BARS + 1);
      for (let i = 0; i < BARS; i++) {
        const x = gap + i * (barW + gap);
        const h = 4
          + Math.abs(Math.sin(t * 2.1 + i * 0.55)) * 18
          + Math.abs(Math.sin(t * 1.3 + i * 1.1))  * 10
          + Math.abs(Math.sin(t * 3.7 + i * 0.3))  * 6;
        const alpha = 0.55 + Math.sin(t * 1.5 + i * 0.4) * 0.3;
        const grd = ctx.createLinearGradient(x, cy + h, x, cy - h);
        grd.addColorStop(0,   "rgba(0,255,255,0)");
        grd.addColorStop(0.4, "rgba(0,255,255," + alpha * 0.4 + ")");
        grd.addColorStop(1,   "rgba(0,255,255," + alpha + ")");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.roundRect(x, cy - h, barW, h * 2, 2);
        ctx.fill();
      }
      const rings = 3;
      for (let r = 0; r < rings; r++) {
        const phase    = (t * 0.8 + r * (1 / rings)) % 1;
        const radius   = phase * (H * 0.45);
        const opacity  = (1 - phase) * 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,255," + opacity + ")";
        ctx.lineWidth   = 1.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,255,255,0.9)";
      ctx.fill();
      ctx.shadowColor = "#0ff";
      ctx.shadowBlur  = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function drawSpeaking() {
      ctx.clearRect(0, 0, W, H);
      const t = tRef.current;
      const BARS   = 32;
      const maxR   = H * 0.46;
      const minR   = 12;
      for (let i = 0; i < BARS; i++) {
        const angle = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const amp =
          Math.abs(Math.sin(t * 3.2 + i * 0.45)) * 0.45 +
          Math.abs(Math.sin(t * 1.8 + i * 0.9))  * 0.30 +
          Math.abs(Math.sin(t * 5.1 + i * 0.2))  * 0.25;
        const r   = minR + amp * (maxR - minR);
        const x1  = cx + Math.cos(angle) * minR;
        const y1  = cy + Math.sin(angle) * minR;
        const x2  = cx + Math.cos(angle) * r;
        const y2  = cy + Math.sin(angle) * r;
        const alpha = 0.4 + amp * 0.6;
        const g = Math.round(200 + amp * 55);
        const b = Math.round(200 + amp * 55);
        const grd = ctx.createLinearGradient(x1, y1, x2, y2);
        grd.addColorStop(0, "rgba(0," + g + "," + b + ",0.1)");
        grd.addColorStop(1, "rgba(0," + g + "," + b + "," + alpha + ")");
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = grd;
        ctx.lineWidth   = 2.5;
        ctx.lineCap     = "round";
        ctx.stroke();
      }
      const pulse = 0.7 + Math.sin(t * 4) * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, minR * pulse, 0, Math.PI * 2);
      ctx.fillStyle   = "rgba(0,255,255,0.15)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0,255,255,0.7)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      const outerR  = maxR * (0.9 + Math.sin(t * 2.5) * 0.06);
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,255,0.12)";
      ctx.lineWidth   = 1;
      ctx.stroke();
    }

    function loop() {
      tRef.current += 0.035;
      if (mode === "listening") drawListening();
      else if (mode === "speaking") drawSpeaking();
      else drawIdle();
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mode]);

  return (
    <canvas
      ref={canvasRef}
      width={220}
      height={56}
      style={{
        display: "block",
        filter: mode === "idle" ? "none" : "drop-shadow(0 0 6px #0ff)",
      }}
    />
  );
}

export default function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate    = useNavigate();
  const orbitRadius = useOrbitRadius();

  const [stage,        setStage]        = useState("boot");
  const [listening,    setListening]    = useState(false);
  const [speaking,     setSpeaking]     = useState(false);
  const [chatHistory,  setChatHistory]  = useState([]);
  const [showHistory,  setShowHistory]  = useState(false);
  const [displayText,  setDisplayText]  = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [voiceGender,  setVoiceGender]  = useState("female");
  const [language,     setLanguage]     = useState("en-IN");

  const angleRef         = useRef(0);
  const orbitIntervalRef = useRef(null);
  const freeRef          = useRef([false, false, false, false]);
  const isSpeakingRef    = useRef(false);
  const voiceGenderRef   = useRef(voiceGender);
  const languageRef      = useRef(language);
  const returnTimers     = useRef({});
  // FIX 3: ref to track if clap-mode is active (skip name gate)
  const clapActiveRef    = useRef(false);
  const synth            = window.speechSynthesis;

  const restartRecognitionRef = useRef(null);
  const stopRecognitionRef    = useRef(null);
  const handleCommandRef      = useRef(null);

  useEffect(() => { voiceGenderRef.current = voiceGender; }, [voiceGender]);
  useEffect(() => { languageRef.current    = language;    }, [language]);

  useEffect(() => {
    const load = () => synth.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const btnX = useRef([
    useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0),
  ]);
  const btnY = useRef([
    useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0),
  ]);

  const getPos = useCallback((index, total, angle, r) => {
    const rad = (((index / total) * 360 + angle) * Math.PI) / 180;
    return { x: Math.cos(rad) * r, y: Math.sin(rad) * r };
  }, []);

  useEffect(() => {
    orbitIntervalRef.current = setInterval(() => {
      angleRef.current = (angleRef.current + 0.4) % 360;
      btnX.current.forEach((mv, i) => {
        if (freeRef.current[i]) return;
        const pos = getPos(i, 4, angleRef.current, orbitRadius);
        mv.set(pos.x - 28);
      });
      btnY.current.forEach((mv, i) => {
        if (freeRef.current[i]) return;
        const pos = getPos(i, 4, angleRef.current, orbitRadius);
        mv.set(pos.y - 28);
      });
    }, 16);
    return () => clearInterval(orbitIntervalRef.current);
  }, [orbitRadius, getPos]);

  const pointerDownPos = useRef({});
  const isDragging     = useRef({});

  const returnToOrbit = useCallback((i) => {
    const pos     = getPos(i, 4, angleRef.current, orbitRadius);
    const targetX = pos.x - 28;
    const targetY = pos.y - 28;
    const stopX = motionAnimate(btnX.current[i], targetX, { type: "spring", stiffness: 160, damping: 20 });
    const stopY = motionAnimate(btnY.current[i], targetY, { type: "spring", stiffness: 160, damping: 20 });
    setTimeout(() => { stopX(); stopY(); freeRef.current[i] = false; }, 750);
  }, [orbitRadius, getPos]);

  const handleDragStart = useCallback((i, event) => {
    const e = event?.touches?.[0] || event;
    pointerDownPos.current[i] = { x: e?.clientX ?? 0, y: e?.clientY ?? 0 };
    isDragging.current[i] = false;
    clearTimeout(returnTimers.current[i]);
  }, []);

  const handleDrag = useCallback((i, event) => {
    if (isDragging.current[i]) return;
    const e = event?.touches?.[0] || event;
    const origin = pointerDownPos.current[i] || { x: 0, y: 0 };
    const dist = Math.hypot((e?.clientX ?? 0) - origin.x, (e?.clientY ?? 0) - origin.y);
    if (dist > 8) { isDragging.current[i] = true; freeRef.current[i] = true; }
  }, []);

  const handleDragEnd = useCallback((i, info) => {
    const wasDragged = isDragging.current[i];
    isDragging.current[i] = false;
    pointerDownPos.current[i] = null;
    if (!wasDragged) { freeRef.current[i] = false; return; }
    const dist = Math.hypot(info.offset.x, info.offset.y);
    if (dist < 60) {
      returnToOrbit(i);
    } else {
      returnTimers.current[i] = setTimeout(() => returnToOrbit(i), 3000);
    }
  }, [returnToOrbit]);

  async function handleLogout() {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (e) { console.log(e); }
  }

  const orbitButtons = [
    { label: "Customize", icon: "\u2699\uFE0F",  color: "cyan",   action: () => navigate("/customize") },
    { label: "History",   icon: "\uD83D\uDCDC",  color: "purple", action: () => setShowHistory(true) },
    { label: "Settings",  icon: "\uD83C\uDFA4",  color: "blue",   action: () => setShowSettings(true) },
    { label: "Logout",    icon: "\uD83D\uDEAA",  color: "red",    action: handleLogout },
  ];
  const colorMap = {
    cyan:   { border:"border-cyan-400",   text:"text-cyan-300",   glow:"shadow-[0_0_18px_#0ff8]",     bg:"bg-cyan-400/10" },
    purple: { border:"border-purple-400", text:"text-purple-300", glow:"shadow-[0_0_18px_#a855f788]", bg:"bg-purple-400/10" },
    blue:   { border:"border-blue-400",   text:"text-blue-300",   glow:"shadow-[0_0_18px_#3b82f688]", bg:"bg-blue-400/10" },
    red:    { border:"border-red-400",    text:"text-red-300",    glow:"shadow-[0_0_18px_#f00a]",     bg:"bg-red-400/10" },
  };

  const bootLines = [
    "System Online...",
    "Scanning user identity...",
    "Special Thanks to Our Developers Anurag and Team!",
  ];
  const [bootText, setBootText] = useState("");
  const [bootLine, setBootLine] = useState(0);
  const [bootChar, setBootChar] = useState(0);

  useEffect(() => {
    if (bootLine >= bootLines.length) { setTimeout(() => setStage("ui"), 600); return; }
    const cur = bootLines[bootLine];
    const t = setTimeout(() => { setBootText(p => p + cur[bootChar]); setBootChar(c => c + 1); }, 35);
    if (bootChar === cur.length) {
      clearTimeout(t);
      setTimeout(() => { setBootText(p => p + "\n"); setBootLine(l => l + 1); setBootChar(0); }, 400);
    }
    return () => clearTimeout(t);
  }, [bootChar, bootLine]);

  const introLines = [(userData?.name || "User") + " detected.", "Initializing your AI assistant..."];
  const loopMsg    = "Your AI is fully operational \u26A1";
  const [text,    setText]    = useState("");
  const [tLine,   setTLine]   = useState(0);
  const [tChar,   setTChar]   = useState(0);
  const [lChar,   setLChar]   = useState(0);
  const [lCount,  setLCount]  = useState(0);
  const [looping, setLooping] = useState(false);

  useEffect(() => {
    if (stage !== "ui") return;
    if (!looping && tLine < introLines.length) {
      const cur = introLines[tLine];
      const t = setTimeout(() => { setText(p => p + cur[tChar]); setTChar(c => c + 1); }, 35);
      if (tChar === cur.length) {
        clearTimeout(t);
        setTimeout(() => {
          setText(p => p + "\n"); setTLine(l => l + 1); setTChar(0);
          if (tLine === introLines.length - 1) setTimeout(() => setLooping(true), 900);
        }, 600);
      }
      return () => clearTimeout(t);
    }
    if (looping && lCount < 2) {
      const t = setTimeout(() => { setText(loopMsg.slice(0, lChar + 1)); setLChar(c => c + 1); }, 40);
      if (lChar === loopMsg.length) {
        clearTimeout(t);
        setTimeout(() => {
          if (lCount + 1 >= 2) { setText(loopMsg); setLooping(false); }
          else { setLChar(0); setText(""); setLCount(c => c + 1); }
        }, 1200);
      }
      return () => clearTimeout(t);
    }
  }, [tChar, tLine, stage, lChar, looping, lCount]);

  const speak = useCallback((textToSpeak) => {
    if (!textToSpeak) return;
    synth.cancel();
    isSpeakingRef.current = true;
    setSpeaking(true);
    setDisplayText("\uD83E\uDD16 " + textToSpeak);
    if (stopRecognitionRef.current) stopRecognitionRef.current();

    const utt = new SpeechSynthesisUtterance(textToSpeak);
    utt.volume = 1;
    utt.rate   = 1;
    utt.lang   = languageRef.current;
    utt.pitch  = voiceGenderRef.current === "female" ? 1.4 : 0.75;

    const assignVoice = () => {
      const v = pickVoice(synth, voiceGenderRef.current, languageRef.current);
      if (v) utt.voice = v;
    };
    assignVoice();
    if (!utt.voice) { setTimeout(assignVoice, 200); }

    utt.onend = () => {
      isSpeakingRef.current = false;
      setSpeaking(false);
      setTimeout(() => { if (restartRecognitionRef.current) restartRecognitionRef.current(); }, 400);
    };
    utt.onerror = (e) => {
      console.warn("TTS error:", e.error);
      isSpeakingRef.current = false;
      setSpeaking(false);
      setTimeout(() => { if (restartRecognitionRef.current) restartRecognitionRef.current(); }, 400);
    };
    synth.speak(utt);
  }, []);

  /* ══════════════════════════════════════════════
     CONTINUOUS SPEECH RECOGNITION
     FIX 3: skip name gate when clapActiveRef is true
  ══════════════════════════════════════════════ */
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    let recognition = null;
    let restartTimer = null;
    let dead = false;
    let busy = false;

    function stopCurrent() {
      clearTimeout(restartTimer);
      try { recognition?.stop(); } catch (_) {}
      recognition = null;
    }

    function createRecognition() {
      if (dead) return;
      clearTimeout(restartTimer);

      recognition = new SR();
      recognition.continuous     = true;
      recognition.interimResults = false;
      recognition.lang           = languageRef.current;

      recognition.onresult = async (e) => {
        if (isSpeakingRef.current || busy) return;
        const result = e.results[e.results.length - 1];
        if (!result.isFinal) return;
        const transcript = result[0].transcript.trim();
        console.log("Heard:", transcript);

        // FIX 3: if clap activated, skip name gate for ONE command
        if (!clapActiveRef.current) {
          const name = userData?.assistantName?.toLowerCase() || "";
          if (!name || !transcript.toLowerCase().includes(name)) return;
        }
        clapActiveRef.current = false; // reset after one command

        busy = true;
        stopCurrent();
        setListening(true);
        setDisplayText("\uD83C\uDF99\uFE0F " + transcript);
        setChatHistory(prev => [...prev, { role: "user", text: transcript }]);

        try {
          const data = await getGeminiResponse(transcript);
          if (data?.response) setChatHistory(prev => [...prev, { role: "ai", text: data.response }]);
          if (handleCommandRef.current) handleCommandRef.current(data);
        } catch (err) {
          console.error("Gemini error:", err);
          if (!dead) restartTimer = setTimeout(createRecognition, 500);
        } finally {
          busy = false;
          setListening(false);
        }
      };

      recognition.onerror = (e) => {
        if (e.error === "aborted" || e.error === "no-speech") return;
        if (!dead && !isSpeakingRef.current && !busy) {
          restartTimer = setTimeout(createRecognition, 1000);
        }
      };

      recognition.onend = () => {
        if (!dead && !isSpeakingRef.current && !busy) {
          restartTimer = setTimeout(createRecognition, 300);
        }
      };

      try { recognition.start(); } catch (_) {}
    }

    restartRecognitionRef.current = createRecognition;
    stopRecognitionRef.current    = stopCurrent;
    if (!isSpeakingRef.current) createRecognition();

    return () => {
      dead = true;
      clearTimeout(restartTimer);
      try { recognition?.stop(); } catch (_) {}
      restartRecognitionRef.current = null;
      stopRecognitionRef.current    = null;
    };
  }, [userData, language]);

  const contacts = {
    "mom":"345312534555","mummy":"914345345444","maa":"435134534555","mother":"432513453455",
    "dad":"534534534666","daddy":"343534453455","papa":"34531453455",
  };

  /* ── command handler ──
     FIX 2: open links in same tab on mobile so browser allows it
  ── */
  const handleCommand = useCallback((data) => {
    if (!data) return;
    const { type, userInput, response, whatsapp } = data;
    if (response) speak(response);
    setTimeout(() => {
      const open = (url) => window.open(url, "_blank") || (window.location.href = url);
      if (type === "google_search")
        open("https://www.google.com/search?q=" + encodeURIComponent(userInput));
      if (type === "youtube_search" || type === "youtube_play")
        open("https://www.youtube.com/results?search_query=" + encodeURIComponent(userInput));
      if (type === "calculator_open") open("https://www.google.com/search?q=calculator");
      if (type === "instagram_open")  open("https://www.instagram.com/");
      if (type === "facebook_open")   open("https://www.facebook.com/");
      if (type === "weather_show")
        open("https://www.google.com/search?q=weather+" + encodeURIComponent(userInput));
      if (type === "whatsapp_message" && whatsapp) {
        const number = contacts[whatsapp.contact?.toLowerCase()];
        if (number)
          open("https://wa.me/" + number + "?text=" + encodeURIComponent(whatsapp.message || ""));
        else
          speak(getString(languageRef.current, "noContact", whatsapp.contact));
      }
    }, 300);
  }, [speak]);

  useEffect(() => { handleCommandRef.current = handleCommand; }, [handleCommand]);

  /* ── clap detection ──
     FIX 3: set clapActiveRef so next voice command skips name gate
  ── */
  useEffect(() => {
    let ac, analyser, raf;
    let lastClap = 0, cooldown = false;

    const activateAssistant = () => {
      if (isSpeakingRef.current) return;
      const greeting = getString(languageRef.current, "greeting", userData?.name || "");
      speak(greeting);
      setListening(true);
      // FIX 3: mark clap active so recognition skips name gate
      clapActiveRef.current = true;
      // reset after 8s in case user doesn't speak
      setTimeout(() => { clapActiveRef.current = false; }, 8000);
    };

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        });
        ac = new AudioContext();
        analyser = ac.createAnalyser();
        ac.createMediaStreamSource(stream).connect(analyser);
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.1;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        const check = () => {
          analyser.getByteFrequencyData(buf);
          if (Math.max(...buf) > 240) {
            const now = Date.now(), diff = now - lastClap;
            if (diff < 800 && diff > 100 && !isSpeakingRef.current && !cooldown) {
              cooldown = true;
              activateAssistant();
              setTimeout(() => { cooldown = false; }, 4000);
            }
            lastClap = now;
          }
          raf = requestAnimationFrame(check);
        };
        check();
      } catch (e) { console.log("Clap mic error:", e); }
    };
    start();
    return () => { cancelAnimationFrame(raf); if (ac) ac.close(); };
  }, [userData, speak, handleCommand]);

  const containerSize = orbitRadius < 130 ? 300 : 370;
  const avatarSize    = orbitRadius < 130 ? "w-36 h-36" : "w-48 h-48";
  const ringBase      = orbitRadius < 130 ? 190 : 250;
  const waveMode = speaking ? "speaking" : listening ? "listening" : "idle";

  return (
    <div
      className="w-full min-h-screen flex flex-col justify-center items-center
                 relative overflow-hidden text-center text-cyan-300"
      style={{ backgroundImage: "url(" + p3 + ")", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="bgZoom absolute inset-0" />
      <div className="absolute inset-0 bg-black/85" />
      <div className="matrix absolute inset-0 opacity-20" />
      <div className="hud tl"/><div className="hud tr"/>
      <div className="hud bl"/><div className="hud br"/>

      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 right-4 z-40 flex items-center gap-2
                       bg-cyan-500/20 border border-cyan-400 px-3 py-1.5
                       rounded-full text-cyan-300 text-xs font-mono"
          >
            <motion.span
              animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-cyan-400 inline-block"
            />
            Listening...
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, x: -300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }}
            className="absolute left-0 top-0 h-full w-72 max-w-[85vw] z-50
                       bg-black/95 border-r border-cyan-400/30 flex flex-col p-4 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-cyan-300 font-bold text-base">Chat History</h3>
              <button onClick={() => setShowHistory(false)}
                className="text-cyan-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center">
                {"\u2715"}
              </button>
            </div>
            {chatHistory.length === 0 && (
              <p className="text-cyan-400/50 text-sm text-center mt-10">No conversations yet...</p>
            )}
            {chatHistory.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={"mb-3 p-3 rounded-xl text-sm text-left " +
                  (msg.role === "user"
                    ? "bg-cyan-500/20 border border-cyan-400/40 text-cyan-200"
                    : "bg-purple-500/20 border border-purple-400/40 text-purple-200")}>
                <span className="font-bold text-xs opacity-60 block mb-1">
                  {msg.role === "user" ? "\uD83C\uDF99\uFE0F You" : "\uD83E\uDD16 " + (userData?.assistantName || "AI")}
                </span>
                {msg.text}
              </motion.div>
            ))}
            {chatHistory.length > 0 && (
              <button onClick={() => setChatHistory([])}
                className="mt-4 text-xs text-red-400 hover:text-red-300 border border-red-400/30 rounded-full py-1.5 px-4">
                {"\uD83D\uDDD1\uFE0F Clear History"}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-0 h-full w-64 max-w-[85vw] z-50
                       bg-black/95 border-l border-cyan-400/30 flex flex-col p-5"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-cyan-300 font-bold text-base tracking-widest uppercase">Settings</h3>
              <button onClick={() => setShowSettings(false)}
                className="text-cyan-400 hover:text-white text-xl w-8 h-8 flex items-center justify-center">
                {"\u2715"}
              </button>
            </div>
            <div className="mb-6">
              <p className="text-cyan-400/70 text-[10px] uppercase tracking-widest mb-3">
                {"\uD83C\uDFA4 Voice Gender"}
              </p>
              <div className="flex gap-2">
                {["female", "male"].map(g => (
                  <button key={g} onClick={() => setVoiceGender(g)}
                    className={"flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 " +
                      (voiceGender === g
                        ? "bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_#0ff5]"
                        : "border-cyan-400/20 text-cyan-400/50 hover:border-cyan-400/50")}>
                    {g === "female" ? "\u2640\uFE0F Female" : "\u2642\uFE0F Male"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-cyan-400/70 text-[10px] uppercase tracking-widest mb-3">
                {"\uD83C\uDF10 Language"}
              </p>
              <div className="flex gap-2">
                {[{ label: "English", value: "en-IN" }, { label: "\u0939\u093F\u0902\u0926\u0940", value: "hi-IN" }].map(l => (
                  <button key={l.value} onClick={() => setLanguage(l.value)}
                    className={"flex-1 py-2.5 rounded-full text-xs font-bold border transition-all duration-200 " +
                      (language === l.value
                        ? "bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_#0ff5]"
                        : "border-cyan-400/20 text-cyan-400/50 hover:border-cyan-400/50")}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                const line = getString(
                  languageRef.current, "testVoice",
                  userData?.name || "",
                  userData?.assistantName || (languageRef.current === "hi-IN" ? "\u092B\u094D\u0930\u093E\u0907\u0921\u0947" : "Friday")
                );
                speak(line);
              }}
              className="mb-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider
                         border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-200">
              {"\uD83D\uDD0A Test Voice"}
            </button>
            <div className="mt-auto p-3 rounded-xl border border-cyan-400/20 bg-cyan-400/5">
              <p className="text-[10px] text-cyan-400/50 uppercase tracking-widest mb-2">Active Config</p>
              <p className="text-cyan-300 text-sm">Voice: <span className="font-bold capitalize">{voiceGender}</span></p>
              <p className="text-cyan-300 text-sm">Lang: <span className="font-bold">{language === "en-IN" ? "English" : "\u0939\u093F\u0902\u0926\u0940"}</span></p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === "boot" && (
        <pre className="relative z-10 font-mono text-base sm:text-lg whitespace-pre-line drop-shadow-[0_0_8px_#0ff] px-6">
          {bootText}
        </pre>
      )}

      {stage === "ui" && (
        <div className="relative z-10 flex flex-col items-center w-full px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl font-extrabold mb-5
                       bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300
                       bg-clip-text text-transparent"
          >
            Welcome Back
          </motion.h1>

          <div className="relative flex justify-center items-center flex-shrink-0"
               style={{ width: containerSize, height: containerSize }}>
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                className="absolute rounded-full border border-cyan-400/20"
                style={{ width: ringBase + i * 28, height: ringBase + i * 28 }}
                animate={{ scale: [1, 1.04, 1], opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.5 }}
              />
            ))}

            {orbitButtons.map((btn, i) => {
              const c = colorMap[btn.color];
              return (
                <motion.button key={btn.label}
                  drag dragMomentum={false} dragElastic={0}
                  onPointerDown={(e) => handleDragStart(i, e)}
                  onPointerMove={(e) => handleDrag(i, e)}
                  onDragEnd={(_, info) => handleDragEnd(i, info)}
                  onClick={(e) => {
                    if (isDragging.current[i]) { e.preventDefault(); return; }
                    btn.action();
                  }}
                  style={{ position: "absolute", left: "50%", top: "50%", x: btnX.current[i], y: btnY.current[i] }}
                  whileHover={{ scale: 1.18 }} whileTap={{ scale: 0.92 }}
                  className={"w-14 h-14 rounded-full border-2 " + c.border + " " + c.bg + " " + c.glow +
                    " flex flex-col items-center justify-center backdrop-blur-sm cursor-grab active:cursor-grabbing z-20 touch-none select-none"}
                >
                  <motion.div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <motion.div
                      className={"absolute w-full h-0.5 " + (btn.color === "red" ? "bg-red-400/60" : "bg-cyan-400/60")}
                      animate={{ y: [-28, 28, -28] }} transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                  <span className="text-base z-10 pointer-events-none">{btn.icon}</span>
                  <span className={"text-[8px] font-bold uppercase tracking-wider " + c.text + " z-10 pointer-events-none"}>
                    {btn.label}
                  </span>
                  <motion.div
                    className={"absolute inset-0 rounded-full border " + c.border + " pointer-events-none"}
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.button>
              );
            })}

            {listening && (
              <motion.div className="absolute rounded-full border-2 border-cyan-400"
                style={{ width: ringBase - 38, height: ringBase - 38 }}
                animate={{ scale: [1, 1.15, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}

            <motion.div className="absolute rounded-full bg-cyan-400/20 blur-2xl"
              style={{ width: ringBase - 55, height: ringBase - 55 }}
              animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div className="absolute bg-cyan-400/70 blur-sm"
              style={{ width: ringBase - 75, height: 2 }}
              animate={{ y: [-(ringBase / 2 - 35), (ringBase / 2 - 35), -(ringBase / 2 - 35)] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {userData?.assistantImage && (
              <motion.img src={userData.assistantImage} alt="Assistant"
                className={avatarSize + " rounded-full object-cover ring-4 ring-cyan-400 shadow-[0_0_40px_#0ff] relative z-10"}
                animate={{ y: [0, -8, 0], rotate: [0, 1, -1, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
            )}
          </div>

          <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-2 text-xl sm:text-3xl font-bold text-cyan-300">
            {userData?.assistantName || "Your AI"}
          </motion.h2>

          <div className="mt-3 flex flex-col items-center gap-1">
            <AnimatePresence mode="wait">
              <motion.div key={waveMode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <Waveform mode={waveMode} />
              </motion.div>
            </AnimatePresence>
            <motion.p
              key={waveMode + "_label"}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-[10px] font-mono tracking-[0.2em] uppercase"
              style={{ color: speaking ? "#a78bfa" : listening ? "#22d3ee" : "rgba(34,211,238,0.3)" }}
            >
              {speaking ? "[ TRANSMITTING ]" : listening ? "[ RECEIVING ]" : "[ STANDBY ]"}
            </motion.p>
          </div>

          <AnimatePresence>
            {displayText && (
              <motion.div key={displayText}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2 px-4 py-2 max-w-[90vw] sm:max-w-sm
                           bg-cyan-500/10 border border-cyan-400/30 rounded-xl
                           text-cyan-200 text-xs sm:text-sm font-mono text-center">
                {displayText}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.pre initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
            className="mt-3 font-mono whitespace-pre-line drop-shadow-[0_0_8px_#0ff] text-xs sm:text-sm min-h-[26px]">
            {text}
          </motion.pre>
        </div>
      )}

      <style>{`
        .bgZoom{background:url(${p3})center/cover no-repeat;animation:bgZoom 25s infinite alternate ease-in-out;z-index:-1}
        @keyframes bgZoom{from{transform:scale(1)}to{transform:scale(1.08)}}
        .matrix{background:repeating-linear-gradient(to bottom,rgba(0,255,255,.15)0,rgba(0,255,255,.15)2px,transparent 2px,transparent 20px);animation:rain 10s linear infinite}
        @keyframes rain{from{background-position-y:0}to{background-position-y:1000px}}
        .hud{position:absolute;width:44px;height:44px;border-color:#22d3ee;opacity:.5}
        @media(min-width:640px){.hud{width:66px;height:66px}}
        .tl{top:12px;left:12px;border-top:2px solid;border-left:2px solid}
        .tr{top:12px;right:12px;border-top:2px solid;border-right:2px solid}
        .bl{bottom:12px;left:12px;border-bottom:2px solid;border-left:2px solid}
        .br{bottom:12px;right:12px;border-bottom:2px solid;border-right:2px solid}
      `}</style>
    </div>
  );
}
