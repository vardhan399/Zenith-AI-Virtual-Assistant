import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import p3 from "../assets/p3.jpg";
import { userDataContext } from "../context/UserContext";

function SignIn() {
  const { serverUrl, setUserData } = useContext(userDataContext);
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${serverUrl}/api/auth/login`,
        {
          email: email.toLowerCase(), // ✅ normalize
          password
        },
        { withCredentials: true }
      );

      setUserData(res.data);
      setLoading(false);

      navigate("/customize"); // ✅ correct navigation
    } catch (error) {
      console.error("Login failed:", error);
      setUserData(null);
      setLoading(false);
      setErr(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div
      className="w-full h-screen flex justify-center items-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${p3})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-black to-blue-900/30 animate-pulse"></div>

      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-2xl w-[400px] shadow-[0_0_40px_rgba(59,130,246,0.4)]">

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl opacity-70"></div>
        </div>

        <h2 className="text-4xl font-extrabold text-white text-center mb-8">
          Resume With{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Zenith AI
          </span>
        </h2>

        <form onSubmit={handleSignIn} className="flex flex-col gap-6">

          <div className="relative">
            <input
              type="email"
              required
              className="peer w-full px-4 py-3 bg-transparent border-b border-white/40 text-white outline-none"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
            <label className="absolute left-4 -top-5 text-sm text-gray-400">
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required
              className="w-full px-4 py-3 bg-transparent border-b border-white/40 text-white outline-none"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <label className="absolute left-4 -top-5 text-sm text-gray-400">
              Password
            </label>

            {showPass ? (
              <FaEyeSlash
                onClick={() => setShowPass(false)}
                className="absolute right-4 top-4 text-white cursor-pointer"
              />
            ) : (
              <FaEye
                onClick={() => setShowPass(true)}
                className="absolute right-4 top-4 text-white cursor-pointer"
              />
            )}
          </div>

          {err && (
            <p className="text-red-500 text-sm text-center">*{err}</p>
          )}

          <button
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 hover:scale-105 transition text-white py-3 rounded-full font-semibold shadow-[0_0_20px_rgba(59,130,246,0.6)]"
          >
            {loading ? "Connecting..." : "Connect to AI"}
          </button>

          <p className="text-gray-400 text-sm text-center">
            🔒 Secure AI authentication
          </p>

          <p className="text-gray-400 text-sm text-center">
            New here?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Initialize Zenith AI Account
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

export default SignIn;
