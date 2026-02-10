"use client";

import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Brain, Activity, Bone, Globe2, ShieldCheck, Zap, ArrowRight, Play, ChevronDown, Heart } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const BoneScene = dynamic(() => import("@/components/animations/BoneScene"), { ssr: false });

export default function KeynotePage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const [activeBeat, setActiveBeat] = useState(0);

    // Scroll mapping for beats
    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            if (latest < 0.15) setActiveBeat(0);
            else if (latest < 0.35) setActiveBeat(1);
            else if (latest < 0.55) setActiveBeat(2);
            else if (latest < 0.75) setActiveBeat(3);
            else if (latest < 0.90) setActiveBeat(4);
            else setActiveBeat(5);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <main ref={containerRef} className="relative bg-black text-white h-[600vh] selection:bg-[#00D1FF]/30">
            {/* Fixed Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '3s' }} />
                <div className="absolute inset-0 medical-grid opacity-10" />
            </div>

            {/* Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="fixed top-0 left-0 w-full z-[100] px-10 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
            >
                <div className="flex items-center gap-3 pointer-events-auto">
                    <Link href="/" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all group">
                        <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <span className="text-xs font-black tracking-[0.3em] uppercase opacity-50">MediVision Vision</span>
                </div>
            </motion.nav>

            {/* Hero / Beat 1: The Invisible Wall */}
            <section className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
                <motion.div
                    style={{
                        opacity: useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]),
                        scale: useTransform(scrollYProgress, [0, 0.15], [1, 0.9])
                    }}
                    className="text-center z-10 max-w-4xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-20 h-20 bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] rounded-2xl mx-auto mb-12 flex items-center justify-center shadow-2xl shadow-blue-500/20"
                    >
                        <span className="text-2xl font-black text-black">MV</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-none"
                    >
                        THE INVISIBLE <br />WALL.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        Healthcare today speaks a language most humans don't understand.
                        Behind every scan is a person looking for hope.
                    </motion.p>
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mt-20 flex flex-col items-center gap-4 text-slate-500"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Scroll to Begin</span>
                        <ChevronDown size={20} />
                    </motion.div>
                </motion.div>
            </section>

            {/* Beat 2: The Breakthrough */}
            <section className="sticky top-0 h-screen flex items-center justify-center px-6 z-20">
                <motion.div
                    style={{
                        opacity: useTransform(scrollYProgress, [0.15, 0.25, 0.35], [0, 1, 0]),
                        scale: useTransform(scrollYProgress, [0.15, 0.25, 0.35], [0.8, 1, 1.2])
                    }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl w-full"
                >
                    <div className="space-y-8">
                        <div className="inline-flex py-1 px-3 rounded-full border border-[#00D1FF]/30 text-[#00D1FF] text-[10px] font-black uppercase tracking-widest">
                            The Breakthrough
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black leading-tight">
                            A New Way <br /><span className="text-[#00D1FF] italic">to See.</span>
                        </h2>
                        <p className="text-xl text-slate-400 leading-relaxed font-medium">
                            We've combined OpenAI reasoning with high-fidelity 3D visualization.
                            Converts flat X-rays into interactive, medical-grade anatomy.
                        </p>
                    </div>
                    <div className="relative h-[500px] w-full group">
                        <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all" />
                        <div className="relative h-full w-full">
                            <BoneModel />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Beat 3: Intelligence with a Pulse */}
            <section className="sticky top-0 h-screen flex items-center justify-center px-6 z-30">
                <motion.div
                    style={{
                        opacity: useTransform(scrollYProgress, [0.35, 0.45, 0.55], [0, 1, 0]),
                        y: useTransform(scrollYProgress, [0.35, 0.45, 0.55], [50, 0, -50])
                    }}
                    className="max-w-4xl text-center space-y-12"
                >
                    <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
                        <Activity size={48} className="animate-pulse" />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black italic uppercase italic">
                        Intelligence <br /><span className="text-emerald-400">with a Pulse.</span>
                    </h2>
                    <p className="text-2xl text-slate-400 font-medium leading-relaxed">
                        Our Predictive Risk Engine forecasts health trends with clinical precision,
                        while our AI Rehab Simulator stays with the patient long after the diagnosis.
                    </p>
                    <div className="grid grid-cols-3 gap-8 pt-12">
                        <StatBox label="Pattern Rec" value="99.8%" />
                        <StatBox label="Prediction" value="0.95" unit="AUC" />
                        <StatBox label="Edge Latency" value="0.4s" />
                    </div>
                </motion.div>
            </section>

            {/* Beat 4: Solving for Equity */}
            <section className="sticky top-0 h-screen flex items-center justify-center px-6 z-40">
                <motion.div
                    style={{
                        opacity: useTransform(scrollYProgress, [0.55, 0.65, 0.75], [0, 1, 0]),
                        x: useTransform(scrollYProgress, [0.55, 0.65, 0.75], [-100, 0, 100])
                    }}
                    className="max-w-7xl w-full flex flex-col lg:flex-row items-center gap-20"
                >
                    <div className="lg:w-1/2 space-y-10">
                        <Globe2 size={64} className="text-yellow-400" />
                        <h2 className="text-5xl md:text-7xl font-black italic italic">
                            Solving for <br /><span className="text-yellow-400 underline decoration-4 underline-offset-8">Equity.</span>
                        </h2>
                        <p className="text-xl text-slate-400 font-medium leading-relaxed">
                            Advanced diagnostics shouldn't be a privilege. MediVision AI supports native languages and works in low-bandwidth environments for rural impact.
                        </p>
                        <div className="flex gap-4">
                            <span className="px-4 py-2 rounded-full glass-card border-white/10 text-xs font-black uppercase tracking-widest">Hindi</span>
                            <span className="px-4 py-2 rounded-full glass-card border-white/10 text-xs font-black uppercase tracking-widest">Marathi</span>
                            <span className="px-4 py-2 rounded-full glass-card border-white/10 text-xs font-black uppercase tracking-widest">Tamil</span>
                        </div>
                    </div>
                    <div className="lg:w-1/2 grid grid-cols-2 gap-6">
                        <InfoCard icon={<ShieldCheck className="text-emerald-400" />} title="Privacy-First" desc="HIPAA compliant, on-device neural processing." />
                        <InfoCard icon={<Zap className="text-blue-400" />} title="Offline Sync" desc="Diagnose anywhere, even without the grid." />
                    </div>
                </motion.div>
            </section>

            {/* Beat 5: The Mission */}
            <section className="sticky top-0 h-screen flex items-center justify-center px-6 z-50">
                <motion.div
                    style={{
                        opacity: useTransform(scrollYProgress, [0.75, 0.85, 0.95], [0, 1, 0]),
                        scale: useTransform(scrollYProgress, [0.75, 0.85, 0.95], [0.9, 1, 1.1])
                    }}
                    className="text-center space-y-12 max-w-4xl"
                >
                    <div className="inline-block p-4 rounded-full bg-white text-black font-black uppercase tracking-[0.5em] text-[10px]">
                        The Mission
                    </div>
                    <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
                        AI FOR <br /><span className="gradient-text italic">HUMAN DIGNITY.</span>
                    </h2>
                    <p className="text-2xl text-slate-400 font-medium">
                        Moving from reactive treatment to proactive prevention.
                        Survival, dignity, and access to care for everyone, everywhere.
                    </p>
                </motion.div>
            </section>

            {/* Beat 6: The Call to Action / Closing */}
            <section className="sticky top-0 h-screen flex items-center justify-center px-6 z-[60]">
                <motion.div
                    style={{
                        opacity: useTransform(scrollYProgress, [0.95, 1], [0, 1]),
                        y: useTransform(scrollYProgress, [0.95, 1], [50, 0])
                    }}
                    className="text-center space-y-20 max-w-5xl"
                >
                    <h2 className="text-5xl md:text-7xl font-black italic italic uppercase tracking-tighter italic leading-none">
                        "MediVision AI doesn’t just analyze health. It helps humanity understand, predict, and heal —together with AI."
                    </h2>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <Link href="/" className="group flex items-center gap-3 px-12 py-6 rounded-2xl bg-white text-black font-black text-xl hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-all">
                            BACK TO HOME
                        </Link>
                        <Link href="/auth" className="group flex items-center gap-3 px-12 py-6 rounded-2xl border border-white/20 glass-card font-black text-xl hover:border-[#00D1FF]/50 transition-all">
                            LAUNCH PLATFORM
                            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Progress Bar */}
            <motion.div
                className="fixed bottom-0 left-0 h-1 bg-gradient-to-r from-[#00D1FF] via-[#7000FF] to-emerald-400 origin-left z-[100]"
                style={{ scaleX: scrollYProgress }}
            />

            {/* Beat Navigation Dots */}
            <div className="fixed right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[100]">
                {[0, 1, 2, 3, 4, 5].map((beat) => (
                    <div
                        key={beat}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeBeat === beat ? 'h-8 bg-[#00D1FF]' : 'bg-white/20'}`}
                    />
                ))}
            </div>
        </main>
    );
}

function BoneModel() {
    return (
        <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
            <BoneScene />
            <div className="absolute inset-x-0 bottom-4 flex justify-center">
                <div className="px-4 py-2 rounded-full glass-card border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Interactive 3D Fragment • Drag to Rotate
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, unit = "" }: { label: string; value: string; unit?: string }) {
    return (
        <div className="p-6 rounded-3xl glass-card border-white/5 bg-white/[0.02]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
            <p className="text-3xl font-black italic leading-none">{value}<span className="text-sm font-bold text-slate-600 ml-1">{unit}</span></p>
        </div>
    );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="p-8 rounded-[2.5rem] glass-card border-white/5 bg-white/[0.01] space-y-4 hover:border-white/20 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] flex items-center justify-center group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h4 className="text-xl font-black italic italic uppercase tracking-tighter">{title}</h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed">{desc}</p>
        </div>
    );
}
