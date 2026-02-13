"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, Zap, Activity, Info, ArrowUpRight, ArrowDownRight, Microscope, Target } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiUrl, authHeaders } from "@/lib/api";

export default function TrendsPage() {
    const { data: session } = useSession();
    const [timeframe, setTimeframe] = useState("6M");
    const [bioAnalysis, setBioAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTrends() {
            if (!session) return;
            try {
                const res = await fetch(apiUrl('/api/reports/bio-analysis'), {
                    headers: authHeaders((session as any).accessToken)
                });
                const data = await res.json();
                setBioAnalysis(data);
            } catch (err) {
                console.error("Failed to fetch trends:", err);
            } finally {
                setLoading(false);
            }
        }
        if (session) fetchTrends();
    }, [session]);

    const metrics = [
        { label: "Overall Health Score", value: 0, status: "increasing", color: "text-[#00D1FF]" },
        { label: "Biomarker Stability", value: 0, status: "stable", color: "text-[#7000FF]" },
        { label: "Recovery Efficiency", value: 0, status: "increasing", color: "text-emerald-400" }
    ];

    return (
        <div className="space-y-10 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Health <span className="text-[#00D1FF]">Trends</span></h1>
                    <p className="text-slate-400">Longitudinal analysis of your neural, physical, and metabolic datasets.</p>
                </div>
                <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-xl">
                    {["1M", "3M", "6M", "1Y"].map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeframe === tf ? 'bg-[#00D1FF] text-black shadow-lg shadow-[#00D1FF]/20' : 'text-slate-500 hover:text-white'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {metrics.map((m, idx) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 rounded-[3rem] glass-morphism border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{m.label}</p>
                        <div className="flex items-baseline gap-4 mb-6">
                            <span className={`text-5xl font-black italic tracking-tighter ${m.color}`}>{m.value}</span>
                            <span className="text-xs font-bold text-slate-500 uppercase">/ 100</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">TRAJECTORY</span>
                            <div className="flex items-center gap-2 text-slate-600">
                                <TrendingUp size={14} />
                                --% VS LAST QTR
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-10 rounded-[3.5rem] glass-card border-white/5 bg-white/[0.01]">
                    <h3 className="text-xl font-black mb-10 flex items-center gap-3 uppercase italic">
                        <Activity className="text-[#00D1FF]" size={22} />
                        Neural Vigor Index
                    </h3>
                    <div className="relative h-64 flex items-end justify-between gap-4 px-4 pb-4 border-b border-l border-white/5">
                        <div className="absolute top-1/2 left-0 right-0 h-px border-t border-dashed border-white/10" />
                        {([0, 0, 0, 0, 0, 0, 0]).map((h: number, i: number) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: 0.5 + (i * 0.1), duration: 1, ease: "circOut" }}
                                className="w-full bg-gradient-to-t from-[#00D1FF]/20 to-[#00D1FF] rounded-t-xl group relative"
                            >
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {h}%
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                    </div>
                </div>

                <div className="p-10 rounded-[3.5rem] glass-card border-white/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black mb-4 flex items-center gap-3 uppercase italic">
                            <Target className="text-[#7000FF]" size={22} />
                            Predictive Insights
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">AI has identified patterns that suggest a 15% improvement in cardiovascular endurance if current recovery metrics persist.</p>
                    </div>
                    <div className="space-y-4">
                        <InsightItem label="WBC Count" percentage={0} color="bg-[#00D1FF]" />
                        <InsightItem label="Glucose" percentage={0} color="bg-[#7000FF]" />
                        <InsightItem label="Hemoglobin" percentage={0} color="bg-emerald-400" />
                        <InsightItem label="Creatinine" percentage={0} color="bg-rose-400" />
                    </div>
                    <button className="w-full py-5 rounded-3xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] mt-10 hover:bg-white/10 transition-all">
                        VIEW FULL PROJECTION
                    </button>
                </div>
            </div>
        </div>
    );
}

function InsightItem({ label, percentage, color }: { label: string, percentage: number, color: string }) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>{label}</span>
                <span className="text-white">{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 1, duration: 1.5 }}
                    className={`h-full ${color}`}
                />
            </div>
        </div>
    );
}
