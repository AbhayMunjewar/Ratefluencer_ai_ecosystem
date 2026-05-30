"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  MapPin,
  Link as LinkIcon,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  Award,
  Video,
  Flame,
  ThumbsUp,
  MessageCircle,
  Share2,
  BarChart3,
  Users,
  Percent,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Shared database matching the search page
const database: Record<string, any> = {
  mrbeast: {
    id: "mrbeast",
    name: "MrBeast",
    username: "@mrbeast",
    platform: "YouTube",
    category: "Entertainment",
    country: "USA",
    followers: "225M",
    following: "284",
    avgLikes: "14.2M",
    engRate: "4.2%",
    views: "3.1B",
    growth: "+12.5%",
    bio: "I want to make the world a better place before I die.",
    avatar: "MB",
    location: "Greenville, NC, USA",
    website: "mrbeast.store",
    tags: ["Entertainment", "Stunts", "Philanthropy"],
    overviewStats: [
      { label: "Engagement Rate", val: "4.2%", desc: "Good for size", score: "75/100" },
      { label: "Average Likes", val: "14.2M", desc: "Top 0.01% globally", score: "99/100" },
      { label: "Average Comments", val: "185K", desc: "High conversation depth", score: "98/100" },
      { label: "Average Shares", val: "410K", desc: "Viral potential index", score: "99/100" },
    ],
    growthForecast: [
      { date: "Jan", followers: 200 },
      { date: "Feb", followers: 208 },
      { date: "Mar", followers: 215 },
      { date: "Apr", followers: 225 },
      { date: "May", followers: 236 },
      { date: "Jun", followers: 248 },
    ],
    contentType: [
      { name: "Extreme Challenges", value: 55, color: "#7B61FF" },
      { name: "Philanthropy Videos", value: 25, color: "#00D4FF" },
      { name: "Shorts", value: 15, color: "#8B5CF6" },
      { name: "Vlogs", value: 5, color: "#FFB800" },
    ],
  },
  zachking: {
    id: "zachking",
    name: "Zach King",
    username: "@zachking",
    platform: "Instagram",
    category: "Entertainment",
    country: "USA",
    followers: "24.6M",
    following: "393",
    avgLikes: "1.2M",
    engRate: "8.7%",
    views: "1.2M",
    growth: "+8.3%",
    bio: "Visual Effects Artist & filmmaker making digital magic.",
    avatar: "ZK",
    location: "Los Angeles, CA, USA",
    website: "zachking.com",
    tags: ["Entertainment", "Visual Effects", "Comedy"],
    overviewStats: [
      { label: "Engagement Rate", val: "8.7%", desc: "Excellent fit", score: "92/100" },
      { label: "Average Likes", val: "1.2M", desc: "Top 0.05% globally", score: "91/100" },
      { label: "Average Comments", val: "12.5K", desc: "Very Good", score: "88/100" },
      { label: "Average Shares", val: "45.3K", desc: "Excellent reach", score: "95/100" },
    ],
    growthForecast: [
      { date: "Jan", followers: 21.0 },
      { date: "Feb", followers: 22.1 },
      { date: "Mar", followers: 23.4 },
      { date: "Apr", followers: 24.6 },
      { date: "May", followers: 25.8 },
      { date: "Jun", followers: 27.2 },
    ],
    contentType: [
      { name: "Short Videos", value: 62, color: "#7B61FF" },
      { name: "Magic / VFX", value: 20, color: "#00D4FF" },
      { name: "Behind the Scenes", value: 10, color: "#8B5CF6" },
      { name: "Others", value: 8, color: "#FFB800" },
    ],
  },
  fitnessblender: {
    id: "fitnessblender",
    name: "Fitness Blender",
    username: "@fitnessblender",
    platform: "YouTube",
    category: "Fitness",
    country: "USA",
    followers: "8.3M",
    following: "120",
    avgLikes: "35K",
    engRate: "6.1%",
    views: "492M",
    growth: "+15.2%",
    bio: "Free workout videos for every fitness level. Health and happiness.",
    avatar: "FB",
    location: "Seattle, WA, USA",
    website: "fitnessblender.com",
    tags: ["Fitness", "Health", "Well-being"],
    overviewStats: [
      { label: "Engagement Rate", val: "6.1%", desc: "Very strong loyalty", score: "89/100" },
      { label: "Average Likes", val: "35K", desc: "High active participation", score: "85/100" },
      { label: "Average Comments", val: "1.8K", desc: "Supportive community", score: "82/100" },
      { label: "Average Shares", val: "14.2K", desc: "Shared across fitness groups", score: "88/100" },
    ],
    growthForecast: [
      { date: "Jan", followers: 7.1 },
      { date: "Feb", followers: 7.4 },
      { date: "Mar", followers: 7.8 },
      { date: "Apr", followers: 8.3 },
      { date: "May", followers: 8.9 },
      { date: "Jun", followers: 9.5 },
    ],
    contentType: [
      { name: "HIIT Workouts", value: 45, color: "#7B61FF" },
      { name: "Strength Routines", value: 30, color: "#00D4FF" },
      { name: "Meal Prep Advice", value: 15, color: "#8B5CF6" },
      { name: "Vlogs & Q&A", value: 10, color: "#FFB800" },
    ],
  },
  kimberlyloaiza: {
    id: "kimberlyloaiza",
    name: "Kimberly Loaiza",
    username: "@kimberly.loaiza",
    platform: "TikTok",
    category: "Lifestyle",
    country: "Mexico",
    followers: "82.7M",
    following: "432",
    avgLikes: "6.4M",
    engRate: "9.3%",
    views: "2.1M",
    growth: "+7.8%",
    bio: "Singer & video creator from MX. Love my fans!",
    avatar: "KL",
    location: "Mexico City, MX",
    website: "kimberlyloaiza.com",
    tags: ["Lifestyle", "Music", "Vlog"],
    overviewStats: [
      { label: "Engagement Rate", val: "9.3%", desc: "Outstanding size ratio", score: "96/100" },
      { label: "Average Likes", val: "6.4M", desc: "Top 0.02% TikTok", score: "98/100" },
      { label: "Average Comments", val: "54K", desc: "Strong fan interaction", score: "94/100" },
      { label: "Average Shares", val: "125K", desc: "Top distribution factor", score: "97/100" },
    ],
    growthForecast: [
      { date: "Jan", followers: 76.0 },
      { date: "Feb", followers: 78.2 },
      { date: "Mar", followers: 80.5 },
      { date: "Apr", followers: 82.7 },
      { date: "May", followers: 85.1 },
      { date: "Jun", followers: 87.8 },
    ],
    contentType: [
      { name: "Dance Videos", value: 50, color: "#7B61FF" },
      { name: "Music Clips", value: 30, color: "#00D4FF" },
      { name: "Comedy Skits", value: 12, color: "#8B5CF6" },
      { name: "Beauty Vlogs", value: 8, color: "#FFB800" },
    ],
  },
};

export default function InfluencerProfile() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || "zachking";

  const [creator, setCreator] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [mounted, setMounted] = useState(false);

  // Campaign predictor inputs
  const [budget, setBudget] = useState(15000);
  const [fitMatch, setFitMatch] = useState(90);

  useEffect(() => {
    setMounted(true);
    // Find creator or fallback to zachking
    const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (database[cleanId]) {
      setCreator(database[cleanId]);
    } else {
      setCreator(database.zachking);
    }
  }, [id]);

  if (!creator) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-500 font-bold">
          Searching Creator Directory...
        </div>
      </DashboardLayout>
    );
  }

  // Pre-calculated campaign success projections based on slider inputs
  const estReach = Math.floor(budget * (parseFloat(creator.followers) * 0.08) * 0.05);
  const estClicks = Math.floor(estReach * (parseFloat(creator.engRate) / 100) * 0.12);
  const conversionRate = 0.024; // 2.4% standard ROI conversion
  const estSales = Math.floor(estClicks * conversionRate);
  const estRevenueMin = estSales * 45; // average order size of $45
  const estRevenueMax = estSales * 80;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Card Header */}
        <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              {/* Profile Avatar */}
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center font-bold text-2xl text-primary-purple border-2 border-primary-purple/40">
                {creator.avatar}
              </div>

              {/* Identity metadata */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white">{creator.name}</h1>
                  <CheckCircle2 className="w-5 h-5 text-secondary-cyan fill-bg-deep" />
                </div>
                <span className="text-xs text-slate-400 font-medium block">
                  {creator.username}
                </span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {creator.location}
                  </span>
                  <a
                    href={`https://${creator.website}`}
                    target="_blank"
                    className="flex items-center gap-1 text-primary-purple hover:underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    {creator.website}
                  </a>
                </div>

                {/* Category Tags */}
                <div className="flex gap-2 pt-1.5">
                  {creator.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/40 rounded-2xl border border-slate-800/30">
              <div className="text-center px-4">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Followers</span>
                <span className="text-base font-black text-white mt-1 block">{creator.followers}</span>
              </div>
              <div className="text-center px-4 border-l border-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Following</span>
                <span className="text-base font-black text-white mt-1 block">{creator.following}</span>
              </div>
              <div className="text-center px-4 border-l border-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Avg Likes</span>
                <span className="text-base font-black text-white mt-1 block">{creator.avgLikes}</span>
              </div>
              <div className="text-center px-4 border-l border-slate-800/40">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Eng. Rate</span>
                <span className="text-base font-black text-secondary-green mt-1 block">{creator.engRate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800/40 overflow-x-auto gap-6 text-sm font-semibold select-none">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "analytics", label: "Analytics & Growth", icon: TrendingUp },
            { id: "audience", label: "Audience Insights", icon: Users },
            { id: "content", label: "Content Analysis", icon: Video },
            { id: "predictions", label: "Campaign Predictor", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-primary-purple text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content rendering */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Overview Widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {creator.overviewStats.map((stat: any, idx: number) => (
                <div
                  key={idx}
                  className="glass-panel p-4 rounded-2xl space-y-1 transition-all hover:border-slate-700"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500">{stat.label}</span>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xl font-bold text-white">{stat.val}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{stat.score}</span>
                  </div>
                  <span className="text-[10px] text-secondary-green font-semibold block pt-1">
                    {stat.desc}
                  </span>
                </div>
              ))}
            </div>

            {/* Growth & Distribution Charts */}
            <div className="grid lg:grid-cols-12 gap-6">
              {/* Follower Growth Tracker */}
              <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Follower Growth Trend
                  </h3>
                  <div className="flex gap-2">
                    {["7D", "30D", "90D", "1Y", "All"].map((r) => (
                      <button
                        key={r}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r === "90D" ? "bg-primary-purple text-white" : "bg-slate-900 text-slate-400"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full h-64">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={creator.growthForecast}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            background: "#0b1020",
                            border: "1px solid #1e293b",
                            borderRadius: "12px",
                          }}
                          labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                          itemStyle={{ fontSize: "11px" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="followers"
                          stroke="#7B61FF"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Distribution Donut */}
              <div className="lg:col-span-4 p-6 rounded-3xl glass-panel flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Content Distribution
                  </h3>
                </div>

                <div className="w-full h-36 relative flex items-center justify-center">
                  {mounted && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={creator.contentType}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {creator.contentType.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-lg font-black text-white">62%</span>
                    <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">
                      Primary
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-800/40">
                  {creator.contentType.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        {item.name}
                      </span>
                      <span className="font-bold text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics & Growth Predictions Tab */}
        {activeTab === "analytics" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Predictive trajectory forecasts */}
            <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                XGBoost ML Projections (Next 180 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Predicted path with an 85% confidence interval overlay.
              </p>

              <div className="w-full h-64">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={creator.growthForecast} margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="followers"
                        stroke="#00FFA3"
                        strokeWidth={3}
                        name="High Growth Pathway"
                      />
                      <Line
                        type="monotone"
                        dataKey="followers"
                        stroke="#7B61FF"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        name="Risk Projection"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Authenticity Index info */}
            <div className="lg:col-span-4 p-6 rounded-3xl glass-panel space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Authenticity Report
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Audience Quality Score</span>
                  <span className="text-secondary-cyan font-bold">92/100</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Suspicious Spike flags</span>
                  <span className="text-secondary-green font-bold">None</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-400">Engagement Integrity</span>
                  <span className="text-secondary-green font-bold">98.4% Authentic</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-primary-indigo/10 border border-primary-indigo/20 text-[10px] text-slate-300 leading-normal">
                🤖 <strong>AI Verification Note:</strong> We detected zero suspicious bot cluster spikes. Organic user engagement is verified.
              </div>
            </div>
          </div>
        )}

        {/* Audience Insights Tab */}
        {activeTab === "audience" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Top Countries Map Representation */}
            <div className="lg:col-span-6 p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Geographic Audience Distribution
              </h3>

              <div className="space-y-4 pt-4">
                {[
                  { country: "United States", val: "42%", count: "10.3M", fill: "#7B61FF" },
                  { country: "United Kingdom", val: "18%", count: "4.4M", fill: "#00D4FF" },
                  { country: "India", val: "12%", count: "2.9M", fill: "#8B5CF6" },
                  { country: "Brazil", val: "8%", count: "1.9M", fill: "#FFB800" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>{item.country}</span>
                      <span className="text-slate-400">
                        {item.count} ({item.val})
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: item.val, backgroundColor: item.fill }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Range Distribution */}
            <div className="lg:col-span-6 p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Age & Gender Breakdown
              </h3>

              <div className="w-full h-64">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "13-17", male: 8, female: 12 },
                        { name: "18-24", male: 25, female: 32 },
                        { name: "25-34", male: 15, female: 18 },
                        { name: "35-44", male: 5, female: 7 },
                        { name: "45+", male: 2, female: 3 },
                      ]}
                      margin={{ left: -25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                      <YAxis stroke="#475569" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="male" fill="#00D4FF" name="Male (%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="female" fill="#7B61FF" name="Female (%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Analysis Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Sentiment Analyzer */}
            <div className="grid lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 p-6 rounded-3xl glass-panel space-y-4 text-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Audience Sentiment index
                </h3>

                <div className="py-6 flex flex-col items-center">
                  <span className="text-4xl font-black text-secondary-green">94%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-1">
                    Positive / Neutral
                  </span>
                </div>

                <div className="text-left text-xs space-y-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/40">
                  <div className="flex justify-between">
                    <span>Positive</span>
                    <span className="text-secondary-green font-bold">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Neutral</span>
                    <span className="text-slate-400 font-bold">16%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Negative</span>
                    <span className="text-accent-red font-bold">6%</span>
                  </div>
                </div>
              </div>

              {/* Risk Brand Safety Scanner */}
              <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Brand Safety Scan
                </h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { metric: "Adult Content Flag", score: "0% Safe", status: "Clean", color: "text-secondary-green" },
                    { metric: "Controversial Political", score: "2% Mild", status: "Low Risk", color: "text-secondary-green" },
                    { metric: "Profanity / Language", score: "1.5% Rare", status: "Clean", color: "text-secondary-green" },
                    { metric: "Brand Safety Index", score: "99.8%", status: "Excellent", color: "text-secondary-green" },
                  ].map((scan, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">{scan.metric}</span>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-white">{scan.score}</span>
                        <span className={`text-[10px] font-semibold ${scan.color}`}>{scan.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campaign Predictions Tab */}
        {activeTab === "predictions" && (
          <div className="grid lg:grid-cols-12 gap-6 animate-scale-up">
            {/* Sliders Input */}
            <div className="lg:col-span-5 p-6 rounded-3xl glass-panel space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Simulate Campaign Budget
              </h3>

              <div className="space-y-4">
                {/* Budget Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Campaign Budget</span>
                    <span className="text-primary-purple font-black">
                      ${budget.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="500"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full accent-primary-purple bg-slate-900 h-1.5 rounded-full"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 pt-1 font-semibold">
                    <span>$1,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Compatibility match Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Product-Niche Alignment</span>
                    <span className="text-secondary-cyan font-black">{fitMatch}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={fitMatch}
                    onChange={(e) => setFitMatch(Number(e.target.value))}
                    className="w-full accent-secondary-cyan bg-slate-900 h-1.5 rounded-full"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 pt-1 font-semibold">
                    <span>50% Fit</span>
                    <span>100% Fit</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/40 text-[10px] text-slate-400 leading-normal">
                📈 <strong>Projections Model:</strong> Estimations are computed based on average engagement values, product placement fits, and general conversion margins in {creator.category} marketing.
              </div>
            </div>

            {/* Campaign Output Forecast Dashboard */}
            <div className="lg:col-span-7 p-6 rounded-3xl glass-panel flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">
                  Estimated Campaign Performance
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Impressions Reach</span>
                  <span className="text-lg font-black text-white mt-1.5 block">
                    {estReach.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Clicks Proj.</span>
                  <span className="text-lg font-black text-white mt-1.5 block">
                    {estClicks.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500">Estimated Sales</span>
                  <span className="text-lg font-black text-secondary-green mt-1.5 block">
                    {estSales.toLocaleString()} units
                  </span>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary-purple/10 to-primary-violet/10 border border-primary-purple/30 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">
                    Revenue Range Project
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    ${estRevenueMin.toLocaleString()} – ${estRevenueMax.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">ROI Rate Proj</span>
                  <span className="text-lg font-bold text-secondary-green block mt-1">
                    {((estRevenueMin / budget) * 100).toFixed(0)}% – {((estRevenueMax / budget) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
