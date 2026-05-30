"use client";

import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  ChevronRight,
  Cpu,
  CornerDownLeft,
} from "lucide-react";

interface Message {
  sender: "user" | "copilot";
  text: string;
  suggestions?: string[];
}

const templates: Record<string, Message[]> = {
  "Why is this score high?": [
    { sender: "user", text: "Why is Zach King's Ratefluencer score 91?" },
    {
      sender: "copilot",
      text: "Zach King's score is high because of the following key factors:\n\n• **Excellent engagement rate (8.7%)** - Significantly higher than average creators in the Entertainment niche.\n• **High audience quality with low fake followers (2.1%)** - Zero suspicious automated clusters detected.\n• **Strong growth trajectory (+8.3% in 90 days)** - Compound follower interest.\n• **Perfect brand alignment** with top brands like Nike, Sony, Adobe.\n• **Consistent content posting** and high audience retention.\n\nWould you like a detailed breakdown?",
      suggestions: ["Yes, show breakdown", "Compare with similar influencers"],
    },
  ],
  "Which brand should collaborate?": [
    { sender: "user", text: "Which brand should collaborate with Zach King?" },
    {
      sender: "copilot",
      text: "Based on our vector similarity models, the top brand matches for Zach King are:\n\n1. **Nike (95% similarity)** - Ideal fit for activewear and action-oriented visual effects transitions.\n2. **Sony (92% similarity)** - Outstanding alignment with creative cameras, hardware, and VFX equipment vlogging.\n3. **Adobe (89% similarity)** - Matches their creator editing and Premiere/After Effects tutorial community.\n\nI recommend launching a transition-based short showing digital editing magic.",
      suggestions: ["Generate Campaign Pitch", "Compare Niche Fits"],
    },
  ],
  "Will this creator grow in 6 months?": [
    { sender: "user", text: "Will Zach King grow in the next 6 months?" },
    {
      sender: "copilot",
      text: "Our XGBoost projections estimate Zach King will grow from **24.6M to 27.2M followers** in the next 180 days (growth probability 92%). The confidence boundaries place the floor at 25.8M and the ceiling at 28.5M. The risk index is minimal due to consistent posting cycles.",
      suggestions: ["View Growth Forecast", "Simulate 365 Days"],
    },
  ],
  "What is the fraud risk?": [
    { sender: "user", text: "What is the fraud risk for Zach King?" },
    {
      sender: "copilot",
      text: "The fraud risk is **Extremely Low (Green Alert)**. Bot ratio is 2.1%, engagement pods overlap is 1.3%, and there are no suspicious historical growth spikes. Comment sentiment is 94% positive/neutral.",
      suggestions: ["View Authenticity Map", "Audit Another Username"],
    },
  ],
};

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>(templates["Why is this score high?"]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let responseText = `I processed your request concerning "${text}". Based on Ratefluencer AI indexes, this creator ranks in the top 5% of their category, demonstrating high authenticity scores and low bot risks.`;
      let suggestions = ["Analyze engagement quality", "Run Campaign Simulation"];

      // Check if matches template query keywords
      const lower = text.toLowerCase();
      if (lower.includes("brand") || lower.includes("collaborate")) {
        responseText = templates["Which brand should collaborate?"][1].text;
        suggestions = templates["Which brand should collaborate?"][1].suggestions || [];
      } else if (lower.includes("grow") || lower.includes("6 months")) {
        responseText = templates["Will this creator grow in 6 months?"][1].text;
        suggestions = templates["Will this creator grow in 6 months?"][1].suggestions || [];
      } else if (lower.includes("fraud") || lower.includes("fake")) {
        responseText = templates["What is the fraud risk?"][1].text;
        suggestions = templates["What is the fraud risk?"][1].suggestions || [];
      }

      setMessages((prev) => [
        ...prev,
        { sender: "copilot", text: responseText, suggestions },
      ]);
      setTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const loadTemplate = (title: string) => {
    if (templates[title]) {
      setMessages(templates[title]);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-140px)] rounded-3xl glass-panel overflow-hidden border border-slate-800/40">
        {/* Chat Threads Sidebar */}
        <aside className="w-64 border-r border-slate-800/60 hidden md:flex flex-col bg-slate-950/20 shrink-0">
          <div className="p-4 border-b border-slate-800/40">
            <button
              onClick={() => setMessages([{ sender: "copilot", text: "Hello! Ask me any questions about influencer metrics, fraud assessments, or campaign simulations." }])}
              className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-primary-purple" />
              New Chat
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-4">
            {/* Today Threads */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-600 px-3 block mb-1">Today</span>
              {[
                { label: "Why is Zach King's score high?", id: "Why is this score high?" },
                { label: "Which brands fit best?", id: "Which brand should collaborate?" },
                { label: "Will creator grow in 6m?", id: "Will this creator grow in 6 months?" },
              ].map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => loadTemplate(thread.id)}
                  className="w-full text-left text-xs text-slate-400 hover:bg-slate-900/30 hover:text-white px-3 py-2 rounded-lg truncate flex items-center gap-2 font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-primary-purple shrink-0" />
                  {thread.label}
                </button>
              ))}
            </div>

            {/* Yesterday Threads */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-600 px-3 block mb-1">Yesterday</span>
              {[
                { label: "What is the fraud risk?", id: "What is the fraud risk?" },
              ].map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => loadTemplate(thread.id)}
                  className="w-full text-left text-xs text-slate-400 hover:bg-slate-900/30 hover:text-white px-3 py-2 rounded-lg truncate flex items-center gap-2 font-medium"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {thread.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Conversation Window */}
        <section className="flex-1 flex flex-col justify-between bg-slate-950/5">
          {/* Chat Messages Logs */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* Copilot Avatar */}
                {msg.sender === "copilot" && (
                  <div className="w-8 h-8 rounded-lg bg-primary-indigo flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary-indigo/10">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className="space-y-3 max-w-xl">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                      msg.sender === "user"
                        ? "bg-primary-purple border-primary-purple text-white rounded-tr-none shadow-md shadow-primary-purple/10"
                        : "bg-slate-900 border-slate-800 text-slate-200 rounded-tl-none"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {msg.text}
                  </div>

                  {/* Bubble action proposals */}
                  {msg.sender === "copilot" && msg.suggestions && (
                    <div className="flex flex-wrap gap-2">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestionClick(s)}
                          className="py-1 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white transition-all"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Avatar indicator */}
                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-slate-850 flex items-center justify-center font-bold text-[10px] text-primary-purple border border-slate-700 shrink-0">
                    SJ
                  </div>
                )}
              </div>
            ))}

            {/* Typing state */}
            {typing && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-primary-indigo flex items-center justify-center text-white shrink-0">
                  <Cpu className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none max-w-xs text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                  AI RAG matching...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Chat text Input Bar */}
          <div className="p-4 border-t border-slate-800/40 bg-slate-950/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask me anything about influencers, fraud, or campaigns..."
                className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-600 font-bold bg-slate-950/60 border border-slate-850 px-1.5 py-0.5 rounded flex items-center gap-1">
                  Enter <CornerDownLeft className="w-2.5 h-2.5" />
                </span>
                <button
                  type="submit"
                  disabled={!inputText.trim() || typing}
                  className="p-1.5 rounded-lg bg-primary-purple text-white disabled:opacity-40 hover:bg-primary-violet transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
