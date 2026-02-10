import { Request, Response } from 'express';
import * as aiService from '../services/aiService';
import { getChannel } from '../config/rabbitmq';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// @desc    Analyze medical image
// @route   POST /api/ai/analyze-image
// @access  Public
export const analyzeImage = async (req: Request, res: Response) => {
    try {
        const { imageBase64, mimeType, modality, prompt } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const buffer = Buffer.from(imageBase64, 'base64');
        const result = await aiService.analyzeMedicalImage(buffer, mimeType || 'image/jpeg', modality, prompt);

        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Explain lab report text
// @route   POST /api/ai/explain-report
// @access  Public
export const explainReport = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ message: 'No text provided' });
        }

        const explanation = await aiService.explainLabReport(text);
        res.json({ explanation });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const getHealthNews = async (req: Request, res: Response) => {
    // ...
};

// @desc    Analyze ECG using RabbitMQ Worker
// @route   POST /api/ai/analyze-ecg-async
// @access  Public
export const analyzeECGAsync = async (req: Request, res: Response) => {
    try {
        const { ecgData, samplingRate } = req.body;
        const jobId = uuidv4();
        const channel = getChannel();

        if (!channel) {
            return res.status(503).json({ message: 'Message queue unavailable' });
        }

        const message = {
            jobId,
            timestamp: new Date(),
            fileType: 'csv',
            metadata: { samplingRate }
        };

        channel.sendToQueue('ecg_analysis_queue', Buffer.from(JSON.stringify(message)), { persistent: true });

        res.status(202).json({
            message: 'ECG Analysis job queued',
            jobId,
            status: 'Processing',
            checkStatusUrl: `/api/ai/job-status/${jobId}`
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check ECG Analysis job status
// @route   GET /api/ai/job-status/:jobId
// @access  Public
export const getJobStatus = async (req: Request, res: Response) => {
    try {
        const { jobId } = req.params;
        const resultPath = path.join(__dirname, '../../data/jobs', `${jobId}.json`);

        if (fs.existsSync(resultPath)) {
            const data = fs.readFileSync(resultPath, 'utf8');
            return res.json(JSON.parse(data));
        }

        res.json({ jobId, status: 'Processing' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
