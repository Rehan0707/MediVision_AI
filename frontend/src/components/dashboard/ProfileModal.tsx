"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Shield, Activity, Save, Loader2, Phone, Briefcase, GraduationCap, Clock } from "lucide-react";
import { useSession } from "next-auth/react";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { data: session, update } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        specialization: "",
        clinicName: "",
        workingHours: "",
    });

    useEffect(() => {
        if (session?.user) {
            const user = session.user as any;
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phoneNumber: user.phoneNumber || "",
                specialization: user.profile?.specialization || "",
                clinicName: user.profile?.clinicName || "",
                workingHours: user.profile?.workingHours || "",
            });
        }
    }, [session]);

    const handleSave = async () => {
        setIsLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/users/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Neural profile synchronized successfully.' });
                await update({
                    name: formData.name,
                    phoneNumber: formData.phoneNumber,
                });
                setTimeout(() => setIsEditing(false), 2000);
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.message || 'Synchronization failed.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Network connection interrupted.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const user = session?.user as any;
    const role = user?.role || "Patient";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-2xl bg-[#020617] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] flex items-center justify-center shadow-lg shadow-[#00D1FF]/20">
                                <User size={24} className="text-black" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Clinical <span className="text-[#00D1FF]">Profile</span></h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-1.5 h-1.5 rounded-full ${role === 'Admin' ? 'bg-[#7000FF]' : role === 'Doctor' ? 'bg-[#00D1FF]' : 'bg-emerald-500'} animate-pulse`} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{role} Identifier</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-2xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-xs font-black uppercase tracking-widest flex items-center gap-3`}
                            >
                                <Shield size={16} />
                                {message.text}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Info */}
                            <ProfileField
                                label="Full Identity Name"
                                value={formData.name}
                                icon={<User size={16} />}
                                isEditing={isEditing}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                            />
                            <ProfileField
                                label="Neural Address (Email)"
                                value={formData.email}
                                icon={<Mail size={16} />}
                                isEditing={false} // Email typically not editable
                            />
                            <ProfileField
                                label="Primary Contact"
                                value={formData.phoneNumber}
                                icon={<Phone size={16} />}
                                isEditing={isEditing}
                                onChange={(val) => setFormData({ ...formData, phoneNumber: val })}
                            />

                            {/* Role Specific Info */}
                            {role === 'Doctor' && (
                                <>
                                    <ProfileField
                                        label="Specialization"
                                        value={formData.specialization}
                                        icon={<GraduationCap size={16} />}
                                        isEditing={isEditing}
                                        onChange={(val) => setFormData({ ...formData, specialization: val })}
                                    />
                                    <ProfileField
                                        label="Clinical Facility"
                                        value={formData.clinicName}
                                        icon={<Briefcase size={16} />}
                                        isEditing={isEditing}
                                        onChange={(val) => setFormData({ ...formData, clinicName: val })}
                                    />
                                    <ProfileField
                                        label="Operating Hours"
                                        value={formData.workingHours}
                                        icon={<Clock size={16} />}
                                        isEditing={isEditing}
                                        onChange={(val) => setFormData({ ...formData, workingHours: val })}
                                    />
                                </>
                            )}
                        </div>

                        {/* Stats / Bio Section */}
                        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00D1FF]">Account Credentials</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Status</p>
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Verified</p>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Enc Level</p>
                                    <p className="text-xs font-bold text-white uppercase tracking-tighter">AES-512</p>
                                </div>
                                <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase mb-1">Uptime</p>
                                    <p className="text-xs font-bold text-white uppercase tracking-tighter">99.9%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-white/5 flex gap-4 bg-white/[0.01]">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-8 py-4 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-slate-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading}
                                    className="flex-1 py-4 rounded-2xl bg-[#00D1FF] text-black font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#00D1FF]/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                    Commit Changes
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-4 rounded-2xl border border-[#00D1FF]/30 text-[#00D1FF] font-black text-xs uppercase tracking-[0.2em] hover:bg-[#00D1FF]/5 transition-all flex items-center justify-center gap-3"
                            >
                                <Activity size={18} />
                                Edit Neural Identity
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function ProfileField({ label, value, icon, isEditing, onChange }: { label: string, value: string, icon: React.ReactNode, isEditing: boolean, onChange?: (val: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</label>
            <div className={`relative group transition-all ${isEditing ? 'scale-[1.02]' : ''}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors">
                    {icon}
                </div>
                {isEditing ? (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        className="w-full bg-white/5 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium"
                    />
                ) : (
                    <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-300">
                        {value || "Not provided"}
                    </div>
                )}
            </div>
        </div>
    );
}
