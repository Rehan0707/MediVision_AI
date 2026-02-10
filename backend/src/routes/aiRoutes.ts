import express from 'express';
import { analyzeImage, explainReport, getHealthNews, analyzeECGAsync, getJobStatus } from '../controllers/aiController';

const router = express.Router();

router.post('/analyze-image', analyzeImage);
router.post('/explain-report', explainReport);
router.post('/news', getHealthNews);
router.post('/analyze-ecg-async', analyzeECGAsync);
router.get('/job-status/:jobId', getJobStatus);

export default router;
