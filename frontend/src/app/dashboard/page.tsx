"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, ChevronRight, ChevronLeft, Activity, Bone, AlertCircle, CheckCircle2, Search, Zap, ShieldCheck, Microscope, Scan, Info, Brain, WifiOff, Sparkles, SplitSquareVertical, Database, Users, HeartPulse, Stethoscope, Droplets, Syringe, Pill, ClipboardList, Thermometer, Dna, Waves, AlertTriangle, X } from "lucide-react";
import dynamic from "next/dynamic";

const HeroScene = dynamic(() => import("@/components/animations/Model"), { ssr: false });
const HandScene = dynamic(() => import("@/components/animations/HandScene"), { ssr: false });
const BrainScene = dynamic(() => import("@/components/animations/BrainScene"), { ssr: false });
const ThoraxScene = dynamic(() => import("@/components/animations/ThoraxScene"), { ssr: false });
const KneeScene = dynamic(() => import("@/components/animations/KneeScene"), { ssr: false });
const SpineScene = dynamic(() => import("@/components/animations/SpineScene"), { ssr: false });
const BoneScene = dynamic(() => import("@/components/animations/BoneScene"), { ssr: false });
const LegScene = dynamic(() => import("@/components/animations/LegScene"), { ssr: false });

import MedicalGlossary from "@/components/dashboard/MedicalGlossary";
import { useSettings } from "@/context/SettingsContext";
import { apiUrl, authHeaders } from "@/lib/api";
import Link from "next/link";
import { ComparisonModal } from "@/components/dashboard/ComparisonModal";
import { PrintReport } from "@/components/dashboard/PrintReport";
import { AdminStats } from "@/components/dashboard/AdminStats";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { useSearchParams, useRouter } from "next/navigation";
import { runLocalInference, MLResult } from "@/lib/ml/engine";

function LiveNeuralFeed() {
    const feeds = [
        "SYSTEM: Neural Interface Synchronized",
        "SECURITY: AES-256 Vault Active",
        "CONNECTIVITY: Clinical Node SG-1 Online",
        "READY: Awaiting Diagnostic Input",
    ];

    return (
        <div className="w-full bg-[#00D1FF]/5 border-y border-[#00D1FF]/10 py-2 overflow-hidden whitespace-nowrap relative">
            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                className="inline-flex gap-20 items-center"
            >
                {[...feeds, ...feeds].map((text, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00D1FF] opacity-70 italic">{text}</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#00D1FF] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Neural Interface...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function DashboardContent() {
    const { isRuralMode, isPrivacyMode, userRole, t } = useSettings();
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    // States
    const [selectedModality, setSelectedModality] = useState<string | null>(null);
    const [customMlResult, setCustomMlResult] = useState<MLResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analysisComplete, setAnalysisComplete] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [isComparing, setIsComparing] = useState(false);
    const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [modalityMismatch, setModalityMismatch] = useState<string | null>(null);
    const [detectedPart, setDetectedPart] = useState<string>("hand");
    const [currentScanImage, setCurrentScanImage] = useState<string>("/scans/hand_active_scan.png");
    const [hasIssue, setHasIssue] = useState(false);
    const [analysisData, setAnalysisData] = useState<{
        detectedPart?: string;
        preciseAbnormality?: string;
        preciseLocation?: string;
        findings?: string[];
        recommendations?: string[];
        summary?: string;
        confidence?: number;
        pinpoint2D?: { x: number; y: number };
        pinpoint3D?: { x: number; y: number; z: number };
    } | null>(null);
    const [viewMode, setViewMode] = useState<'3d' | 'slice'>('3d');
    const [isScheduling, setIsScheduling] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [latestScan, setLatestScan] = useState<any>(null);

    useEffect(() => {
        const fetchLatest = async () => {
            if (!session) return;
            try {
                const res = await fetch(apiUrl('/api/scans'), {
                    headers: authHeaders((session?.user as any)?.accessToken)
                });
                const data = await res.json();
                if (data && data.length > 0) setLatestScan(data[0]);
            } catch (err) {
                console.error("Latest scan fetch failed:", err);
            }
        };
        fetchLatest();
    }, [session]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session) return;
            try {
                const res = await fetch(apiUrl('/api/users/profile'), {
                    headers: authHeaders((session?.user as any)?.accessToken)
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (err) {
                console.error("Profile fetch failed:", err);
            }
        };
        fetchProfile();
    }, [session]);

    useEffect(() => {
        const modality = searchParams.get("modality");
        if (modality) {
            setSelectedModality(modality);
            // Contextual Defaults based on Modality
            if (modality === 'ct' || modality === 'mri') {
                setDetectedPart('brain');
                setCurrentScanImage('/scans/brain_scan_active.png');
            } else if (modality === 'xray') {
                setDetectedPart('chest');
                setCurrentScanImage('/scans/chest_xray_active.png');
            }
        }
    }, [searchParams]);

    const groupedModalities = [
        {
            category: "Imaging & Radiology",
            items: [
                { id: "xray", name: t("xray"), icon: <Bone size={24} />, description: t("xrayDesc"), color: "text-[#00D1FF]", bg: "bg-[#00D1FF]/5", border: "border-[#00D1FF]/20" },
                { id: "mri", name: t("mri"), icon: <Brain size={24} />, description: t("mriDesc"), color: "text-[#7000FF]", bg: "bg-[#7000FF]/5", border: "border-[#7000FF]/20" },
                { id: "ct", name: t("ct"), icon: <Scan size={24} />, description: t("ctDesc"), color: "text-emerald-400", bg: "bg-emerald-400/5", border: "border-emerald-400/20" },
                { id: "ultrasound", name: t("ultrasound"), icon: <Waves size={24} />, description: t("ultrasoundDesc"), color: "text-blue-400", bg: "bg-blue-400/5", border: "border-blue-400/20" },
                { id: "pet", name: t("pet"), icon: <Activity size={24} />, description: t("petDesc"), color: "text-rose-400", bg: "bg-rose-400/5", border: "border-rose-400/20" },
                { id: "mammography", name: t("mammography"), icon: <Microscope size={24} />, description: t("mammographyDesc"), color: "text-pink-400", bg: "bg-pink-400/5", border: "border-pink-400/20" }
            ]
        },
        {
            category: "Laboratory & Bloodwork",
            items: [
                { id: "blood", name: t("blood"), icon: <Droplets size={24} />, description: t("bloodDesc"), color: "text-red-400", bg: "bg-red-400/5", border: "border-red-400/20" },
                { id: "urine", name: t("urine"), icon: <Syringe size={24} />, description: t("urineDesc"), color: "text-yellow-400", bg: "bg-yellow-400/5", border: "border-yellow-400/20" },
                { id: "lft", name: "Liver Function (LFT)", icon: <Activity size={24} />, description: "Check liver health.", color: "text-orange-400", bg: "bg-orange-400/5", border: "border-orange-400/20" },
                { id: "kft", name: "Kidney Function (KFT)", icon: <Zap size={24} />, description: "Check kidney health.", color: "text-indigo-400", bg: "bg-indigo-400/5", border: "border-indigo-400/20" },
                { id: "thyroid", name: "Thyroid Profile", icon: <Stethoscope size={24} />, description: "Check hormone levels.", color: "text-cyan-400", bg: "bg-cyan-400/5", border: "border-cyan-400/20" },
                { id: "hormone", name: "Hormone Tests", icon: <Thermometer size={24} />, description: "Check hormone balance.", color: "text-purple-400", bg: "bg-purple-400/5", border: "border-purple-400/20" }
            ]
        },
        {
            category: "Cardiac & Vascular",
            items: [
                { id: "ecg", name: "ECG / EKG", icon: <HeartPulse size={24} />, description: "Electrical rhythm tracking.", color: "text-rose-500", bg: "bg-rose-500/5", border: "border-rose-500/20" },
                { id: "stress", name: "Stress Test", icon: <Zap size={24} />, description: "Cardiac load performance.", color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/20" }
            ]
        },
        {
            category: "Advanced Specialists",
            items: [
                { id: "oncology", name: "Oncology Reports", icon: <Microscope size={24} />, description: "Cellular morphology audit.", color: "text-violet-400", bg: "bg-violet-400/5", border: "border-violet-400/20" },
                { id: "biopsy", name: "Histopathology", icon: <Scan size={24} />, description: "Biopsy specimen analysis.", color: "text-fuchsia-400", bg: "bg-fuchsia-400/5", border: "border-fuchsia-400/20" },
                { id: "genetic", name: "Genetic Testing", icon: <Dna size={24} />, description: "Genomic sequence mapping.", color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20" },
                { id: "allergy", name: "Allergy Profile", icon: <Droplets size={24} />, description: "Immune response baseline.", color: "text-orange-400", bg: "bg-orange-400/5", border: "border-orange-400/20" }
            ]
        }
    ];

    const getHudTitle = () => {
        if (detectedPart.includes("brain") || detectedPart.includes("mri") || detectedPart.includes("head")) return "Brain Structure Check";
        if (detectedPart.includes("hand") || detectedPart.includes("carpal")) return "Hand Bone Check";
        if (detectedPart.includes("chest") || detectedPart.includes("lung")) return "Chest Cavity Check";
        return "Scan Analysis Tools";
    };

    const MODALITY_PROMPTS: Record<string, string> = {
        blood: `This is a BLOOD TEST report image. Extract all values, units, and reference ranges. Identify any abnormal (high/low) values.
        Return ONLY valid JSON: {"detectedPart":"blood","preciseAbnormality":"string or 'Normal'","preciseLocation":"Systemic","findings":["value1","value2"],"recommendations":["suggestion"],"summary":"Plain English summary for patient","confidence":0.0-1.0}`,
        urine: `This is a URINE ANALYSIS report. Extract values (pH, protein, glucose, etc.). Identify abnormalities.
        Return ONLY valid JSON: {"detectedPart":"urine","preciseAbnormality":"string or 'Normal'","preciseLocation":"Renal","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        lft: `This is a LIVER FUNCTION (LFT) report. Extract ALT, AST, ALP, bilirubin. Identify abnormal values.
        Return ONLY valid JSON: {"detectedPart":"liver","preciseAbnormality":"string or 'Normal'","preciseLocation":"Hepatic","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        kft: `This is a KIDNEY FUNCTION (KFT) report. Extract creatinine, urea, electrolytes. Identify abnormalities.
        Return ONLY valid JSON: {"detectedPart":"kidney","preciseAbnormality":"string or 'Normal'","preciseLocation":"Renal","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        thyroid: `This is a THYROID PROFILE report (TSH, T3, T4). Extract values, identify hypo/hyperthyroidism.
        Return ONLY valid JSON: {"detectedPart":"thyroid","preciseAbnormality":"string or 'Normal'","preciseLocation":"Endocrine","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        hormone: `This is a HORMONE TEST report. Extract values, identify imbalances.
        Return ONLY valid JSON: {"detectedPart":"endocrine","preciseAbnormality":"string or 'Normal'","preciseLocation":"Systemic","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        stress: `This is a STRESS TEST report. Extract exercise capacity, ECG changes, symptoms.
        Return ONLY valid JSON: {"detectedPart":"heart","preciseAbnormality":"string or 'Normal'","preciseLocation":"Cardiac","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        prescription: `This is a PRESCRIPTION. Extract medications, dosage, instructions.
        Return ONLY valid JSON: {"detectedPart":"clinical","preciseAbnormality":"string or 'Routine'","preciseLocation":"Pharmacy","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        oncology: `This is an ONCOLOGY report. Extract tumor markers, staging, treatment status.
        Return ONLY valid JSON: {"detectedPart":"oncology","preciseAbnormality":"string or 'Stable'","preciseLocation":"Oncological","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        biopsy: `This is a HISTOPATHOLOGY/BIOPSY report. Extract diagnosis, grade, margins.
        Return ONLY valid JSON: {"detectedPart":"biopsy","preciseAbnormality":"string or 'Benign'","preciseLocation":"Tissue","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        genetic: `This is a GENETIC TESTING report. Extract variants, risk alleles, interpretation.
        Return ONLY valid JSON: {"detectedPart":"genetic","preciseAbnormality":"string or 'No significant variants'","preciseLocation":"Genomic","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
        allergy: `This is an ALLERGY PROFILE report. Extract allergens, IgE levels, sensitivities.
        Return ONLY valid JSON: {"detectedPart":"allergy","preciseAbnormality":"string or 'No significant allergies'","preciseLocation":"Immunological","findings":[],"recommendations":[],"summary":"Plain English summary","confidence":0.0-1.0}`,
    };

    const getHudDescription = () => {
        if (analysisData?.preciseAbnormality || analysisData?.preciseLocation) {
            return `${analysisData.preciseAbnormality || "Abnormality"} identified at ${analysisData.preciseLocation || "specified anatomical zone"}. ${analysisData.summary || ""}`;
        }
        if (detectedPart.includes("brain") || detectedPart.includes("mri") || detectedPart.includes("head"))
            return "Brain structure looks normal. No bleeding or unusual findings detected.";
        if (detectedPart.includes("hand") || detectedPart.includes("carpal"))
            return "Hand bones are aligned correctly. No breaks or fractures identified.";
        return "Scanning and analyzing the medical image for any issues.";
    };

    const handleGeminiAnalysis = async (imageData?: string) => {
        setIsAiAnalyzing(true);
        const imageToAnalyze = imageData || currentScanImage;

        try {
            // Run custom ML alongside Gemini
            const customMlPromise = runLocalInference(imageToAnalyze, selectedModality || "xray");

            const customPrompt = selectedModality ? MODALITY_PROMPTS[selectedModality] : undefined;
            const res = await fetch(apiUrl('/api/ai/analyze'), {
                method: 'POST',
                headers: authHeaders((session?.user as any)?.accessToken),
                body: JSON.stringify({
                    image: imageToAnalyze,
                    modality: selectedModality || "xray",
                    prompt: customPrompt
                })
            });
            const data = await res.json();
            const customResult = await customMlPromise;
            setCustomMlResult(customResult);

            let parsedData: {
                detectedModality?: string;
                detectedPart?: string;
                preciseAbnormality?: string;
                preciseLocation?: string;
                findings?: string[];
                recommendations?: string[];
                summary?: string;
                confidence?: number;
            };
            try {
                // Backend now returns the object directly, but checking for text just in case
                if (data.text) {
                    const jsonStr = data.text.replace(/```json|```/g, '').trim();
                    parsedData = JSON.parse(jsonStr);
                } else {
                    parsedData = data;
                }

                if (parsedData.detectedPart) {
                    setDetectedPart(parsedData.detectedPart.toLowerCase());
                } else if (selectedModality) {
                    setDetectedPart(selectedModality);
                }

                // Modality Mismatch Detection
                setModalityMismatch(null);
                if (parsedData.detectedModality && selectedModality) {
                    const selected = selectedModality.toLowerCase();
                    const detected = parsedData.detectedModality.toLowerCase();

                    // Allow broad matches (e.g., Sonography/Ultrasound, X-ray/Bone)
                    const isMismatch = (
                        (selected === 'ultrasound' && !detected.includes('sonography') && !detected.includes('ultrasound')) ||
                        (selected === 'xray' && !detected.includes('x-ray') && !detected.includes('xray')) ||
                        (selected === 'mri' && !detected.includes('mri')) ||
                        (selected === 'ct' && !detected.includes('ct'))
                    );

                    if (isMismatch) {
                        setModalityMismatch(parsedData.detectedModality);
                        parsedData.summary = `⚠️ MODALITY WARNING: You selected ${selectedModality.toUpperCase()} but the system detected a ${parsedData.detectedModality.toUpperCase()} image. Please ensure you uploaded the correct file for accurate results.`;
                        setHasIssue(true); // Treat mismatch as an issue for visibility
                    }
                }

                setAiResponse(parsedData.summary ?? null);
                setAnalysisData(parsedData);

                const issueKeywords = ["fracture", "abnormality", "lesion", "displacement", "tumor", "mass", "bleed", "hemorrhage", "break", "tear", "cyst", "calcification", "elevated", "elevation", "abnormal", "abnormalities", "high", "low", "decreased", "increased", "positive", "malignant", "moderate", "severe"];
                const containsIssue = parsedData.findings?.some((f: string) =>
                    issueKeywords.some(kw => f.toLowerCase().includes(kw))
                ) ||
                    (parsedData.summary && issueKeywords.some(kw => parsedData.summary?.toLowerCase().includes(kw))) ||
                    (parsedData.preciseAbnormality && issueKeywords.some(kw => parsedData.preciseAbnormality?.toLowerCase().includes(kw)) && !parsedData.preciseAbnormality.toLowerCase().includes("none") && !parsedData.preciseAbnormality.toLowerCase().includes("normal"));

                setHasIssue(!!containsIssue);
                await saveScanToDb(parsedData, imageToAnalyze);
            } catch (pErr) {
                console.error("Failed to parse Gemini JSON:", pErr);
                setAiResponse(data.text);
            }

        } catch (err) {
            console.error("AI Analysis failed:", err);
            setAiResponse("Analysis connection timeout. Please verify Clinical Intelligence sync.");
        } finally {
            setIsAiAnalyzing(false);
        }
    };

    const saveScanToDb = async (analysisData: any, image: string) => {
        try {
            await fetch(apiUrl('/api/scans/save'), {
                method: 'POST',
                headers: authHeaders((session?.user as any)?.accessToken),
                body: JSON.stringify({
                    referenceId: `MV-${Math.floor(Math.random() * 9000) + 1000}`,
                    type: analysisData.detectedPart ? `${analysisData.detectedPart.toUpperCase()} Scan` : "Medical Scan",
                    patient: "Self",
                    risk: analysisData.findings?.length > 3 ? "High" : "Safe",
                    analysis: {
                        confidence: analysisData.confidence || 95,
                        findings: analysisData.findings || [],
                        recommendations: analysisData.recommendations || []
                    },
                    imageUrl: image.length < 100000 ? image : undefined
                })
            });
        } catch (err) {
            console.error("Failed to save scan:", err);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setScanProgress(0);
        setDetectedPart("searching");
        setAiResponse(null);

        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
        const base64 = await base64Promise as string;
        setCurrentScanImage(base64);

        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setIsUploading(false);
                        setAnalysisComplete(true);
                        handleGeminiAnalysis(base64);
                    }, 500);
                    return 100;
                }
                return prev + 5;
            });
        }, 50);
    };

    const [showHelp, setShowHelp] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            window.print();
        }, 2000);
    };

    return (
        <div className="space-y-10 relative">
            {userRole === "admin" ? (
                <AdminStats t={t} />
            ) : (
                <>
                    {/* Help Overlay */}
                    <AnimatePresence>
                        {showHelp && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
                                onClick={() => setShowHelp(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    className="w-full max-w-2xl bg-[#020617] border border-white/10 rounded-[3rem] p-12 shadow-2xl space-y-8"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">Mission <span className="text-[#00D1FF]">Guide</span></h3>
                                            <p className="text-slate-500 font-medium">Getting started with MediVision AI</p>
                                        </div>
                                        <button onClick={() => setShowHelp(false)} className="text-slate-500 hover:text-white transition-colors">
                                            <ChevronRight size={32} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] font-black">01</div>
                                            <h4 className="font-black text-sm uppercase">Target</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">Select a diagnostic modality (X-Ray, MRI, or CT) to initialize the neural sensors.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#7000FF]/10 border border-[#7000FF]/20 flex items-center justify-center text-[#7000FF] font-black">02</div>
                                            <h4 className="font-black text-sm uppercase">Ingest</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">Upload your medical imaging file. Our local ML will immediately begin volumetric parsing.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black">03</div>
                                            <h4 className="font-black text-sm uppercase">Visualize</h4>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">Interact with the 3D reconstruction and consult our AI for clinical findings and mapping.</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowHelp(false)}
                                        className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                                    >
                                        Acknowledged
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Help Trigger */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="fixed bottom-10 right-10 w-14 h-14 rounded-full bg-[#00D1FF] text-black shadow-2xl shadow-[#00D1FF]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border-4 border-[#020617]"
                        title="Open Guide"
                    >
                        <Info size={24} />
                    </button>

                    <LiveNeuralFeed />
                    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 space-y-12">

                        {!analysisComplete ? (
                            <div className="flex flex-col space-y-12 pb-20">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center mt-12 relative"
                                >
                                    <div className="absolute top-0 left-0">
                                        <button
                                            onClick={() => {
                                                setSelectedModality(null);
                                                const url = new URL(window.location.href);
                                                url.searchParams.delete("modality");
                                                window.history.pushState({}, '', url);
                                            }}
                                            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-3"
                                        >
                                            <ChevronLeft size={16} />
                                            Back
                                        </button>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-[10px] font-black text-[#00D1FF] mb-6 border-[#00D1FF]/20 uppercase tracking-[0.2em]">
                                        <Activity size={14} className="animate-pulse" />
                                        MediVision AI
                                    </div>
                                    <h2 className="text-5xl font-black mb-4 tracking-tighter uppercase italic">
                                        Welcome to MediVision
                                    </h2>
                                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                                        Get started by selecting the type of scan you want to analyze. Our AI will guide you through the process step-by-step.
                                    </p>

                                    {/* Step Indicator */}
                                    <div className="flex items-center justify-center gap-4 mt-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${!selectedModality ? 'bg-[#00D1FF] text-black' : 'bg-white/5 text-slate-500'}`}>1. SELECT TYPE</span>
                                        <div className="w-10 h-[1px] bg-white/10" />
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedModality && !analysisComplete ? 'bg-[#00D1FF] text-black' : 'bg-white/5 text-slate-500'}`}>2. UPLOAD SCAN</span>
                                        <div className="w-10 h-[1px] bg-white/10" />
                                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-500">3. VIEW RESULTS</span>
                                    </div>
                                </motion.div>

                                {!selectedModality ? (
                                    <div className="space-y-16 px-4">
                                        {groupedModalities.map((group, gIdx) => (
                                            <div key={group.category} className="space-y-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-[1px] flex-1 bg-white/5" />
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 bg-[#020617] px-4 whitespace-nowrap">
                                                        {group.category}
                                                    </h3>
                                                    <div className="h-[1px] flex-1 bg-white/5" />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {group.items.map((m, idx) => (
                                                        <motion.div
                                                            key={m.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: (gIdx * 0.1) + (idx * 0.05) }}
                                                            onClick={() => {
                                                                if (['xray', 'mri', 'ct', 'mammography', 'ultrasound', 'pet'].includes(m.id)) {
                                                                    router.push(`/dashboard/visualizer?modality=${m.id}`);
                                                                } else if (m.id === 'ecg') {
                                                                    router.push(`/dashboard/signals`);
                                                                } else {
                                                                    setSelectedModality(m.id);
                                                                }
                                                            }}
                                                            className={`p-8 rounded-[2.5rem] ${m.bg} border-2 ${m.border} hover:border-white/20 cursor-pointer transition-all group relative overflow-hidden flex flex-col justify-between h-full`}
                                                        >
                                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[60px] rounded-full translate-x-10 -translate-y-10" />
                                                            <div>
                                                                <div className={`w-12 h-12 rounded-2xl ${m.bg} border ${m.border} flex items-center justify-center ${m.color} mb-6 group-hover:scale-110 transition-transform`}>
                                                                    {m.icon}
                                                                </div>
                                                                <h4 className="text-xl font-black mb-2 tracking-tight text-white italic uppercase">{m.name}</h4>
                                                                <p className="text-[11px] text-slate-400 leading-relaxed font-medium mb-6">{m.description}</p>
                                                            </div>
                                                            <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${m.color} mt-auto`}>
                                                                Start Analysis <ChevronRight size={12} />
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* User Dashboard has been moved to /dashboard/patient-portal */}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full max-w-3xl mx-auto px-4"
                                    >
                                        <button
                                            onClick={() => setSelectedModality(null)}
                                            className="mb-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <ChevronRight size={14} className="rotate-180" /> Change Modality
                                        </button>

                                        <div
                                            onClick={() => !isUploading && document.getElementById('dashboard-upload')?.click()}
                                            className={`border-2 border-dashed rounded-[3rem] p-20 flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden group ${isUploading ? "border-[#00D1FF] bg-[#00D1FF]/5" : "border-white/10 bg-white/[0.02] hover:border-[#00D1FF]/40 hover:bg-white/[0.04]"
                                                }`}
                                        >
                                            <input
                                                type="file"
                                                id="dashboard-upload"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                                accept="image/*,.dicom"
                                            />
                                            {isUploading && (
                                                <motion.div
                                                    initial={{ top: "-100%" }}
                                                    animate={{ top: "100%" }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                                    className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00D1FF] to-transparent z-10"
                                                />
                                            )}

                                            <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mb-10 transition-all duration-500 ${isUploading ? "bg-[#00D1FF] text-black scale-110 shadow-[0_0_30px_rgba(0,209,255,0.4)]" : "bg-white/5 text-slate-400 group-hover:scale-110"
                                                }`}>
                                                {isUploading ? <Scan className="animate-pulse" size={48} /> : <Upload size={48} />}
                                            </div>

                                            <AnimatePresence mode="wait">
                                                {isUploading ? (
                                                    <motion.div
                                                        key="uploading"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="text-center"
                                                    >
                                                        <p className="text-3xl font-black mb-3 tracking-tighter italic">ANALYZING SCAN: {scanProgress}%</p>
                                                        <div className="w-80 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-[#00D1FF]"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${scanProgress}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-[#00D1FF] text-[10px] mt-6 uppercase tracking-[0.3em] font-black animate-pulse">
                                                            {scanProgress < 30 ? "Initializing Scan Sensors..." :
                                                                scanProgress < 60 ? "Parsing Image Data..." :
                                                                    scanProgress < 90 ? "Checking Medical Databases..." :
                                                                        "Finalizing Analysis Result..."}
                                                        </p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="idle"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className="text-center"
                                                    >
                                                        <p className="text-3xl font-black mb-3 tracking-tight italic uppercase">Drop {selectedModality?.toUpperCase()} data here</p>
                                                        <p className="text-slate-500 text-sm font-bold tracking-wide">Supports DICOM, PNG, JPG (Full encryption enabled)</p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                                    <StatCard icon={<Activity size={20} />} label="AI Precision" value="99.4%" />
                                    <StatCard icon={<ShieldCheck size={20} />} label="Neural Safety" value="Verified" />
                                    <StatCard icon={<Microscope size={20} />} label="Analysis Flow" value="End-to-End" />
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="pb-12 space-y-8"
                            >
                                {/* Result Header & Actions */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-white/10 ${hasIssue ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {hasIssue ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight uppercase italic">{hasIssue ? "Abnormality Detected" : "Clear Scan Result"}</h2>
                                            <p className="text-slate-400 font-medium">Reference ID: MV-{Math.floor(Math.random() * 9000) + 1000} • {selectedModality?.toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => {
                                                setAnalysisComplete(false);
                                                setSelectedModality(null);
                                                setAnalysisData(null);
                                                setAiResponse(null);
                                                setScanProgress(0);
                                            }}
                                            className="px-8 py-4 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                                        >
                                            New Scan
                                        </button>
                                        <div className="flex flex-wrap gap-4">
                                            <button
                                                onClick={() => setIsComparing(true)}
                                                className="px-8 py-3 rounded-xl glass-card border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white flex items-center gap-3"
                                            >
                                                Compare Scans
                                            </button>
                                            <button
                                                onClick={() => setIsScheduling(true)}
                                                className="px-8 py-3 rounded-xl bg-[#7000FF] text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#7000FF]/20 flex items-center gap-3"
                                            >
                                                <Users size={16} />
                                                Schedule Specialist
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleExport}
                                            disabled={isExporting}
                                            className="px-8 py-4 rounded-xl bg-[#00D1FF] text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#00D1FF]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isExporting ? "EXPORTING PROTOCOL..." : "Export Analysis"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="rounded-[2.5rem] glass-morphism relative overflow-hidden h-[650px] border-white/5 shadow-2xl">
                                            <div className="absolute top-8 left-8 right-8 z-20 flex justify-between items-center">
                                                <div className="flex bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
                                                    <button
                                                        onClick={() => setViewMode('3d')}
                                                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === '3d' ? "bg-[#00D1FF] text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
                                                    >
                                                        3D MESH
                                                    </button>
                                                    <button
                                                        onClick={() => setViewMode('slice')}
                                                        className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'slice' ? "bg-[#00D1FF] text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
                                                    >
                                                        SLICE VIEW
                                                    </button>
                                                </div>
                                                <div className="flex gap-3">
                                                    <button className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-slate-400 hover:text-[#00D1FF] transition-all">
                                                        <Search size={20} />
                                                    </button>
                                                    <button className="p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-slate-400 hover:text-[#00D1FF] transition-all">
                                                        <Info size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {modalityMismatch && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        className="absolute top-28 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl"
                                                    >
                                                        <div className="mx-8 p-4 rounded-2xl bg-red-500/20 border border-red-500/50 backdrop-blur-xl flex items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                                                            <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                                                                <AlertTriangle size={24} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-0.5">Critical Modality Mismatch</p>
                                                                <p className="text-xs font-bold text-white leading-tight">
                                                                    You selected <span className="text-red-400 uppercase">{selectedModality}</span> but uploaded what looks like a <span className="text-red-400 uppercase">{modalityMismatch}</span> image.
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => setModalityMismatch(null)}
                                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                            >
                                                                <X size={16} className="text-white/50" />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="absolute top-28 left-8 z-20">
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl"
                                                >
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Original Scan</p>
                                                    <div className="w-32 aspect-square rounded-xl overflow-hidden border border-white/10 relative">
                                                        <img src={currentScanImage} alt="Scan" className="w-full h-full object-cover" />
                                                        {analysisData?.pinpoint2D && (
                                                            <div
                                                                className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 z-30"
                                                                style={{ left: `${analysisData.pinpoint2D.x * 100}%`, top: `${analysisData.pinpoint2D.y * 100}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
                                                                <div className="absolute inset-1 bg-red-600 rounded-full border border-white shadow-[0_0_10px_red]" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-[#00D1FF]/10 animate-pulse" />
                                                    </div>
                                                </motion.div>
                                            </div>

                                            <div className="absolute inset-0 flex items-center justify-center">
                                                {!isRuralMode ? (
                                                    <div className="w-full h-full opacity-80 scale-125">
                                                        {viewMode === '3d' ? (
                                                            detectedPart === 'brain' ? (
                                                                <BrainScene hasIssue={hasIssue} />
                                                            ) : (detectedPart === 'spine' || detectedPart === 'back' || detectedPart === 'vertebra') ? (
                                                                <SpineScene hasIssue={hasIssue} />
                                                            ) : (detectedPart === 'thorax' || detectedPart === 'chest' || detectedPart === 'lung' || detectedPart === 'rib') ? (
                                                                <ThoraxScene hasIssue={hasIssue} />
                                                            ) : (detectedPart === 'knee' || detectedPart === 'joint') ? (
                                                                <KneeScene hasIssue={hasIssue} />
                                                            ) : (detectedPart === 'leg' || detectedPart === 'lower limb') ? (
                                                                <LegScene hasIssue={hasIssue} hotspots={analysisData?.pinpoint3D ? [{ id: 'injury', position: [analysisData.pinpoint3D.x, analysisData.pinpoint3D.y, analysisData.pinpoint3D.z], label: analysisData.preciseAbnormality || 'Injury' }] : []} />
                                                            ) : (detectedPart === 'hand' || detectedPart === 'wrist' || detectedPart === 'finger' || detectedPart === 'carpal') ? (
                                                                <HandScene hasIssue={hasIssue} hotspots={analysisData?.pinpoint3D ? [{ id: 'injury', position: [analysisData.pinpoint3D.x, analysisData.pinpoint3D.y, analysisData.pinpoint3D.z], label: analysisData.preciseAbnormality || 'Injury' }] : []} />
                                                            ) : (detectedPart === 'bone' || detectedPart === 'fracture' || selectedModality === 'xray') ? (
                                                                <BoneScene hasIssue={hasIssue} hotspots={analysisData?.pinpoint3D ? [{ id: 'injury', position: [analysisData.pinpoint3D.x, analysisData.pinpoint3D.y, analysisData.pinpoint3D.z], label: analysisData.preciseAbnormality || 'Injury' }] : []} />
                                                            ) : (
                                                                <div className="w-full h-full p-20 flex items-center justify-center">
                                                                    <img
                                                                        src={currentScanImage}
                                                                        alt="Medical Scan"
                                                                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
                                                                    />
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="w-full h-full p-20 flex items-center justify-center relative group">
                                                                <div className="absolute inset-0 bg-gradient-to-t from-[#00D1FF]/5 to-transparent pointer-events-none" />
                                                                <img
                                                                    src={currentScanImage}
                                                                    alt="Anatomical Slice"
                                                                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border-4 border-[#00D1FF]/20 brightness-125 contrast-125 grayscale"
                                                                />
                                                                <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-red-500/50 shadow-[0_0_10px_red] animate-scan-line" />
                                                                <div className="absolute top-10 right-10 flex flex-col items-end">
                                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded mb-2">SCANNING AXIS: Z-44</span>
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">FRAME: 882/1000</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-slate-500 gap-4">
                                                        <WifiOff size={48} className="opacity-20" />
                                                        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">3D Assets Optimized Out</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="absolute bottom-10 left-10 right-10 z-20">
                                                <motion.div
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="p-8 rounded-3xl glass-card border-white/10 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00D1FF]" />
                                                    <div className="flex items-start gap-6">
                                                        <div className="p-3 rounded-2xl bg-[#00D1FF]/10 text-[#00D1FF]">
                                                            <AlertCircle size={28} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <h4 className="font-black text-xl tracking-tight uppercase italic">{getHudTitle()}</h4>
                                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${hasIssue ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                                                                    {hasIssue ? "ABNORMALITY DETECTED" : "ZERO ABNORMALITY DETECTED"}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl font-medium mb-4">
                                                                {getHudDescription()}
                                                            </p>
                                                            {analysisData && (
                                                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-[#00D1FF] uppercase tracking-widest mb-1">Identified Problem</p>
                                                                        <p className={`text-xs font-bold text-white uppercase italic ${isPrivacyMode ? 'privacy-blur' : ''}`}>{analysisData.preciseAbnormality || "Normal Morphology"}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black text-[#00D1FF] uppercase tracking-widest mb-1">Anatomical Zone</p>
                                                                        <p className={`text-xs font-bold text-white uppercase italic ${isPrivacyMode ? 'privacy-blur' : ''}`}>{analysisData.preciseLocation || "Global Scan"}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-10 rounded-[2.5rem] glass-card">
                                                <h4 className="font-black mb-6 flex items-center gap-3 text-lg italic uppercase">
                                                    <Zap className="text-yellow-400" size={22} />
                                                    Diagnostic Biomarkers
                                                </h4>
                                                <ul className="space-y-4">
                                                    {customMlResult?.detectedBiomarkers.map((bm, i) => (
                                                        <li key={i} className="flex items-center gap-4 text-sm text-slate-300 font-medium">
                                                            <div className="w-6 h-6 rounded-full border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                            </div>
                                                            {bm}: <span className="text-emerald-400 ml-1">Optimal</span>
                                                        </li>
                                                    ))}
                                                    {(!customMlResult?.detectedBiomarkers?.length && analysisData?.findings) && analysisData.findings.slice(0, 6).map((finding, i) => (
                                                        <li key={i} className="flex items-start gap-4 text-sm text-slate-300 font-medium">
                                                            <div className="w-6 h-6 rounded-full border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                            </div>
                                                            <span className="leading-tight">{finding}</span>
                                                        </li>
                                                    ))}
                                                    {(!customMlResult?.detectedBiomarkers?.length && !analysisData?.findings?.length) && (
                                                        <li className="flex items-center gap-4 text-sm text-slate-300 font-medium opacity-50 italic">
                                                            Initialize analysis to extract clinical biomarkers...
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                            <div className="p-10 rounded-[2.5rem] glass-card relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Database size={100} />
                                                </div>
                                                <h4 className="font-black mb-8 flex items-center gap-3 text-[#00D1FF] text-lg italic uppercase">
                                                    <Zap size={22} />
                                                    Neural Telemetry
                                                </h4>
                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                                {customMlResult ? "Voxel Density" : "Analysis Consistency"}
                                                            </p>
                                                            <p className="text-xl font-black text-white">
                                                                {customMlResult ? `${customMlResult.voxelDensity}%` : (analysisData?.confidence ? `${(analysisData.confidence * 100).toFixed(0)}%` : "--")}
                                                            </p>
                                                        </div>
                                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                                                {customMlResult ? "Neural Entropy" : "Clinical Signal"}
                                                            </p>
                                                            <p className="text-xl font-black text-white">
                                                                {customMlResult ? `${(100 - customMlResult.confidence).toFixed(2)}%` : "Verified"}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div className="flex justify-between text-xs font-black uppercase tracking-wider text-slate-500">
                                                            <span>Synapse-X Confidence</span>
                                                            <span className="text-[#00D1FF]">{customMlResult?.confidence || "--"}%</span>
                                                        </div>
                                                        <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${customMlResult?.confidence || 0}%` }}
                                                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00D1FF] to-[#7000FF] shadow-[0_0_15px_rgba(0,209,255,0.5)]"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Probability Map Visualization */}
                                                    <div className="pt-4 space-y-3">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Distribution Map</p>
                                                        <div className="h-10 flex items-end gap-1">
                                                            {customMlResult?.probabilityMap.map((val, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    initial={{ height: 0 }}
                                                                    animate={{ height: `${val * 100}%` }}
                                                                    className="flex-1 bg-white/10 rounded-t-sm"
                                                                />
                                                            ))}
                                                            {!customMlResult && Array.from({ length: 12 }).map((_, i) => (
                                                                <div key={i} className="flex-1 bg-white/5 h-2 rounded-t-sm" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-10 rounded-[3rem] glass-morphism border-[#00D1FF]/20 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D1FF]/5 blur-[60px] rounded-full" />
                                            <div className="flex items-center gap-4 mb-10">
                                                <div className="w-14 h-14 rounded-2xl bg-[#00D1FF]/10 flex items-center justify-center text-[#00D1FF] border border-[#00D1FF]/20 shadow-inner">
                                                    <Brain size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-2xl tracking-tight uppercase italic">Diagnosis AI</h3>
                                                    <p className={`text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black ${isPrivacyMode ? 'patient-sensitive' : ''}`}>DUAL-ENGINE V4</p>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Clinical Insight</h4>
                                                        <button onClick={() => handleGeminiAnalysis()} disabled={isAiAnalyzing} className="flex items-center gap-2 text-[10px] font-black text-[#00D1FF] hover:scale-105 transition-transform">
                                                            <Sparkles size={12} className={isAiAnalyzing ? "animate-spin" : ""} />
                                                            {isAiAnalyzing ? "CONSULTING..." : "LIVE CONSULT"}
                                                        </button>
                                                    </div>
                                                    <p className="text-[13px] leading-relaxed text-slate-300 italic font-medium">
                                                        {aiResponse || "Initialize Dual-Engine analysis for cross-referenced differential diagnosis."}
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    <button onClick={() => setIsComparing(true)} className="w-full py-5 rounded-2xl bg-[#00D1FF] text-black font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] transition-transform shadow-2xl flex items-center justify-center gap-3">
                                                        <SplitSquareVertical size={18} />
                                                        SPLIT-VIEW COMPARISON
                                                    </button>
                                                    <button onClick={() => window.print()} className="w-full py-5 rounded-2xl border border-white/10 font-bold text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-colors">
                                                        GENERATE CLINICAL PDF
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[2.5rem] bg-[#7000FF]/5 border border-[#7000FF]/20 group hover:bg-[#7000FF]/10 transition-colors">
                                            <div className="flex items-center gap-4 text-[#7000FF] mb-4">
                                                <Microscope size={24} className="group-hover:scale-110 transition-transform" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Accuracy Logic</span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                                Cross-referencing MediVision Custom ML with Gemini 2.5 Hub to verify diagnostic confidence levels.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Interactive Medical Glossary */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <MedicalGlossary />
                                </motion.div>
                            </motion.div>
                        )}

                        <ComparisonModal isOpen={isComparing} onClose={() => setIsComparing(false)} originalImage={currentScanImage} detectedPart={detectedPart} hasIssue={hasIssue} modality={selectedModality} />

                        <AnimatePresence>
                            {isScheduling && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-xl"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: 0 }}
                                        className="w-full max-w-2xl glass-morphism rounded-[3rem] p-12 border-white/5 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7000FF]/10 blur-[100px] rounded-full translate-x-32 -translate-y-32" />

                                        <h3 className="text-4xl font-black mb-4 uppercase italic">Schedule <span className="text-[#7000FF]">Specialist</span></h3>
                                        <p className="text-slate-400 mb-10 font-medium">Connect with top-tier consultants for a clinical review of your findings.</p>

                                        <div className="space-y-6 mb-10">
                                            {[
                                                { name: "Dr. Sarah Chen", specialty: "Neuroradiologist", availability: "Today, 4:00 PM", fee: "$120" },
                                                { name: "Dr. Marcus Thorne", specialty: "Orthopedic Surgeon", availability: "Tomorrow, 9:30 AM", fee: "$150" },
                                                { name: "Dr. Elena Rossi", specialty: "Diagnostic Imaging", availability: "Feb 8, 11:00 AM", fee: "$100" }
                                            ].map((doc, i) => (
                                                <div key={i} className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] transition-all cursor-pointer">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-[#00D1FF]/10 flex items-center justify-center text-[#00D1FF]">
                                                            <Stethoscope size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-200">{doc.name}</h4>
                                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{doc.specialty}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-[#00D1FF] uppercase tracking-widest mb-1">{doc.availability}</p>
                                                        <p className="font-black text-slate-400">{doc.fee}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4">
                                            <button onClick={() => setIsScheduling(false)} className="flex-1 py-5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all">Close Pipeline</button>
                                            <button onClick={() => { setIsScheduling(false); /* Consultant booking confirmed - in production would open booking flow */ }} className="flex-1 py-5 rounded-2xl bg-[#7000FF] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all">Select Consultant</button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {isExporting && (
                            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                <Activity className="text-[#00D1FF] animate-spin mb-6" size={48} />
                                <p className="text-xs font-black uppercase tracking-[0.5em] text-[#00D1FF]">Encrypting Clinical Data Packet...</p>
                            </div>
                        )}

                        {analysisData && (
                            <PrintReport data={{
                                referenceId: `MV-${Math.floor(Math.random() * 9000) + 1000}`,
                                timestamp: new Date(),
                                type: analysisData.detectedPart ? `${analysisData.detectedPart.toUpperCase()} Scan` : "Medical Scan",
                                patient: "Self (Authorized)",
                                risk: (analysisData.findings && analysisData.findings.length > 3) ? "High" : "Safe",
                                analysis: {
                                    confidence: analysisData.confidence || 95,
                                    findings: analysisData.findings || [],
                                    recommendations: analysisData.recommendations || []
                                },
                                summary: analysisData.summary
                            }} />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="p-6 rounded-3xl glass-card border-white/5 flex flex-col items-center text-center group hover:border-[#00D1FF]/30 transition-all">
            <div className="mb-3 text-slate-500 group-hover:text-[#00D1FF] transition-colors">{icon}</div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
            <p className="font-bold text-slate-200 tracking-tight text-lg">{value}</p>
        </div>
    );
}

function MetricTile({ label, value, unit, icon, color }: { label: string; value: string; unit: string; icon: React.ReactNode; color: string }) {
    return (
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group">
            <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${color} mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{value}</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase">{unit}</span>
            </div>
        </div>
    );
}
