"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { MapPin, Newspaper, ExternalLink, Loader2, ShieldAlert, ChevronDown, X } from "lucide-react";
import { apiUrl } from "@/lib/api";

const DoctorBot = dynamic(() => import("@/components/animations/DoctorBot"), { ssr: false });

type LocationState = "idle" | "asking" | "getting" | "denied" | "error" | "ready";
type NewsArticle = {
  title: string;
  description?: string;
  url: string;
  urlToImage?: string;
  source?: string;
  author?: string;
  publishedAt?: string;
};

const COUNTRY_TO_NEWS = new Map([
  ["US", "United States"],
  ["GB", "United Kingdom"],
  ["IN", "India"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["JP", "Japan"],
  ["BR", "Brazil"],
  ["MX", "Mexico"],
]);

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    if (hrs < 24) return hrs <= 0 ? "Just now" : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  } catch {
    return "";
  }
}

const fetchIpLocation = async (): Promise<string | null> => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (!res.ok) throw new Error("IP API failed");
    const data = await res.json();
    return data.country_code || null;
  } catch (e) {
    console.warn("Primary IP Geolocation failed:", e);
    try {
      const res2 = await fetch("https://ipwho.is/");
      if (!res2.ok) throw new Error("Backup IP API failed");
      const data2 = await res2.json();
      return data2.country_code || null;
    } catch (e2) {
      console.warn("Backup IP Geolocation failed:", e2);
      return null;
    }
  }
};

export default function HomeRobot() {
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryName, setCountryName] = useState<string | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [newsExpanded, setNewsExpanded] = useState(false);
  const [dismissedPrompt, setDismissedPrompt] = useState(false);

  const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<string | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: { "User-Agent": "MediVisionAI-HealthNews/1.0 (health-app)" },
        }
      );
      const data = await res.json();
      const code = data?.address?.country_code;
      return typeof code === "string" ? code.toUpperCase() : null;
    } catch {
      return null;
    }
  }, []);

  const fetchHealthNews = useCallback(async (country: string) => {
    try {
      const res = await fetch(apiUrl(`/api/health-news?country=${country.toLowerCase()}`));
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load news");
      setArticles(data.articles || data.news || []);
      setNewsError(null);
      return (data.articles || data.news)?.length > 0;
    } catch (err: any) {
      const msg =
        err.message?.includes("NEWS_API_KEY") || err.message?.includes("not configured")
          ? "Health news requires setup. Contact support."
          : err.message || "Unable to load health news";
      setNewsError(msg);
      setArticles([]);
      return false;
    }
  }, []);



  const requestLocation = useCallback(async () => {
    setLocationState("asking");
    setLocationError(null);

    const handleSuccess = async (code: string) => {
      setCountryCode(code);
      setCountryName(COUNTRY_TO_NEWS.get(code) || code);
      const hasNews = await fetchHealthNews(code);
      setLocationState("ready");
      if (hasNews) setNewsExpanded(true);
    };

    const runFallback = async () => {
      console.log("Attempting IP-based fallback...");
      setLocationState("getting");
      const code = await fetchIpLocation();
      if (code) {
        await handleSuccess(code);
      } else {
        setLocationState("error");
        setLocationError("Could not determine your location automatically. Please enable location or try again later.");
      }
    };

    if (!navigator.geolocation) {
      await runFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocationState("getting");
        const { latitude, longitude } = pos.coords;
        const code = await reverseGeocode(latitude, longitude);
        if (!code) {
          await runFallback();
          return;
        }
        await handleSuccess(code);
      },
      async (err) => {
        console.warn("Geolocation failed or denied:", err);
        // If denied (code 1) or any other error, try fallback
        await runFallback();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
    );
  }, [reverseGeocode, fetchHealthNews]);

  useEffect(() => {
    if (locationState === "idle" && !dismissedPrompt) {
      const timer = setTimeout(() => setLocationState("asking"), 1500);
      return () => clearTimeout(timer);
    }
  }, [locationState, dismissedPrompt]);

  const showPrompt =
    locationState === "asking" || locationState === "denied" || locationState === "error";
  const isLoading = locationState === "getting";
  const hasNews = articles.length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 p-4 lg:p-12 min-h-[600px]">

      {/* Robot Section (Left/Center) */}
      <div className="relative shrink-0 flex flex-col items-center">
        <div
          className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-500"
          onClick={() => {
            if (locationState === "idle") requestLocation();
            else if (locationState === "denied" || locationState === "error") requestLocation();
          }}
        >
          <DoctorBot />

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-[#020617]/60 rounded-[3rem] z-20 backdrop-blur-sm"
            >
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-12 h-12 text-[#00D1FF] animate-spin" />
                <span className="text-[#00D1FF] text-xs font-bold tracking-widest uppercase">
                  Locating...
                </span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Hint when idle and dismissed - Below Robot */}
        {locationState === "idle" && dismissedPrompt && (
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={requestLocation}
            className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-[#00D1FF] transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:border-[#00D1FF]/30"
          >
            <MapPin size={14} />
            Check Health News
          </motion.button>
        )}

        {/* Location permission prompt - Floating below robot */}
        <AnimatePresence>
          {showPrompt && !dismissedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-6 left-1/2 -translate-x-1/2 z-30 w-[90vw] max-w-sm"
            >
              <div className="p-5 rounded-2xl bg-[#0f172a]/90 backdrop-blur-xl border border-[#00D1FF]/30 shadow-2xl shadow-[#00D1FF]/20 ring-1 ring-[#00D1FF]/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center shrink-0 border border-[#00D1FF]/20">
                    <MapPin className="text-[#00D1FF]" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white mb-1">Local Health Intel</h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      {locationState === "denied" || locationState === "error"
                        ? locationError
                        : "Enable location access to receive real-time health news and alerts for your region."}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={requestLocation}
                        className="px-4 py-2 rounded-lg bg-[#00D1FF] text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#00D1FF]/90 transition-all active:scale-95 shadow-lg shadow-[#00D1FF]/20"
                      >
                        {locationState === "denied" || locationState === "error" ? "Retry" : "Enable"}
                      </button>
                      <button
                        onClick={() => {
                          setDismissedPrompt(true);
                          setLocationState("idle");
                        }}
                        className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
                      >
                        Later
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDismissedPrompt(true);
                      setLocationState("idle");
                    }}
                    className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Health News Section (Right Side) */}
      <AnimatePresence mode="wait">
        {(hasNews || newsError) && locationState === "ready" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md lg:h-[500px] flex flex-col justify-center"
          >
            <div className="bg-[#0f172a]/40 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col max-h-[600px]">
              {/* Header */}
              <div
                onClick={() => setNewsExpanded(!newsExpanded)}
                className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between cursor-pointer group hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#00D1FF]/10 text-[#00D1FF]">
                    <Newspaper size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Health Briefing</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                      {countryName ? `Live from ${countryName}` : "Global Updates"}
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform duration-300 ${newsExpanded ? "rotate-180" : ""}`}
                />
              </div>

              {/* Content */}
              <AnimatePresence initial={false}>
                {newsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3 overflow-y-auto max-h-[400px] custom-scrollbar">
                      {newsError && !hasNews && (
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                          <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
                          <p className="text-xs text-amber-200/90 leading-relaxed">{newsError}</p>
                        </div>
                      )}

                      {articles.slice(0, 6).map((art, i) => (
                        <motion.a
                          key={art.url || i}
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#00D1FF]/30 hover:bg-white/[0.06] transition-all group relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#00D1FF]/0 via-[#00D1FF]/5 to-[#00D1FF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                          {art.urlToImage && (
                            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/5 mt-1">
                              <img
                                src={art.urlToImage}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <h5 className="text-xs font-bold text-slate-200 group-hover:text-[#00D1FF] transition-colors line-clamp-2 leading-snug mb-1">
                              {art.title}
                            </h5>
                            <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                              <div className="flex items-center gap-2">
                                {art.source && (
                                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate max-w-[80px]">
                                    {art.source}
                                  </span>
                                )}
                                <span className="text-[9px] text-slate-600">•</span>
                                <span className="text-[9px] text-slate-500">
                                  {formatDate(art.publishedAt || "")}
                                </span>
                              </div>
                              <ExternalLink size={10} className="text-slate-600 group-hover:text-[#00D1FF] transition-colors" />
                            </div>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer status bar (visible when collapsed too) */}
              <div className="px-5 py-3 bg-black/20 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                    {articles.length} Updates Live
                  </span>
                </div>
                {/* Expand/Collapse Text hint */}
                <span className="text-[10px] text-[#00D1FF]/60 font-mono">
                  {newsExpanded ? "READING MODE" : "STANDBY"}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
