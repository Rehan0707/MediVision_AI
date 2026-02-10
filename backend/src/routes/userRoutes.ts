import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Middleware to protect routes
const protect = async (req: any, res: any, next: any) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
