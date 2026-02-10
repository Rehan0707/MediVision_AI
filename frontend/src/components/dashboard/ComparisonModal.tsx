"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Maximize2, MoveHorizontal, Zap } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
const HandScene = dynamic(() => import("@/components/animations/HandScene"), { ssr: false });
const BrainScene = dynamic(() => import("@/components/animations/BrainScene"), { ssr: false });
const ThoraxScene = dynamic(() => import("@/components/animations/ThoraxScene"), { ssr: false });
const KneeScene = dynamic(() => import("@/components/animations/KneeScene"), { ssr: false });
const SpineScene = dynamic(() => import("@/components/animations/SpineScene"), { ssr: false });

interface ComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    originalImage: string;
    detectedPart?: string;
    hasIssue?: boolean;
}

export function ComparisonModal({ isOpen, onClose, originalImage, detectedPart = 'searching', hasIssue = false }: ComparisonModalProps) {
    const [sliderPos, setSliderPos] = useState(50);

    const renderScene = () => {
        if (detectedPart.includes('brain') || detectedPart.includes('mri')) return <BrainScene hasIssue={hasIssue} />;
        if (detectedPart.includes('hand') || detectedPart.includes('carpal')) return <HandScene hasIssue={hasIssue} />;
        if (detectedPart.includes('knee') || detectedPart.includes('leg') || detectedPart.includes('joint')) return <KneeScene hasIssue={hasIssue} />;
        if (detectedPart.includes('spine') || detectedPart.includes('back') || detectedPart.includes('vertebra')) return <SpineScene hasIssue={hasIssue} />;
        if (detectedPart.includes('chest') || detectedPart.includes('lung') || detectedPart.includes('thorax') || detectedPart.includes('bone')) return <ThoraxScene hasIssue={hasIssue} />;
        return <HandScene hasIssue={hasIssue} />; // Fallback
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-2xl"
                >
                    <div className="relative w-full max-w-7xl h-full flex flex-col bg-[#020617] rounded-[3rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,209,255,0.1)]">
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight text-white italic">Voxel-Sync <span className="text-[#00D1FF]">Comparison</span></h2>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-tight">Synchronized analysis between 2D Diagnostic and AI 3D Reconstruction</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Comparison Slider Area */}
                        <div className="flex-1 relative overflow-hidden bg-black/40">
                            {/* AI 3D Layer (Fixed at back) */}
                            <div className="absolute inset-0">
                                {renderScene()}
                                <div className="absolute top-10 right-10 z-20 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-[#00D1FF]/30">
                                    <div className="flex items-center gap-3">
                                        <Zap size={18} className="text-[#00D1FF] animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-widest text-[#00D1FF]">AI 3D ENGINE ACTIVE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Original 2D Layer (Clipped at front) */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                            >
                                <div className="w-full h-full relative">
                                    <img
                                        src={originalImage}
                                        alt="Original Scan"
                                        className="w-full h-full object-cover grayscale opacity-60"
                                    />
                                    <div className="absolute inset-0 medical-grid opacity-20" />
                                    <div className="absolute top-10 left-10 z-20 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-300">RAW DICOM DATA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Slider Handle */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-[#00D1FF] shadow-[0_0_20px_rgba(0,209,255,0.5)] cursor-col-resize z-30"
                                style={{ left: `${sliderPos}%` }}
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#00D1FF] text-black flex items-center justify-center shadow-2xl">
                                    <MoveHorizontal size={24} />
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={sliderPos}
                                    onChange={(e) => setSliderPos(Number(e.target.value))}
                                    className="absolute inset-0 opacity-0 cursor-col-resize w-full h-full"
                                    style={{ transform: 'scale(10)' }}
                                />
                            </div>
                        </div>

                        {/* Footer / Stats */}
                        <div className="p-8 bg-white/[0.02] border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <ComparisonStat label="Sync Precision" value="0.002mm" color="#00D1FF" />
                            <ComparisonStat label="Volumetric Match" value="99.8%" color="#7000FF" />
                            <ComparisonStat label="Processing Delay" value="14ms" color="#10b981" />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function ComparisonStat({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex flex-col gap-1 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
            <span className="text-xl font-black" style={{ color }}>{value}</span>
        </div>
    );
}
