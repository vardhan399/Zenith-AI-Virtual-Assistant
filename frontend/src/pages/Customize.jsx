import React, { useRef, useContext } from "react";
import { motion } from "framer-motion";
import Card from "../components/Card";
import p3 from "../assets/p3.jpg";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

import i1 from "../assets/i1.jpg";
import i3 from "../assets/i3.jpg";
import i5 from "../assets/i5.jpg";
import i6 from "../assets/i6.jpg";
import i9 from "../assets/i9.jpg";
import i10 from "../assets/i10.jpg";
import i11 from "../assets/i11.jpg";
import i12 from "../assets/i12.jpg";
import i13 from "../assets/i13.jpg";

const avatars = [i1,i3,i5,i6,i9,i10,i11,i12,i13];

function Customize() {

  const {
    selected,
    setSelected,
    backendImage,
    setBackendImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();
  const inputImage = useRef(null);

  // ✅ FIX 1: uploading clears preset
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBackendImage(file);
    setSelected(null);
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-center relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage:`url(${p3})` }}
    >

      <div className="absolute inset-0 bg-black/75"></div>

      <div className="absolute inset-0 
        bg-[radial-gradient(circle,_#0ff_1px,_transparent_1px)]
        bg-[size:30px_30px]
        opacity-20 animate-[moveBg_25s_linear_infinite]" />

      <div className="
        relative backdrop-blur-2xl bg-white/5
        border border-cyan-400/30
        p-10 rounded-2xl w-[950px]
        shadow-[0_0_40px_rgba(0,255,255,0.25)]
      ">

        <button
          onClick={()=>navigate("/")}
          className="absolute top-5 left-5 text-cyan-300
                     hover:text-white text-2xl
                     hover:scale-125 transition
                     drop-shadow-[0_0_8px_#0ff]"
        >
          ←
        </button>

        <div className="flex justify-center mb-6 gap-3">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#0ff]"></div>
          <div className="w-3 h-3 bg-white/20 rounded-full"></div>
          <div className="w-3 h-3 bg-white/20 rounded-full"></div>
        </div>

        <h1 className="text-4xl font-extrabold text-center mb-8 text-white">
          Choose Your{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            AI Avatar
          </span>
        </h1>

        {selected && (
          <div className="flex flex-col items-center mb-8">
            <p className="text-cyan-300 mb-3">Selected Avatar</p>

            <motion.img
              src={selected}
              className="w-36 h-36 rounded-full object-cover
                         ring-4 ring-cyan-400
                         shadow-[0_0_25px_#0ff]"
              animate={{ y:[0,-10,0] }}
              transition={{ duration:4, repeat:Infinity }}
            />
          </div>
        )}

        <div className="grid grid-cols-6 gap-8 justify-items-center">

          {avatars.map((img) => (
            <div
              key={img}
              // ✅ FIX 2: preset clears upload
              onClick={()=>{
                setSelected(img);
                setBackendImage(null);
              }}
              className={`cursor-pointer transition-all duration-200 hover:scale-110
                ${selected===img
                  ? "ring-4 ring-cyan-400 rounded-full shadow-[0_0_20px_#0ff]"
                  : ""}`}
            >
              <div className="w-28 h-28 rounded-full overflow-hidden">
                <Card image={img}/>
              </div>
            </div>
          ))}

          <div
            onClick={()=>inputImage.current.click()}
            className="w-28 h-28 rounded-full flex items-center justify-center
                       border-2 border-dashed border-cyan-400
                       text-cyan-300 cursor-pointer
                       hover:scale-110 hover:bg-cyan-400/10
                       transition text-4xl overflow-hidden"
          >
            {!backendImage && "+"}

            {backendImage && (
              <img
                src={URL.createObjectURL(backendImage)}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={inputImage}
            hidden
            onChange={handleImage}
          />

        </div>

        {(selected || backendImage) && (
          <button
            onClick={()=>navigate("/customize2")}
            className="mt-10 w-full
                       bg-gradient-to-r from-blue-500 to-cyan-400
                       hover:from-blue-600 hover:to-cyan-500
                       text-white py-3 rounded-full
                       font-semibold cursor-pointer
                       shadow-[0_0_25px_#0ff]
                       hover:scale-105 transition"
          >
            Continue Initialization
          </button>
        )}

      </div>

      <style>{`
        @keyframes moveBg {
          from { background-position:0 0; }
          to { background-position:600px 600px; }
      `}</style>

    </div>
  );
}

export default Customize;
