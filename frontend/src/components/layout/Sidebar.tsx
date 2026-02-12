"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Activity,
    Bone,
    Stethoscope,
    History,
    Settings,
    Users2,
    ChevronLeft,
    ChevronRight,
    LogOut,
    ShieldCheck,
    TrendingUp,
    Brain,
    Scan,
    Zap,
    ShieldAlert
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useSettings } from "@/context/SettingsContext";
import { signOut } from "next-auth/react";

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { t, userRole, setUserRole, isRuralMode, isPrivacyMode } = useSettings();

    const allItems = [
        // CORE DIAGNOSTICS
        { group: "CORE", name: t("dashboard"), icon: LayoutDashboard, href: "/dashboard", roles: ["patient", "doctor", "admin"] },
        { group: "CORE", name: "Patient Portal", icon: Activity, href: "/dashboard/patient-portal", roles: ["patient", "doctor", "admin"] },
        { group: "CORE", name: "X-Ray 3D", icon: Bone, href: "/dashboard?modality=xray", roles: ["patient", "doctor", "admin"] },
        { group: "CORE", name: "MRI 3D", icon: Brain, href: "/dashboard?modality=mri", roles: ["patient", "doctor", "admin"] },
        { group: "CORE", name: "CT Scan 3D", icon: Scan, href: "/dashboard?modality=ct", roles: ["patient", "doctor", "admin"] },

        // LABORATORY
        { group: "LAB", name: "Blood Tests", icon: Activity, href: "/dashboard?modality=blood", roles: ["patient", "doctor", "admin"] },
        { group: "LAB", name: "Urine Analysis", icon: Activity, href: "/dashboard?modality=urine", roles: ["patient", "doctor", "admin"] },

        // CARDIOVASCULAR
        { group: "CARDIO", name: "ECG / EKG", icon: Activity, href: "/dashboard/signals", roles: ["patient", "doctor", "admin"] },
        { group: "CARDIO", name: "Stress Test", icon: Activity, href: "/dashboard?modality=stress", roles: ["patient", "doctor", "admin"] },

        // INTELLIGENCE & RECOVERY
        { group: "INTEL", name: t("signals"), icon: Activity, href: "/dashboard/signals", roles: ["patient", "doctor", "admin"] },
        { group: "INTEL", name: t("trends"), icon: TrendingUp, href: "/dashboard/trends", roles: ["patient", "doctor", "admin"] },
        { group: "INTEL", name: "Risk Sentinel", icon: ShieldAlert, href: "/dashboard/risk", roles: ["patient", "doctor", "admin"] },
        { group: "INTEL", name: t("copilot"), icon: Stethoscope, href: "/dashboard/copilot", roles: ["patient", "doctor", "admin"] },
        { group: "INTEL", name: t("rehab"), icon: Zap, href: "/dashboard/rehab", roles: ["patient", "doctor", "admin"] },

        // COLLABORATION & HISTORY
        { group: "SYSTEM", name: "Expert Network", icon: Users2, href: "/dashboard/community", roles: ["patient", "doctor", "admin"] },
        { group: "SYSTEM", name: t("history"), icon: History, href: "/dashboard/history", roles: ["patient", "doctor", "admin"] },

        // ADMIN SPECIFIC
        { group: "ADMIN", name: t("userManagement"), icon: Users2, href: "/dashboard/admin/users", roles: ["admin"] },
        { group: "ADMIN", name: t("securityAudit"), icon: ShieldCheck, href: "/dashboard/admin/audit", roles: ["admin"] },
    ];

    const menuItems = allItems.filter(item => item.roles.includes(userRole));

    // Grouping the items for the UI
    const groups = ["CORE", "LAB", "CARDIO", "INTEL", "SYSTEM", "ADMIN"];
    const filteredGroups = groups.filter(g => menuItems.some(i => i.group === g));

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? "80px" : "280px" }}
            className={`h-screen sticky top-0 bg-[#020617]/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out z-40 ${isPrivacyMode ? 'privacy-mode' : ''} ${isRuralMode ? 'rural-mode' : ''}`}
        >
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] flex items-center justify-center font-bold text-black shrink-0 shadow-[0_0_15px_rgba(0,209,255,0.3)]">
                    MV
                </div>
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-bold text-xl tracking-tight whitespace-nowrap"
                    >
                        MediVision <span className="text-[#00D1FF]">AI</span>
                    </motion.span>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#00D1FF] text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-[#00D1FF]/20"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Menu Items */}
            <nav className="flex-1 px-4 mt-10 space-y-8 overflow-y-auto custom-scrollbar">
                {filteredGroups.map((group) => (
                    <div key={group} className="space-y-2">
                        {!isCollapsed && (
                            <div className="px-4 mb-3">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 block">{group}</span>
                            </div>
                        )}
                        <div className="space-y-1">
                            {menuItems.filter(i => i.group === group).map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative ${isActive
                                            ? "bg-[#00D1FF]/10 text-[#00D1FF] font-semibold"
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                                            }`}
                                    >
                                        <item.icon size={20} className={isActive ? "text-[#00D1FF]" : "group-hover:text-white transition-colors"} />
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="whitespace-nowrap text-sm"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="absolute left-0 w-1 h-6 bg-[#00D1FF] rounded-r-full"
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Vision & Disclaimer Area */}
            {!isCollapsed && (
                <div className="px-6 mb-6">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                        <div className="flex items-center gap-2 text-[#00D1FF]">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Vision Protocol</span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            &quot;Transforming medical data into clear visual insights.&quot;
                        </p>
                        <div className="pt-2 border-t border-white/5">
                            <p className="text-[8px] text-slate-600 uppercase font-black tracking-tighter">
                                Assistive AI • Not for Diagnosis
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Badge - Admin only */}
            {!isCollapsed && userRole === 'admin' && (
                <div className="px-6 py-4">
                    <div className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-center border bg-[#7000FF]/5 text-[#7000FF] border-[#7000FF]/20">
                        Admin
                    </div>
                </div>
            )}

            {/* Footer Area */}
            <div className="p-4 border-t border-white/5 space-y-2">
                <Link
                    href="/dashboard/settings"
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-all group"
                >
                    <Settings size={22} />
                    {!isCollapsed && <span>Settings</span>}
                </Link>
                <button
                    onClick={() => {
                        localStorage.removeItem("mv_userRole");
                        localStorage.removeItem("mv_language");
                        localStorage.removeItem("mv_isRuralMode");
                        localStorage.removeItem("mv_isPrivacyMode");
                        signOut({ callbackUrl: "/" });
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all group"
                >
                    <LogOut size={22} />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>

            {isRuralMode && !isCollapsed && (
                <div className="px-6 pb-6">
                    <div className="px-4 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest text-center">
                        RURAL ACCESS ACTIVE
                    </div>
                </div>
            )}
        </motion.div>
    );
}
