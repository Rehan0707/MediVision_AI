"use client";

import { Search, User, Wifi, WifiOff, ShieldCheck, ShieldAlert, LogOut } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useState } from "react";
import { ProfileModal } from "../dashboard/ProfileModal";
import { useSession, signOut } from "next-auth/react";

export function Header() {
    const { data: session } = useSession();
    const {
        isRuralMode, setIsRuralMode,
        isPrivacyMode, setIsPrivacyMode,
        language, setLanguage,
        userRole, setUserRole, t
    } = useSettings();

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const user = session?.user as any;
    const displayName = user?.name || (userRole === 'doctor' ? 'Dr. Rehan S.' : userRole === 'admin' ? 'Administrator' : 'Active Patient');

    const getRoleName = () => {
        switch (userRole) {
            case 'doctor': return t("doctorPortal");
            case 'patient': return t("patientPortal");
            case 'admin': return t("adminPortal");
            default: return "";
        }
    };

    return (
        <header className="h-20 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
            <div className="flex items-center gap-6 flex-1">
                <div className="relative max-w-sm w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search my records..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium"
                    />
                </div>

                <div className="hidden lg:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 ml-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${userRole === 'admin' ? 'bg-[#7000FF]' : userRole === 'doctor' ? 'bg-[#00D1FF]' : 'bg-slate-500'} animate-pulse`} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Access Level: <span className="text-white">{userRole}</span>
                        </span>
                    </div>

                    <button
                        onClick={() => setIsRuralMode(!isRuralMode)}
                        title={t("ruralMode")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isRuralMode
                            ? "bg-white text-black border-white font-black"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            }`}
                    >
                        {isRuralMode ? <WifiOff size={16} /> : <Wifi size={16} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isRuralMode ? 'Rural' : 'Standard'}
                        </span>
                    </button>

                    <button
                        onClick={() => setIsPrivacyMode(!isPrivacyMode)}
                        title={t("privacyMode")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isPrivacyMode
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                            : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                            }`}
                    >
                        {isPrivacyMode ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{isPrivacyMode ? 'Private' : 'Safe'}</span>
                    </button>

                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as 'en' | 'hi' | 'mr' | 'ta')}
                        className="bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <option value="en">EN</option>
                        <option value="hi">हिन्दी</option>
                        <option value="mr">मराठी</option>
                        <option value="ta">தமிழ்</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live</span>
                </div>

                <div className="flex items-center gap-4 pl-6 border-l border-white/10 ml-2">
                    <div className="text-right hidden sm:block">
                        <p className={`text-sm font-black tracking-tight ${isPrivacyMode ? 'patient-data' : ''}`}>
                            {displayName}
                        </p>
                        <p className="text-[10px] text-[#00D1FF] uppercase tracking-[0.3em] font-black">
                            {user?.role ? `${user.role} Portal` : getRoleName()}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] p-[1px] group shadow-lg shadow-[#00D1FF]/20 hover:scale-105 transition-all"
                    >
                        <div className="w-full h-full rounded-[15px] bg-[#020617] flex items-center justify-center overflow-hidden">
                            <User size={24} className="text-[#00D1FF]" />
                        </div>
                    </button>
                    {session && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth' })}
                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </header>
    );
}
