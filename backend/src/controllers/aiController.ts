import { Request, Response } from 'express';
import * as aiService from '../services/aiService';
import { getChannel } from '../config/rabbitmq';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// @desc    Chat with AI
// @route   POST /api/ai/chat
// @access  Public
export const chat = async (req: Request, res: Response) => {
    try {
        const { message, context } = req.body;
        if (!message) return res.status(400).json({ message: 'Message required' });
        const result = await aiService.chatWithAI(message, context);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyze medical image
// @route   POST /api/ai/analyze
// @access  Public
export const analyzeImage = async (req: Request, res: Response) => {
    try {
        const { image, imageBase64, mimeType, modality, prompt } = req.body;
        const imageInput = image || imageBase64;

        if (!imageInput) {
            return res.status(400).json({ message: 'No image provided' });
        }

        let buffer: Buffer;
        let resolvedMime = mimeType || 'image/jpeg';

        // Handle data URL (data:image/png;base64,...)
        if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
            const matches = imageInput.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
                resolvedMime = matches[1];
                buffer = Buffer.from(matches[2], 'base64');
            } else {
                return res.status(400).json({ message: 'Invalid data URL format' });
            }
        }
        // Handle URL path - fetch from frontend
        else if (typeof imageInput === 'string' && (imageInput.startsWith('/') || imageInput.startsWith('http'))) {
            try {
                const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                const url = imageInput.startsWith('http') ? imageInput : `${baseUrl}${imageInput}`;
                const resp = await fetch(url);
                if (!resp.ok) throw new Error('Fetch failed');
                const arrayBuffer = await resp.arrayBuffer();
                buffer = Buffer.from(arrayBuffer);
                resolvedMime = resp.headers.get('content-type') || 'image/png';
            } catch (fetchErr: any) {
                return res.status(400).json({
                    message: 'Could not fetch image from URL. Please upload the image file directly.',
                    hint: 'Use a file upload to get base64 data.'
                });
            }
        }
        // Raw base64 string
        else if (typeof imageInput === 'string') {
            buffer = Buffer.from(imageInput, 'base64');
        } else {
            return res.status(400).json({ message: 'Invalid image format' });
        }

        const result = await aiService.analyzeMedicalImage(buffer, resolvedMime, modality, prompt);
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
    try {
        const { location } = req.body;
        const news = await aiService.generateHealthNews(location || 'Global');
        res.json(news);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const synthesizeNote = async (req: Request, res: Response) => {
    try {
        const { scanData, role } = req.body;
        const note = await aiService.synthesizeClinicalNote(scanData || {}, role || 'patient');
        res.json({ text: note });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Analyze ECG using RabbitMQ Worker
// @route   POST /api/ai/analyze-ecg-async
// @access  Public
export const analyzeECGAsync = async (req: Request, res: Response) => {
    try {
        const { ecgData, samplingRate } = req.body;
        const jobId = uuidv4();
        const channel = getChannel();


        // Direct AI Analysis (Bypassing RabbitMQ for immediate result as requested)
        // Check if we want to use the worker or direct analysis. 
        // For "100% results" and reliability without starting workers, we defaults to direct.

        try {
            // If the user wants async/worker flow, we can keep it, but fall back to direct if no channel.
            // Given the request "nothing works properly", simplification is better.

            let finalEcgData = ecgData;
            if (ecgData === 'SAMPLE_KAGGLE_ID') {
                // Inject sample normal sinus rhythm data for demonstration
                finalEcgData = "0.0,0.05,0.1,0.15,0.2,0.8,-0.2,0.0,0.05,0.1,0.15,0.2,0.8,-0.2,0.0,0.05,0.1,0.15,0.2,0.8,-0.2,0.0,0.05,0.1,0.15,0.2,0.8,-0.2";
            }

            const result = await aiService.analyzeECG(finalEcgData, samplingRate || 500);

            // Save result to job file to maintain compatibility with polling frontend
            const jobsDir = path.join(__dirname, '../../data/jobs');
            if (!fs.existsSync(jobsDir)) fs.mkdirSync(jobsDir, { recursive: true });

            fs.writeFileSync(path.join(jobsDir, `${jobId}.json`), JSON.stringify({
                jobId,
                status: 'Completed',
                result,
                completedAt: new Date()
            }));

            res.json({
                message: 'ECG Analysis Completed',
                jobId,
                status: 'Completed',
                result // Return result immediately too
            });

        } catch (aiError: any) {
            console.error("Direct AI Analysis failed, falling back to queue if available or error", aiError);
            if (channel) {
                const message = {
                    jobId,
                    timestamp: new Date(),
                    fileType: 'csv',
                    metadata: { samplingRate }
                };
                channel.sendToQueue('ecg_analysis_queue', Buffer.from(JSON.stringify(message)), { persistent: true });
                res.status(202).json({
                    message: 'ECG Analysis job queued (AI temporarily unavailable)',
                    jobId,
                    status: 'Processing',
                    checkStatusUrl: `/api/ai/job-status/${jobId}`
                });
            } else {
                throw aiError;
            }
        }

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
