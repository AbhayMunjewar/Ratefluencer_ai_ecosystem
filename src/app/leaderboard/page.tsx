"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  Trophy,
  Award,
  TrendingUp,
  ShieldCheck,
  Camera,
  Video,
  Tv,
  Briefcase,
  ArrowRight,
  Filter,
  Star,
} from "lucide-react";

// Full leaderboard database
const leaderboardDatabase = [
  { rank: 1, id: "zachking", name: "Zach King", username: "@zachking", platform: "Instagram", score: 91, growth: "+8.3%", authenticity: 88, engagement: "8.7%", avatar: "ZK", category: "Entertainment" },
  { rank: 2, id: "mrbeast", name: "MrBeast", username: "@mrbeast", platform: "YouTube", score: 94, growth: "+12.5%", authenticity: 92, engagement: "4.2%", avatar: "MB", category: "Entertainment" },
  { rank: 3, id: "charlidamelio", name: "Charli D'Amelio", username: "@charlidamelio", platform: "TikTok", score: 93, growth: "+5.7%", authenticity: 90, engagement: "6.3%", avatar: "CD", category: "Fashion" },
  { rank: 4, id: "kimberlyloaiza", name: "Kimberly Loaiza", username: "@kimberly.loaiza", platform: "TikTok", score: 92, growth: "+6.2%", authenticity: 91, engagement: "6.8%", avatar: "KL", category: "Lifestyle" },
  { rank: 5, id: "mkbhd", name: "Marques Brownlee", username: "@mkbhd", platform: "YouTube", score: 90, growth: "+9.1%", authenticity: 88, engagement: "5.8%", avatar: "M", category: "Tech" },
  { rank: 6, id: "fitnessblender", name: "Fitness Blender", username: "@fitnessblender", platform: "YouTube", score: 89, growth: "+15.2%", authenticity: 85, engagement: "6.1%", avatar: "FB", category: "Fitness" },
  { rank: 7, id: "garyvee", name: "Gary Vaynerchuk", username: "@garyvee", platform: "LinkedIn", score: 87, growth: "+11.4%", authenticity: 82, engagement: "3.2%", avatar: "GV", category: "Business" },
];

export default function Leaderboard() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filtering criteria
  const filteredLeaderboard = leaderboardDatabase
    .filter((item) => {
      const matchesPlatform = selectedPlatform === "All" || item.platform === selectedPlatform;
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      return matchesPlatform && matchesCategory;
    })
    // Sort descending by score
    .sort((a, b) => b.score - a.score)
    // Remap temporary visual ranks
    .map((item, idx) => ({ ...item, displayRank: idx + 1 }));

  const getPlatformIcon = (plat: string) => {
    switch (plat) {
      case "Instagram":
        return <Camera className="w-3.5 h-3.5 text-pink-500" />;
      case "YouTube":
        return <Video className="w-3.5 h-3.5 text-red-500" />;
      case "TikTok":
        return <Tv className="w-3.5 h-3.5 text-cyan-400" />;
      case "LinkedIn":
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-[#FFD700] fill-[#FFD700]/20"; // Gold
    if (rank === 2) return "text-[#C0C0C0] fill-[#C0C0C0]/20"; // Silver
    if (rank === 3) return "text-[#CD7F32] fill-[#CD7F32]/20"; // Bronze
    return "text-slate-500";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-scale-up">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Ratefluencer Leaderboard
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Global competitive rankings sorted by our proprietary Ratefluencer Score™ value.
            </p>
          </div>

          {/* Platforms Tabs Selection */}
          <div className="flex gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
            {["All", "Instagram", "YouTube", "TikTok", "LinkedIn"].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${
                  selectedPlatform === p ? "bg-primary-purple text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Filter Niche:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-3 text-xs text-slate-300 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Fitness">Fitness</option>
              <option value="Fashion">Fashion</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Tech">Tech</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Audience index active
          </span>
        </div>

        {/* Rankings Table Grid */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 w-20 text-center">Rank</th>
                  <th className="py-4 px-6">Influencer</th>
                  <th className="py-4 px-4">Platform</th>
                  <th className="py-4 px-4 text-center">Ratefluencer Score</th>
                  <th className="py-4 px-4 text-center">Authenticity Index</th>
                  <th className="py-4 px-4 text-center">Engagement Rate</th>
                  <th className="py-4 px-4 text-center">Growth Rate</th>
                  <th className="py-4 px-6 text-right">Profile Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-500 font-medium">
                      No influencers found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/35 transition-colors group">
                      {/* Rank Column */}
                      <td className="py-4 px-6 text-center font-bold">
                        {item.displayRank <= 3 ? (
                          <div className="flex items-center justify-center">
                            <Trophy className={`w-5 h-5 ${getMedalColor(item.displayRank)}`} />
                          </div>
                        ) : (
                          <span className="text-slate-400">{item.displayRank}</span>
                        )}
                      </td>

                      {/* Name Details */}
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-primary-purple border border-slate-700/60 group-hover:border-primary-purple/40">
                          {item.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{item.name}</span>
                          <span className="text-[10px] text-slate-500 block">{item.username}</span>
                        </div>
                      </td>

                      {/* Platform Tag */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800/60 text-[10px] font-semibold text-slate-300">
                          {getPlatformIcon(item.platform)}
                          {item.platform}
                        </span>
                      </td>

                      {/* Ratefluencer Score Gauge */}
                      <td className="py-4 px-4 text-center font-extrabold text-white text-sm">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-primary-indigo/10 border border-primary-indigo/20 text-primary-purple">
                          {item.score}
                        </span>
                      </td>

                      {/* Authenticity Score */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-white">
                          <ShieldCheck className="w-3.5 h-3.5 text-secondary-green" />
                          {item.authenticity}
                        </span>
                      </td>

                      {/* Engagement Rate */}
                      <td className="py-4 px-4 text-center font-bold text-white">{item.engagement}</td>

                      {/* Growth Rate */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-secondary-green font-bold">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {item.growth}
                        </span>
                      </td>

                      {/* Action View */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/influencer/${item.id}`}
                          className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-slate-800/60 hover:bg-primary-purple text-[10px] font-bold text-slate-300 hover:text-white transition-all"
                        >
                          Analyze
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
