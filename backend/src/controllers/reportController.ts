import { Request, Response } from 'express';
import Report from '../models/Report';
import * as aiService from '../services/aiService';

// @desc    Get all reports
// @route   GET /api/reports
export const getReports = async (req: Request, res: Response) => {
    try {
        // intended primarily for "Self" patient demo
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new report
// @route   POST /api/reports
export const createReport = async (req: Request, res: Response) => {
    try {
        const { scanType, bodyPart, scanUrl, status, patient } = req.body;

        const newReport = new Report({
            patient,
            scanType,
            bodyPart,
            scanUrl,
            status: status || 'Pending'
        });

        const savedReport = await newReport.save();
        res.status(201).json(savedReport);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Analyze report text
// @route   POST /api/reports/analyze
export const analyzeReportText = async (req: Request, res: Response) => {
    try {
        const { text, reportId } = req.body;

        if (!text) {
            return res.status(400).json({ message: "No text provided for analysis" });
        }

        const explanation = await aiService.explainLabReport(text);

        // If we have a reportId, update the status AND save the analysis
        if (reportId) {
            await Report.findByIdAndUpdate(reportId, {
                status: 'Analyzed',
                analysis: { summary: explanation }
            });
        }

        res.json({ explanation });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
