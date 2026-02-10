"use client";

import { motion } from "framer-motion";
import { Activity, Calendar, Clock, Heart, Zap, ChevronRight, Play, FileText, Database } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import Link from "next/link";
import { LocalizedHealthNews } from "./LocalizedHealthNews";
import MedicalGlossary from "./MedicalGlossary";

export function PatientDashboard({ t, profile }: { t: (key: any) => string, profile?: any }) {
    const { isPrivacyMode, isRuralMode } = useSettings();
    const userName = profile?.name || "Member";

    return (
        <div className={`space-y-10 pb-12 ${isPrivacyMode ? 'privacy-mode' : ''} ${isRuralMode ? 'rural-mode' : ''}`}>
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight uppercase italic">Welcome back, <span className="text-[#00D1FF] privacy-blur">{isPrivacyMode ? "ID-HIDDEN" : userName}</span></h1>
                    <p className="text-slate-400 font-medium">Your health journey at a glance. Visualizing your actual clinical milestones.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 rounded-2xl glass-card flex items-center gap-3 border-[#00D1FF]/20 shadow-xl shadow-[#00D1FF]/5">
                        <Heart size={18} className="text-[#00D1FF]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#00D1FF]">System Sync Active</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Featured Recovery Card */}
                    <div className="p-10 glass-morphism rounded-[3rem] border-white/5 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                            <Activity className="text-[#00D1FF]" size={150} />
                        </div>
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-2xl font-black mb-2 tracking-tight uppercase italic">Recovery Progress</h3>
                                <p className="text-slate-500 text-sm font-medium">See how you're healing</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-end text-sm">
                                <span className="text-slate-300 font-bold italic">Analysis of neural and physiological data points...</span>
                                <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Awaiting Scan Data</span>
                            </div>
                            <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                                <div className="h-full w-0 bg-gradient-to-r from-[#00D1FF] to-[#7000FF] rounded-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 mt-12">
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center transition-colors hover:bg-white/[0.04]">
                                <Clock className="mx-auto mb-3 text-slate-500" size={20} />
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Time Profiled</p>
                                <p className="text-lg font-black italic">-- hrs</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center transition-colors hover:bg-white/[0.04]">
                                <Zap className="mx-auto mb-3 text-slate-400" size={20} />
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Activity</p>
                                <p className="text-lg font-black italic">--</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center transition-colors hover:bg-white/[0.04]">
                                <Calendar className="mx-auto mb-3 text-slate-500" size={20} />
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Consistency</p>
                                <p className="text-lg font-black italic">--</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="sm:col-span-2 p-10 rounded-[3rem] glass-morphism border-white/5 bg-white/[0.01]">
                            <div className="flex justify-between items-center mb-8">
                                <h4 className="font-black text-xl italic uppercase tracking-tight flex items-center gap-3">
                                    <FileText className="text-[#00D1FF]" size={22} />
                                    My Lab Reports
                                </h4>
                                <Link href="/dashboard/lab-reports" className="text-[10px] font-black text-[#00D1FF] uppercase tracking-widest hover:underline">
                                    Full Vault
                                </Link>
                            </div>
                            <div className="space-y-4">
                                <div className="p-8 rounded-2xl bg-white/[0.03] border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500">
                                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                        <Database size={24} className="opacity-20" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#00D1FF]/40">No records synchronized yet</p>
                                    <p className="text-[10px] italic mt-2">Upload a scan to initialize your clinical history.</p>
                                </div>
                            </div>
                        </div>

                        <Link href="/dashboard/rehab" className="group">
                            <div className="p-8 glass-card rounded-[2.5rem] border-white/5 hover:border-[#7000FF]/50 transition-all bg-[#7000FF]/[0.02]">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#7000FF]/10 text-[#7000FF] flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Play fill="currentColor" size={20} />
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
                                </div>
                                <h4 className="font-black text-lg mb-2 uppercase italic">Rehab Protocols</h4>
                                <p className="text-xs text-slate-400 leading-relaxed italic">Initialize personalized recovery schemes.</p>
                            </div>
                        </Link>

                        <Link href="/dashboard?modality=xray" className="group">
                            <div className="p-8 glass-card rounded-[2.5rem] border-white/5 hover:border-[#FACC15]/50 transition-all bg-[#FACC15]/[0.02]">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FACC15]/10 text-[#FACC15] flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Activity size={24} />
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
                                </div>
                                <h4 className="font-black text-lg mb-2 uppercase italic">Open Scan Results</h4>
                                <p className="text-xs text-slate-400 leading-relaxed italic">Check your latest diagnostics.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="space-y-8 flex flex-col">
                    <div className="p-10 rounded-[3rem] glass-morphism border-white/5 bg-white/[0.01]">
                        <h4 className="font-black text-lg mb-8 uppercase italic flex items-center gap-3">
                            <Zap className="text-yellow-400" size={20} />
                            Your Biometrics
                        </h4>
                        <div className="space-y-6">
                            <MetricRow label="Body Mass Index" value={profile?.patientProfile?.weight ? "Profile Sync" : "--"} status="Awaiting Data" color="bg-slate-700" />
                            <MetricRow label="Blood Glucose" value="--" status="No Sync" color="bg-slate-700" />
                            <MetricRow label="Blood Pressure" value="--" status="No Sync" color="bg-slate-700" />
                            <MetricRow label="Cholesterol" value="--" status="No Sync" color="bg-slate-700" />
                        </div>
                    </div>
                    <LocalizedHealthNews />
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <div className="flex items-center gap-4 mb-10">
                    <Database className="text-[#00D1FF]" size={24} />
                    <h2 className="text-2xl font-black uppercase tracking-tight italic">My Health <span className="text-[#00D1FF]">Records</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <NavCategory title="Imaging & Radiology" items={["X-ray", "CT Scan", "MRI", "Sonography (Ultrasound)", "PET Scan", "Mammography"]} color="border-[#00D1FF]/30" accent="text-[#00D1FF]" />
                    <NavCategory title="Laboratory & Bloodwork" items={["Blood tests (CBC, Sugar, Lipid)", "Urine tests", "Liver function tests", "Kidney function tests", "Thyroid tests", "Hormone tests"]} color="border-[#7000FF]/30" accent="text-[#7000FF]" />
                    <NavCategory title="Cardiac Diagnostics" items={["ECG / EKG", "Echocardiogram", "Stress test", "Holter monitoring"]} color="border-rose-500/30" accent="text-rose-500" />
                    <NavCategory title="Pulmonary & Sleep" items={["Pulmonary function test (PFT)", "Spirometry", "Sleep study reports"]} color="border-emerald-500/30" accent="text-emerald-500" />
                    <NavCategory title="Clinical & Surgery" items={["Discharge summary", "Operation notes", "Clinical notes", "Prescription reports"]} color="border-amber-500/30" accent="text-amber-500" />
                    <NavCategory title="Advanced Specialists" items={["Oncology reports", "Histopathology (biopsy)", "Genetic testing", "Allergy testing"]} color="border-fuchsia-500/30" accent="text-fuchsia-500" />
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <MedicalGlossary />
            </div>
        </div>
    );
}

function NavCategory({ title, items, color, accent }: { title: string, items: string[], color: string, accent: string }) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-8 rounded-[2.5rem] bg-white/[0.02] border ${color} hover:bg-white/[0.04] transition-all group`}
        >
            <h3 className={`text-xs font-black uppercase tracking-[0.3em] mb-6 ${accent}`}>{title}</h3>
            <div className="space-y-4">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between group/item cursor-pointer">
                        <span className="text-[13px] font-bold text-slate-400 group-hover/item:text-white transition-colors">{item}</span>
                        <ChevronRight size={14} className="text-slate-700 group-hover/item:text-white transition-colors" />
                    </div>
                ))}
            </div>
            <button className={`w-full mt-8 py-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all ${accent}`}>
                Initialize Records
            </button>
        </motion.div>
    );
}

function MetricRow({ label, value, status, color }: { label: string, value: string, status: string, color: string }) {
    return (
        <div className="flex justify-between items-center">
            <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-black text-white">{value}</p>
            </div>
            <div className="text-right">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mr-2">{status}</span>
                <div className={`inline-block w-2 h-2 rounded-full ${color}`} />
            </div>
        </div>
    );
}
