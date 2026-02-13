"use client";

// Force dynamic rendering to fix Vercel build error with useSearchParams
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Shield, Users, Clock, Mail, Microscope, Globe, Activity, ChevronRight, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Doctor {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    doctorProfile?: {
        specialization: string;
        licenseNumber: string;
        clinicName: string;
        workingHours: string;
        verificationProof?: string;
    };
}

export default function AdminApprovalPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [actioningId, setActioningId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated" || ((session?.user as any)?.role?.toLowerCase?.() ?? '') !== 'admin') {
            router.push("/auth");
        } else {
            fetchPendingDoctors();
        }
    }, [status, session, router]);

    const fetchPendingDoctors = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/pending-doctors`);
            const data = await res.json();
            setDoctors(data);
        } catch (error) {
            console.error("Failed to fetch pending doctors", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (id: string, approve: boolean) => {
        setActioningId(id);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/auth/approve-doctor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: approve ? "Approved" : "Rejected" }),
            });

            if (res.ok) {
                setDoctors(doctors.filter(d => d._id !== id));
            }
        } catch (error) {
            console.error("Approval action failed", error);
        } finally {
            setActioningId(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="w-16 h-16 border-t-2 border-[#00D1FF] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white p-8 selection:bg-[#00D1FF]/30">
            {/* Header */}
            <div className="max-w-6xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
                        Neural <span className="text-[#00D1FF]">Approval</span> Console
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                        MediVision AI Administrative Protocol v4.2
                    </p>
                </div>
                <Link href="/dashboard" className="px-6 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                    Return to Hub
                </Link>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {doctors.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full py-20 text-center glass-morphism rounded-[3rem] border-white/5 bg-white/[0.02]"
                        >
                            <Shield size={64} className="mx-auto text-slate-700 mb-6" />
                            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-500">No Pending Requests</h3>
                            <p className="text-slate-600 text-xs font-bold mt-2 uppercase tracking-widest">The neural queue is empty</p>
                        </motion.div>
                    ) : (
                        doctors.map((dr, index) => (
                            <motion.div
                                key={dr._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-morphism rounded-[2.5rem] border-white/10 p-8 flex flex-col bg-white/[0.03] hover:bg-white/[0.05] transition-all relative overflow-hidden group"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00D1FF]/30 to-transparent" />

                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00D1FF]/20 to-[#7000FF]/20 flex items-center justify-center border border-white/10">
                                        <Shield className="text-[#00D1FF]" size={28} />
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-black uppercase tracking-widest">
                                        Pending Verification
                                    </div>
                                </div>

                                <h3 className="text-xl font-black mb-1">{dr.name}</h3>
                                <p className="text-slate-500 text-xs flex items-center gap-2 mb-6">
                                    <Mail size={12} /> {dr.email}
                                </p>

                                <div className="space-y-4 mb-8">
                                    <DetailItem icon={<Microscope size={14} />} label="Specialty" value={dr.doctorProfile?.specialization || 'N/A'} />
                                    <DetailItem icon={<ShieldCheck size={14} />} label="License" value={dr.doctorProfile?.licenseNumber || 'N/A'} />
                                    <DetailItem icon={<Globe size={14} />} label="Affiliation" value={dr.doctorProfile?.clinicName || 'N/A'} />
                                    {dr.doctorProfile?.verificationProof && (
                                        <div className="pt-2 border-t border-white/5">
                                            <a
                                                href={dr.doctorProfile.verificationProof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#00D1FF] text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:underline"
                                            >
                                                <Sparkles size={12} /> View Verification Proof
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleApproval(dr._id, false)}
                                        disabled={actioningId === dr._id}
                                        className="py-3 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={14} /> Reject
                                    </button>
                                    <button
                                        onClick={() => handleApproval(dr._id, true)}
                                        disabled={actioningId === dr._id}
                                        className="py-3 rounded-xl bg-[#00D1FF] text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#00D1FF]/20 flex items-center justify-center gap-2"
                                    >
                                        <Check size={14} /> Approve
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="text-[#00D1FF] mt-1">{icon}</div>
            <div>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-slate-200 text-[11px] font-bold tracking-tight">{value}</p>
            </div>
        </div>
    );
}
