"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Target, Zap, Activity, AlertTriangle, TrendingDown, Info, ChevronRight, Brain, Heart, Bone, Download, Share2, Eye, ShieldCheck, MapPin } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSettings } from "@/context/SettingsContext";

interface RiskProjection {
    id: string;
    region: string;
    type: string;
    probability: number;
    timeframe: string;
    severity: "low" | "medium" | "high";
    icon: any;
    insight: string;
    coordinates: { top: string; left: string };
    trend: "up" | "down" | "stable";
}

export default function RiskSentinelPage() {
    const { isRuralMode, t } = useSettings();
    const [scannedRegions, setScannedRegions] = useState<RiskProjection[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [lastSync, setLastSync] = useState<Date>(new Date());
    const [hoveredRisk, setHoveredRisk] = useState<string | null>(null);

    const initialRisks: RiskProjection[] = [
        {
            id: 'R-992',
            region: "Left Forearm",
            type: "Structural Degradation",
            probability: 14,
            timeframe: "3-6 months",
            severity: "low",
            icon: Bone,
            insight: "Pattern indicates slight bone density variance near the previous fracture site.",
            coordinates: { top: "60%", left: "38%" },
            trend: "stable"
        },
        {
            id: 'R-441',
            region: "Cardiovascular",
            type: "Artery Elasticity",
            probability: 22,
            timeframe: "12 months",
            severity: "medium",
            icon: Heart,
            insight: "Slight decrease in myocardial efficiency detected during high-intensity signal streams.",
            coordinates: { top: "45%", left: "52%" },
            trend: "up"
        },
        {
            id: 'R-001',
            region: "Neural Pathways",
            type: "Synaptic Latency",
            probability: 8,
            timeframe: "Indefinite",
            severity: "low",
            icon: Brain,
            insight: "Neural vigor indices remain stable, with minimal risk of motor skill regression.",
            coordinates: { top: "20%", left: "45%" },
            trend: "down"
        }
    ];

    const generateAIProjection = useCallback(async () => {
        setIsSimulating(true);
        // Simulate AI Calculation delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        const randomized = initialRisks.map(r => ({
            ...r,
            probability: Math.min(100, Math.max(5, r.probability + (Math.random() * 10 - 5))),
            trend: Math.random() > 0.7 ? (Math.random() > 0.5 ? "up" : "down") : "stable"
        })) as RiskProjection[];

        setScannedRegions(randomized);
        setLastSync(new Date());
        setIsSimulating(false);
    }, []);

    useEffect(() => {
        setScannedRegions(initialRisks);
        const timer = setTimeout(() => generateAIProjection(), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleExportProfile = () => {
        const profile = {
            subject: "Subject: Active Patient Analysis",
            timestamp: lastSync.toISOString(),
            riskAnalysis: scannedRegions,
            accuracy: 98.4,
            ruralMode: isRuralMode
        };
        const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MediVision_RiskProfile_${new Date().getTime()}.json`;
        a.click();
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 text-red-500 mb-2">
                        <ShieldAlert size={20} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Risk Protocol Active</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Risk <span className="text-[#00D1FF]">Sentinel</span></h1>
                    <p className="text-slate-400 font-medium">Predictive health trajectory simulation powered by Synapse-X Neural Engine.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleExportProfile}
                        className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                        <Download size={14} /> EXPORT PACKET
                    </button>
                    <button
                        onClick={generateAIProjection}
                        disabled={isSimulating}
                        className="px-8 py-4 rounded-2xl bg-[#00D1FF] text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(0,209,255,0.3)]"
                    >
                        <Zap size={16} className={isSimulating ? "animate-spin" : "fill-black"} />
                        {isSimulating ? "Simulating Evolution..." : "Run New Projection"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-10 rounded-[3.5rem] glass-morphism border-white/5 bg-black/40 relative overflow-hidden min-h-[600px] flex items-center justify-center group/map">
                        <div className="absolute inset-0 medical-grid opacity-20" />

                        {/* Scanning Effect Overlay */}
                        {isSimulating && (
                            <motion.div
                                initial={{ top: "-100%" }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#00D1FF]/10 to-transparent z-20 pointer-events-none"
                            />
                        )}

                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                            <AnimatePresence>
                                <div className="relative">
                                    {/* Central Human Silhouette Visual */}
                                    <motion.div
                                        animate={isSimulating ? { scale: [1, 1.02, 1], opacity: [0.3, 0.4, 0.3] } : {}}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="relative w-64 h-[450px] mx-auto opacity-30 grayscale pointer-events-none"
                                    >
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-gradient-to-b from-[#00D1FF]/10 to-[#7000FF]/10 blur-[100px] rounded-full h-96 w-96 transform -translate-x-1/2 left-1/2" />
                                        <div className="w-full h-full border-2 border-dashed border-white/10 rounded-[5rem] flex items-center justify-center italic text-white/5 text-9xl font-black select-none uppercase tracking-tighter">
                                            BODY
                                        </div>
                                    </motion.div>

                                    {/* Interactive Risk Markers */}
                                    {!isSimulating && scannedRegions.map((risk, idx) => (
                                        <RiskMarker
                                            key={risk.id}
                                            {...risk.coordinates}
                                            label={risk.region}
                                            severity={risk.severity}
                                            delay={idx * 0.2}
                                            isHovered={hoveredRisk === risk.id}
                                            onHover={() => setHoveredRisk(risk.id)}
                                            onLeave={() => setHoveredRisk(null)}
                                        />
                                    ))}
                                </div>
                            </AnimatePresence>
                        </div>

                        {/* HUD Elements */}
                        <div className="absolute top-10 left-10 p-4 border-l-2 border-[#00D1FF]/30 backdrop-blur-md rounded-r-2xl bg-white/[0.02]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Activity size={10} className="text-[#00D1FF]" />
                                Live Analysis Data
                            </p>
                            <p className="text-2xl font-black italic text-white">14,882 <span className="text-xs text-slate-600">vps</span></p>
                        </div>

                        <div className="absolute top-10 right-10 p-4 border-r-2 border-[#7000FF]/30 text-right backdrop-blur-md rounded-l-2xl bg-white/[0.02]">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2 justify-end">
                                <Brain size={10} className="text-[#7000FF]" />
                                AI Reliability
                            </p>
                            <p className="text-2xl font-black italic text-white">98.4%</p>
                        </div>

                        <div className="absolute bottom-10 inset-x-10 flex justify-between items-end gap-6 pointer-events-none">
                            {isRuralMode && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-lg max-w-xs pointer-events-auto"
                                >
                                    <div className="flex items-center gap-3 text-emerald-400 mb-2 font-black italic">
                                        <MapPin size={18} />
                                        <span className="text-[10px] uppercase tracking-widest tracking-[0.2em]">Rural Geography Layer</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                                        Local agricultural pollutants and specialist transit lag (2.4h) integrated into current projections.
                                    </p>
                                </motion.div>
                            )}

                            <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-[9px] font-black uppercase text-slate-500 tracking-[0.3em] backdrop-blur-md pointer-events-auto">
                                LAST SYNC: {lastSync.toLocaleTimeString()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] glass-card border-white/5 bg-white/[0.01] group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <ShieldCheck size={100} />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
                                <TrendingDown size={14} className="text-[#00D1FF]" />
                                Prevention Strategy
                            </h4>
                            <p className="text-sm text-slate-200 font-bold leading-relaxed mb-6 italic">
                                "Increasing daily hydration and specific localized stretching can reduce structural risk in the left forearm by up to 34%."
                            </p>
                            <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-[#00D1FF] uppercase tracking-widest flex items-center gap-2 hover:bg-[#00D1FF]/10 transition-all">
                                VIEW INTERVENTION PLAN <ChevronRight size={14} />
                            </button>
                        </motion.div>

                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-[2.5rem] glass-card border-[#7000FF]/20 bg-[#7000FF]/5 group"
                        >
                            <h4 className="font-black text-xs uppercase tracking-[0.2em] text-[#7000FF] mb-6 flex items-center gap-2">
                                <AlertTriangle size={14} className="animate-pulse" />
                                Critical Window
                            </h4>
                            <p className="text-sm text-slate-200 font-bold leading-relaxed mb-6">
                                The next <span className="text-[#7000FF]">45 days</span> are vital for cardiovascular stabilization. High-intensity signal monitoring recommended.
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest bg-black/20 p-3 rounded-xl w-fit">
                                <Info size={12} /> PROTOCOL: ACTIVE MONITORING
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Sidebar - Risk Inventory */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-500">Trajectory Feed</h3>
                        <Activity size={14} className="text-slate-600" />
                    </div>
                    <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-2 custom-scrollbar">
                        {isSimulating ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] animate-pulse space-y-4">
                                    <div className="flex justify-between">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl" />
                                        <div className="w-16 h-4 bg-white/5 rounded-full" />
                                    </div>
                                    <div className="h-4 bg-white/5 rounded-full w-2/3" />
                                    <div className="h-12 bg-white/5 rounded-2xl w-full" />
                                </div>
                            ))
                        ) : (
                            scannedRegions.map((risk, idx) => (
                                <motion.div
                                    key={risk.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onMouseEnter={() => setHoveredRisk(risk.id)}
                                    onMouseLeave={() => setHoveredRisk(null)}
                                    className={`p-8 rounded-[2.5rem] border transition-all cursor-pointer group ${hoveredRisk === risk.id
                                        ? 'bg-[#00D1FF]/10 border-[#00D1FF]/40 shadow-[0_0_30px_rgba(0,209,255,0.1)]'
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${hoveredRisk === risk.id ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'bg-white/5 text-slate-400 group-hover:text-white'
                                            }`}>
                                            <risk.icon size={24} />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${risk.severity === 'medium' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' :
                                            risk.severity === 'high' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                                                'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                                            }`}>
                                            {risk.severity === 'medium' ? 'Mod-Risk' : risk.severity === 'high' ? 'High-Risk' : 'Low-Risk'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-black text-lg">{risk.region}</h4>
                                        {risk.trend === "up" && <TrendingDown size={14} className="text-red-500 rotate-180" />}
                                        {risk.trend === "down" && <TrendingDown size={14} className="text-emerald-500" />}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{risk.type}</p>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6 italic">
                                        "{risk.insight}"
                                    </p>
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest pt-4 border-t border-white/5">
                                        <span className="text-slate-600">Timeline: {risk.timeframe}</span>
                                        <span className={risk.probability > 20 ? 'text-red-400' : 'text-white'}>{risk.probability.toFixed(1)}% Prob</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    <button className="w-full p-6 rounded-[2rem] border border-dashed border-white/10 hover:border-[#00D1FF]/40 text-[10px] font-black text-slate-500 hover:text-[#00D1FF] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                        <Share2 size={14} /> SECURE SHARE WITH CLINIC
                    </button>
                </div>
            </div>
        </div>
    );
}

function RiskMarker({ top, left, label, severity, delay, isHovered, onHover, onLeave }: any) {
    const color = severity === 'high' ? '#EF4444' : severity === 'medium' ? '#F59E0B' : '#10B981';

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: "spring" }}
            className="absolute flex items-center gap-4 group cursor-pointer z-30"
            style={{ top, left }}
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
        >
            <div className="relative">
                <motion.div
                    animate={{ scale: isHovered ? [1, 1.4, 1] : [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-5 h-5 rounded-full absolute inset-0 opacity-40"
                    style={{ backgroundColor: color }}
                />
                <div
                    className={`w-5 h-5 rounded-full relative shadow-[0_0_20px_rgba(255,255,255,0.2)] border-2 border-black transition-transform ${isHovered ? 'scale-125' : ''}`}
                    style={{ backgroundColor: color }}
                />
            </div>

            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        className="p-4 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl min-w-[150px]"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Eye size={10} className="text-[#00D1FF]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#00D1FF]">Risk Sector</span>
                        </div>
                        <p className="text-xs font-black text-white uppercase">{label}</p>
                        <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} className="h-full bg-red-500" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
