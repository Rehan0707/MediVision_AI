import express from 'express';
import { getReports, createReport, analyzeReportText } from '../controllers/reportController';

const router = express.Router();

router.route('/')
    .get(getReports)
    .post(createReport);

router.post('/analyze', analyzeReportText);

export default router;
