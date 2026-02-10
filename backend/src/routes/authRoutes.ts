import express from 'express';
import { register, login, getPendingDoctors, approveDoctor } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/pending-doctors', getPendingDoctors);
router.post('/approve-doctor', approveDoctor);

export default router;
