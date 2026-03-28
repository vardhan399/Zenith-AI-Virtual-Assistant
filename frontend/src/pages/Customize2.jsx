import React, { useContext, useState, useEffect } from "react";
import { userDataContext } from "../context/UserContext";
import { motion } from "framer-motion";
import p3 from "../assets/p3.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Customize2() {

  const navigate = useNavigate();

  const {
    serverUrl,
    userData,
    setUserData,
    selected,
    backendImage,
  } = useContext(userDataContext);

  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || ""
  );

  /* AI typing placeholder */
  const names = ["Zenith...", "NeonX...", "Astra...", "Orion..."];
  const [placeholder, setPlaceholder] = useState(names[0]);

  useEffect(() => {
    const int = setInterval(() => {
      setPlaceholder(names[Math.floor(Math.random()*names.length)]);
    }, 2000);
    return () => clearInterval(int);
  }, []);

  const handleUpdateAssistant = async () => {
    try{
      const formData = new FormData();

      formData.append("assistantName", assistantName);

      if(selected){
        formData.append("imageUrl", selected);
      }

      if(backendImage){
        formData.append("assistantImage", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/user/update`,
        formData,
        { withCredentials:true }
      );

      setUserData(result.data);
      navigate("/");

    }catch(err){
      console.log("Update failed:", err);
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-center relative overflow-hidden"
      style={{ backgroundImage:`url(${p3})`, backgroundSize:"cover" }}
    >

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/80"></div>

      {/* PARTICLE BG */}
      <div className="absolute inset-0 
        bg-[radial-gradient(circle,_#0ff_1px,_transparent_1px)]
        bg-[size:25px_25px]
        animate-[moveBg_20s_linear_infinite] opacity-30" />

      {/* CARD */}
      <div className="relative backdrop-blur-xl bg-black/40 
                      border border-cyan-400/30
                      p-10 rounded-2xl w-[750px]
                      shadow-[0_0_30px_#0ff]">

        {/* BACK BUTTON */}
        <button
          onClick={()=>navigate("/customize")}
          className="absolute top-5 left-5 text-cyan-300
                     hover:text-white text-2xl
                     hover:scale-125 transition
                     drop-shadow-[0_0_8px_#0ff]"
        >
          ←
        </button>

        {/* ✅ 3 STEP DOTS */}
        <div className="flex justify-center mb-6 gap-3">
          <div className="w-3 h-3 bg-white/20 rounded-full"></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#0ff]"></div>
          <div className="w-3 h-3 bg-white/20 rounded-full"></div>
        </div>

        <h1 className="text-4xl font-extrabold text-center mb-10
                       text-cyan-300 drop-shadow-[0_0_15px_#0ff]">
          Final Initialization
        </h1>

        <div className="grid grid-cols-2 gap-10 items-center">

          {/* FLOATING AVATAR */}
          <div className="flex flex-col items-center">
            <p className="text-cyan-300 mb-4">AI Core</p>

            {(selected || backendImage) && (
              <motion.img
                src={
                  backendImage
                    ? URL.createObjectURL(backendImage)
                    : selected
                }
                className="w-40 h-40 rounded-full object-cover
                           ring-4 ring-cyan-400
                           shadow-[0_0_25px_#0ff]"
                animate={{ y:[0,-12,0] }}
                transition={{ duration:4, repeat:Infinity }}
              />
            )}
          </div>

          {/* FORM */}
          <div>

            <p className="text-cyan-300 mb-3">AI Name</p>

            <input
              type="text"
              placeholder={placeholder}
              value={assistantName}
              onChange={(e)=>setAssistantName(e.target.value)}
              className="w-full px-4 py-3 bg-black/40
                         border-b border-cyan-400/50
                         text-cyan-200 outline-none
                         focus:border-cyan-300
                         focus:shadow-[0_0_15px_#0ff]
                         transition mb-8"
            />

            <button
              onClick={handleUpdateAssistant}
              className="relative w-full bg-cyan-500/80
                         hover:bg-cyan-400 text-black
                         py-3 rounded-full font-bold
                         cursor-pointer overflow-hidden
                         shadow-[0_0_20px_#0ff]
                         hover:scale-105 transition"
            >
              Initialize AI

              <span className="absolute inset-0
                               bg-gradient-to-r from-transparent via-white/40 to-transparent
                               translate-x-[-100%]
                               animate-[shimmer_2s_infinite]" />
            </button>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }

        @keyframes moveBg {
          from { background-position:0 0; }
          to { background-position:500px 500px; }
        }
      `}</style>

    </div>
  );
}

export default Customize2;
