"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { Brain, ShieldCheck, Mail, Lock, User, UserPlus, LogIn, ChevronRight, Zap, Globe, Microscope, Activity, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";

export default function AuthPage() {
    const { data: session, status } = useSession();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");

    // Form States
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [clinicName, setClinicName] = useState("");
    const [workingHours, setWorkingHours] = useState("");
    const [verificationProof, setVerificationProof] = useState("");

    const { setUserRole } = useSettings();
    const router = useRouter();

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            const userRole = (session.user as any).role?.toLowerCase();
            if (userRole === 'admin') {
                router.push("/dashboard/admin/approval");
            } else {
                router.push("/dashboard");
            }
        }
    }, [status, session, router]);

    const validateForm = () => {
        if (!email.includes("@")) return "Please enter a valid neural address (email).";
        if (password.length < 6) return "Security key must be at least 6 characters.";
        if (!isLogin && !fullName) return "Identity name is required for registration.";
        if (!isLogin && role === 'doctor' && (!specialization || !licenseNumber || !clinicName || !workingHours || !verificationProof)) {
            return "All clinical details and verification proof are required.";
        }
        return null;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            if (isLogin) {
                const res = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (res?.error) {
                    setError(res.error);
                } else {
                    setShowSuccess(true);
                    // Redirect logic is handled by useEffect based on session status
                }
            } else {
                const res = await fetch('http://localhost:5001/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: fullName,
                        email,
                        password,
                        role: role.charAt(0).toUpperCase() + role.slice(1),
                        specialization,
                        licenseNumber,
                        clinicName,
                        workingHours,
                        verificationProof
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Registration failed.");
                } else {
                    setShowSuccess(true);
                    setUserRole(role);
                    setTimeout(() => {
                        if (role === 'doctor') {
                            setIsLogin(true);
                            setShowSuccess(false);
                            setError("Account created. Please wait for admin approval before logging in.");
                        } else if (role === 'admin') {
                            router.push("/dashboard/admin/approval");
                        } else {
                            router.push("/dashboard");
                        }
                    }, 2000);
                }
            }
        } catch (err) {
            setError("Neural link failed. Verify connection status.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setIsLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard" });
        } catch (err) {
            setError("Neural link failed. Verify Google credentials.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#00D1FF]/30">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#00D1FF]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#7000FF]/5 blur-[120px] rounded-full" />
                <div className="absolute top-0 left-0 w-full h-full medical-grid opacity-20" />
            </div>

            <AnimatePresence mode="wait">
                {status === "loading" ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center z-50 space-y-6"
                    >
                        <div className="w-20 h-20 rounded-full border-t-2 border-[#00D1FF] animate-spin mx-auto" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00D1FF] animate-pulse">Initializing Neural Link...</p>
                    </motion.div>
                ) : showSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="text-center z-50 space-y-8"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] p-1 mx-auto"
                        >
                            <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center">
                                <CheckCircle2 size={64} className="text-[#00D1FF] animate-pulse" />
                            </div>
                        </motion.div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black italic tracking-tighter uppercase">Neural Sync <span className="text-[#00D1FF]">Complete</span></h2>
                            <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Redirecting to Medical Vault...</p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="auth-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10"
                    >
                        {/* Visual Side */}
                        <div className="hidden lg:block space-y-12 text-left">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-6"
                            >
                                <div>
                                    <Link href="/" className="inline-block group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] flex items-center justify-center font-bold text-black text-xl shadow-[0_0_20px_rgba(0,209,255,0.3)] group-hover:scale-110 transition-transform">
                                                MV
                                            </div>
                                            <span className="text-xl font-black tracking-tighter uppercase italic">MediVision AI</span>
                                        </div>
                                    </Link>
                                </div>
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-7xl font-black tracking-tight leading-tight"
                                >
                                    Access the <br />
                                    <span className="gradient-text italic">Neural Network</span>
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-slate-400 text-lg max-w-md leading-relaxed font-medium"
                                >
                                    MediVision AI is transforming the diagnostic experience with real-time neural visualization and clinical intelligence.
                                </motion.p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="space-y-8"
                            >
                                <AuthFeature icon={<ShieldCheck size={20} />} text="End-to-end encrypted medical data" />
                                <AuthFeature icon={<Microscope size={20} />} text="AI-powered diagnostic assistance" />
                                <AuthFeature icon={<Activity size={20} />} text="Real-time physiological stream tracking" />
                            </motion.div>
                        </div>

                        {/* Form Side */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="w-full max-w-md mx-auto"
                        >
                            <div className="p-10 rounded-[3rem] glass-morphism border-white/5 relative overflow-hidden bg-white/[0.01] shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00D1FF] via-[#7000FF] to-[#00D1FF]" />

                                {isLoading && (
                                    <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-6">
                                        <div className="w-20 h-20 rounded-full border-t-2 border-[#00D1FF] animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00D1FF]">Authorizing Identity...</p>
                                    </div>
                                )}

                                <div className="mb-10 flex justify-center">
                                    <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex gap-1">
                                        <button
                                            onClick={() => { setIsLogin(true); setError(null); }}
                                            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={() => { setIsLogin(false); setError(null); }}
                                            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-8 text-center px-4">
                                    <h2 className="text-3xl font-black mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                                    <p className="text-sm text-slate-500">{isLogin ? "Log in to view your medical vault." : "Join the future of healthcare today."}</p>
                                </div>

                                <div className="space-y-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleGoogleAuth}
                                        className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-bold tracking-tight"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        {isLogin ? "Sign in with Google" : "Sign up with Google"}
                                    </motion.button>

                                    <div className="relative my-8">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[#020617] px-4 text-slate-500 font-bold tracking-[0.2em]">OR</span>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs font-bold"
                                        >
                                            <AlertCircle size={16} />
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleAuth} className="space-y-5">
                                        <div className="mb-6">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 text-center">Identity Role</p>
                                            <div className="bg-white/[0.03] p-1 rounded-2xl border border-white/5 grid grid-cols-3 gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setRole("patient")}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${role === 'patient' ? 'bg-[#00D1FF] text-black shadow-lg shadow-[#00D1FF]/20' : 'text-slate-500 hover:text-white'}`}
                                                >
                                                    <User size={14} />
                                                    Patient
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRole("doctor")}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${role === 'doctor' ? 'bg-[#7000FF] text-white shadow-lg shadow-[#7000FF]/20' : 'text-slate-500 hover:text-white'}`}
                                                >
                                                    <Brain size={14} />
                                                    Doctor
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setRole("admin")}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${role === 'admin' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                                                >
                                                    <Shield size={14} />
                                                    Admin
                                                </button>
                                            </div>
                                        </div>

                                        <AnimatePresence mode="popLayout">
                                            {!isLogin && (
                                                <motion.div
                                                    key="signup-fields"
                                                    initial={{ opacity: 0, y: -20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    className="space-y-5"
                                                >
                                                    <div className="relative group">
                                                        <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                                        <input
                                                            type="text"
                                                            value={fullName}
                                                            onChange={(e) => setFullName(e.target.value)}
                                                            placeholder={role === 'doctor' ? "Doctor Full Name" : "Patient Full Name"}
                                                            required={!isLogin}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                                        />
                                                    </div>

                                                    {role === 'doctor' && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="space-y-4 pt-2"
                                                        >
                                                            <div className="relative group">
                                                                <Microscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                                                <input
                                                                    type="text"
                                                                    value={specialization}
                                                                    onChange={(e) => setSpecialization(e.target.value)}
                                                                    placeholder="Area of Specialization"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                                                />
                                                            </div>
                                                            <div className="relative group">
                                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                                                <input
                                                                    type="text"
                                                                    value={licenseNumber}
                                                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                                                    placeholder="Medical License Number"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                                                />
                                                            </div>
                                                            <div className="relative group">
                                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                                                <input
                                                                    type="text"
                                                                    value={clinicName}
                                                                    onChange={(e) => setClinicName(e.target.value)}
                                                                    placeholder="Hospital/Clinic Affiliation"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                                                />
                                                            </div>
                                                            <div className="relative group">
                                                                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                                                <input
                                                                    type="text"
                                                                    value={workingHours}
                                                                    onChange={(e) => setWorkingHours(e.target.value)}
                                                                    placeholder="Working Hours (e.g. 09:00 - 18:00)"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                                                />
                                                            </div>
                                                            <div className="relative group">
                                                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                                                <input
                                                                    type="text"
                                                                    value={verificationProof}
                                                                    onChange={(e) => setVerificationProof(e.target.value)}
                                                                    placeholder="Licence Proof / Certificate URL"
                                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                                                />
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Neural ID (Email)"
                                                required
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00D1FF] transition-colors" size={18} />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Security Code"
                                                    required
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-[#00D1FF]/50 transition-all font-medium placeholder:text-slate-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {isLogin && (
                                                <div className="flex justify-end px-2">
                                                    <button type="button" className="text-[10px] font-black text-slate-500 hover:text-[#00D1FF] transition-colors uppercase tracking-widest">
                                                        Recover Key?
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#00D1FF] to-[#7000FF] text-black font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-[#00D1FF]/10 transition-all flex items-center justify-center gap-3 mt-4"
                                        >
                                            {isLogin ? "AUTHORIZE ACCESS" : "INITIALIZE ACCOUNT"}
                                            <ChevronRight size={16} />
                                        </motion.button>
                                    </form>
                                </div>

                                <div className="mt-8 text-center">
                                    <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">
                                        Secured by <span className="text-[#00D1FF]">Neural-Blockade v4.2</span>
                                    </p>
                                </div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="mt-12 flex justify-center gap-8 text-slate-500"
                            >
                                <Link href="/" className="flex items-center gap-2 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                                    <Globe size={14} /> Global Access
                                </Link>
                                <button className="flex items-center gap-2 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck size={14} /> Neuro-Metrics
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AuthFeature({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[#00D1FF] group-hover:scale-110 transition-transform shadow-inner">
                {icon}
            </div>
            <p className="text-slate-300 font-bold text-sm tracking-tight">{text}</p>
        </div>
    );
}
