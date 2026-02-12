"use client";

import { motion } from "framer-motion";
import { Settings, Shield, WifiOff, Bell, User, CheckCircle2, ChevronRight, Moon, Lock, Save, Loader2, Camera, Phone, Calendar, Ruler, Weight, Droplets, Briefcase, Building, Clock, GraduationCap } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { apiUrl, authHeaders } from "@/lib/api";

export default function SettingsPage() {
    const { isRuralMode, isPrivacyMode, setIsRuralMode, setIsPrivacyMode, userRole } = useSettings();
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Form states
    const [formData, setFormData] = useState<any>({
        name: "",
        email: "",
        phoneNumber: "",
        avatar: "",
        // Patient fields
        dateOfBirth: "",
        gender: "",
        bloodGroup: "",
        weight: "",
        height: "",
        // Doctor fields
        specialization: "",
        clinicName: "",
        workingHours: "",
        experience: "",
        education: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user) return;
            setIsLoading(true);
            try {
                const res = await fetch(apiUrl('/api/users/profile'), {
                    headers: authHeaders((session as any).accessToken)
                });
                const data = await res.json();
                if (res.ok) {
                    setProfile(data);
                    const profileData = data.role === 'Patient' ? data.patientProfile : data.role === 'Doctor' ? data.doctorProfile : {};
                    setFormData({
                        name: data.name || "",
                        email: data.email || "",
                        phoneNumber: data.phoneNumber || "",
                        avatar: data.avatar || "",
                        ...profileData,
                        dateOfBirth: profileData?.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : ""
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [session]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage("");
        try {
            const res = await fetch(apiUrl('/api/users/profile'), {
                method: 'PUT',
                headers: authHeaders((session as any).accessToken),
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setSuccessMessage("Identity sync complete. Profile updated.");
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        } catch (err) {
            console.error("Update failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="text-[#00D1FF] animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            <div>
                <h1 className="text-4xl font-black mb-2 tracking-tight">System <span className="text-[#00D1FF]">Settings</span></h1>
                <p className="text-slate-400">Manage your neural identity, node preferences, and privacy blockade level.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile & Identity */}
                <form onSubmit={handleUpdateProfile} className="lg:col-span-2 space-y-8">
                    <div className="p-10 rounded-[3rem] glass-morphism border-white/5 bg-white/[0.01]">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black flex items-center gap-3 uppercase italic">
                                <User className="text-[#00D1FF]" size={22} />
                                Identity Profile
                            </h3>
                            {successMessage && (
                                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                    {successMessage}
                                </motion.span>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-10 mb-10 pb-10 border-b border-white/5">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-[#00D1FF] flex items-center justify-center text-4xl font-black overflow-hidden">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        formData.name?.split(/\s+/).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
                                    )}
                                </div>
<label className="absolute bottom-0 right-0 p-2 rounded-full bg-[#00D1FF] text-black hover:scale-110 transition-all shadow-lg cursor-pointer">
                                        <Camera size={16} />
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) {
                                                const r = new FileReader();
                                                r.onload = () => setFormData({ ...formData, avatar: r.result as string });
                                                r.readAsDataURL(f);
                                            }
                                        }} />
                                    </label>
                            </div>
                            <div className="space-y-2 text-center md:text-left">
                                <h4 className="text-2xl font-black">{formData.name || 'User Identity'}</h4>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{userRole} Identity ID: #MV-{profile?._id?.slice(-4) || 'XXXX'}</p>
                                <div className="flex gap-3 justify-center md:justify-start">
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Verified</span>
                                    <span className="px-3 py-1 rounded-full bg-[#7000FF]/10 text-[#7000FF] text-[10px] font-black uppercase tracking-widest border border-[#7000FF]/20 text-blue-glow">Pro Member</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField label="Full Name" icon={<User size={14} />} value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                            <FormField label="Email Address" icon={<Settings size={14} />} value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                            <FormField label="Phone Number" icon={<Phone size={14} />} value={formData.phoneNumber} onChange={(v) => setFormData({ ...formData, phoneNumber: v })} />

                            {userRole === 'patient' && (
                                <>
                                    <FormField label="Date of Birth" icon={<Calendar size={14} />} value={formData.dateOfBirth} type="date" onChange={(v) => setFormData({ ...formData, dateOfBirth: v })} />
                                    <FormField label="Weight (kg)" icon={<Weight size={14} />} value={formData.weight} type="number" onChange={(v) => setFormData({ ...formData, weight: v })} />
                                    <FormField label="Height (cm)" icon={<Ruler size={14} />} value={formData.height} type="number" onChange={(v) => setFormData({ ...formData, height: v })} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                            <Droplets size={14} /> Blood Group
                                        </label>
                                        <select
                                            value={formData.bloodGroup}
                                            onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 font-medium outline-none focus:border-[#00D1FF]/50 transition-all"
                                        >
                                            <option value="">Select</option>
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {userRole === 'doctor' && (
                                <>
                                    <FormField label="Specialization" icon={<Briefcase size={14} />} value={formData.specialization} onChange={(v) => setFormData({ ...formData, specialization: v })} />
                                    <FormField label="Clinic/Hospital" icon={<Building size={14} />} value={formData.clinicName} onChange={(v) => setFormData({ ...formData, clinicName: v })} />
                                    <FormField label="Working Hours" icon={<Clock size={14} />} value={formData.workingHours} onChange={(v) => setFormData({ ...formData, workingHours: v })} />
                                    <FormField label="Experience (Years)" icon={<Calendar size={14} />} value={formData.experience} type="number" onChange={(v) => setFormData({ ...formData, experience: v })} />
                                    <FormField label="Education" icon={<GraduationCap size={14} />} value={formData.education} className="md:col-span-2" onChange={(v) => setFormData({ ...formData, education: v })} />
                                </>
                            )}
                        </div>

                        <div className="mt-12 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isSaving}
                                className="px-10 py-4 rounded-2xl bg-gradient-to-r from-[#00D1FF] to-[#7000FF] text-black font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-[#00D1FF]/20"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                SYNC IDENTITY DATA
                            </motion.button>
                        </div>
                    </div>

                    <div className="p-10 rounded-[3rem] glass-morphism border-white/5">
                        <h3 className="text-xl font-black mb-10 flex items-center gap-3 uppercase italic">
                            <Shield className="text-[#7000FF]" size={22} />
                            Platform Logic
                        </h3>
                        <div className="space-y-6">
                            <ToggleSetting
                                icon={<WifiOff size={20} />}
                                title="Rural Access Mode"
                                description="Optimizes performance for low-bandwidth environments by reducing 3D model complexity."
                                active={isRuralMode}
                                onToggle={() => setIsRuralMode(!isRuralMode)}
                            />
                            <ToggleSetting
                                icon={<Lock size={20} />}
                                title="Privacy Shield"
                                description="Anonymizes sensitive patient data across all diagnostic views for classroom or remote sharing."
                                active={isPrivacyMode}
                                onToggle={() => setIsPrivacyMode(!isPrivacyMode)}
                            />
                            <ToggleSetting
                                icon={<Bell size={20} />}
                                title="Neural Notifications"
                                description="Receive haptic and visual updates for real-time scan analysis completion."
                                active={true}
                                onToggle={() => { }}
                            />
                        </div>
                    </div>
                </form>

                {/* Account Security */}
                <div className="space-y-8">
                    <div className="p-8 rounded-[2.5rem] glass-card border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Security Hub</h4>
                        <div className="space-y-4">
                            <button onClick={() => { setSuccessMessage('Password change flow coming soon.'); setTimeout(() => setSuccessMessage(''), 3000); }} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-300 flex items-center justify-between hover:bg-white/10 transition-all">
                                <span>Change Secure Password</span>
                                <ChevronRight size={14} />
                            </button>
                            <button onClick={() => { setSuccessMessage('2FA is active.'); setTimeout(() => setSuccessMessage(''), 3000); }} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-300 flex items-center justify-between hover:bg-white/10 transition-all">
                                <span>Multi-Factor (2FA)</span>
                                <span className="text-emerald-500 text-[9px] font-black uppercase">Active</span>
                            </button>
                            <button onClick={() => { setSuccessMessage('Login history in audit logs.'); setTimeout(() => setSuccessMessage(''), 3000); }} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-300 flex items-center justify-between hover:bg-white/10 transition-all">
                                <span>Login History</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 rounded-[3rem] bg-gradient-to-tr from-[#00D1FF]/20 to-transparent border border-[#00D1FF]/10">
                        <Moon size={32} className="text-[#00D1FF] mb-6 shadow-glow" />
                        <h4 className="font-black text-lg mb-2 uppercase italic">Diagnostic Mode</h4>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">Platform default is set to Clinical Dark. Light mode is available upon regional health board request.</p>
                        <button type="button" onClick={() => { setSuccessMessage('Light mode on request.'); setTimeout(() => setSuccessMessage(''), 3000); }} className="w-full py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest">
                            ENABLE LIGHT MODE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FormField({ label, icon, value, onChange, type = "text", className = "" }: { label: string, icon: React.ReactNode, value: string, onChange: (v: string) => void, type?: string, className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                {icon} {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-300 font-medium outline-none focus:border-[#00D1FF]/50 transition-all"
            />
        </div>
    );
}

function ToggleSetting({ icon, title, description, active, onToggle }: { icon: React.ReactNode, title: string, description: string, active: boolean, onToggle: () => void }) {
    return (
        <div className="flex items-start justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
            <div className="flex gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${active ? 'text-[#00D1FF]' : 'text-slate-500'}`}>{icon}</div>
                <div>
                    <h4 className="font-bold text-slate-200 group-hover:text-white transition-colors">{title}</h4>
                    <p className="text-xs text-slate-500 font-medium max-w-md leading-relaxed">{description}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={onToggle}
                className={`w-14 h-8 rounded-full p-1 transition-all ${active ? 'bg-[#00D1FF]' : 'bg-slate-800'}`}
            >
                <motion.div
                    animate={{ x: active ? 24 : 0 }}
                    className="w-6 h-6 rounded-full bg-white shadow-lg"
                />
            </button>
        </div>
    );
}
