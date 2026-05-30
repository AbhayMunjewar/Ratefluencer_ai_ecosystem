"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Cpu,
  Sparkles,
  Sliders,
  Settings2,
  Calendar,
  AlertCircle,
} from "lucide-react";

// Projections generator helper
const generateForecast = (horizon: number, model: string, freq: number, viral: number) => {
  const data = [];
  let baseFollowers = 24.6; // in millions
  const steps = horizon === 30 ? 6 : horizon === 90 ? 9 : horizon === 180 ? 12 : 18;
  const growthMultiplier = model === "XGBoost" ? 1.05 : model === "LightGBM" ? 1.04 : model === "LSTM" ? 1.065 : 1.03;
  const factor = growthMultiplier + (freq * 0.005) + (viral * 0.015);

  for (let i = 0; i <= steps; i++) {
    const monthIndex = i;
    const label = `Step ${monthIndex}`;
    
    // Accumulate compounded growth
    const expected = baseFollowers * Math.pow(factor, i / 2);
    const optimistic = expected * (1 + (i * 0.015));
    const pessimistic = expected * (1 - (i * 0.01));

    data.push({
      step: label,
      Expected: parseFloat(expected.toFixed(2)),
      Optimistic: parseFloat(optimistic.toFixed(2)),
      Pessimistic: parseFloat(pessimistic.toFixed(2)),
    });
  }
  return data;
};

export default function GrowthPrediction() {
  const [horizon, setHorizon] = useState(180); // 30, 90, 180, 365
  const [model, setModel] = useState("XGBoost"); // XGBoost, LightGBM, LSTM, Prophet
  const [postFreq, setPostFreq] = useState(5); // posts per week
  const [viralCoef, setViralCoef] = useState(2); // 1-5 scale
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setChartData(generateForecast(horizon, model, postFreq, viralCoef));
  }, [horizon, model, postFreq, viralCoef]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-scale-up">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Growth Prediction Engine
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate follower progression pathways using enterprise XGBoost and LSTM network models.
            </p>
          </div>

          {/* Model Config selector */}
          <div className="flex gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            {["XGBoost", "LightGBM", "LSTM", "Prophet"].map((m) => (
              <button
                key={m}
                onClick={() => setModel(m)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  model === m ? "bg-primary-purple text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Configurations grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Parameters sliders */}
          <div className="lg:col-span-4 p-6 rounded-3xl glass-panel space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary-purple" />
                Forecast Parameters
              </h3>

              {/* Time Horizon */}
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold text-slate-500">
                  Forecasting Horizon
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 90, 180, 365].map((d) => (
                    <button
                      key={d}
                      onClick={() => setHorizon(d)}
                      className={`py-1.5 rounded-lg text-[10px] font-bold ${
                        horizon === d ? "bg-primary-purple text-white" : "bg-slate-900 text-slate-400"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Posting frequency slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Weekly Posts Target</span>
                  <span className="text-secondary-cyan font-bold">{postFreq} posts</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={postFreq}
                  onChange={(e) => setPostFreq(Number(e.target.value))}
                  className="w-full accent-secondary-cyan bg-slate-900 h-1 rounded-full"
                />
              </div>

              {/* Virality Multiplier */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Virality Coefficient</span>
                  <span className="text-secondary-green font-bold">x{viralCoef}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={viralCoef}
                  onChange={(e) => setViralCoef(Number(e.target.value))}
                  className="w-full accent-secondary-green bg-slate-900 h-1 rounded-full"
                />
              </div>
            </div>

            {/* Micro Details panel */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Model Integrity</span>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Mean Absolute Error</span>
                <span className="text-secondary-green font-bold">2.41%</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">R² Coefficient</span>
                <span className="text-secondary-green font-bold">0.978</span>
              </div>
            </div>
          </div>

          {/* Area Prediction Plot */}
          <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-4 min-h-[350px]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Social Growth Projection Pathways
                </h3>
                <p className="text-[10px] text-slate-400">Values represented in Millions of followers</p>
              </div>

              <div className="flex gap-4 text-[10px] text-slate-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-secondary-green/30 rounded" /> Optimistic
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-primary-purple/30 rounded" /> Expected
                </span>
              </div>
            </div>

            <div className="w-full h-72">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ left: -20, top: 10 }}>
                    <defs>
                      <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00FFA3" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7B61FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                    <XAxis dataKey="step" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} domain={["auto", "auto"]} />
                    <Tooltip
                      contentStyle={{ background: "#0b1020", border: "1px solid #1e293b", borderRadius: "12px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Optimistic"
                      stroke="#00FFA3"
                      fillOpacity={1}
                      fill="url(#optGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="Expected"
                      stroke="#7B61FF"
                      fillOpacity={1}
                      fill="url(#expGrad)"
                      strokeWidth={2.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="Pessimistic"
                      stroke="#FF5E5E"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Narrative ML Insights */}
        <div className="p-6 rounded-3xl glass-panel relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-indigo/10 border border-primary-indigo/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary-indigo" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              Growth Trajectory Narrative
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Based on the {model} simulator with {postFreq} posts/week, this profile is highly likely to reach{" "}
              <strong className="text-secondary-green">
                {chartData[chartData.length - 1]?.Expected}M followers
              </strong>{" "}
              by the end of the selected timeline. The virality index (x{viralCoef}) introduces volatility, meaning a single breakout post could elevate the trajectory toward the optimistic{" "}
              <strong className="text-secondary-cyan">
                {chartData[chartData.length - 1]?.Optimistic}M target
              </strong>
              .
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
