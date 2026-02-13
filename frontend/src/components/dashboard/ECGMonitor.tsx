"use client";

import React, { useEffect, useRef } from 'react';

interface ECGMonitorProps {
    heartRate: number;
    color?: string;
}

export const ECGMonitor: React.FC<ECGMonitorProps> = ({ heartRate, color = "#00D1FF" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const posRef = useRef(0);
    const dataRef = useRef<number[]>([]);

    const generateECGPoint = (x: number) => {
        if (heartRate <= 0) return 0;

        // beatInterval in samples. Speed is approx 60fps.
        // heartRate: 60bpm = 1 beat/sec = 60 samples. 120bpm = 2 beats/sec = 30 samples.
        const bpm = heartRate;
        const samplesPerBeat = (60 * 60) / bpm;
        const phase = (x % samplesPerBeat) / samplesPerBeat;

        // Baseline noise
        let y = Math.random() * 2 - 1;

        // P Wave
        if (phase > 0.1 && phase < 0.2) {
            y += Math.sin((phase - 0.1) * Math.PI / 0.1) * 5;
        }
        // QRS Complex
        if (phase > 0.25 && phase < 0.27) {
            y -= (phase - 0.25) * 1000; // Q
        } else if (phase >= 0.27 && phase < 0.3) {
            y += 50 - Math.abs(phase - 0.285) * 2000; // R
        } else if (phase >= 0.3 && phase < 0.32) {
            y -= (0.32 - phase) * 1000; // S
        }
        // T Wave
        if (phase > 0.5 && phase < 0.7) {
            y += Math.sin((phase - 0.5) * Math.PI / 0.2) * 10;
        }

        return y;
    };

    const animate = (time: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 20) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 20) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
        }

        // Update data
        posRef.current += 1;
        const newPoint = generateECGPoint(posRef.current);
        dataRef.current.push(newPoint);
        if (dataRef.current.length > canvas.width) {
            dataRef.current.shift();
        }

        // Draw Waveform
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        const centerY = canvas.height / 2;
        dataRef.current.forEach((point, i) => {
            const x = i;
            const y = centerY - point;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.stroke();
        ctx.shadowBlur = 0;

        // Moving scanner head
        ctx.fillStyle = color;
        const lastIdx = dataRef.current.length - 1;
        ctx.beginPath();
        ctx.arc(lastIdx, centerY - dataRef.current[lastIdx], 4, 0, Math.PI * 2);
        ctx.fill();

        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [heartRate]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={200}
            className="w-full h-full opacity-80"
        />
    );
};
