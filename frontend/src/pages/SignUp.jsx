import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import p3 from "../assets/p3.jpg";
import { userDataContext } from "../context/UserContext";
import axios from "axios";

function SignUp() {
    const [showPass, setShowPass] = useState(false);
    const { serverUrl, userData, setUserData } = useContext(userDataContext);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");

    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            const result = await axios.post(
                `${serverUrl}/api/auth/signup`,
                {
                    name: name.trim(),
                    email: email.trim(),
                    password: password.trim()
                },
                { withCredentials: true }
            );

            setUserData(result.data);
            setLoading(false);
            navigate("/customize");
        }
        catch (error) {
            console.error("Signup failed:", error);
            setUserData(null);
            setLoading(false);

            setErr(
                error?.response?.data?.message ||
                "Signup failed. Try again."
            );
        }
    };

    return (
        <div
            className="w-full h-screen flex justify-center items-center bg-cover bg-center relative"
            style={{ backgroundImage: `url(${p3})` }}
        >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60"></div>

            {/* Animated gradient layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 via-black to-blue-900/30 animate-pulse"></div>

            {/* Card */}
            <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 p-10 rounded-2xl w-[400px] shadow-[0_0_40px_rgba(59,130,246,0.4)] hover:shadow-blue-500/40 transition duration-500">

                {/* AI Glow Logo */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-blue-500 rounded-full blur-xl opacity-70"></div>
                </div>

                {/* Heading */}
                <h2 className="text-4xl font-extrabold text-white text-center mb-8 drop-shadow-lg">
                    Initialize{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                        Zenith AI Account
                    </span>
                </h2>

                <form className="flex flex-col gap-6" onSubmit={handleSignUp}>

                    {/* Name */}
                    <div className="relative">
                        <input
                            type="text"
                            required
                            className="peer w-full px-4 py-3 bg-transparent border-b border-white/40 text-white outline-none"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                        />
                        <label className="absolute left-4 -top-5 text-sm text-gray-400 peer-focus:text-blue-400 transition">
                            Identity Name
                        </label>
                    </div>

                    {/* Email */}
                    <div className="relative">
                        <input
                            type="email"
                            required
                            className="peer w-full px-4 py-3 bg-transparent border-b border-white/40 text-white outline-none"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                        <label className="absolute left-4 -top-5 text-sm text-gray-400 peer-focus:text-blue-400 transition">
                            Email Address
                        </label>
                    </div>

                    {/* Password */}
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
                                className="absolute right-4 top-4 text-white cursor-pointer hover:text-blue-400"
                            />
                        ) : (
                            <FaEye
                                onClick={() => setShowPass(true)}
                                className="absolute right-4 top-4 text-white cursor-pointer hover:text-blue-400"
                            />
                        )}
                    </div>

                    {err.length > 0 && (
                        <p className="text-red-500 text-sm text-center">* {err}</p>
                    )}

                    {/* Button */}
                    <button
                        className="bg-blue-500 hover:bg-blue-600 hover:scale-105 transition duration-300 text-white py-3 rounded-full font-semibold shadow-[0_0_20px_rgba(59,130,246,0.6)]"
                        disabled={loading}
                    >
                        {loading ? "Connecting..." : "Connect to AI"}
                    </button>

                    {/* Trust line */}
                    <p className="text-gray-400 text-sm text-center">
                        🔒 Your data is encrypted & secure
                    </p>

                    <p className="text-gray-400 text-sm text-center">
                        Already have an account?{" "}
                        <Link
                            to="/signin"
                            className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                            Sign In
                        </Link>
                    </p>

                </form>
            </div>
        </div>
    );
}

export default SignUp;
