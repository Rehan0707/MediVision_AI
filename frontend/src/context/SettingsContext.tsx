"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type Language = "en" | "hi" | "mr" | "ta";
type UserRole = "doctor" | "patient" | "admin";

const translations = {
    en: {
        dashboard: "Dashboard",
        history: "History",
        labReports: "Lab Reports",
        copilot: "Co-Pilot",
        rehab: "Rehab Center",
        visualizer: "3D Visualizer",
        ruralMode: "Rural Mode",
        privacyMode: "Privacy Mode",
        liveConsult: "Live Consult",
        diagnosing: "Consulting AI...",
        analysisComplete: "Analysis Complete",
        uploadScan: "Upload Scan",
        recoveryRoadmap: "Recovery Roadmap",
        signals: "Signal Intel",
        settings: "Settings",
        trends: "Health Trends",
        predictiveInsights: "Predictive Insights",
        lowBandwidth: "Low Bandwidth Active",
        highContrast: "High Contrast Enabled",
        doctorPortal: "Doctor Portal",
        patientPortal: "Patient Portal",
        adminPortal: "Admin Control",
        userManagement: "Users",
        systemStatus: "System",
        securityAudit: "Audit Log",
        myScans: "My Scans",
        recoveryPath: "Recovery Path",
        myReports: "My Reports",
        expertNetwork: "Expert Network",
    },
    hi: {
        dashboard: "डैशबोर्ड",
        history: "इतिहास",
        labReports: "लैब रिपोर्ट",
        copilot: "को-पायलट",
        rehab: "पुनर्वास केंद्र",
        visualizer: "3D विज़ुअलाइज़र",
        ruralMode: "ग्रामीण मोड",
        privacyMode: "गोपनीयता मोड",
        liveConsult: "लाइव परामर्श",
        diagnosing: "एआई परामर्श कर रहा है...",
        analysisComplete: "विश्लेषण पूर्ण",
        uploadScan: "स्कैन अपलोड करें",
        recoveryRoadmap: "रिकवरी रोडमैप",
        signals: "सिग्नल इंटेलिजेंस",
        settings: "सेटिंग्स",
        trends: "स्वास्थ्य रुझान",
        predictiveInsights: "भविष्य कहनेवाला अंतर्दृष्टि",
        lowBandwidth: "कम बैंडविड्थ सक्रिय",
        highContrast: "उच्च कंट्रास्ट सक्षम",
        doctorPortal: "डॉक्टर पोर्टल",
        patientPortal: "मरीज पोर्टल",
        adminPortal: "एडमिन नियंत्रण",
        userManagement: "उपयोगकर्ता",
        systemStatus: "सिस्टम",
        securityAudit: "सुरक्षा ऑडिट",
        myScans: "मेरे स्कैन",
        recoveryPath: "रिकवरी पथ",
        myReports: "मेरी रिपोर्ट",
        expertNetwork: "विशेषज्ञ नेटवर्क",
    },
    mr: {
        dashboard: "डॅशबोर्ड",
        history: "इतिहास",
        labReports: "लॅब रिपोर्ट",
        copilot: "को-पायलट",
        rehab: "पुनर्वसन केंद्र",
        visualizer: "3D व्हिज्युअलायझर",
        ruralMode: "ग्रामीण मोड",
        privacyMode: "गोपनीयता मोड",
        liveConsult: "थेट सल्ला",
        diagnosing: "एआय सल्ला घेत आहे...",
        analysisComplete: "विश्लेषण पूर्ण झाले",
        uploadScan: "स्कॅन अपलोड करा",
        recoveryRoadmap: "रिकव्हरी रोडमॅप",
        signals: "सिग्नल इंटेलिजन्स",
        settings: "सेटिंग्ज",
        trends: "आरोग्य कल",
        predictiveInsights: "भविष्यवाणी अंतर्दृष्टी",
        lowBandwidth: "कमी बँडविड्थ सक्रिय",
        highContrast: "उच्च कॉन्ट्रास्ट सक्षम",
        doctorPortal: "डॉक्टर पोर्टल",
        patientPortal: "रुग्ण पोर्टल",
        adminPortal: "प्रशासक नियंत्रण",
        userManagement: "वापरकर्ते",
        systemStatus: "सिस्टम",
        securityAudit: "सुरक्षा ऑडिट",
        myScans: "माझे स्कॅन्स",
        recoveryPath: "रिकव्हरी पथ",
        myReports: "माझे अहवाल",
        expertNetwork: "तज्ञ नेटवर्क",
    },
    ta: {
        dashboard: "டாஷ்போர்டு",
        history: "வரலாறு",
        labReports: "ஆய்வக அறிக்கைகள்",
        copilot: "கோ-பைலட்",
        rehab: "மறுவாழ்வு மையம்",
        visualizer: "3D விஸ்வலைசர்",
        ruralMode: "கிராமப்புற பயன்முறை",
        privacyMode: "தனியுரிமை முறை",
        liveConsult: "நேரடி ஆலோசனை",
        diagnosing: "AI ஆலோசனை செய்கிறது...",
        analysisComplete: "பகுப்பாய்வு முடிந்தது",
        uploadScan: "ஸ்கேன் பதிவேற்றவும்",
        recoveryRoadmap: "மீட்பு சாலை வரைபடம்",
        signals: "சிக்னல் இன்டெல்",
        settings: "அமைப்புகள்",
        trends: "சுகாதார போக்குகள்",
        predictiveInsights: "முன்கணிப்பு நுண்ணறிவு",
        lowBandwidth: "குறைந்த அலைவரிசை செயலில் உள்ளது",
        highContrast: "உயர் மாறுபாடு இயக்கப்பட்டது",
        doctorPortal: "மருத்துவர் போர்டல்",
        patientPortal: "நோயாளி போர்டல்",
        adminPortal: "நிர்வாகக் கட்டுப்பாடு",
        userManagement: "பயனர்கள்",
        systemStatus: "அமைப்பு",
        securityAudit: "பாதுகாப்பு தணிக்கை",
        myScans: "எனது ஸ்கேன்கள்",
        recoveryPath: "மீட்பு பாதை",
        myReports: "எனது அறிக்கைகள்",
        expertNetwork: "நிபுணர் நெட்வொர்க்",
    }
};

interface SettingsContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    userRole: UserRole;
    setUserRole: (role: UserRole) => void;
    isRuralMode: boolean;
    setIsRuralMode: (val: boolean) => void;
    isPrivacyMode: boolean;
    setIsPrivacyMode: (val: boolean) => void;
    t: (key: keyof typeof translations.en) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");
    const [userRole, setUserRole] = useState<UserRole>("patient");
    const [isRuralMode, setIsRuralMode] = useState(false);
    const [isPrivacyMode, setIsPrivacyMode] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const t = (key: keyof typeof translations.en) => {
        return translations[language][key] || translations.en[key];
    };

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem("mv_language") as Language;
        const savedRole = localStorage.getItem("mv_userRole") as UserRole;
        const savedRural = localStorage.getItem("mv_isRuralMode") === "true";
        const savedPrivacy = localStorage.getItem("mv_isPrivacyMode") === "true";

        if (savedLanguage) setLanguage(savedLanguage);
        if (savedRole) setUserRole(savedRole);
        if (savedRural) setIsRuralMode(savedRural);
        if (savedPrivacy) setIsPrivacyMode(savedPrivacy);

        setIsInitialized(true);
    }, []);

    // Sync role from session if available
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user) {
            // @ts-ignore
            const sessionRole = (session.user.role || session.user.userRole || "patient").toLowerCase();
            console.log("SettingsContext: Syncing role from session:", sessionRole);
            if (sessionRole !== userRole && (sessionRole === 'doctor' || sessionRole === 'admin' || sessionRole === 'patient')) {
                setUserRole(sessionRole as UserRole);
            }
        }
    }, [session, userRole]);

    // Save settings to localStorage
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem("mv_language", language);
        localStorage.setItem("mv_userRole", userRole);
        localStorage.setItem("mv_isRuralMode", isRuralMode.toString());
        localStorage.setItem("mv_isPrivacyMode", isPrivacyMode.toString());
    }, [language, userRole, isRuralMode, isPrivacyMode, isInitialized]);

    useEffect(() => {
        if (isRuralMode) {
            document.documentElement.classList.add("rural-mode");
        } else {
            document.documentElement.classList.remove("rural-mode");
        }
    }, [isRuralMode]);

    useEffect(() => {
        if (isPrivacyMode) {
            document.documentElement.classList.add("privacy-mode");
        } else {
            document.documentElement.classList.remove("privacy-mode");
        }
    }, [isPrivacyMode]);

    return (
        <SettingsContext.Provider
            value={{
                language,
                setLanguage,
                userRole,
                setUserRole,
                isRuralMode,
                setIsRuralMode,
                isPrivacyMode,
                setIsPrivacyMode,
                t
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
