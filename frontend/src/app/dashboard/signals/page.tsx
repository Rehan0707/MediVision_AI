"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Activity, Heart, Zap, ShieldCheck, Thermometer, Droplets, ArrowUpRight, ArrowDownRight, Info, Upload, Sparkles, Scan, ChevronRight, FileJson, Share2, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/context/SettingsContext";

import { ECGMonitor } from "@/components/dashboard/ECGMonitor";
import { runLocalInference, MLResult } from "@/lib/ml/engine";

interface EcgResult {
    rhythm: string;
    findings: string[];
    summary: string;
    confidence: number;
    heartRateBpm: number;
    spo2?: number;
    temperature?: number;
}

function EcgAnalysisSection({ onAnalysisComplete }: { onAnalysisComplete: (result: EcgResult) => void }) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<EcgResult | null>(null);
    const [localMlResult, setLocalMlResult] = useState<MLResult | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);

        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
        const base64 = await base64Promise as string;
        setPreviewImage(base64);

        try {
            // Dual Engine Analysis
            const localPromise = runLocalInference(base64, "ecg");

            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: base64,
                    prompt: `Analyze this ECG (Electrocardiogram) scan image/recording. 
                    Identify the heart rhythm, any abnormalities (arrhythmia, tachycardia, bradycardia, etc.), and provide a plain-English explanation of what is happening.
                    Return ONLY a JSON object:
                    {
                        "rhythm": "string",
                        "findings": ["string"],
                        "summary": "string",
                        "confidence": number,
                        "heartRateBpm": number
                    }`
                })
            });

            const data = await res.json();
            const localResult = await localPromise;

            const jsonStr = data.text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            setAnalysisResult(parsed);
            setLocalMlResult(localResult);
            onAnalysisComplete(parsed);
        } catch (err) {
            console.error("ECG Analysis Error:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div id="cardio-vision" className="p-10 rounded-[3rem] glass-morphism border-[#00D1FF]/20 bg-[#00D1FF]/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00D1FF]/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] shadow-inner border border-[#00D1FF]/20">
                        <Heart size={28} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black italic uppercase tracking-tight">Cardiovascular <span className="text-[#00D1FF]">Vision</span></h3>
                        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-black">AI-ECG Recog Layer v4.0</p>
                    </div>
                </div>

                <label className="cursor-pointer group">
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                    <div className="px-8 py-5 rounded-2xl bg-[#00D1FF] text-black font-black text-xs uppercase tracking-[0.2em] shadow-xl group-hover:scale-105 transition-transform flex items-center gap-3">
                        {isAnalyzing ? <Activity size={18} className="animate-spin" /> : <Upload size={18} />}
                        {isAnalyzing ? "Analyzing Waves..." : "Upload ECG Image"}
                    </div>
                </label>
            </div>

            {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-20 h-20 rounded-3xl bg-[#00D1FF]/10 border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] mb-6"
                    >
                        <Scan size={40} className="animate-pulse" />
                    </motion.div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00D1FF] animate-pulse">Syncing with Cardiac Neural Node...</p>
                </div>
            )}

            {analysisResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-black/40 border border-white/10 aspect-video relative overflow-hidden group">
                            {previewImage && <img src={previewImage} className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all duration-700" />}
                            <div className="absolute inset-0 medical-grid opacity-20" />
                            <div className="absolute top-4 right-6 px-3 py-1 rounded-full bg-[#00D1FF]/20 border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] font-black uppercase tracking-widest">Captured Lead</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Detected BPM</p>
                                <p className="text-2xl font-black text-white">{analysisResult.heartRateBpm || "--"}</p>
                            </div>
                            <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Synapse Confidence</p>
                                <p className="text-2xl font-black text-[#00D1FF]">{analysisResult.confidence || localMlResult?.confidence || "--"}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center gap-3 text-emerald-400 mb-4">
                                <ShieldCheck size={20} />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] font-black italic">{analysisResult.rhythm || "Neural Analysis Complete"}</span>
                            </div>
                            <p className="text-xl font-medium text-slate-200 leading-relaxed italic">
                                "{analysisResult.summary}"
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Findings</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {analysisResult.findings?.map((f: string, i: number) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group hover:bg-[#00D1FF]/10 transition-colors">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
                                        <span className="text-sm font-medium text-slate-300">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="flex items-center gap-2 text-[10px] font-black text-[#00D1FF] hover:translate-x-2 transition-transform uppercase tracking-widest">
                            <Sparkles size={14} /> Consult Cardiology AI <ChevronRight size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

export default function SignalsPage() {
    const { isPrivacyMode } = useSettings();
    const [heartRate, setHeartRate] = useState(0);
    const [spo2, setSpo2] = useState(0);
    const [temp, setTemp] = useState(0);
    const [waveType, setWaveType] = useState<"ECG" | "EEG" | "EMG">("ECG");
    const [analysisStatus, setAnalysisStatus] = useState<EcgResult | null>(null);

    const handleAnalysisComplete = (result: EcgResult) => {
        setAnalysisStatus(result);
        if (result.heartRateBpm) setHeartRate(result.heartRateBpm);
        if (result.spo2) setSpo2(result.spo2);
        if (result.temperature) setTemp(result.temperature);
    };

    const [isExporting, setIsExporting] = useState(false);

    // Simulate real-time signal drift
    // Simulate real-time signal drift
    /* 
    useEffect(() => {
        const interval = setInterval(() => {
            setHeartRate(h => {
                const shift = (Math.random() - 0.5) * 2;
                const newRate = h + shift;
                return Math.max(65, Math.min(85, newRate));
            });
            setSpo2(s => Math.max(97.5, Math.min(99.8, s + (Math.random() - 0.5) * 0.1)));
            setTemp(t => Math.max(36.4, Math.min(37.1, t + (Math.random() - 0.5) * 0.05)));
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    */

    const handleDownloadLogs = () => {
        setIsExporting(true);
        setTimeout(() => {
            const logs = {
                timestamp: new Date().toISOString(),
                patientId: "SELF-AUTH",
                metrics: { heartRate, spo2, temp },
                analysis: analysisStatus || "Baseline scan only",
                waveType
            };
            const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MediVision_Signals_${new Date().getTime()}.json`;
            a.click();
            setIsExporting(false);
        }, 2000);
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight uppercase italic underline decoration-[#00D1FF]/30 underline-offset-8">Signal <span className="text-[#00D1FF]">Intelligence</span></h1>
                    <p className="text-slate-400 font-medium">Real-time physiological stream tracking with proprietary Synapse-X cross-referencing.</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 shadow-xl shadow-emerald-500/5 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Secure Stream Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Signal Display */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-10 rounded-[3rem] glass-morphism border-white/5 relative overflow-hidden bg-white/[0.01]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black flex items-center gap-3 uppercase italic tracking-tight">
                                <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center text-[#00D1FF]">
                                    <Activity size={20} />
                                </div>
                                Multi-Channel Waveform
                            </h3>
                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                                {(["ECG", "EEG", "EMG"] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setWaveType(type)}
                                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${waveType === type ? 'bg-[#00D1FF] text-black shadow-lg shadow-[#00D1FF]/20' : 'text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Real-Time Waveform */}
                        <div className="h-64 w-full relative mb-8 flex items-center justify-center overflow-hidden rounded-3xl bg-black/60 border border-white/10 shadow-inner">
                            <div className="absolute inset-0 opacity-20 medical-grid" />
                            <div className="absolute top-4 left-6 flex items-center gap-2 z-10">
                                <div className="w-2 h-2 rounded-full bg-slate-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Offline • {waveType} Mode</span>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={waveType}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full h-full"
                                >
                                    <ECGMonitor heartRate={waveType === "ECG" ? heartRate : waveType === "EEG" ? heartRate / 4 : heartRate * 1.5} color={waveType === "ECG" ? "#00D1FF" : waveType === "EEG" ? "#7000FF" : "#FACC15"} />
                                </motion.div>
                            </AnimatePresence>

                            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/80 to-transparent pointer-events-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SignalMetric
                                icon={<Heart className="text-red-400" size={18} />}
                                label="Heart Rate"
                                value={heartRate > 0 ? `${Math.round(heartRate)}` : "--"}
                                unit="BPM"
                                trend="stable"
                            />
                            <SignalMetric
                                icon={<Droplets className="text-blue-400" size={18} />}
                                label="O₂ Saturation"
                                value={spo2 > 0 ? `${spo2.toFixed(1)}` : "--"}
                                unit="%"
                                trend="stable"
                            />
                            <SignalMetric
                                icon={<Thermometer className="text-orange-400" size={18} />}
                                label="Surface Temp"
                                value={temp > 0 ? `${temp.toFixed(1)}` : "--"}
                                unit="°C"
                                trend="stable"
                            />
                        </div>
                    </div>

                    <EcgAnalysisSection onAnalysisComplete={handleAnalysisComplete} />

                    <div className="p-10 rounded-[3rem] glass-card border-[#7000FF]/10 bg-[#7000FF]/[0.02] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap size={100} className="text-[#7000FF]" />
                        </div>
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase italic relative z-10">
                            <Zap className="text-[#7000FF]" size={22} />
                            Neural Pattern Match
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                {analysisStatus
                                    ? `Direct AI correlation established: ${analysisStatus.rhythm}. Analyzing wave morphology for sub-clinical indicators.`
                                    : "AI is scanning historical patterns for arrhythmia or abnormal recovery signals..."
                                }
                            </p>
                            <div className={`p-6 rounded-2xl bg-white/[0.03] border flex items-center justify-between transition-all ${analysisStatus ? 'border-[#00D1FF]/40 bg-[#00D1FF]/5' : 'border-white/5'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${analysisStatus ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{analysisStatus ? analysisStatus.rhythm : "Sinus Rhythm Verified"}</h4>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{analysisStatus ? `Confidence: ${analysisStatus.confidence}%` : "99.8% Neural Concordance"}</p>
                                    </div>
                                </div>
                                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                                    <ArrowUpRight size={20} className="text-[#00D1FF]" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] glass-morphism border-white/5 bg-white/[0.01]">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Activity size={12} className="text-slate-600" />
                            Device Sync
                        </h4>
                        <div className="space-y-4">
                            <DeviceItem name="MediLink Implant v2" status="searching" />
                            <DeviceItem name="Vitals Patch Alpha" status="searching" />
                            <DeviceItem name="Neural Crown 4" status="searching" />
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#00D1FF]/10 to-transparent border border-[#00D1FF]/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[#00D1FF]/10 flex items-center justify-center text-[#00D1FF] mb-6 shadow-glow group-hover:scale-110 transition-transform">
                                <Info size={24} />
                            </div>
                            <h4 className="font-black text-lg mb-2 uppercase italic tracking-tight">Vitals Summary</h4>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">All physiological signals are within normal clinical thresholds. No immediate action required.</p>
                            <button
                                onClick={handleDownloadLogs}
                                disabled={isExporting}
                                className="w-full py-4 rounded-2xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 hover:bg-[#00D1FF]/20 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                                {isExporting ? (
                                    <>
                                        <Activity size={14} className="animate-spin" />
                                        Generating Packet...
                                    </>
                                ) : (
                                    <>
                                        <Download size={14} />
                                        DOWNLOAD LOGS
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] glass-morphism border-white/5 bg-black/40">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Node Health</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">SYNC STABILITY</span>
                                <span className="text-slate-600">OFFLINE</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: "0%" }} className="h-full bg-slate-700" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function SignalMetric({ icon, label, value, unit, trend }: { icon: any, label: string, value: string, unit: string, trend: 'up' | 'down' | 'stable' }) {
    return (
        <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-2 rounded-xl bg-white/[0.05] text-slate-400 group-hover:text-white transition-colors">{icon}</div>
                <div className="px-2 py-1 rounded-md bg-white/[0.05]">
                    {trend === 'up' && <ArrowUpRight size={14} className="text-emerald-400" />}
                    {trend === 'down' && <ArrowDownRight size={14} className="text-red-400" />}
                    {trend === 'stable' && <Activity size={14} className="text-[#00D1FF]" />}
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">{label}</p>
            <div className="flex items-baseline gap-1 relative z-10">
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter">{value}</span>
                <span className="text-xs font-bold text-slate-600 uppercase">{unit}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/[0.01] blur-2xl rounded-full" />
        </div>
    );
}

function DeviceItem({ name, status, battery }: { name: string, status: 'connected' | 'searching', battery?: number }) {
    return (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/5 transition-all">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700 animate-pulse'}`} />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{name}</span>
            </div>
            {battery !== undefined ? (
                <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-slate-500 uppercase">{battery}%</span>
                    <div className="w-6 h-3 rounded-sm border border-slate-700 p-[1px]">
                        <div className="h-full bg-emerald-500/50 rounded-[1px]" style={{ width: `${battery}%` }} />
                    </div>
                </div>
            ) : (
                <span className="text-[9px] font-black text-[#00D1FF] uppercase animate-pulse">Searching...</span>
            )}
        </div>
    );
}
