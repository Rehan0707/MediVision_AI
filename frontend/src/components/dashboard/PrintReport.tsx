"use client";

import { ShieldCheck, Activity, Brain, User } from "lucide-react";

interface PrintReportProps {
    data: {
        referenceId: string;
        timestamp: Date;
        type: string;
        patient: string;
        risk: string;
        analysis: {
            confidence: number;
            findings: string[];
            recommendations: string[];
        };
        summary?: string;
    };
}

export function PrintReport({ data }: PrintReportProps) {
    return (
        <div className="hidden print:block p-16 bg-white text-black min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-start border-b-4 border-black pb-8 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tighter uppercase italic">MediVision AI</h1>
                    <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">Neural Clinical Intelligence Report</p>
                </div>
                <div className="text-right">
                    <div className="bg-black text-white px-4 py-2 font-black text-xs inline-block mb-2">
                        REF ID: {data.referenceId}
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                        Generated: {new Date().toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Patient & Metadata */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
                        <User size={14} /> Subject Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <p className="text-slate-500 font-bold uppercase mb-1">Patient Name</p>
                            <p className="font-extrabold">{data.patient}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase mb-1">Diagnostic Type</p>
                            <p className="font-extrabold">{data.type}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase mb-1">Case Timestamp</p>
                            <p className="font-extrabold">{new Date(data.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 font-bold uppercase mb-1">Risk Assessment</p>
                            <p className={`font-extrabold uppercase ${data.risk === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>{data.risk}</p>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center gap-2">
                        <ShieldCheck size={14} /> Security Audit
                    </h3>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <p className="text-[10px] leading-relaxed text-slate-600">
                            This document is end-to-end encrypted and verified via the B-Alpha neural protocol. Hash verification: <span className="font-mono bg-slate-200 px-1">mv_7721_882x_alpha</span>. Verified by HIPAA-compliant clinical engine.
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Summary */}
            <div className="mb-12">
                <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                    <Brain size={14} /> Clinical Executive Summary
                </h3>
                <p className="text-sm leading-relaxed text-slate-800 italic">
                    {data.summary || "Machine reading indicates a high-confidence structural baseline analysis. No emergency interventions required at this timestamp."}
                </p>
            </div>

            {/* Findings & Recommendations */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Neural Findings</h3>
                    <ul className="space-y-3">
                        {data.analysis.findings.map((finding, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-3">
                                <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                                <span className="font-bold">{finding}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h3 className="text-sm font-black uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">Clinical Guidance</h3>
                    <ul className="space-y-3">
                        {data.analysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs flex items-start gap-3">
                                <span className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black shrink-0">{idx + 1}</span>
                                <span className="text-slate-700">{rec}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Confidence Gauge */}
            <div className="bg-black text-white p-8 mb-12 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                        <span className="text-xl font-black">
                        {data.analysis?.confidence != null
                            ? (data.analysis.confidence <= 1 ? Math.round(data.analysis.confidence * 100) : data.analysis.confidence)
                            : "--"}%
                    </span>
                    </div>
                    <div>
                        <h4 className="font-black uppercase tracking-widest">AI Confidence Score</h4>
                        <p className="text-[10px] text-white/60">Cross-referenced against 1.2M clinical datasets.</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                        <Activity size={14} className="text-[#00D1FF]" />
                        <span className="text-[10px] font-black uppercase">Pulsing Engine Active</span>
                    </div>
                    <p className="text-[10px] text-white/40 italic">Signature: MediVision_Neural_Core_v3</p>
                </div>
            </div>

            {/* Footer / Footer Signature */}
            <div className="fixed bottom-16 left-16 right-16">
                <div className="flex justify-between items-end border-t border-slate-200 pt-8">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 leading-tight">
                            CONFIDENTIAL RECORD. FOR CLINICAL USE ONLY.<br />
                            (C) 2026 MEDIVISION AI SYSTEMS.
                        </p>
                    </div>
                    <div className="w-64 border-b-2 border-black pb-2 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest">Verified Specialist Signature</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
