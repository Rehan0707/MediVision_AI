"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "@/context/SettingsContext";
import { apiUrl, authHeaders } from "@/lib/api";
import { PatientDashboard } from "@/components/dashboard/PatientDashboard";
import { motion } from "framer-motion";

export default function PatientPortalPage() {
    const { t } = useSettings();
    const { data: session } = useSession();
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-7xl mx-auto space-y-8"
        >
            <PatientDashboard t={t} profile={profile} latestScan={latestScan} />
        </motion.div>
    );
}
