"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Brain, Activity, Bone, FlaskConical, ChevronRight, ShieldCheck, Microscope, Zap, ArrowRight, CheckCircle2, Globe2, Play } from "lucide-react";
import dynamic from "next/dynamic";
const DoctorBot = dynamic(() => import("@/components/animations/DoctorBot"), { ssr: false });
import Link from "next/link";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#020617] overflow-x-hidden selection:bg-[#00D1FF]/30">
      {/* Background Elements */}
      <motion.div style={{ y: backgroundY }} className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#00D1FF]/5 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7000FF]/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-0 left-0 w-full h-full medical-grid opacity-20" />
        <motion.div
          animate={{ y: ["0%", "100%", "0%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00D1FF]/50 to-transparent shadow-[0_0_20px_rgba(0,209,255,0.5)] opacity-30"
        />
      </motion.div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 left-0 w-full z-50 px-10 py-6 flex justify-between items-center pointer-events-auto bg-[#020617]/20 backdrop-blur-xl"
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 90 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(0,209,255,0.3)]"
          >
            MV
          </motion.div>
          <span className="text-lg font-black tracking-tight uppercase italic text-white/90">MediVision <span className="text-[#00D1FF]">AI</span></span>
        </div>
        <div className="flex items-center gap-10">
          <Link href="/keynote" className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00D1FF] hover:text-white transition-all">
            Keynote
          </Link>
          <Link href="/auth" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all">
            Support
          </Link>
          <Link href="/auth" className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all text-white/80">
            Console Login
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-56 pb-20 mx-auto max-w-7xl z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="z-10 text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-[#00D1FF] mb-10"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF] animate-pulse" />
              <span className="tracking-[0.4em] uppercase">NEURAL DIAGNOSTICS v4.2</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-7xl md:text-[6.5rem] font-black tracking-tighter mb-10 leading-[0.9] text-white"
            >
              Understand Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] to-[#7000FF] italic">Health.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-lg text-slate-400 mb-14 max-w-lg leading-relaxed font-medium"
            >
              MediVision AI transforms raw clinical data into high-fidelity 3D reconstructions, making the invisible visible for both patients and specialists.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6"
            >
              <Link href="/auth" className="group px-12 py-6 rounded-2xl bg-[#00D1FF] text-black font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-[0_20px_40px_rgba(0,209,255,0.2)]">
                OPEN DASHBOARD
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link
                href="/keynote"
                className="group px-12 py-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md hover:bg-white/[0.05] transition-all font-black text-[10px] tracking-[0.2em] text-white/50 hover:text-white flex items-center gap-4"
              >
                <Play size={16} className="text-[#00D1FF]" />
                WATCH PROTOCOL
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Animation with Model */}
          <div className="relative hidden lg:block perspective-2000">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative z-10"
            >
              <DoctorBot />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Intelligence Feed */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative px-6 py-12 border-y border-white/5 bg-white/[0.01] overflow-hidden"
      >
        <div className="mx-auto max-w-7xl flex flex-wrap justify-between items-center gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-12"
          >
            <StatItem label="Scans Processed" value="1.2M+" color="text-[#00D1FF]" />
            <StatItem label="Neural Nodes" value="48.5k" color="text-[#7000FF]" />
            <StatItem label="Avg Response" value="0.4s" color="text-emerald-400" />
          </motion.div>
          <div className="flex-1 max-w-md hidden md:block">
            <motion.div
              animate={{ borderColor: ["rgba(255,255,255,0.1)", "rgba(0,209,255,0.3)", "rgba(255,255,255,0.1)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between shadow-inner"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Diagnostic Stream</span>
              </div>
              <span className="text-[10px] font-bold text-[#00D1FF] animate-pulse">OPTIMIZING_NEURAL_WEIGHTS...</span>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Solving for Clarity Section */}
      <section id="vision-section" className="relative px-6 py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-[#00D1FF]/60 text-[10px] font-black uppercase tracking-[0.5em] mb-6">THE CHALLENGE</h3>
            <h2 className="text-5xl md:text-6xl font-black mb-10 text-white tracking-tighter leading-none">Complexity is the <br /><span className="text-white/20 italic">new barrier.</span></h2>
            <div className="space-y-4">
              <ChallengeItem text="Clinical imagery remains cryptic to non-specialists." delay={0.1} />
              <ChallengeItem text="Medical jargon creates a knowledge gap between patient and provider." delay={0.2} />
              <ChallengeItem text="High-end diagnostics are traditionally siloed in urban hubs." delay={0.3} />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center p-12 rounded-[3rem] bg-gradient-to-br from-[#00D1FF]/10 to-[#7000FF]/10 border border-white/5 relative group"
          >
            <div className="absolute inset-0 bg-white/[0.01] backdrop-blur-3xl rounded-[3rem] -z-10" />
            <h3 className="text-[#00D1FF] text-[10px] font-black uppercase tracking-[0.5em] mb-6">OUR VISION</h3>
            <h2 className="text-4xl font-black mb-10 italic text-white leading-tight">"See the health, <br />understand the journey."</h2>
            <p className="text-slate-400 leading-relaxed text-lg font-medium max-w-sm">
              We translate clinical complexity into human clarity. Interactive 3D models. Plain-language insights. Universal access.
            </p>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="mt-10 w-20 h-20 rounded-full border border-[#00D1FF]/30 flex items-center justify-center text-[#00D1FF] cursor-pointer"
            >
              <Activity size={32} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-32 border-t border-white/5 bg-slate-900/[0.02]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black mb-8 text-white tracking-tight"
            >
              How <span className="text-[#00D1FF] italic">MediVision AI</span> Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-slate-400 max-w-2xl mx-auto text-xl font-medium"
            >
              A comprehensive intelligence layer for every aspect of your health.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Bone className="text-[#00D1FF]" size={28} />}
              title="3D Visualization"
              description="Upload X-rays/MRIs and see affected regions in interactive 3D space."
              delay={0.1}
            />
            <FeatureCard
              icon={<Activity className="text-emerald-400" size={28} />}
              title="Heart & Vitals"
              description="Simple explanations for your heart rate and other vital signs."
              delay={0.2}
            />
            <FeatureCard
              icon={<FlaskConical className="text-[#7000FF]" size={28} />}
              title="Understand My Reports"
              description="Automatic jargon removal and highlights for your lab results."
              delay={0.3}
            />
            <FeatureCard
              icon={<Zap className="text-yellow-400" size={28} />}
              title="Recovery Guidance"
              description="Personalized timelines and lifestyle suggestions for healing."
              delay={0.4}
            />
            <FeatureCard
              icon={<Microscope className="text-pink-400" size={28} />}
              title="Predictive Trends"
              description="Track health data over time to identify potential risks early."
              delay={0.5}
            />
            <FeatureCard
              icon={<Brain className="text-blue-400" size={28} />}
              title="Doctor Co-Pilot"
              description="AI support for specialists to summarize and visualize findings."
              delay={0.6}
            />
          </div>
        </div>
      </section>
      {/* Addressing Global Health Equity Section */}
      <section className="relative px-6 py-32 overflow-hidden bg-white/[0.01]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-widest"
            >
              <Globe2 size={14} /> Global Social Impact
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black mb-8 leading-tight text-white tracking-tighter uppercase italic"
            >
              Solving for <br /><span className="text-emerald-400">Equity.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl font-medium leading-relaxed"
            >
              Advanced diagnostics shouldn't be limited to prime urban centers. MediVision AI includes a dedicated <span className="text-white font-bold">Rural Mode</span>—optimizing for low-bandwidth environments and high-contrast visibility.
            </motion.p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              <div className="space-y-4">
                <div className="p-3 w-fit rounded-xl bg-white/5 text-emerald-400 border border-white/5">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-black text-lg text-white uppercase italic">Multi-Lingual</h4>
                <p className="text-slate-500 text-sm font-medium">Native support for Hindi, Marathi, and Tamil to bridge communication gaps in regional consultations.</p>
              </div>
              <div className="space-y-4">
                <div className="p-3 w-fit rounded-xl bg-white/5 text-[#00D1FF] border border-white/5">
                  <Zap size={24} />
                </div>
                <h4 className="font-black text-lg text-white uppercase italic">Offline Sync</h4>
                <p className="text-slate-500 text-sm font-medium">Neural models optimized for local edge device execution, ensuring diagnostics occur even without stability.</p>
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="p-12 rounded-[5rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 backdrop-blur-2xl">
              <div className="text-center space-y-8">
                <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                  <Globe2 size={48} />
                </div>
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none italic">Democratizing <br />Intelligence.</h3>
                <div className="flex justify-center gap-4">
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-slate-400">Rural Access Mode</span>
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase text-slate-400">E2E Privacy</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Final CTA */}
      <section className="px-6 py-40 text-center relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-[#00D1FF]/10 blur-[150px] rounded-full"
        />
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-black mb-16 leading-tight text-white tracking-tighter"
        >
          Empowering patients. <br /><span className="gradient-text italic">Supporting doctors.</span>
        </motion.h2>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/auth" className="relative z-10 inline-flex px-16 py-8 rounded-[2rem] bg-white text-black font-black text-xl hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] transition-all uppercase tracking-widest shadow-2xl">
            GET STARTED NOW
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-white/5 text-center text-slate-500 text-sm font-black uppercase tracking-[0.3em]">
        <p>&copy; 2026 MediVision AI. Built for the neural age of healthcare.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="p-10 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-[#00D1FF]/30 transition-all group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D1FF]/5 blur-[60px] rounded-full group-hover:bg-[#00D1FF]/10 transition-colors" />
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mb-8 border border-white/5 group-hover:bg-[#00D1FF]/10 transition-all duration-500 relative z-10">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-4 tracking-tight text-white uppercase italic relative z-10">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10">{description}</p>
    </motion.div>
  );
}

function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">{label}</span>
      <span className={`text-4xl font-black ${color} tabular-nums tracking-tighter italic`}>{value}</span>
    </motion.div>
  );
}

function ChallengeItem({ text, delay }: { text: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="p-5 rounded-2xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-white/10 transition-colors group flex items-start gap-4"
    >
      <div className="mt-2 w-1 h-1 rounded-full bg-[#00D1FF]/50 group-hover:bg-[#00D1FF] transition-colors" />
      <p className="text-slate-400 text-sm font-medium leading-relaxed group-hover:text-slate-200 transition-colors">{text}</p>
    </motion.div>
  );
}
