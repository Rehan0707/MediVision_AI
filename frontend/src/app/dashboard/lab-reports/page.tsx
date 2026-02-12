"use client";

import { motion } from "framer-motion";
import { FlaskConical, Filter, Search, Download, FileText, AlertCircle, CheckCircle2, ChevronRight, Microscope } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiUrl, authHeaders } from "@/lib/api";

export default function LabReportsPage() {
    const { data: session } = useSession();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newReport, setNewReport] = useState({ type: '', text: '' });
    const [showFilter, setShowFilter] = useState(false);
    const [bioAnalysis, setBioAnalysis] = useState<any>({ indicators: [], aiSuggestion: '' });

    async function fetchBioAnalysis() {
        if (!session) return;
        try {
            const res = await fetch(apiUrl('/api/reports/bio-analysis'), {
                headers: authHeaders((session?.user as any)?.accessToken)
            });
            const data = await res.json();
            setBioAnalysis(data);
        } catch (err) {
            console.error("Failed to fetch bio-analysis:", err);
        }
    }

    async function fetchReports() {
        if (!session) return;
        try {
            const res = await fetch(apiUrl('/api/reports'), {
                headers: authHeaders((session?.user as any)?.accessToken)
            });
            const data = await res.json();
            setReports(data.map((r: any) => ({
                id: `LAB-${r._id.slice(-4).toUpperCase()}`,
                date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                type: r.scanType,
                status: r.status,
                findings: r.analysis?.summary ? "Analysis Available" : "Processing...",
                fullAnalysis: r.analysis?.summary
            })));
        } catch (err) {
            console.error("Failed to fetch reports:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (session) {
            fetchReports();
            fetchBioAnalysis();
        }
    }, [session]);

    const handleAddReport = async () => {
        if (!newReport.type || !newReport.text) return;
        setUploading(true);
        try {
            // 1. Create Report
            const createRes = await fetch(apiUrl('/api/reports'), {
                method: 'POST',
                headers: authHeaders((session?.user as any)?.accessToken),
                body: JSON.stringify({
                    scanType: newReport.type,
                    bodyPart: 'Systemic',
                    scanUrl: 'manual_entry',
                    patient: 'Self', // Demo user
                    status: 'Pending'
                })
            });
            const reportData = await createRes.json();

            // 2. Analyze Report
            await fetch(apiUrl('/api/reports/analyze'), {
                method: 'POST',
                headers: authHeaders((session?.user as any)?.accessToken),
                body: JSON.stringify({
                    text: newReport.text,
                    reportId: reportData._id
                })
            });

            setIsUploadOpen(false);
            setNewReport({ type: '', text: '' });
            fetchReports(); // Refresh
        } catch (err) {
            console.error("Failed to add report:", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-10 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black mb-2 tracking-tight">Lab <span className="text-[#00D1FF]">Insights</span></h1>
                    <p className="text-slate-400">Biological data machine-reading with automated jargon removal.</p>
                </div>
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-8 py-4 rounded-2xl bg-[#00D1FF] text-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#00D1FF]/30 hover:scale-105 active:scale-95 transition-all">
                    UPLOAD NEW REPORT
                </button>
            </div>

            {/* Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f1115] w-full max-w-lg rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative"
                    >
                        <button onClick={() => setIsUploadOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white">✕</button>
                        <h2 className="text-2xl font-black mb-6">Add Lab Report</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Report Type</label>
                                <input
                                    value={newReport.type}
                                    onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                                    placeholder="e.g. Complete Blood Count"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00D1FF]"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">Paste Report Data</label>
                                <textarea
                                    value={newReport.text}
                                    onChange={(e) => setNewReport({ ...newReport, text: e.target.value })}
                                    placeholder="Paste the raw text from your lab report here for AI analysis..."
                                    className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-[#00D1FF]"
                                />
                            </div>
                            <button
                                onClick={handleAddReport}
                                disabled={uploading}
                                className="w-full py-4 rounded-xl bg-[#00D1FF] text-black font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50"
                            >
                                {uploading ? 'Analyzing...' : 'Analyze & Save'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Reports List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="p-8 rounded-[3rem] glass-morphism border-white/5 flex flex-col md:flex-row gap-6 mb-8">
                        <div className="relative flex-1">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search lab records..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all"
                            />
                        </div>
                        <button onClick={() => setShowFilter(!showFilter)} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                            <Filter size={16} /> {showFilter ? 'Hide Filter' : 'Filter'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loading && <p className="text-center text-slate-500 py-10">Loading Lab Records...</p>}
                        {!loading && reports.length === 0 && <p className="text-center text-slate-500 py-10">No lab reports found. Upload a new report to get started.</p>}
                        {reports.map((r, i) => (
                            <motion.div
                                key={r.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[2.5rem] glass-card border-white/5 group hover:border-[#00D1FF]/30 transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-[#00D1FF] transition-colors">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-[#00D1FF] uppercase tracking-[0.3em] mb-1">{r.id}</p>
                                        <h3 className="text-xl font-black text-white italic">{r.type}</h3>
                                        <p className="text-sm text-slate-500 font-bold">{r.date}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12">
                                    <div className="text-right hidden md:block">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Findings</p>
                                        <p className={`text-sm font-black ${r.status === 'Critical' ? 'text-red-400' : 'text-emerald-400'}`}>{r.findings}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                const blob = new Blob([JSON.stringify(r)], { type: 'application/json' });
                                                const url = URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `${r.id}.json`;
                                                a.click();
                                                URL.revokeObjectURL(url);
                                            }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button onClick={() => alert(r.fullAnalysis || r.findings)} className="p-4 rounded-xl bg-[#00D1FF] text-black">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* AI Summary Sidebar */}
                <div className="space-y-8">
                    <div className="p-10 rounded-[3rem] glass-morphism border-[#7000FF]/20 bg-[#7000FF]/5">
                        <div className="flex items-center gap-3 text-[#7000FF] mb-6">
                            <Microscope size={24} />
                            <h4 className="font-black text-lg uppercase italic">Bio-Analysis</h4>
                        </div>
                        <div className="space-y-6">
                            {bioAnalysis.indicators.map((ind: any, i: number) => (
                                <LabIndicator key={i} label={ind.label} status={ind.status} color={ind.color} />
                            ))}
                        </div>
                        <div className="mt-10 p-4 rounded-2xl bg-black/40 border border-white/5">
                            <p className="text-[11px] leading-relaxed text-slate-400 font-medium italic">
                                "{bioAnalysis.aiSuggestion}"
                            </p>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
                            <CheckCircle2 size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Analysis Protocol</p>
                        <p className="text-xs font-bold text-white">HL7 Standard v2.8</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LabIndicator({ label, status, color }: { label: string, status: string, color: string }) {
    return (
        <div className="flex justify-between items-center group">
            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{status}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
            </div>
        </div>
    );
}
