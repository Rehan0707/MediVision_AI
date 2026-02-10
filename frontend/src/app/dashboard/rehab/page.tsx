"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Calendar, Activity, CheckCircle2, ChevronRight, Play, Info, Timer, Target, Sparkles, Brain, Clock, ShieldCheck, HeartPulse } from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

import dynamic from "next/dynamic";
const RehabExerciseScene = dynamic(() => import("@/components/animations/RehabExerciseScene"), { ssr: false });
import RehabCalendar from "@/components/dashboard/RehabCalendar";
import DoctorCollaboration from "@/components/dashboard/DoctorCollaboration";

interface Exercise {
    id: string;
    title: string;
    description: string;
    plainTitle: string;
    plainDescription: string;
    duration: string;
    intensity: "Low" | "Med" | "High";
    status: "Compete" | "In Progress" | "Upcoming";
    icon: any;
}

export default function RehabPage() {
    const { isRuralMode } = useSettings();
    const [isPlainEnglish, setIsPlainEnglish] = useState(false);
    const [activeExerciseIdx, setActiveExerciseIdx] = useState(1);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionProgress, setSessionProgress] = useState(0);

    const exercises: Exercise[] = [
        {
            id: 'ex-1',
            title: "Dynamic Neural Stretch",
            description: "Neural flossing of the brachial plexus to reduce distal nerve entrapment.",
            plainTitle: "Nerve Flexibility Stretch",
            plainDescription: "Gently stretching the nerves in your arm to prevent them from getting pinched or tight.",
            duration: "12 min",
            intensity: "Low",
            status: "Compete",
            icon: Brain
        },
        {
            id: 'ex-2',
            title: "Metacarpal Articulation v4",
            description: "Guided flexion and extension of the MCP joints within the optimal sagittal plane.",
            plainTitle: "Finger Joint Movement",
            plainDescription: "Simply bending and straightening your fingers to keep the joints loose and healthy.",
            duration: "8 min",
            intensity: "Med",
            status: "In Progress",
            icon: Activity
        },
        {
            id: 'ex-3',
            title: "Vascular Expansion Flow",
            description: "Intermittent compression maneuvers to stimulate capillary recruitment.",
            plainTitle: "Blood Flow Booster",
            plainDescription: "Exercises designed to get your blood moving to help the tissues heal faster.",
            duration: "15 min",
            intensity: "Low",
            status: "Upcoming",
            icon: HeartPulse
        }
    ];

    const activeExercise = exercises[activeExerciseIdx];

    useEffect(() => {
        let interval: any;
        if (isSessionActive && sessionProgress < 100) {
            interval = setInterval(() => {
                setSessionProgress(prev => Math.min(100, prev + 2));
            }, 1000);
        } else if (sessionProgress >= 100) {
            setIsSessionActive(false);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, sessionProgress]);

    const handleStartSession = () => {
        setIsSessionActive(true);
        setSessionProgress(0);
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 text-[#00D1FF] mb-2">
                        <Sparkles size={18} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Recovery Path Optimized</span>
                    </div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight italic uppercase">Recovery <span className="text-[#00D1FF]">Protocol</span></h1>
                    <p className="text-slate-400 font-medium">Personalized AI recovery pathways and physiological milestone tracking.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsPlainEnglish(!isPlainEnglish)}
                        className={`px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 ${isPlainEnglish
                            ? 'bg-[#00D1FF]/10 border-[#00D1FF]/40 text-[#00D1FF]'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                    >
                        <Info size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isPlainEnglish ? "Plain English: ON" : "Plain English: OFF"}
                        </span>
                    </button>
                    <div className="px-6 py-4 rounded-2xl glass-card border-white/5 flex items-center gap-3">
                        <Timer size={18} className="text-[#00D1FF]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00D1FF]">DAY 14 / 30</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Protocol Overview */}
                <div className="lg:col-span-2 space-y-8">
                    {/* 3D Exercise Visualizer */}
                    <div className="relative aspect-video rounded-[3.5rem] overflow-hidden group border border-white/5 bg-black/40">
                        <div className="absolute inset-0 medical-grid opacity-10" />
                        <RehabExerciseScene />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isPlainEnglish ? "plain" : "medical"}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="absolute top-8 left-8 p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 z-10 max-w-xs"
                            >
                                <p className="text-[10px] font-black text-[#00D1FF] uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Eye size={12} /> Live Visual Guide
                                </p>
                                <h4 className="text-lg font-black italic uppercase text-white mb-2">
                                    {isPlainEnglish ? activeExercise.plainTitle : activeExercise.title}
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                                    {isPlainEnglish ? activeExercise.plainDescription : activeExercise.description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10">
                            {isSessionActive && (
                                <div className="flex-1 max-w-md mr-8">
                                    <div className="flex justify-between text-[10px] font-black text-[#00D1FF] uppercase tracking-widest mb-2">
                                        <span>Session Progress</span>
                                        <span>{sessionProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${sessionProgress}%` }}
                                            className="h-full bg-gradient-to-r from-[#00D1FF] to-[#7000FF]"
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <button className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white">
                                    <Info size={20} />
                                </button>
                                <button className="px-8 py-3 rounded-2xl bg-[#00D1FF] text-black font-black text-xs uppercase tracking-widest shadow-xl shadow-[#00D1FF]/20 hover:scale-105 transition-all">
                                    FULL SCREEN
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Recovery Calendar */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#00D1FF]/20 to-[#7000FF]/20 rounded-[3.1rem] blur opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                        <RehabCalendar />
                    </div>

                    {/* Milestone Roadmap */}
                    <div className="p-10 rounded-[3rem] glass-morphism border-white/5 bg-white/[0.01] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Target size={120} />
                        </div>
                        <h3 className="text-xl font-black mb-10 flex items-center gap-3 uppercase italic text-white relative z-10">
                            <Target className="text-[#7000FF]" size={22} />
                            Functional Milestones
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-12 ml-4 border-l-2 border-white/5 pl-10 relative">
                                <Milestone
                                    date="Aug 12"
                                    title={isPlainEnglish ? "First Check-up" : "Initial Assessment"}
                                    status="done"
                                    description={isPlainEnglish ? "Setting up your recovery goals." : "Baseline diagnostic established."}
                                />
                                <Milestone
                                    date="Aug 18"
                                    title={isPlainEnglish ? "Getting Steady" : "Baseline Stabilization"}
                                    status="done"
                                    description={isPlainEnglish ? "Your neural signals are now steady." : "Synaptic drift remains under 2%."}
                                />
                            </div>
                            <div className="space-y-12 ml-4 border-l-2 border-white/5 pl-10 relative">
                                <Milestone
                                    date="Aug 25"
                                    title={isPlainEnglish ? "Healing Phase" : "Tissue Regen Phase 1"}
                                    status="active"
                                    description={isPlainEnglish ? "Tissues are starting to knit back." : "Cellular turnover up by 22%."}
                                />
                                <Milestone
                                    date="Sep 02"
                                    title={isPlainEnglish ? "Next Level" : "Mobility Test"}
                                    status="upcoming"
                                    description={isPlainEnglish ? "Testing how well you can move." : "Advanced range of motion audit."}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exercises Sidebar */}
                <div className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#00D1FF] to-[#7000FF] p-[1px] relative group">
                        <div className="absolute inset-0 bg-[#00D1FF]/20 blur-2xl opacity-0 group-hover:opacity-100 transition-all" />
                        <div className="w-full h-full bg-[#020617] rounded-[2.4rem] p-8 relative z-10">
                            <h3 className="text-lg font-black mb-6 uppercase italic flex items-center gap-3">
                                <Play size={18} className="text-[#00D1FF]" /> Next Motion
                            </h3>
                            <div className="space-y-6">
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                    {isPlainEnglish
                                        ? "Start your finger movement session now to keep your joints healthy."
                                        : `Initialize neural-sync to begin ${activeExercise.title}.`
                                    }
                                </p>
                                <button
                                    onClick={handleStartSession}
                                    disabled={isSessionActive}
                                    className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isSessionActive
                                        ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                        : 'bg-[#00D1FF] text-black hover:scale-105 shadow-glow'
                                        }`}
                                >
                                    {isSessionActive ? `SESSION IN PROGRESS (${sessionProgress}%)` : "START SESSION"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] glass-card border-white/5 bg-white/[0.01]">
                        <h3 className="text-xs font-black mb-8 flex items-center gap-3 uppercase italic text-slate-500 tracking-widest">
                            <Clock size={14} /> Task Queue
                        </h3>
                        <div className="space-y-4">
                            {exercises.map((ex, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 5 }}
                                    onClick={() => setActiveExerciseIdx(i)}
                                    className={`p-6 rounded-2xl border transition-all group cursor-pointer ${activeExerciseIdx === i
                                        ? 'bg-[#00D1FF]/10 border-[#00D1FF]/30'
                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className={`font-bold transition-colors ${activeExerciseIdx === i ? 'text-white' : 'text-slate-200'}`}>
                                            {isPlainEnglish ? ex.plainTitle : ex.title}
                                        </h4>
                                        {ex.status === 'Compete'
                                            ? <CheckCircle2 size={16} className="text-emerald-500" />
                                            : activeExerciseIdx === i
                                                ? <Play size={16} className="text-[#00D1FF] animate-pulse" />
                                                : <ChevronRight size={16} className="text-slate-600" />
                                        }
                                    </div>
                                    <div className="flex gap-4">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                            <Timer size={10} /> {ex.duration}
                                        </span>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${ex.intensity === 'Low' ? 'text-emerald-400' : 'text-orange-400'
                                            }`}>{ex.intensity} INTENSITY</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Doctor Collaboration Sidebar */}
                    <DoctorCollaboration />

                    <div className="p-8 rounded-[2.5rem] bg-[#7000FF]/5 border border-[#7000FF]/20 group hover:bg-[#7000FF]/10 transition-all relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 bg-[#7000FF]/10 w-24 h-24 rounded-full blur-2xl" />
                        <div className="flex items-center gap-4 text-[#7000FF] mb-4 relative z-10">
                            <Zap size={24} className="group-hover:scale-110 transition-transform shadow-glow" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isPlainEnglish ? "Healing Radar" : "Motion Sensor Hub"}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-bold italic relative z-10">
                            {isPlainEnglish
                                ? "\"You're doing great! You can move your arm 4% better today than yesterday.\""
                                : "\"Optimal alignment detected. Your range of motion has improved by 4.2% in the last 24 hours.\""
                            }
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-[8px] font-black text-[#7000FF] uppercase tracking-widest relative z-10">
                            <ShieldCheck size={12} /> VERIFIED BY AI DR. LUNA
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Milestone({ date, title, status, description }: { date: string, title: string, status: 'done' | 'active' | 'upcoming', description?: string }) {
    return (
        <div className="relative group/milestone">
            <div className={`absolute -left-[51px] top-0 w-10 h-10 rounded-full border-4 border-[#020617] flex items-center justify-center z-10 transition-transform group-hover/milestone:scale-110 ${status === 'done' ? 'bg-emerald-500' :
                status === 'active' ? 'bg-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.5)]' :
                    'bg-slate-800'
                }`}>
                {status === 'done' && <CheckCircle2 size={16} className="text-white" />}
                {status === 'active' && <Zap size={16} className="text-black" />}
            </div>
            <div className="mb-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{date}</span>
                <h4 className={`text-lg font-black tracking-tight italic uppercase transition-colors ${status === 'upcoming' ? 'text-slate-600 group-hover/milestone:text-slate-400' : 'text-white'
                    }`}>{title}</h4>
            </div>
            {description && (
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md italic">{description}</p>
            )}
        </div>
    );
}

function Eye({ size, className }: { size: number, className?: string }) {
    return <Activity size={size} className={className} />;
}
