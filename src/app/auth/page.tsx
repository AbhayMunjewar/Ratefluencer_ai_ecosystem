"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Key,
  Globe,
  GitBranch,
} from "lucide-react";
import canvasConfetti from "canvas-confetti";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "verify" | "otp">("signin");
  
  // Form input states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  
  // Validation status
  const [loading, setLoading] = useState(false);

  const triggerSuccessConfetti = () => {
    canvasConfetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#7B61FF", "#00D4FF", "#00FFA3"],
    });
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      triggerSuccessConfetti();
      router.push("/dashboard");
    }, 1000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode("otp");
    }, 1000);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode("verify");
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(v => !v)) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      triggerSuccessConfetti();
      router.push("/dashboard");
    }, 1200);
  };

  const handleOtpChange = (val: string, index: number) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Focus next box automatically
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep text-[#F8FAFC] flex flex-col justify-center items-center p-4 relative bg-grid-pattern">
      {/* Glowing Mesh Orbs */}
      <div className="glow-orb glow-orb-purple w-[500px] h-[500px] -top-40 -left-40 opacity-20" />
      <div className="glow-orb glow-orb-cyan w-[500px] h-[500px] -bottom-40 -right-40 opacity-15" />

      {/* Main Glassmorphic Wrapper */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 animate-scale-up">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center space-y-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-indigo to-secondary-cyan flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Ratefluencer AI
            </span>
          </Link>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
            Enterprise Intelligence Gateway
          </span>
        </div>

        {/* State-based screens */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Welcome back</h2>
              <p className="text-xs text-slate-400">Sign in to resume campaign predictions.</p>
            </div>

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-slate-500">Business Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Password</label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[10px] text-primary-purple font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-xs font-bold text-white shadow-lg transition-all"
            >
              {loading ? "Verifying..." : "Sign In Workspace"}
            </button>

            {/* Social OAuth integrations */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800/60"></div>
              <span className="flex-shrink mx-4 text-[9px] uppercase font-bold text-slate-500">Or continue with</span>
              <div className="flex-grow border-t border-slate-800/60"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  triggerSuccessConfetti();
                  router.push("/dashboard");
                }}
                className="py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" /> Google
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerSuccessConfetti();
                  router.push("/dashboard");
                }}
                className="py-2.5 px-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-2"
              >
                <GitBranch className="w-4 h-4" /> GitHub
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 pt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-primary-purple font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </form>
        )}

        {mode === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Create Account</h2>
              <p className="text-xs text-slate-400">Join top marketing agencies deploying AI metrics.</p>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-slate-500">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Johnson"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-slate-500">Work Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-slate-500">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-xs font-bold text-white shadow-lg transition-all"
            >
              {loading ? "Registering..." : "Send Verification OTP"}
            </button>

            <p className="text-center text-xs text-slate-400 pt-4">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary-purple font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-black text-white">Reset Password</h2>
              <p className="text-xs text-slate-400">Enter email to receive security link.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase font-bold text-slate-500">Account Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet text-xs font-bold text-white shadow-lg"
            >
              {loading ? "Sending..." : "Send Link"}
            </button>

            <button
              type="button"
              onClick={() => setMode("signin")}
              className="w-full text-center text-xs text-slate-400 hover:text-white mt-2"
            >
              Back to Login
            </button>
          </form>
        )}

        {mode === "verify" && (
          <div className="space-y-6 text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-secondary-green/10 border border-secondary-green/20 flex items-center justify-center mx-auto text-secondary-green">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-white">Check Your Inbox</h2>
              <p className="text-xs text-slate-400">
                A verification link has been dispatched to your email address.
              </p>
            </div>
            <button
              onClick={() => setMode("signin")}
              className="py-2.5 px-6 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white"
            >
              Back to Sign In
            </button>
          </div>
        )}

        {mode === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-1.5 text-center">
              <div className="w-10 h-10 rounded-xl bg-primary-indigo/10 border border-primary-indigo/20 flex items-center justify-center mx-auto text-primary-indigo mb-2">
                <Key className="w-5 h-5 animate-pulse" />
              </div>
              <h2 className="text-lg font-black text-white">Enter OTP</h2>
              <p className="text-xs text-slate-400">
                We sent a 4-digit code to verify your credentials.
              </p>
            </div>

            {/* OTP input boxes */}
            <div className="flex justify-center gap-4">
              {otp.map((num, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  maxLength={1}
                  required
                  value={num}
                  onChange={(e) => handleOtpChange(e.target.value, idx)}
                  className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl text-center text-lg font-extrabold text-white focus:outline-none focus:border-primary-purple"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otp.some(v => !v)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-xs font-bold text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Verify OTP & Continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
