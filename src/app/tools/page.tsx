"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Sparkles,
  BarChart3,
  MessageSquare,
  FileDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Copy,
  ChevronRight,
  Flame,
  Users,
} from "lucide-react";
import canvasConfetti from "canvas-confetti";

export default function AITools() {
  const [activeTool, setActiveTool] = useState("comparison");

  // Competitor Comparison state
  const [compA, setCompA] = useState("zachking");
  const [compB, setCompB] = useState("mrbeast");

  // Viral Predictor state
  const [viralText, setViralText] = useState("Giving away $50,000 to random subscribers who watch this video until the end!");
  const [predicting, setPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  // AI Clone state
  const [cloneMsg, setCloneMsg] = useState("");
  const [cloneLog, setCloneLog] = useState<any[]>([
    { sender: "clone", text: "Yo! It's Zach here. What kind of digital magic are we planning to build today?" },
  ]);

  // Media Kit PDF trigger
  const [exporting, setExporting] = useState(false);

  const handleExportMediaKit = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#7B61FF", "#00D4FF", "#00FFA3"],
      });
    }, 1500);
  };

  const handleViralPredict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viralText) return;
    setPredicting(true);
    setPredictionResult(null);

    setTimeout(() => {
      setPredicting(false);
      setPredictionResult({
        score: 92,
        tier: "Highly Viral",
        reasoning: "Exceptional hook formatting. Financial CTAs combined with watch time retention hooks ('until the end') historically score in the top 8% of YouTube and TikTok feeds.",
        time: "Optimal posting time: 5:00 PM EST (Wednesday)",
      });
    }, 1200);
  };

  const handleSendToClone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneMsg.trim()) return;

    const userText = cloneMsg;
    setCloneLog((prev) => [...prev, { sender: "user", text: userText }]);
    setCloneMsg("");

    setTimeout(() => {
      setCloneLog((prev) => [
        ...prev,
        {
          sender: "clone",
          text: `Haha, that's awesome! Let's definitely do it. But we need to make sure the visual cut feels completely seamless. Maybe I disappear into a Nike shoe? What do you think?`,
        },
      ]);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-scale-up">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Winning Features Suite
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test virality indices, compare creators, synthesize clones, and generate exportable media portfolios.
          </p>
        </div>

        {/* Tools Navigator Menu */}
        <div className="flex flex-wrap gap-2.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/80 overflow-x-auto max-w-full">
          {[
            { id: "comparison", label: "Competitor Compare", icon: BarChart3 },
            { id: "clone", label: "AI Influencer Clone", icon: MessageSquare },
            { id: "mediakit", label: "Portfolio Builder", icon: FileDown },
            { id: "viral", label: "Viral Predictor", icon: Flame },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTool === t.id
                  ? "bg-primary-purple text-white shadow-md shadow-primary-purple/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tools Workspace Render */}
        {activeTool === "comparison" && (
          <div className="space-y-6">
            {/* Quick compare parameters */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Creator A Selection */}
              <div className="p-4 rounded-2xl glass-panel space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Creator A</label>
                <select
                  value={compA}
                  onChange={(e) => setCompA(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                >
                  <option value="zachking">Zach King (Instagram)</option>
                  <option value="mrbeast">MrBeast (YouTube)</option>
                  <option value="fitnessblender">Fitness Blender (YouTube)</option>
                  <option value="kimberlyloaiza">Kimberly Loaiza (TikTok)</option>
                </select>
              </div>

              {/* Creator B Selection */}
              <div className="p-4 rounded-2xl glass-panel space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Creator B</label>
                <select
                  value={compB}
                  onChange={(e) => setCompB(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white"
                >
                  <option value="mrbeast">MrBeast (YouTube)</option>
                  <option value="zachking">Zach King (Instagram)</option>
                  <option value="fitnessblender">Fitness Blender (YouTube)</option>
                  <option value="kimberlyloaiza">Kimberly Loaiza (TikTok)</option>
                </select>
              </div>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/40 p-6 space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Side-by-Side Metric Matrix</h3>
              <div className="grid grid-cols-3 gap-4 text-center items-center pb-3 border-b border-slate-800/40 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <span>Zach King</span>
                <span>Metric Dimensions</span>
                <span>MrBeast</span>
              </div>

              {[
                { name: "Ratefluencer Score", a: "91 / 100", b: "94 / 100", high: "b" },
                { name: "Followers Reach", a: "24.6M", b: "225M", high: "b" },
                { name: "Engagement Rate", a: "8.7%", b: "4.2%", high: "a" },
                { name: "Authenticity Score", a: "88 / 100", b: "92 / 100", high: "b" },
                { name: "Growth Rate", a: "+8.3%", b: "+12.5%", high: "b" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 text-center items-center text-xs py-2">
                  <span className={`font-black ${row.high === "a" ? "text-secondary-green" : "text-white"}`}>
                    {row.a}
                  </span>
                  <span className="text-slate-400 font-semibold">{row.name}</span>
                  <span className={`font-black ${row.high === "b" ? "text-secondary-green" : "text-white"}`}>
                    {row.b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTool === "clone" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Clone selection details */}
            <div className="lg:col-span-4 p-6 rounded-3xl glass-panel space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-purple" />
                Active Clone Target
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-850 flex items-center justify-center font-bold text-xs text-primary-purple border border-slate-700">
                    ZK
                  </div>
                  <div>
                    <strong className="text-xs text-white">Zach King Clone</strong>
                    <span className="text-[10px] text-slate-500 block">Tone: Enthusiastic, VFX-heavy, collaborative</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 leading-normal bg-primary-indigo/10 border border-primary-indigo/20 p-4 rounded-xl">
                🧠 <strong>AI Persona Cloning:</strong> Clones are compiled by indexing previous video descriptions, podcast scripts, and comment threads. Useful for running pre-outreach simulations.
              </div>
            </div>

            {/* Chatbot Interface */}
            <div className="lg:col-span-8 h-[380px] rounded-3xl glass-panel overflow-hidden border border-slate-800 flex flex-col justify-between">
              {/* Chat log */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {cloneLog.map((log, idx) => (
                  <div key={idx} className={`flex gap-3 ${log.sender === "user" ? "justify-end" : "justify-start"}`}>
                    {log.sender === "clone" && (
                      <div className="w-7 h-7 rounded-lg bg-primary-indigo flex items-center justify-center font-black text-[10px] text-white">
                        ZK
                      </div>
                    )}
                    <div className={`p-3 rounded-2xl text-xs max-w-sm border ${
                      log.sender === "user"
                        ? "bg-primary-purple border-primary-purple text-white rounded-tr-none"
                        : "bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none"
                    }`}>
                      {log.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-800/40 bg-slate-950/20">
                <form onSubmit={handleSendToClone} className="flex gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                  <input
                    type="text"
                    value={cloneMsg}
                    onChange={(e) => setCloneMsg(e.target.value)}
                    placeholder="Pitch your marketing offer to Zach's clone..."
                    className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                  <button type="submit" className="p-1 rounded bg-primary-purple text-white">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTool === "mediakit" && (
          <div className="p-8 rounded-3xl glass-panel border border-slate-800 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-secondary-cyan/10 border border-secondary-cyan/20 flex items-center justify-center">
              <FileDown className="w-8 h-8 text-secondary-cyan animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Influencer Media Kit Portfolio Generator</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Generate and export an aggregated PDF portfolio for Zach King, featuring audience demography graphics, engagement averages, brand safety score sheets, and AI forecast targets.
              </p>
            </div>

            <button
              onClick={handleExportMediaKit}
              disabled={exporting}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet text-xs font-bold text-white hover:scale-102 transition-all shadow-lg"
            >
              {exporting ? "Compiling Media Kit PDF..." : "Export Media Portfolio (PDF)"}
            </button>
          </div>
        )}

        {activeTool === "viral" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Input fields */}
            <div className="lg:col-span-5 p-6 rounded-3xl glass-panel space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Analyze Caption Virality
              </h3>

              <form onSubmit={handleViralPredict} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Caption Text / Title</label>
                  <textarea
                    rows={4}
                    value={viralText}
                    onChange={(e) => setViralText(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-purple"
                  />
                </div>
                <button
                  type="submit"
                  disabled={predicting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-xs font-bold text-white"
                >
                  {predicting ? "Running Virality Engine..." : "Analyze Virality Index"}
                </button>
              </form>
            </div>

            {/* Results output */}
            <div className="lg:col-span-7 p-6 rounded-3xl glass-panel flex flex-col justify-between min-h-[280px]">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">
                  Virality Potential Projection
                </h3>
              </div>

              {predictionResult ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Virality Score</span>
                      <span className="text-2xl font-black text-secondary-green">{predictionResult.score}%</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Velocity Class</span>
                      <span className="text-lg font-black text-white">{predictionResult.tier}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                    💡 <strong>AI Explanation:</strong> {predictionResult.reasoning}
                  </p>

                  <div className="text-xs font-semibold text-secondary-cyan">
                    📅 {predictionResult.time}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 font-medium">
                  Enter caption text and click Predict to view virality estimates.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
