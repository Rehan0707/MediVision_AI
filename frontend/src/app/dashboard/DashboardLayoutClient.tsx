"use client";

import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useSettings } from "@/context/SettingsContext";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Lock, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userRole } = useSettings();
    const pathname = usePathname();

    // Define access rules - admin routes protected; all other routes available to everyone
    const isAuthorized = () => {
        if (pathname.startsWith("/dashboard/admin") && userRole !== "admin") return false;
        return true;
    };

    if (!isAuthorized()) {
        return (
            <div className="flex min-h-screen bg-[#020617]">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 flex items-center justify-center p-8 medical-grid">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md w-full p-12 glass-morphism rounded-[3.5rem] border-red-500/20 text-center space-y-8 bg-red-500/[0.02]"
                        >
                            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-red-500 blur-2xl rounded-full"
                                />
                                <div className="relative w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-2xl">
                                    <Lock size={40} />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter">Access <span className="text-red-500">Denied</span></h1>
                                <p className="text-slate-400 font-medium leading-relaxed">
                                    Your current neural clearance (<span className="text-white uppercase px-2 py-0.5 rounded bg-white/5">{userRole}</span>) is insufficient to access this encrypted sector.
                                </p>
                            </div>

                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-slate-300 hover:text-white"
                            >
                                <ChevronLeft size={16} /> Return to Safe Zone
                            </Link>
                        </motion.div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#020617]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-auto p-8 medical-grid">
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#00D1FF] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Interface...</div>}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
