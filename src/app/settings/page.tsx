"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Settings,
  User,
  Key,
  Bell,
  CreditCard,
  CheckCircle,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import canvasConfetti from "canvas-confetti";

export default function SettingsPage() {
  const [activeSubTab, setActiveSubTab] = useState("profile");
  const [profileName, setProfileName] = useState("Sarah Johnson");
  const [profileEmail, setProfileEmail] = useState("sarah.j@brand.com");
  const [profileSaved, setProfileSaved] = useState(false);

  // API Key generation state
  const [apiKeys, setApiKeys] = useState<string[]>([
    "rf_live_8321a98fc8eb20de4cbb8f9024c",
  ]);
  const [copiedKeyIdx, setCopiedKeyIdx] = useState<number | null>(null);

  const handleGenerateApiKey = () => {
    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newKey = `rf_live_${randomHex}`;
    setApiKeys((prev) => [...prev, newKey]);
    canvasConfetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#7B61FF", "#00D4FF"],
    });
  };

  const handleCopyKey = (key: string, idx: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyIdx(idx);
    setTimeout(() => setCopiedKeyIdx(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-scale-up">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Workspace Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure developer integrations, member notifications, and general preferences.
          </p>
        </div>

        {/* Configurations grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sub navigation links */}
          <div className="lg:col-span-3 space-y-1">
            {[
              { id: "profile", label: "Account Profile", icon: User },
              { id: "keys", label: "Developer API Keys", icon: Key },
              { id: "alerts", label: "Notifications & Alerts", icon: Bell },
              { id: "billing", label: "Billing & Plans", icon: CreditCard },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setActiveSubTab(sub.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl text-left transition-all ${
                  activeSubTab === sub.id
                    ? "bg-slate-900 text-white border-l-2 border-primary-purple"
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                }`}
              >
                <sub.icon className="w-4 h-4 text-slate-400" />
                {sub.label}
              </button>
            ))}
          </div>

          {/* Sub content workspace */}
          <div className="lg:col-span-9 p-6 rounded-3xl glass-panel min-h-[300px]">
            {activeSubTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Profile Settings</h3>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary-purple"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-slate-500">Business Email</label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-primary-purple"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-xs font-bold text-white"
                >
                  {profileSaved ? "Changes Saved!" : "Save Profile Details"}
                </button>
              </form>
            )}

            {activeSubTab === "keys" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workspace API Keys</h3>
                  <button
                    onClick={handleGenerateApiKey}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-purple text-white text-xs font-bold rounded-xl transition-all shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New API Key
                  </button>
                </div>

                <div className="space-y-4">
                  {apiKeys.map((key, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/40 flex justify-between items-center relative group">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Secret Key</span>
                        <code className="text-xs text-slate-200 font-mono block select-all">{key}</code>
                      </div>
                      <button
                        onClick={() => handleCopyKey(key, idx)}
                        className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white"
                        title="Copy Key"
                      >
                        {copiedKeyIdx === idx ? (
                          <Check className="w-3.5 h-3.5 text-secondary-green" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "alerts" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notification Subscriptions</h3>
                <div className="space-y-4">
                  {[
                    { title: "Smart Alerts: Bot Spikes", desc: "Push warnings when tracked creators encounter irregular growth spikes", active: true },
                    { title: "Weekly Executive Reports", desc: "Receive summary PDFs highlighting campaign ROI forecasts", active: true },
                    { title: "Webhook: Campaign Triggers", desc: "Fires endpoints when influencer link click margins exceed estimates", active: false },
                  ].map((setting, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-950/20 border border-slate-800/40 rounded-xl">
                      <div className="space-y-0.5">
                        <strong className="text-xs text-white block">{setting.title}</strong>
                        <p className="text-[10px] text-slate-400">{setting.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={setting.active}
                        className="w-4 h-4 accent-primary-purple"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSubTab === "billing" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Plan Billing Details</h3>
                <div className="p-5 rounded-2xl bg-gradient-to-r from-primary-purple/10 to-primary-violet/10 border border-primary-purple/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Plan Tier</span>
                    <strong className="text-base text-white">Ratefluencer Professional Plan</strong>
                    <p className="text-xs text-slate-400">$249 / month, billed monthly</p>
                  </div>
                  <button className="py-2 px-4 bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 rounded-xl hover:border-slate-600 transition-colors">
                    Manage Subscription
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
