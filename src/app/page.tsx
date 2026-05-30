"use client";

import React, { useState } from "react";
import Link from "next/link";
import ThreeDGlobe from "@/components/ThreeDGlobe";
import {
  ShieldAlert,
  TrendingUp,
  Handshake,
  Zap,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Search,
  MessageSquare,
  Users,
  Play,
  X,
  FileText,
} from "lucide-react";

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoName && demoEmail) {
      setDemoSubmitted(true);
      setTimeout(() => {
        setDemoOpen(false);
        setDemoSubmitted(false);
        setDemoName("");
        setDemoEmail("");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep text-[#F8FAFC] relative overflow-hidden font-sans bg-grid-pattern">
      {/* Glow Orbs */}
      <div className="glow-orb glow-orb-purple w-[600px] h-[600px] -top-80 -left-60 opacity-20" />
      <div className="glow-orb glow-orb-cyan w-[600px] h-[600px] top-[40%] -right-40 opacity-15" />
      <div className="glow-orb glow-orb-purple w-[700px] h-[700px] bottom-0 -left-80 opacity-10" />

      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-slate-800/40 bg-bg-deep/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-indigo to-secondary-cyan flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Ratefluencer AI<span className="text-xs text-secondary-cyan align-super">™</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#tech" className="hover:text-white transition-colors">AI Tech</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQs</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-white shadow-lg shadow-primary-purple/20 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-8 text-left z-10">
            {/* Tagline */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-indigo/10 border border-primary-indigo/30 text-xs font-medium text-primary-indigo shadow-md shadow-primary-indigo/5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-cyan animate-pulse" />
              AI-Powered Influencer Intelligence Engine
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Find the Influencers <br />
              <span className="bg-gradient-to-r from-white via-primary-purple to-secondary-cyan bg-clip-text text-transparent">
                That Actually Drive <br />
                Revenue
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              AI-powered influencer discovery, fraud detection, growth prediction, and brand matching — designed to maximize your campaign ROI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/auth"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-sm font-semibold text-white shadow-lg shadow-primary-purple/30 flex items-center gap-2 group transition-all duration-300 hover:scale-105"
              >
                Analyze Influencer
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setDemoOpen(true)}
                className="px-6 py-3 rounded-full border border-slate-700 hover:border-slate-500 bg-slate-900/30 hover:bg-slate-900/50 text-sm font-semibold text-slate-300 hover:text-white transition-all duration-300"
              >
                Book Demo
              </button>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800/40">
              <div>
                <h4 className="text-2xl font-bold text-white">2.4M+</h4>
                <p className="text-xs text-slate-400 mt-1">Influencers Analyzed</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-secondary-cyan">127M+</h4>
                <p className="text-xs text-slate-400 mt-1">Fake Followers Detected</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-primary-purple">8.7K+</h4>
                <p className="text-xs text-slate-400 mt-1">Campaigns Optimized</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-secondary-green">$320M+</h4>
                <p className="text-xs text-slate-400 mt-1">Revenue Generated</p>
              </div>
            </div>
          </div>

          {/* Hero Right Globe */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <ThreeDGlobe />
          </div>
        </div>
      </section>

      {/* Trusted Brands Bar */}
      <section className="py-12 border-y border-slate-800/40 bg-slate-950/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-8">
            Trusted by leading brands worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8 opacity-45">
            <span className="text-xl font-bold text-white tracking-widest hover:opacity-100 transition-opacity">NIKE</span>
            <span className="text-xl font-bold text-white tracking-widest hover:opacity-100 transition-opacity">airbnb</span>
            <span className="text-xl font-bold text-white tracking-widest hover:opacity-100 transition-opacity">amazon</span>
            <span className="text-xl font-bold text-white tracking-widest hover:opacity-100 transition-opacity">HubSpot</span>
            <span className="text-xl font-bold text-white tracking-widest hover:opacity-100 transition-opacity">Spotify</span>
            <span className="text-xl font-bold text-white tracking-widest hover:opacity-100 transition-opacity">Walmart</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-purple">
            Flagship Capabilities
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Stop Guessing. Start Quantifying Influencer Marketing.
          </p>
          <p className="text-sm text-slate-400">
            Powered by advanced neural networks, our system processes engagement metrics, follower authenticity, growth patterns, and sentiment to deliver bulletproof analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Fraud */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mb-6">
                <ShieldAlert className="w-6 h-6 text-accent-red" />
              </div>
              <h3 className="text-lg font-bold mb-2">Authenticity & Fraud Audit</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan profiles for bot activities, engagement pods, fake commenting loops, and purchased followers with a 99.4% accuracy rate.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs font-semibold text-primary-purple flex items-center gap-1 mt-6 hover:underline">
              Run Audit <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 2: Growth */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary-cyan/10 border border-secondary-cyan/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-secondary-cyan" />
              </div>
              <h3 className="text-lg font-bold mb-2">ML Growth Forecasting</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Project creator growth trajectory up to 365 days out using advanced XGBoost models and historic data patterns.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs font-semibold text-secondary-cyan flex items-center gap-1 mt-6 hover:underline">
              Forecast Growth <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 3: Brand Matching */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-violet/10 border border-primary-violet/20 flex items-center justify-center mb-6">
                <Handshake className="w-6 h-6 text-primary-violet" />
              </div>
              <h3 className="text-lg font-bold mb-2">Vector Semantic Brand Match</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyze bios, captions, and user comments using NLP similarity embedding models to find exact alignment with your brand niche.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs font-semibold text-primary-violet flex items-center gap-1 mt-6 hover:underline">
              View Matches <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 4: Campaign ROI */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary-green/10 border border-secondary-green/20 flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-secondary-green" />
              </div>
              <h3 className="text-lg font-bold mb-2">Campaign ROI Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate marketing budgets and forecast conversion rates, CPMs, audience reaches, and revenue generation before signing contracts.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs font-semibold text-secondary-green flex items-center gap-1 mt-6 hover:underline">
              Simulate ROI <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 5: Competitor benchmark */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6 text-accent-gold" />
              </div>
              <h3 className="text-lg font-bold mb-2">Competitor Benchmarking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compare multiple influencer profiles side-by-side on audience demographic overlap, core content types, and historical KPIs.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs font-semibold text-accent-gold flex items-center gap-1 mt-6 hover:underline">
              Compare Creators <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Card 6: AI Clone */}
          <div className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-indigo/10 border border-primary-indigo/20 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-primary-indigo" />
              </div>
              <h3 className="text-lg font-bold mb-2">AI Creator Clone & Chat</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test pitches on an AI-synthesized creator profile that behaves exactly like the influencer based on their writing history and values.
              </p>
            </div>
            <Link href="/dashboard" className="text-xs font-semibold text-primary-indigo flex items-center gap-1 mt-6 hover:underline">
              Launch Chatbot <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section id="tech" className="py-20 bg-slate-950/40 border-t border-slate-800/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Tech Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-cyan/10 border border-secondary-cyan/30 text-xs font-semibold text-secondary-cyan">
                RATEFLUENCER SCORE™
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Our Flagship Index for Creator Authenticity
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Follower count is a vanity metric. Ratefluencer Score™ is an aggregated value from 0 to 100 calculated using deep natural language processing, bot risk scans, historical engagement, comment quality indexes, and posting frequencies.
              </p>
              <ul className="space-y-4">
                {[
                  "Natural Language Comment Quality Scanner",
                  "Bot spike network topography maps",
                  "Conversion ROI estimation metrics",
                  "Multi-platform comparative matrix tracking",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-secondary-green" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Right (Visual Mock Card) */}
            <div className="glass-panel glass-card-purple p-8 rounded-3xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xs font-semibold text-slate-400">INDEX SYSTEM STATUS</span>
                <span className="px-2 py-0.5 rounded bg-secondary-green/20 text-[10px] text-secondary-green font-bold">OPERATIONAL</span>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span>NLP Sentiment Scanner</span>
                    <span className="text-secondary-cyan">94% Positivity</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-purple to-secondary-cyan rounded-full" style={{ width: "94%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span>Engagement Auditing</span>
                    <span className="text-primary-violet">0.8% Bot Flags</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-purple to-secondary-cyan rounded-full" style={{ width: "98%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span>Campaign Conversion Proj.</span>
                    <span className="text-accent-gold">High Fit Probability</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-purple to-secondary-cyan rounded-full" style={{ width: "87%" }} />
                  </div>
                </div>
              </div>
              {/* Visual glow element */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary-purple/10 filter blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tier */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-20">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-purple">Pricing Plans</h2>
          <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Flexible plans for high-growth brands</p>
          <p className="text-sm text-slate-400">Unlock predictive growth, bot scoring, and vector compatibility filters built for marketing scales.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Starter */}
          <div className="p-8 rounded-3xl glass-panel flex flex-col justify-between relative">
            <div>
              <h3 className="text-lg font-bold mb-2">Starter</h3>
              <p className="text-xs text-slate-400 mb-6">For single campaign managers and startups.</p>
              <div className="text-3xl font-extrabold mb-8">$79<span className="text-xs text-slate-500 font-normal"> / mo</span></div>
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> 10 Creator Audits / mo</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Basic Engagement Metrics</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> 30-Day Growth Forecasts</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Email Support</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full mt-8 py-3 text-center rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-bold transition-all">
              Start Free Trial
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 rounded-3xl glass-panel border-primary-purple relative flex flex-col justify-between shadow-2xl shadow-primary-purple/10">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-primary-purple to-primary-violet text-[10px] font-bold text-white">
              POPULAR
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Professional</h3>
              <p className="text-xs text-slate-400 mb-6">For expanding brands and marketing agencies.</p>
              <div className="text-3xl font-extrabold mb-8">$249<span className="text-xs text-slate-500 font-normal"> / mo</span></div>
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> 100 Creator Audits / mo</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Advanced Bot/Spike Analytics</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Full 365-Day ML Projections</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Competitor Comparison Tools</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> AI Copilot Integration</li>
              </ul>
            </div>
            <Link href="/dashboard" className="w-full mt-8 py-3 text-center rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet text-xs font-bold transition-all shadow-lg hover:shadow-primary-purple/20">
              Upgrade to Pro
            </Link>
          </div>

          {/* Enterprise */}
          <div className="p-8 rounded-3xl glass-panel flex flex-col justify-between relative">
            <div>
              <h3 className="text-lg font-bold mb-2">Enterprise</h3>
              <p className="text-xs text-slate-400 mb-6">For multi-national operations and holding teams.</p>
              <div className="text-3xl font-extrabold mb-8">Custom</div>
              <ul className="space-y-4 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Unlimited Core Audits</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Vector Database Matching Access</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Dedicated Account ML Architect</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> Custom Dashboard Reporting APIs</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary-purple" /> SLAs & Dedicated Node Deployment</li>
              </ul>
            </div>
            <button onClick={() => setDemoOpen(true)} className="w-full mt-8 py-3 text-center rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-bold transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/40">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary-purple">Knowledge base</h2>
          <p className="text-3xl font-extrabold">Frequently Asked Questions</p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "How does Ratefluencer AI verify influencer follower authenticity?",
              a: "We train our classifiers on engagement distributions, network graphing nodes, commenter profile dates, and typical growth behaviors. If an influencer acquires 50k followers in a single day without matching content virality, our system flags it.",
            },
            {
              q: "What variables compose the Ratefluencer Score™?",
              a: "It incorporates average engagement rates, content share ratios, save indexes, commenting sentiment score (NLP indices), bot spike detections, follower retention parameters, and historical sponsor retention metrics.",
            },
            {
              q: "Can I simulate campaign performance before reaching out to an influencer?",
              a: "Yes! Using our Campaign Success Predictor module, you can specify your budget, brand category, and goals. The tool calculates expected conversion probability, revenue ranges, and ROI metrics.",
            },
            {
              q: "Is there a limit to how many social platforms I can audit?",
              a: "We support Instagram, YouTube, TikTok, LinkedIn, and X (formerly Twitter). The database is updated in real-time.",
            },
          ].map((item, idx) => (
            <details key={idx} className="p-6 rounded-2xl glass-panel group [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex justify-between items-center font-bold text-sm cursor-pointer list-none select-none text-white hover:text-primary-purple transition-colors">
                {item.q}
                <span className="transition group-open:rotate-180">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </span>
              </summary>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary-indigo to-secondary-cyan flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Ratefluencer AI™</span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Ratefluencer AI Inc. All rights reserved. Built for high-conversion brands.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      {demoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl animate-scale-up">
            <button
              onClick={() => setDemoOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-xl font-bold text-white">Book a Live Demo</h3>
              <p className="text-xs text-slate-400">See our AI Platform predict campaigns in action.</p>
            </div>
            {demoSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-secondary-green mx-auto animate-bounce" />
                <h4 className="font-bold text-white">Request Sent Successfully!</h4>
                <p className="text-xs text-slate-400">An AI Product Engineer will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-purple"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Business Email</label>
                  <input
                    type="email"
                    required
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="jane@company.com"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary-purple"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-purple to-primary-violet text-xs font-bold text-white transition-all shadow-lg hover:scale-102"
                >
                  Schedule Live Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
