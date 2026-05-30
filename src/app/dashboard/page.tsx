"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  ArrowRight,
  ThumbsUp,
  Eye,
  MessageCircle,
  Share2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Mock Data for Growth Chart
const growthData = [
  { month: "Jan", actual: 120, predicted: 120 },
  { month: "Feb", actual: 145, predicted: 140 },
  { month: "Mar", actual: 180, predicted: 175 },
  { month: "Apr", actual: 230, predicted: 220 },
  { month: "May", actual: null, predicted: 250 },
  { month: "Jun", actual: null, predicted: 280 },
  { month: "Jul", actual: null, predicted: 310 },
];

// Mock Data for Demographics Pie Chart
const demographicData = [
  { name: "18-24", value: 45, color: "#7B61FF" },
  { name: "25-34", value: 30, color: "#00D4FF" },
  { name: "35-44", value: 15, color: "#8B5CF6" },
  { name: "45+", value: 10, color: "#101827" },
];

const topBrands = [
  { name: "Nike", match: 95, desc: "Perfect match for fitness and lifestyle audience", color: "#00FFA3" },
  { name: "MyProtein", match: 91, desc: "High audience overlap in Fitness niche", color: "#7B61FF" },
  { name: "Gymshark", match: 88, desc: "Strong brand alignment and audience fit", color: "#00D4FF" },
  { name: "Fitbit", match: 85, desc: "Wellness and fitness audience match", color: "#FFB800" },
];

const authenticityMetrics = [
  { label: "Fake Followers", value: "2.1%", status: "Low Risk", color: "text-secondary-green" },
  { label: "Engagement Pods", value: "1.3%", status: "Low Risk", color: "text-secondary-green" },
  { label: "Bot Activity", value: "2.6%", status: "Low Risk", color: "text-secondary-green" },
  { label: "Growth Spikes", value: "0", status: "No Issues", color: "text-secondary-cyan" },
];

const miniSparklineData = [
  { value: 40 }, { value: 45 }, { value: 42 }, { value: 50 }, { value: 65 }, { value: 60 }, { value: 75 }
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SVG Gauge Component
  const SemiCircleGauge = ({ value }: { value: number }) => {
    const radius = 50;
    const strokeWidth = 10;
    const circumference = radius * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex flex-col items-center">
        <svg className="w-48 h-28" viewBox="0 0 120 70">
          {/* Track */}
          <path
            d="M 10,60 A 50,50 0 0,1 110,60"
            fill="none"
            stroke="#161b30"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active */}
          <path
            d="M 10,60 A 50,50 0 0,1 110,60"
            fill="none"
            stroke="url(#gauge-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7B61FF" />
              <stop offset="50%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#00FFA3" />
            </linearGradient>
          </defs>
          <text
            x="60"
            y="52"
            textAnchor="middle"
            className="fill-white text-[24px] font-black font-sans"
          >
            {value}
          </text>
          <text
            x="60"
            y="64"
            textAnchor="middle"
            className="fill-slate-400 text-[7px] tracking-widest font-semibold"
          >
            / 100
          </text>
        </svg>
        <span className="absolute bottom-2 text-xs font-bold text-secondary-green tracking-wider uppercase">
          Excellent
        </span>
      </div>
    );
  };

  const ScoreMetricCard = ({
    title,
    score,
    label,
    icon: Icon,
    colorClass,
  }: {
    title: string;
    score: number;
    label: string;
    icon: React.ComponentType<any>;
    colorClass: string;
  }) => {
    return (
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between transition-all duration-200 hover:border-slate-700">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{title}</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-white">{score}</span>
            <span className="text-[9px] text-slate-500">/ 100</span>
          </div>
          <span className={`text-[10px] font-semibold block ${colorClass}`}>{label}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Welcome back, Sarah! 👋
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Here is your AI platform intelligence and campaign planning overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/search"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              Discover Creators
            </Link>
            <Link
              href="/copilot"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-white shadow-md shadow-primary-purple/20 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask Copilot
            </Link>
          </div>
        </div>

        {/* Core Top Row: Ratefluencer Score & AI Explanation */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Ratefluencer Score */}
          <div className="lg:col-span-5 p-6 rounded-3xl glass-panel relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
            <span className="absolute top-4 left-6 text-xs font-bold uppercase tracking-wider text-slate-400">
              Ratefluencer Score™
            </span>
            <div className="mt-4">
              <SemiCircleGauge value={91} />
            </div>
            {/* Visual ambient light */}
            <div className="absolute -bottom-10 w-40 h-20 bg-primary-purple/10 rounded-full filter blur-2xl pointer-events-none" />
          </div>

          {/* AI Explanation Summary */}
          <div className="lg:col-span-7 p-6 rounded-3xl glass-panel relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-4 h-4 text-primary-purple animate-pulse" />
                AI Summary Explanation
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                This creator has excellent audience quality, strong growth potential, high authenticity, and great brand alignment. Highly likely to drive strong campaign performance.
              </p>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-800/40">
              <Link
                href="/influencer/zachking"
                className="text-xs font-semibold text-primary-purple flex items-center gap-1.5 hover:underline group"
              >
                View Full Analysis
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Multi-Score Widgets */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScoreMetricCard
            title="Authenticity Score"
            score={88}
            label="Very Good"
            icon={ShieldCheck}
            colorClass="text-secondary-green"
          />
          <ScoreMetricCard
            title="Growth Potential"
            score={92}
            label="Excellent"
            icon={TrendingUp}
            colorClass="text-secondary-cyan"
          />
          <ScoreMetricCard
            title="Brand Match Score"
            score={89}
            label="Excellent"
            icon={Target}
            colorClass="text-primary-purple"
          />
          <ScoreMetricCard
            title="Campaign Success"
            score={85}
            label="Very Good"
            icon={Zap}
            colorClass="text-accent-gold"
          />
        </div>

        {/* Primary Analytical Details & Demographics */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Line Forecast */}
          <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-4 min-h-[350px]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Follower Growth Forecast
                </h3>
                <p className="text-[10px] text-slate-400">90 Days Prediction Trajectory</p>
              </div>
              <div className="flex gap-4 text-[10px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-secondary-cyan rounded-full" /> Actual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 border-t-2 border-dashed border-primary-purple rounded-full" /> Predicted
                </span>
              </div>
            </div>

            <div className="w-full h-64">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                    <XAxis dataKey="month" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={[100, 350]} />
                    <Tooltip
                      contentStyle={{ background: "#0b1020", border: "1px solid #1e293b", borderRadius: "12px" }}
                      labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: "bold" }}
                      itemStyle={{ fontSize: "11px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#00D4FF"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#7B61FF"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Demographics */}
          <div className="lg:col-span-4 p-6 rounded-3xl glass-panel space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Audience Demographics
              </h3>
              <p className="text-[10px] text-slate-400 mb-4">Core age range distribution</p>
            </div>

            <div className="w-full h-36 relative flex items-center justify-center">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={demographicData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {demographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Inner ring text */}
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-bold text-white">45%</span>
                <span className="text-[9px] text-slate-500 font-semibold">18-24 Years</span>
              </div>
            </div>

            {/* Demographics Legend / Countries */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/40">
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Age Share</span>
                <div className="space-y-1.5">
                  {demographicData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] font-medium text-slate-300">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name} ({item.value}%)
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 border-l border-slate-800/40 pl-4">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Top Countries</span>
                <div className="space-y-1">
                  {[
                    { c: "United States", v: "35%" },
                    { c: "India", v: "28%" },
                    { c: "Brazil", v: "10%" },
                    { c: "UK", v: "8%" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] text-slate-300">
                      <span className="truncate">{item.c}</span>
                      <span className="font-bold text-white">{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Top Brands Matches & Authenticity Deep Audit */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Top Brand Matches */}
          <div className="lg:col-span-5 p-6 rounded-3xl glass-panel space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Top Brand Matches
              </h3>
              <span className="text-[10px] text-primary-purple font-semibold">View All</span>
            </div>

            <div className="space-y-4">
              {topBrands.map((brand, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800/30">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white">{brand.name}</span>
                    <p className="text-[10px] text-slate-400 leading-normal">{brand.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold" style={{ color: brand.color }}>
                      {brand.match}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authenticity Analysis */}
          <div className="lg:col-span-7 p-6 rounded-3xl glass-panel space-y-6 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Authenticity Analysis
              </h3>
              <span className="text-[10px] text-primary-purple font-semibold">View Details</span>
            </div>

            {/* Score Ring Section */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center border border-slate-800 rounded-full">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#161b30" strokeWidth="4" />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#00FFA3"
                    strokeWidth="4"
                    strokeDasharray={176}
                    strokeDashoffset={176 - (88 / 100) * 176}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-sm font-extrabold text-white">88</span>
                  <span className="text-[7px] text-slate-500">/100</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-white">Audience Integrity Audit</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Excellent authenticity indicators. 88% of the follower list represents genuine user interactions with zero bulk automated clusters.
                </p>
              </div>
            </div>

            {/* Anomaly Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {authenticityMetrics.map((metric, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/40 text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">{metric.label}</span>
                  <span className="text-sm font-bold text-white mt-1 block">{metric.value}</span>
                  <span className={`text-[9px] font-semibold ${metric.color} mt-0.5 block`}>{metric.status}</span>
                </div>
              ))}
            </div>

            {/* Micro Sparkline Visual */}
            <div className="w-full h-8 flex items-end gap-1.5 pt-4 border-t border-slate-800/40">
              <span className="text-[9px] text-slate-500 font-semibold mb-2">Audience Health Spark</span>
              <div className="flex-1 flex items-end justify-between h-full pl-6">
                {miniSparklineData.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-full mx-0.5 bg-gradient-to-t from-primary-purple to-secondary-cyan rounded-t"
                    style={{ height: `${val.value}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
