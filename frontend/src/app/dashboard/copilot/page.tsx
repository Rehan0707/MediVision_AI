"use client";

import { useState, useEffect, useRef } from "react";
import {
    Send,
    Bot,
    User,
    Loader2,
    Sparkles,
    ArrowLeft,
    ShieldCheck,
    FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/context/SettingsContext";
import { apiUrl } from "@/lib/api";

interface Message {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp: Date;
}

export default function CopilotPage() {
    const router = useRouter();
    const { userRole } = useSettings();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'ai',
            content: "Hello! I'm your MediVision AI assistant. I have access to your latest scans and health data. How can I help you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [latestScan, setLatestScan] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch context
    useEffect(() => {
        async function fetchLatest() {
            try {
                const res = await fetch(apiUrl('/api/scans'));
                const data = await res.json();
                if (data && data.length > 0) setLatestScan(data[0]);
            } catch (err) {
                console.error("Failed to fetch context:", err);
            }
        }
        fetchLatest();
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch(apiUrl('/api/ai/chat'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    context: latestScan
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || `Server Error: ${res.status}`);
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: data.reply || "I'm having trouble connecting right now. Please try again.",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (err: any) {
            console.error("Chat error:", err);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: `Error: ${err.message || "I encountered an error. Please try again."}`,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col max-w-5xl mx-auto">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase flex items-center gap-2">
                            AI <span className="text-[#00D1FF]">Chat</span>
                            <Sparkles size={16} className="text-[#00D1FF]" />
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Powered by OpenAI</p>
                    </div>
                </div>

                {latestScan && (
                    <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <FileText size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                            Context: {latestScan.type || "Medical Scan"}
                        </span>
                    </div>
                )}
            </div>

            {/* Chat Container */}
            <div className="flex-1 bg-[#020617] rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col shadow-2xl">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 custom-scrollbar">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'ai' && (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] flex items-center justify-center shrink-0 shadow-lg shadow-[#00D1FF]/20">
                                    <Bot size={20} className="text-white" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-white text-black font-medium rounded-tr-sm'
                                    : 'bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-sm'
                                    }`}
                            >
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                    <User size={20} className="text-white" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D1FF] to-[#7000FF] flex items-center justify-center shrink-0">
                                <Loader2 size={20} className="text-white animate-spin" />
                            </div>
                            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 text-slate-500 text-sm italic flex items-center gap-2">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-black/20 backdrop-blur-md border-t border-white/5">
                    <div className="relative flex items-center gap-4 max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about your scan, symptoms, or recovery plan..."
                            className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-[#00D1FF]/50 focus:bg-white/[0.08] transition-all placeholder:text-slate-500"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="p-4 rounded-xl bg-[#00D1FF] text-black hover:bg-[#33dbff] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#00D1FF]/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium flex items-center justify-center gap-2">
                            <ShieldCheck size={12} /> Private & Secure • Not Medical Advice
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
