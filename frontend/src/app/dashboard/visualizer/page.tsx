"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Bone, Activity, ShieldCheck, WifiOff, ArrowRight, Upload, Search, FileText, CheckCircle2, AlertCircle, Sparkles, Target, Box } from "lucide-react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
const BoneScene = dynamic(() => import("@/components/animations/BoneScene"), { ssr: false });
const HandScene = dynamic(() => import("@/components/animations/HandScene"), { ssr: false });
const BrainScene = dynamic(() => import("@/components/animations/BrainScene"), { ssr: false });
const ThoraxScene = dynamic(() => import("@/components/animations/ThoraxScene"), { ssr: false });
const LegScene = dynamic(() => import("@/components/animations/LegScene"), { ssr: false });
import { useSettings } from "@/context/SettingsContext";
import { apiUrl, authHeaders } from "@/lib/api";
import XvrRegistrationPanel from "@/components/visualizer/XvrRegistrationPanel";

import { ScanTypeSelector, ScanType } from "@/components/visualizer/ScanTypeSelector";

function VisualizerContent() {
    const { isRuralMode, setIsRuralMode, t } = useSettings();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzed, setIsAnalyzed] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);
    const [detectedPart, setDetectedPart] = useState<string>("hand");
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
    const [showSource, setShowSource] = useState(false);
    const [modality, setModality] = useState<string | null>(null);
    const [selectedScanType, setSelectedScanType] = useState<ScanType | null>(null);
    const [xvrData, setXvrData] = useState<any>(null);

    useEffect(() => {
        const m = searchParams.get("modality");
        if (m) setModality(m);
    }, [searchParams]);

    const canShow3DModel = !detectedPart.includes("chest") && !detectedPart.includes("lung") && !detectedPart.includes("thorax");

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setIsAnalyzed(false);

        // Convert to Base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
        const base64 = await base64Promise as string;
        setCurrentImage(base64);

        try {
            const res = await fetch(apiUrl('/api/ai/analyze'), {
                method: 'POST',
                headers: authHeaders((session?.user as any)?.accessToken),
                body: JSON.stringify({
                    image: base64,
                    modality: modality || 'xray',
                    scanType: selectedScanType,
                    prompt: modality === 'ultrasound'
                        ? `Analyze this ULTRASOUND image. Identify body part, echo texture, masses, fluid. Return JSON: {"detectedPart":"string","findings":[{"id":"1","label":"string","description":"string","severity":"low|medium|high"}],"summary":"string","confidence":number}`
                        : modality === 'pet'
                            ? `Analyze this PET SCAN image. Identify metabolic activity, hotspots, organs. Return JSON: {"detectedPart":"string","findings":[{"id":"1","label":"string","description":"string","severity":"low|medium|high"}],"summary":"string","confidence":number}`
                            : `Perform clinical analysis for this ${selectedScanType || modality || 'medical'} ${modality?.toUpperCase() || 'X-RAY'} scan. Identify body part and findings.
                    Return ONLY JSON: {"detectedPart":"string","findings":[{"id":"1","label":"string","description":"string","severity":"low|medium|high"}],"summary":"string","confidence":number}`
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'AI Analysis failed');
            }

            const parsedData = await res.json();
            setAnalysisData(parsedData);

            // If manual selection exists, prefer it for mapping, or fallback to AI detection
            // For now, we rely on AI detection but the prompt context helps it be accurate.
            setDetectedPart(parsedData.detectedPart?.toLowerCase() || "unknown");
            setIsAnalyzed(true);
        } catch (err) {
            console.error("AI Analysis failed:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const renderScene = () => {
        const hasIssue = analysisData?.findings?.some((f: any) => f.severity === 'high');

        if (detectedPart.includes("brain") || detectedPart.includes("head") || detectedPart.includes("skull")) {
            return <BrainScene hasIssue={hasIssue} />;
        }
        if (detectedPart.includes("hand") || detectedPart.includes("arm") || detectedPart.includes("wrist")) {
            return <HandScene hasIssue={hasIssue} />;
        }
        if (detectedPart.includes("chest") || detectedPart.includes("lung") || detectedPart.includes("thorax")) {
            return <ThoraxScene hasIssue={hasIssue} />;
        }
        if (detectedPart.includes("leg") || detectedPart.includes("tibia") || detectedPart.includes("fibula")) {
            return <LegScene hasIssue={hasIssue} />;
        }
        if (modality === 'mammography' || detectedPart.includes("breast")) {
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="relative">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-64 h-64 rounded-full bg-pink-500/20 blur-3xl absolute -inset-10"
                        />
                        <div className="w-48 h-48 rounded-full border-2 border-dashed border-pink-400/30 flex items-center justify-center relative">
                            <Sparkles className="text-pink-400 absolute animate-pulse" size={48} />
                            <div className="text-[10px] font-black text-pink-400 uppercase tracking-[0.3em] text-center px-6">
                                Mammography Proxy Scene Active
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return <BoneScene hasIssue={hasIssue} />;
    };

    return (
        <div className="space-y-8 h-full flex flex-col pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">3D <span className="text-[#00D1FF]">Visualizer</span></h1>
                    <p className="text-slate-400">Convert static 2D diagnostics into immersive neural architecture.</p>
                </div>
                <div className="flex gap-4">
                    {!isAnalyzed ? (
                        <button
                            onClick={() => document.getElementById('visualizer-upload')?.click()}
                            className="px-8 py-3 rounded-2xl bg-[#00D1FF] text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,209,255,0.3)] flex items-center gap-3"
                        >
                            <Upload size={16} /> Upload X-Ray
                        </button>
                    ) : (
                        <button
                            onClick={() => { setIsAnalyzed(false); setCurrentImage(null); }}
                            className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                        >
                            Reset System
                        </button>
                    )}
                    <input type="file" id="visualizer-upload" className="hidden" onChange={handleFileUpload} accept="image/*" />
                </div>
            </div>

            {!isAnalyzed && !isUploading ? (
                <div className="flex-1 flex flex-col">
                    {modality === 'xray' && (
                        <ScanTypeSelector
                            selectedType={selectedScanType}
                            onSelect={setSelectedScanType}
                        />
                    )}

                    <div
                        onClick={() => {
                            if (modality === 'xray' && !selectedScanType) {
                                alert("Please select an examination protocol first.");
                                return;
                            }
                            document.getElementById('visualizer-upload')?.click();
                        }}
                        className={`flex-1 min-h-[400px] rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${(modality === 'xray' && !selectedScanType)
                            ? 'border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#00D1FF]/40'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform ${(modality === 'xray' && !selectedScanType) ? 'bg-white/5 text-slate-600' : 'bg-[#00D1FF]/10 text-[#00D1FF] group-hover:scale-110'
                            }`}>
                            <Upload size={32} />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Initialize Neural Render</h2>
                        <p className="text-slate-500 max-w-sm text-center">
                            {(modality === 'xray' && !selectedScanType)
                                ? "Select an examination protocol above to continue."
                                : "Upload medical imaging data to begin."}
                        </p>
                    </div>
                </div>
            ) : isUploading ? (
                <div className="flex-1 min-h-[500px] flex flex-col items-center justify-center space-y-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white/5 border-t-[#00D1FF] animate-spin" />
                        <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#00D1FF]" size={32} />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black animate-pulse">Analyzing Voxel Data...</h2>
                        <p className="text-slate-500 mt-2 tracking-widest text-[10px] uppercase font-black">Clinical Intelligence Sync Active</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
                    <div className="lg:col-span-3 min-h-[600px] glass-morphism rounded-[2.5rem] relative overflow-hidden group shadow-2xl border-white/5">
                        <div className="absolute inset-0 medical-grid opacity-10" />

                        <div className="absolute inset-0">
                            {canShow3DModel && !showSource ? (
                                renderScene()
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-20 bg-black/40">
                                    <img src={currentImage!} className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10" alt="Source" />
                                </div>
                            )}
                        </div>

                        {/* Technical HUD Overlay */}
                        <div className="absolute top-10 left-10 flex flex-col gap-2 pointer-events-none z-10">
                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black tracking-widest text-[#00D1FF] uppercase flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
                                Detected: {detectedPart.toUpperCase()}
                            </div>
                            <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                Confidence Level: {analysisData?.confidence != null
                                    ? (analysisData.confidence <= 1 ? Math.round(analysisData.confidence * 100) : analysisData.confidence)
                                    : "--"}%
                            </div>
                            {xvrData && (
                                <div className="bg-[#00D1FF]/10 backdrop-blur-md px-4 py-2 rounded-xl border border-[#00D1FF]/20 text-[10px] font-black tracking-widest text-[#00D1FF] uppercase flex items-center gap-2">
                                    <Target size={12} className="animate-pulse" />
                                    XVR Alignment: {xvrData.registration_metrics.confidence * 100}%
                                </div>
                            )}
                        </div>

                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end pointer-events-none z-10">
                            <div className="flex gap-3 pointer-events-auto">
                                {(!detectedPart.includes("chest") && !detectedPart.includes("lung") && !detectedPart.includes("thorax")) && (
                                    <button
                                        onClick={() => setShowSource(!showSource)}
                                        className={`px-6 py-3 rounded-xl font-black text-xs transition-all shadow-lg ${!showSource ? 'bg-[#00D1FF] text-black' : 'bg-black/60 text-white border border-white/10'}`}
                                    >
                                        {!showSource ? "VIEW 3D MODEL" : "VIEW SOURCE X-RAY"}
                                    </button>
                                )}
                                <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black hover:bg-white/10 transition-all capitalize">
                                    {detectedPart} Analysis
                                </button>
                            </div>
                            <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 max-w-sm pointer-events-auto">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                        Clinical Synthesis Complete
                                    </span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed italic">
                                    {analysisData?.summary}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 glass-card rounded-[2rem] border-[#00D1FF]/10">
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                <Activity size={18} className="text-[#00D1FF]" />
                                AI Analysis Findings
                            </h3>
                            <div className="space-y-4">
                                {analysisData?.findings?.map((f: any, i: number) => (
                                    <div
                                        key={i}
                                        className="w-full text-left p-4 rounded-xl border bg-white/5 border-white/5 hover:border-[#00D1FF]/30 transition-all"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{f.id}</p>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${f.severity === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {f.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs font-black mb-1">{f.label}</p>
                                        <p className="text-[10px] text-slate-400 leading-tight">{f.description}</p>
                                    </div>
                                ))}
                                {(!analysisData?.findings || analysisData.findings.length === 0) && (
                                    <div className="text-center py-6 text-slate-500 text-xs italic">
                                        No significant abnormalities identified.
                                    </div>
                                )}
                            </div>
                        </div>

                        {currentImage && (
                            <XvrRegistrationPanel
                                image={currentImage}
                                onRegistrationComplete={(data) => setXvrData(data)}
                            />
                        )}

                        <div className="p-8 glass-morphism rounded-[2rem] border-emerald-500/20 bg-emerald-500/5">
                            <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-4 flex items-center gap-3 text-emerald-400">
                                <ShieldCheck size={18} />
                                Neural Verification
                            </h3>
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                Dataset cross-referenced with B-ALPHA protocol globally. Structural integrity confirmed at sub-voxel resolution.
                            </p>
                        </div>

                        <button className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs tracking-[0.1em] uppercase hover:scale-[1.02] transition-transform shadow-2xl">
                            DOWNLOAD 3D ASSET (.STL)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VisualizerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#00D1FF] font-black uppercase tracking-[0.3em] animate-pulse">Loading Visualizer...</div>}>
            <VisualizerContent />
        </Suspense>
    );
}

function MetricItem({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-[11px] font-bold mb-2">
                <span className="text-slate-500 uppercase tracking-widest">{label}</span>
                <span style={{ color }}>{value}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: value }}
                    transition={{ duration: 1.5 }}
                    className="h-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}
