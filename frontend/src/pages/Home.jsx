import React, { useContext, useEffect, useState } from "react";
import { userDataContext } from "../context/UserContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import p3 from "../assets/p3.jpg";



function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [stage, setStage] = useState("boot");

  /* ===== LOGOUT FUNCTION ===== */
  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true
      });
      setUserData(null);
      navigate("/signin");
    } catch (err) {
      console.log(err);
    }
  };

  /* ===== INITIAL BOOT TEXT ===== */
  const bootLines = [
    "System Online...",
    "Scanning user identity...",
    "Special Thanks to Our Developers Anurag and Team! ",
  ];

  const [bootText, setBootText] = useState("");
  const [bootLine, setBootLine] = useState(0);
  const [bootChar, setBootChar] = useState(0);

  useEffect(() => {
    if (bootLine >= bootLines.length) {
      setTimeout(() => setStage("ui"), 600);
      return;
    }

    const current = bootLines[bootLine];

    const t = setTimeout(() => {
      setBootText(prev => prev + current[bootChar]);
      setBootChar(bootChar + 1);
    }, 35);

    if (bootChar === current.length) {
      clearTimeout(t);
      setTimeout(() => {
        setBootText(prev => prev + "\n");
        setBootLine(bootLine + 1);
        setBootChar(0);
      }, 400);
    }

    return () => clearTimeout(t);
  }, [bootChar, bootLine]);

  /* ===== TYPING BELOW AVATAR ===== */
  /* ===== TYPING BELOW AVATAR ===== */
const lines = [
  `${userData?.name || "User"} detected.`,
  "Initializing your AI assistant...",
];

const loopMessage = "Your AI is fully operational ⚡";

const [text, setText] = useState("");
const [line, setLine] = useState(0);
const [char, setChar] = useState(0);
const [loopChar, setLoopChar] = useState(0);
const [looping, setLooping] = useState(false);

useEffect(() => {
  if (stage !== "ui") return;

  /* ===== NORMAL SEQUENCE ===== */
  if (!looping && line < lines.length) {
    const current = lines[line];

    const t = setTimeout(() => {
      setText(prev => prev + current[char]);
      setChar(char + 1);
    }, 35);

    if (char === current.length) {
      clearTimeout(t);
      setTimeout(() => {
        setText(prev => prev + "\n");
        setLine(line + 1);
        setChar(0);

        if (line === lines.length - 1) {
          setTimeout(() => setLooping(true), 900);
        }
      }, 600);
    }

    return () => clearTimeout(t);
  }

  /* ===== LOOPING FINAL LINE ===== */
  if (looping) {
    const t = setTimeout(() => {
      setText(loopMessage.slice(0, loopChar + 1));
      setLoopChar(loopChar + 1);
    }, 40);

    if (loopChar === loopMessage.length) {
      clearTimeout(t);

      setTimeout(() => {
        setLoopChar(0);
        setText("");
      }, 1200);
    }

    return () => clearTimeout(t);
  }

}, [char, line, stage, loopChar, looping]);

const speak = (text) => {
  if (!text) return;

  window.speechSynthesis.cancel(); // stop previous speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.volume = 1;
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
};

const handleCommand = (data) => {
  if (!data) return;

  const { type, userInput, response } = data;

  if (response) speak(response);

  // small delay prevents popup blocking
  setTimeout(() => {

    if (type === "google_search") {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, "_blank");
    }

    if (type === "youtube_search" || type === "youtube_play") {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, "_blank");
    }

    if (type === "calculator_open") {
      window.open("https://www.google.com/search?q=calculator", "_blank");
    }

    if (type === "instagram_open") {
      window.open("https://www.instagram.com/", "_blank");
    }

    if (type === "facebook_open") {
      window.open("https://www.facebook.com/", "_blank");
    }

    if (type === "weather_show") {
      window.open(`https://www.google.com/search?q=weather+${encodeURIComponent(userInput)}`, "_blank");
    }

  }, 300);
};
useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-IN";

  recognition.onresult = async (e) => {
    const result = e.results[e.results.length - 1];

    if (!result.isFinal) return;

    const transcript = result[0].transcript.trim();
    console.log("Heard:", transcript);

    if (
      transcript
        .toLowerCase()
        .includes(userData?.assistantName?.toLowerCase())
    ) {
      recognition.stop(); // stop mic while AI works

      const data = await getGeminiResponse(transcript);
      console.log("AI DATA:", data);

      handleCommand(data);

      // restart listening
      setTimeout(() => recognition.start(), 1500);
    }
  };

  recognition.start();

  return () => recognition.stop();
}, [userData]);


  return (
    <div
      className="w-full h-screen flex flex-col justify-center items-center 
                 relative overflow-hidden text-center text-cyan-300"
      style={{ backgroundImage:`url(${p3})`, backgroundSize:"cover" }}
    >

      {/* CINEMATIC BG ZOOM */}
      <div className="bgZoom absolute inset-0"/>

      <div className="absolute inset-0 bg-black/85"></div>

      <div className="matrix absolute inset-0 opacity-20" />

      {/* JARVIS CORNERS */}
      <div className="hud tl"/>
      <div className="hud tr"/>
      <div className="hud bl"/>
      <div className="hud br"/>

      {/* BOOT */}
      {stage === "boot" && (
        <pre className="relative z-10 font-mono text-lg whitespace-pre-line
                        drop-shadow-[0_0_8px_#0ff]">
          {bootText}
        </pre>
      )}

      {/* UI */}
      {stage === "ui" && (
        <div className="relative z-10 flex flex-col items-center">

          <motion.h1
            initial={{opacity:0,y:-20}}
            animate={{opacity:1,y:0}}
            transition={{delay:0.2}}
            className="text-5xl font-extrabold mb-8
                       bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300
                       bg-clip-text text-transparent">
            Welcome Back
          </motion.h1>

          {/* AVATAR ZONE */}
          <motion.div
            initial={{opacity:0,scale:0.8}}
            animate={{opacity:1,scale:1}}
            transition={{delay:0.6}}
            className="relative flex justify-center items-center">

            {[...Array(3)].map((_,i)=>(
              <motion.div
                key={i}
                className="absolute rounded-full border border-cyan-400/40"
                style={{width:300+i*60,height:300+i*60}}
                animate={{ scale:[1,1.4], opacity:[0.5,0] }}
                transition={{duration:3,repeat:Infinity,delay:i*0.8}}
              />
            ))}

            <motion.div
              className="absolute w-72 h-72 rounded-full bg-cyan-400/20 blur-2xl"
              animate={{ scale:[1,1.3,1] }}
              transition={{ duration:2, repeat:Infinity }}
            />

            <motion.div
              className="absolute w-64 h-1 bg-cyan-400/70 blur-sm"
              animate={{ y:[-120,120,-120] }}
              transition={{ duration:3, repeat:Infinity }}
            />

            {userData?.assistantImage && (
              <motion.img
                src={userData.assistantImage}
                alt="Assistant"
                className="w-64 h-64 rounded-full object-cover
                           ring-4 ring-cyan-400
                           shadow-[0_0_40px_#0ff]"
                animate={{y:[0,-12,0],rotate:[0,1,-1,0]}}
                transition={{duration:6,repeat:Infinity}}
              />
            )}
          </motion.div>

          <motion.h2
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:1.2}}
            className="mt-6 text-3xl font-bold">
            {userData?.assistantName || "Your AI"}
          </motion.h2>

          <motion.pre
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:1.6}}
            className="mt-4 font-mono whitespace-pre-line
                       drop-shadow-[0_0_8px_#0ff]
                       min-h-[70px]">
            {text}
          </motion.pre>

          {/* BUTTONS */}
          <motion.div
            initial={{opacity:0,y:20}}
            animate={{opacity:1,y:0}}
            transition={{delay:2}}
            className="flex gap-6 mt-10 w-[350px]">

            <motion.button
              whileHover={{scale:1.12,y:-2}}
              whileTap={{scale:0.95}}
              onClick={()=>navigate("/customize")}
              className="flex-1 bg-cyan-500/80 hover:bg-cyan-400
                         text-black py-3 rounded-full font-bold
                         shadow-[0_0_25px_#0ff]">
              Customize
            </motion.button>

            <motion.button
              whileHover={{scale:1.12,y:-2}}
              whileTap={{scale:0.95}}
              onClick={handleLogout}
              className="flex-1 bg-red-500/80 hover:bg-red-400
                         text-white py-3 rounded-full font-bold">
              Logout
            </motion.button>

          </motion.div>
        </div>
      )}

      <style>{`
        .bgZoom{
          background:url(${p3}) center/cover no-repeat;
          animation:bgZoom 25s infinite alternate ease-in-out;
          z-index:-1;
        }

        @keyframes bgZoom{
          from{transform:scale(1)}
          to{transform:scale(1.08)}
        }

        .matrix{
          background: repeating-linear-gradient(
            to bottom,
            rgba(0,255,255,0.15) 0px,
            rgba(0,255,255,0.15) 2px,
            transparent 2px,
            transparent 20px
          );
          animation:rain 10s linear infinite;
        }

        @keyframes rain{
          from{background-position-y:0}
          to{background-position-y:1000px}
        }

        .hud{
          position:absolute;
          width:80px;height:80px;
          border-color:#22d3ee;opacity:0.6;
        }
        .tl{top:20px;left:20px;border-top:3px solid;border-left:3px solid;}
        .tr{top:20px;right:20px;border-top:3px solid;border-right:3px solid;}
        .bl{bottom:20px;left:20px;border-bottom:3px solid;border-left:3px solid;}
        .br{bottom:20px;right:20px;border-bottom:3px solid;border-right:3px solid;}
      `}</style>

    </div>
  );
}

export default Home;
