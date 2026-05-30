"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Handshake,
  Cpu,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

// Predefined brand database with mock embeddings results
const brandsDatabase: Record<string, any> = {
  Nike: {
    score: 95,
    overlap: 92,
    niche: 98,
    relevance: 96,
    campaign: 94,
    reasoning: "Exceptional alignment. Over 74% of the creator's audience interacts with fitness, performance apparel, and athletic video challenges. Semantic embeddings from captions map directly to Nike's core brand values: discipline, grit, and athletic growth.",
    proposals: [
      "Launch a 'Magic Transformation' short-form video featuring Nike Pegasus running shoes appearing on feet via a visual stunt.",
      "Execute an interactive challenge encouraging viewers to share their workout setup with the brand hashtag.",
    ],
  },
  Gymshark: {
    score: 88,
    overlap: 90,
    niche: 92,
    relevance: 85,
    campaign: 85,
    reasoning: "Strong fit in the activewear and lifestyle space. The audience demographic centers on 18-24 fitness enthusiasts who actively follow workout apparel brand campaigns.",
    proposals: [
      "Sponsor a 'Behind the Scenes' vlog of a full weekly workout routine highlighting Gymshark apparel fits.",
    ],
  },
  Spotify: {
    score: 74,
    overlap: 80,
    niche: 70,
    relevance: 72,
    campaign: 74,
    reasoning: "Moderate alignment. The creator's background music and high video pace correlate with Spotify playlist placements and music discoveries.",
    proposals: [
      "Create a custom workout/editing playlist on Spotify and share a transition video matching the track beats.",
    ],
  },
  RedBull: {
    score: 91,
    overlap: 88,
    niche: 95,
    relevance: 90,
    campaign: 91,
    reasoning: "Excellent lifestyle fit. The creator's extreme challenges, VFX tricks, and high energy sync precisely with Red Bull's brand positioning of limit-pushing adventures.",
    proposals: [
      "Perform a visual effects stunt making a Red Bull can float and spin in mid-air before a workout session.",
    ],
  },
};

export default function BrandMatching() {
  const [selectedBrand, setSelectedBrand] = useState("Nike");
  const [customBrand, setCustomBrand] = useState("");
  const [scanning, setScanning] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const activeData = brandsDatabase[selectedBrand] || brandsDatabase.Nike;

  // Render variables for graph
  const barData = [
    { name: "Audience Overlap", value: activeData.overlap, color: "#7B61FF" },
    { name: "Niche Fit", value: activeData.niche, color: "#00D4FF" },
    { name: "Content Relevance", value: activeData.relevance, color: "#00FFA3" },
    { name: "Campaign Fit", value: activeData.campaign, color: "#FFB800" },
  ];

  const handleScan = (brandName: string) => {
    setScanning(true);
    setTimeout(() => {
      setSelectedBrand(brandName);
      setScanning(false);
    }, 1200);
  };

  const handleCopyProposal = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-scale-up">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            AI Brand Matching Engine
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query social profile captions, posts, and comments against brand values via vector embeddings.
          </p>
        </div>

        {/* Input Scan Section */}
        <div className="p-6 rounded-3xl glass-panel space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mr-3">
              Select Profile Target:
            </span>
            {["Nike", "RedBull", "Gymshark", "Spotify"].map((b) => (
              <button
                key={b}
                onClick={() => handleScan(b)}
                disabled={scanning}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedBrand === b
                    ? "bg-primary-purple/20 border-primary-purple text-white shadow-md shadow-primary-purple/5"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex gap-4 border-t border-slate-800/40 pt-6">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                placeholder="Query custom brand (e.g. Adidas)..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-primary-purple"
              />
            </div>
            <button
              onClick={() => {
                if (customBrand) {
                  handleScan(customBrand);
                  setCustomBrand("");
                }
              }}
              disabled={scanning}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet text-xs font-bold text-white shadow-md"
            >
              Analyze Vector Overlap
            </button>
          </div>
        </div>

        {/* Scan Status OR Results Render */}
        {scanning ? (
          <div className="py-20 text-center space-y-4">
            <Activity className="w-10 h-10 text-primary-purple mx-auto animate-spin" />
            <h3 className="font-bold text-white">Running Semantic Embedding Similarity Match...</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scanning post caption indexes and RAG comment graphs against brand keyword indices.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Similarity Gauge Score */}
              <div className="lg:col-span-4 p-6 rounded-3xl glass-panel flex flex-col items-center justify-center text-center relative overflow-hidden">
                <span className="absolute top-4 left-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Vector Match Alignment
                </span>

                <div className="relative w-32 h-32 flex items-center justify-center my-6">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="#161b30" strokeWidth="6" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      fill="none"
                      stroke="#7B61FF"
                      strokeWidth="6"
                      strokeDasharray={301}
                      strokeDashoffset={301 - (activeData.score / 100) * 301}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white">{activeData.score}%</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                      Similarity
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-primary-purple/10 border border-primary-purple/30 text-[10px] font-bold text-primary-purple">
                  High Fit Probability
                </div>
              </div>

              {/* Similarity Parameter Radar replacement (Recharts bar chart) */}
              <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Embedding Similarity Dimensions
                </h3>

                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: -10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                      <XAxis type="number" stroke="#475569" fontSize={8} domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" stroke="#475569" fontSize={9} width={90} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7B61FF" radius={[0, 4, 4, 0]} barSize={16}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Reasoning and Proposals */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Reasoning */}
              <div className="lg:col-span-6 p-6 rounded-3xl glass-panel space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-secondary-cyan" />
                    RAG Keyword Overlap Analysis
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeData.reasoning}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/40 text-[9px] text-slate-500 font-semibold leading-normal">
                  💡 <strong>Vector Formula:</strong> Cosine similarity computed on word token matrices from Instagram bio + past 20 image caption segments.
                </div>
              </div>

              {/* Proposals list */}
              <div className="lg:col-span-6 p-6 rounded-3xl glass-panel space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-secondary-green" />
                  AI Collaboration Pitch Ideas
                </h3>

                <div className="space-y-4">
                  {activeData.proposals.map((prop: string, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 space-y-3 relative group">
                      <p className="text-xs text-slate-200 leading-normal pr-8">{prop}</p>
                      <button
                        onClick={() => handleCopyProposal(prop, idx)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                        title="Copy Pitch"
                      >
                        {copiedIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-secondary-green" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
