"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ShieldAlert,
  Server,
  Activity,
  Users,
  Target,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// System latency statistics
const systemLatency = [
  { time: "10:00", latency: 42 },
  { time: "10:15", latency: 48 },
  { time: "10:30", latency: 38 },
  { time: "10:45", latency: 52 },
  { time: "11:00", latency: 41 },
  { time: "11:15", latency: 45 },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("vitals");
  const [mounted, setMounted] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-scale-up">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Reports & Admin Control Panel
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor active server nodes, moderation queues, and team configurations.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-primary-purple" : ""}`} />
            {syncing ? "Syncing Vitals..." : "Sync Systems"}
          </button>
        </div>

        {/* System Vitals Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl glass-panel text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold">API Gateway Status</span>
            <span className="text-sm font-black text-secondary-green mt-1 block">99.98% Online</span>
          </div>
          <div className="p-4 rounded-2xl glass-panel text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Tracked Creators</span>
            <span className="text-sm font-black text-white mt-1 block">12,456</span>
          </div>
          <div className="p-4 rounded-2xl glass-panel text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Active Licenses</span>
            <span className="text-sm font-black text-white mt-1 block">412 Brand Accounts</span>
          </div>
          <div className="p-4 rounded-2xl glass-panel text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Fraud Queue Size</span>
            <span className="text-sm font-black text-accent-red mt-1 block">3 Warnings</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800/40 overflow-x-auto gap-6 text-sm font-semibold select-none">
          {[
            { id: "vitals", label: "Server Vitals", icon: Server },
            { id: "users", label: "Team Members", icon: Users },
            { id: "fraud", label: "Fraud Alert Logs", icon: ShieldAlert },
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

        {/* Tab Contents */}
        {activeTab === "vitals" && (
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Latency Plot */}
            <div className="lg:col-span-8 p-6 rounded-3xl glass-panel space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                API Response Latency (ms)
              </h3>
              <div className="w-full h-60">
                {mounted && (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={systemLatency} margin={{ left: -25, top: 10 }}>
                      <defs>
                        <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B61FF" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#7B61FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161b30" />
                      <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="latency"
                        stroke="#7B61FF"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#latencyGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* DB Nodes details */}
            <div className="lg:col-span-4 p-6 rounded-3xl glass-panel space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Vector DB Clusters
              </h3>

              <div className="space-y-4">
                {[
                  { name: "PostgreSQL Primary", status: "Active", size: "142 GB", color: "text-secondary-green" },
                  { name: "Qdrant Vector Node", status: "Active", size: "8.4M Vectors", color: "text-secondary-green" },
                  { name: "Redis Cache Node", status: "Active", size: "12 GB cached", color: "text-secondary-green" },
                ].map((node, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/40 flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white">{node.name}</span>
                      <p className="text-[10px] text-slate-500">{node.size}</p>
                    </div>
                    <span className={`text-[10px] font-bold ${node.color}`}>
                      {node.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Active Campaigns</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {[
                    { name: "Sarah Johnson", role: "Marketing Manager", email: "sarah.j@brand.com", active: 24 },
                    { name: "Alex Miller", role: "Media Specialist", email: "alex.m@brand.com", active: 12 },
                    { name: "Elena Rostova", role: "Growth Lead", email: "elena.r@brand.com", active: 8 },
                  ].map((team, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/35 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">{team.name}</td>
                      <td className="py-4 px-4 text-slate-300">{team.role}</td>
                      <td className="py-4 px-4 text-slate-400 font-mono">{team.email}</td>
                      <td className="py-4 px-4 font-bold text-white">{team.active}</td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button className="text-[10px] font-bold text-primary-purple hover:underline">
                          Edit Access
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "fraud" && (
          <div className="space-y-4">
            {[
              { id: "ZK-001", creator: "@suspect_creator", trigger: "Sudden spike of 80k followers in 10 minutes", severity: "High", color: "text-accent-red border-accent-red/20 bg-accent-red/5" },
              { id: "ZK-002", creator: "@viral_loop_prom", trigger: "Comment duplication loop (engagement pods match)", severity: "Medium", color: "text-accent-gold border-accent-gold/20 bg-accent-gold/5" },
              { id: "ZK-003", creator: "@tech_guru_test", trigger: "Follower profile clumping on single IP network block", severity: "High", color: "text-accent-red border-accent-red/20 bg-accent-red/5" },
            ].map((alert, idx) => (
              <div key={idx} className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${alert.color}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                      ID: {alert.id}
                    </span>
                    <strong className="text-sm text-white">{alert.creator}</strong>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">{alert.trigger}</p>
                </div>
                <div className="text-right">
                  <button className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-white hover:border-slate-600 transition-colors">
                    Moderate Scan
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
