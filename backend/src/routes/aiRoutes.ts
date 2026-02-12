import express from 'express';
import { analyzeImage, explainReport, getHealthNews, synthesizeNote, analyzeECGAsync, getJobStatus, chat } from '../controllers/aiController';
import { registerXrayTo3D } from '../controllers/xvrController';

const router = express.Router();

router.post('/analyze', analyzeImage);
router.post('/explain-report', explainReport);
router.post('/news', getHealthNews);
router.post('/synthesize-note', synthesizeNote);
router.post('/analyze-ecg-async', analyzeECGAsync);
router.get('/job-status/:jobId', getJobStatus);
router.post('/xvr-registration', registerXrayTo3D);
router.post('/chat', chat);

export default router;
