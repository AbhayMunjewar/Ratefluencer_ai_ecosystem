"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  Handshake,
  TrendingUp,
  Award,
  Sparkles,
  ShieldCheck,
  FileBarChart,
  Settings,
  Bell,
  Cpu,
  Menu,
  X,
  ChevronRight,
  Zap,
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Search Influencers", href: "/search", icon: Search },
  { name: "Influencer Profiles", href: "/influencer/zachking", icon: Users },
  { name: "Brand Matching", href: "/brand-matching", icon: Handshake },
  { name: "Campaigns", href: "/campaign-success", icon: Zap },
  { name: "Analytics", href: "/prediction", icon: TrendingUp },
  { name: "Leaderboard", href: "/leaderboard", icon: Award },
  { name: "AI Copilot", href: "/copilot", icon: Sparkles },
  { name: "Reports & Admin", href: "/admin", icon: FileBarChart },
  { name: "AI Tools", href: "/tools", icon: Cpu },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-deep bg-grid-pattern text-slate-100">
      {/* Background glow orbs */}
      <div className="glow-orb glow-orb-purple w-[500px] h-[500px] -top-60 -left-60" />
      <div className="glow-orb glow-orb-cyan w-[600px] h-[600px] -bottom-80 -right-80" />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 glass-panel border-r border-slate-800/60 shrink-0 z-30">
        {/* Logo Section */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/40">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-indigo to-secondary-cyan flex items-center justify-center shadow-lg shadow-primary-indigo/30">
            <Cpu className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Ratefluencer AI<span className="text-[10px] align-super text-secondary-cyan font-normal">™</span>
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname.startsWith(item.href) || 
                             (item.href === "/dashboard" && pathname === "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-primary-purple/20 to-primary-violet/10 text-white border-l-2 border-primary-purple shadow-[0_0_15px_rgba(123,97,255,0.15)]"
                    : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-100"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-primary-purple" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar Profile */}
        <div className="p-4 border-t border-slate-800/40 flex items-center gap-3 bg-slate-950/20">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-primary-purple/40">
            {/* User Avatar Placeholder */}
            <div className="w-full h-full bg-slate-800 flex items-center justify-center font-bold text-xs text-primary-purple">
              SJ
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-secondary-green border-2 border-bg-deep" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-white truncate">Sarah Johnson</h3>
            <p className="text-[10px] text-slate-400 truncate">Marketing Manager</p>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Overlay and Menu) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="relative flex flex-col w-64 glass-panel border-r border-slate-800 h-full animate-slide-in">
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-indigo to-secondary-cyan flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-white">Ratefluencer AI</span>
              </div>
              <button
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-800"
                onClick={() => setMobileOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = pathname.startsWith(item.href) || 
                                 (item.href === "/dashboard" && pathname === "/dashboard");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary-purple/10 text-white border-l-2 border-primary-purple"
                        : "text-slate-400 hover:bg-slate-800/30 hover:text-slate-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800/40 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-primary-purple border border-primary-purple/30">
                SJ
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">Sarah Johnson</h3>
                <p className="text-[10px] text-slate-400">Marketing Manager</p>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header Nav */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-slate-800/40 glass-panel z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span>Platform</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-200 capitalize font-medium">
                {pathname.split("/")[1] || "dashboard"}
              </span>
            </div>
          </div>

          {/* Search bar & Tools */}
          <div className="flex items-center gap-4">
            <div className="relative max-w-xs hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search influencers, brands..."
                className="w-60 bg-slate-900/40 border border-slate-800/80 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-purple/50 focus:ring-1 focus:ring-primary-purple/30 transition-all duration-200"
              />
            </div>

            {/* Notification alert bell */}
            <div className="relative">
              <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 transition-colors">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-red border border-bg-deep animate-ping" />
              </button>
            </div>

            {/* AI Status Badge */}
            <div className="px-3 py-1 rounded-full bg-primary-indigo/10 border border-primary-indigo/30 text-[10px] text-primary-indigo font-semibold flex items-center gap-1.5 shadow-md shadow-primary-indigo/5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-cyan animate-pulse" />
              AI Copilot Online
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
