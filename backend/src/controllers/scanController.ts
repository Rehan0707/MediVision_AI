import { Request, Response } from 'express';
import Scan from '../models/Scan';
import { v4 as uuidv4 } from 'uuid';

// @desc    Get all scans
// @route   GET /api/scans
// @access  Public (Should be private in production)
export const getScans = async (req: Request, res: Response) => {
    try {
        const scans = await Scan.find().sort({ createdAt: -1 });
        res.json(scans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new scan entry
// @route   POST /api/scans
// @access  Public
export const createScan = async (req: Request, res: Response) => {
    try {
        const { type, patient, analysis, imageUrl, bodyPart } = req.body;

        const newScan = new Scan({
            referenceId: `SCAN-${uuidv4().substring(0, 8).toUpperCase()}`,
            type,
            patient,
            analysis,
            imageUrl,
            bodyPart,
            status: 'Active',
            risk: 'Safe',
        });

        const savedScan = await newScan.save();
        res.status(201).json(savedScan);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Save scan (alias for create with custom referenceId)
// @route   POST /api/scans/save
// @access  Public
export const saveScan = async (req: Request, res: Response) => {
    try {
        const { referenceId, type, patient, analysis, imageUrl, risk, bodyPart } = req.body;

        const newScan = new Scan({
            referenceId: referenceId || `SCAN-${uuidv4().substring(0, 8).toUpperCase()}`,
            type: type || 'Medical Scan',
            patient: patient || 'Self',
            analysis: analysis || { confidence: 0, findings: [], recommendations: [] },
            imageUrl,
            bodyPart,
            status: 'Active',
            risk: risk || 'Safe',
        });

        const savedScan = await newScan.save();
        res.status(201).json(savedScan);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get scan by ID
// @route   GET /api/scans/:id
// @access  Public
export const getScanById = async (req: Request, res: Response) => {
    try {
        const scan = await Scan.findById(req.params.id);
        if (scan) {
            res.json(scan);
        } else {
            res.status(404).json({ message: 'Scan not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
