"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Mock data showing engagement spikes (artificial bot additions vs organic curve)
const baselineData = [
  { day: "Day 1", organic: 4.2, anomaly: 4.2 },
  { day: "Day 2", organic: 4.5, anomaly: 4.3 },
  { day: "Day 3", organic: 4.1, anomaly: 4.1 },
  { day: "Day 4", organic: 4.8, anomaly: 18.5 }, // Artificial Spike!
  { day: "Day 5", organic: 4.3, anomaly: 9.8 },
  { day: "Day 6", organic: 4.6, anomaly: 4.8 },
  { day: "Day 7", organic: 4.2, anomaly: 4.3 },
];

export default function AuthenticityDetection() {
  const [username, setUsername] = useState("@creator_test");
  const [auditing, setAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(true);
  const [score, setScore] = useState(88);
  const [risk, setRisk] = useState("green"); // green, yellow, red

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setAuditing(true);
    setAuditComplete(false);

    setTimeout(() => {
      // Simulate audit results based on names
      const lower = username.toLowerCase();
      if (lower.includes("fake") || lower.includes("bot")) {
        setScore(34);
        setRisk("red");
      } else if (lower.includes("sus") || lower.includes("pod")) {
        setScore(62);
        setRisk("yellow");
      } else {
        setScore(Math.floor(Math.random() * 20) + 80);
        setRisk("green");
      }
      setAuditing(false);
      setAuditComplete(true);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-scale-up">
        {/* Header Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Fraud & Authenticity Audit
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify engagement pod loops, artificial follow spikes, and machine-activated accounts.
          </p>
        </div>

        {/* Audit Input Form */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <form onSubmit={handleAudit} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Audited Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter influencer username (e.g. @mrbeast)..."
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={auditing}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-xs font-bold text-white shadow-md shadow-primary-purple/10 disabled:opacity-50 min-w-[150px] transition-all"
            >
              {auditing ? "Auditing Network..." : "Start Bot Audit"}
            </button>
          </form>
        </div>

        {/* Audit Results View */}
        {auditComplete && (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Authenticity Score Gauge Card */}
              <div className="lg:col-span-4 p-6 rounded-3xl glass-panel flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="absolute top-4 left-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Audience Integrity Score
                </span>

                {/* Circular Score Circle */}
                <div className="relative w-32 h-32 flex items-center justify-center my-6">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="#161b30" strokeWidth="8" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      stroke={risk === "green" ? "#00FFA3" : risk === "yellow" ? "#FFB800" : "#FF5E5E"}
                      strokeWidth="8"
                      strokeDasharray={301}
                      strokeDashoffset={301 - (score / 100) * 301}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white">{score}</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                      Integrity
                    </span>
                  </div>
                </div>

                {/* Risk Alerts */}
                {risk === "green" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-green/10 text-xs font-bold text-secondary-green">
                    <ShieldCheck className="w-4 h-4" /> Verified Authentic
                  </span>
                )}
                {risk === "yellow" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-gold/10 text-xs font-bold text-accent-gold">
                    <AlertTriangle className="w-4 h-4" /> Suspicious Behavior
                  </span>
                )}
                {risk === "red" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-red/10 text-xs font-bold text-accent-red">
                    <ShieldAlert className="w-4 h-4" /> High Bot Risk
                  </span>
                )}
              </div>

              {/* Explanations Dashboard */}
              <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Sparkles className="w-4 h-4 text-primary-purple" />
                    AI Fraud Explanation
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {risk === "green" && (
                      "This account shows highly organic growth. The comment text features deep lexical variety, follower IP locations map cleanly to their primary geographic distributions, and post interaction curves align precisely with typical viewer timelines."
                    )}
                    {risk === "yellow" && (
                      "Attention required. We detected minor anomalies in comment repetitions and suspicious clumping of engagement from inactive profiles. Potential usage of engagement loops or pods observed."
                    )}
                    {risk === "red" && (
                      "Critical concern. Highly irregular growth spikes detected that do not match video impressions. Over 40% of engagements originate from click-farm servers. Lexical diversity in comments is extremely narrow, dominated by bot phrase repetitions."
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-800/40 pt-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Bot Ratio</span>
                    <span className="text-sm font-black text-white block">
                      {risk === "green" ? "2.1%" : risk === "yellow" ? "14.8%" : "54.2%"}
                    </span>
                  </div>
                  <div className="space-y-1 border-l border-slate-800/40 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Lexical Fit</span>
                    <span className="text-sm font-black text-white block">
                      {risk === "green" ? "92%" : risk === "yellow" ? "61%" : "18%"}
                    </span>
                  </div>
                  <div className="space-y-1 border-l border-slate-800/40 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">IP Overlap</span>
                    <span className="text-sm font-black text-white block">
                      {risk === "green" ? "Low" : risk === "yellow" ? "Medium" : "High"}
                    </span>
                  </div>
                  <div className="space-y-1 border-l border-slate-800/40 pl-4">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Pod Detection</span>
                    <span className="text-sm font-black text-white block">
                      {risk === "green" ? "Pass" : risk === "yellow" ? "Flagged" : "Fail"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Spike Chart visualization */}
            <div className="p-6 rounded-3xl glass-panel space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Engagement Topography Spike Anomaly
                  </h3>
                  <p className="text-[10px] text-slate-400">Comparing profile engagements to typical baseline curves</p>
                </div>
                <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-secondary-cyan rounded-full" /> Normal Baseline
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-1 bg-accent-red rounded-full" /> Profile Curve
                  </span>
                </div>
              </div>

              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={baselineData} margin={{ left: -20, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                    <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip
                      contentStyle={{ background: "#0b1020", border: "1px solid #1e293b", borderRadius: "12px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="organic"
                      stroke="#00D4FF"
                      strokeWidth={3}
                      name="Expected Baseline (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="anomaly"
                      stroke="#FF5E5E"
                      strokeWidth={3}
                      name="Observed Profile (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
