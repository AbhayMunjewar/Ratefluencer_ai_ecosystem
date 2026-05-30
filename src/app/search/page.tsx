"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  Play,
  Camera,
  Video,
  Tv,
  Briefcase,
  Globe,
  ArrowRight,
  TrendingUp,
  User,
  SlidersHorizontal,
} from "lucide-react";

// Mock database of influencers
const initialInfluencers = [
  {
    id: "mrbeast",
    name: "MrBeast",
    username: "@mrbeast",
    platform: "YouTube",
    category: "Entertainment",
    country: "USA",
    followers: "225M",
    followersVal: 225000000,
    engRate: "4.2%",
    engRateVal: 4.2,
    views: "3.1B",
    growth: "+12.5%",
    avatar: "MB",
    bio: "I want to make the world a better place before I die.",
  },
  {
    id: "zachking",
    name: "Zach King",
    username: "@zachking",
    platform: "Instagram",
    category: "Entertainment",
    country: "USA",
    followers: "24.6M",
    followersVal: 24600000,
    engRate: "8.7%",
    engRateVal: 8.7,
    views: "1.2M",
    growth: "+8.3%",
    avatar: "ZK",
    bio: "Visual Effects Artist & filmmaker making digital magic.",
  },
  {
    id: "fitnessblender",
    name: "Fitness Blender",
    username: "@fitnessblender",
    platform: "YouTube",
    category: "Fitness",
    country: "USA",
    followers: "8.3M",
    followersVal: 8300000,
    engRate: "6.1%",
    engRateVal: 6.1,
    views: "492M",
    growth: "+15.2%",
    avatar: "FB",
    bio: "Free workout videos for every fitness level. Health and happiness.",
  },
  {
    id: "kimberlyloaiza",
    name: "Kimberly Loaiza",
    username: "@kimberly.loaiza",
    platform: "TikTok",
    category: "Lifestyle",
    country: "Mexico",
    followers: "82.7M",
    followersVal: 82700000,
    engRate: "9.3%",
    engRateVal: 9.3,
    views: "2.1M",
    growth: "+7.8%",
    avatar: "KL",
    bio: "Singer & video creator from MX. Love my fans!",
  },
  {
    id: "mkbhd",
    name: "Marques Brownlee",
    username: "@mkbhd",
    platform: "YouTube",
    category: "Tech",
    country: "USA",
    followers: "18.2M",
    followersVal: 18200000,
    engRate: "5.8%",
    engRateVal: 5.8,
    views: "890M",
    growth: "+9.1%",
    avatar: "M",
    bio: "Web video producer | Host of Waveform Podcast | Professional Ultimate Frisbee player.",
  },
  {
    id: "garyvee",
    name: "Gary Vaynerchuk",
    username: "@garyvee",
    platform: "LinkedIn",
    category: "Business",
    country: "USA",
    followers: "5.4M",
    followersVal: 5400000,
    engRate: "3.2%",
    engRateVal: 3.2,
    views: "450K",
    growth: "+11.4%",
    avatar: "GV",
    bio: "Chairman of VaynerX, CEO of VaynerMedia, 5x NYT Author, Investor.",
  },
  {
    id: "charlidamelio",
    name: "Charli D'Amelio",
    username: "@charlidamelio",
    platform: "TikTok",
    category: "Fashion",
    country: "USA",
    followers: "151M",
    followersVal: 151000000,
    engRate: "7.9%",
    engRateVal: 7.9,
    views: "5.4M",
    growth: "+4.2%",
    avatar: "CD",
    bio: "Dance is my life. Shop my collections!",
  },
];

export default function SearchInfluencers() {
  const [influencers, setInfluencers] = useState(initialInfluencers);
  const [searchQuery, setSearchQuery] = useState("");
  const [platform, setPlatform] = useState("all");
  const [category, setCategory] = useState("all");
  const [country, setCountry] = useState("all");
  const [audienceSize, setAudienceSize] = useState("all");
  const [minEngRate, setMinEngRate] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const handleSearch = () => {
    let filtered = initialInfluencers.filter((item) => {
      // Username/Name search
      const matchesQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bio.toLowerCase().includes(searchQuery.toLowerCase());

      // Platform filter
      const matchesPlatform = platform === "all" || item.platform === platform;

      // Category filter
      const matchesCategory = category === "all" || item.category === category;

      // Country filter
      const matchesCountry = country === "all" || item.country === country;

      // Followers size filter
      let matchesAudience = true;
      if (audienceSize !== "all") {
        if (audienceSize === "under-1m") matchesAudience = item.followersVal < 10000000;
        else if (audienceSize === "1m-10m") matchesAudience = item.followersVal >= 1000000 && item.followersVal <= 10000000;
        else if (audienceSize === "10m-50m") matchesAudience = item.followersVal > 10000000 && item.followersVal <= 50000000;
        else if (audienceSize === "50m-plus") matchesAudience = item.followersVal > 50000000;
      }

      // Engagement rate filter
      let matchesEngRate = true;
      if (minEngRate !== "all") {
        const rate = parseFloat(minEngRate);
        matchesEngRate = item.engRateVal >= rate;
      }

      return matchesQuery && matchesPlatform && matchesCategory && matchesCountry && matchesAudience && matchesEngRate;
    });

    setInfluencers(filtered);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setPlatform("all");
    setCategory("all");
    setCountry("all");
    setAudienceSize("all");
    setMinEngRate("all");
    setInfluencers(initialInfluencers);
  };

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
      case "X":
        return <Globe className="w-3.5 h-3.5 text-slate-200" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Title Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Search Influencers</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover creators and filters backed by AI performance signals.
          </p>
        </div>

        {/* Filter Panel Card */}
        <div className="p-6 rounded-3xl glass-panel space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Username query */}
            <div className="md:col-span-4 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username, niche, or bio..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-purple"
              />
            </div>

            {/* Platform selection */}
            <div className="md:col-span-2">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-purple"
              >
                <option value="all">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>

            {/* Category selection */}
            <div className="md:col-span-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-purple"
              >
                <option value="all">All Categories</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Fitness">Fitness</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Tech">Tech</option>
                <option value="Business">Business</option>
                <option value="Fashion">Fashion</option>
              </select>
            </div>

            {/* Search actions */}
            <div className="md:col-span-4 flex items-center gap-3">
              <button
                onClick={handleSearch}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-primary-purple to-primary-violet hover:from-primary-violet hover:to-primary-indigo text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-primary-purple/10"
              >
                Apply Filters
              </button>
              <button
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
                title="Advanced Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-white font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Advanced collapsible filters */}
          {showMoreFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/40 animate-slide-down">
              {/* Country select */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-purple"
                >
                  <option value="all">Global Location</option>
                  <option value="USA">United States</option>
                  <option value="Mexico">Mexico</option>
                </select>
              </div>

              {/* Followers size */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Audience Size</label>
                <select
                  value={audienceSize}
                  onChange={(e) => setAudienceSize(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-purple"
                >
                  <option value="all">Any Follower Count</option>
                  <option value="under-1m">Under 10M</option>
                  <option value="1m-10m">1M - 10M</option>
                  <option value="10m-50m">10M - 50M</option>
                  <option value="50m-plus">50M+</option>
                </select>
              </div>

              {/* Engagement minimum */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1.5">Min Engagement Rate</label>
                <select
                  value={minEngRate}
                  onChange={(e) => setMinEngRate(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none focus:border-primary-purple"
                >
                  <option value="all">Any Engagement Rate</option>
                  <option value="3.0">3.0% +</option>
                  <option value="5.0">5.0% +</option>
                  <option value="8.0">8.0% +</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Info Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Found <strong className="text-white">{influencers.length}</strong> matching profiles
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Data verified 1 hour ago
          </span>
        </div>

        {/* Influencers Table Listing */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Influencer</th>
                  <th className="py-4 px-4">Platform</th>
                  <th className="py-4 px-4">Followers</th>
                  <th className="py-4 px-4">Engagement Rate</th>
                  <th className="py-4 px-4">Avg Views/Likes</th>
                  <th className="py-4 px-4">Growth Rate</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-xs">
                {influencers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-slate-500 font-medium">
                      No influencers found matching the selected search criteria.
                    </td>
                  </tr>
                ) : (
                  influencers.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/35 transition-colors group"
                    >
                      {/* Name Card */}
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-primary-purple border border-slate-700/60 group-hover:border-primary-purple/40 transition-colors">
                          {item.avatar}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-white truncate">{item.name}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary-green" />
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{item.username}</span>
                        </div>
                      </td>

                      {/* Platform */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/60 border border-slate-800/60 text-[10px] font-semibold text-slate-300">
                          {getPlatformIcon(item.platform)}
                          {item.platform}
                        </span>
                      </td>

                      {/* Followers */}
                      <td className="py-4 px-4 font-bold text-white">{item.followers}</td>

                      {/* Engagement */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-white">{item.engRate}</span>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 text-slate-300 font-medium">{item.views}</td>

                      {/* Growth */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-secondary-green font-bold">
                          <TrendingUp className="w-3 h-3" />
                          {item.growth}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/influencer/${item.id}`}
                          className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-slate-800/60 hover:bg-primary-purple text-[10px] font-bold text-slate-300 hover:text-white transition-all group-hover:translate-x-[-2px]"
                        >
                          View Profile
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
