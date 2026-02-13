import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import scanRoutes from './routes/scanRoutes';
import aiRoutes from './routes/aiRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

import reportRoutes from './routes/reportRoutes';
import communityRoutes from './routes/communityRoutes';
import adminRoutes from './routes/adminRoutes';
import healthNewsRoutes from './routes/healthNewsRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads

// Routes
app.use('/api/scans', scanRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health-news', healthNewsRoutes);

// Root Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to MediVision AI Backend API' });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'MediVision AI Backend', timestamp: new Date() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

export default app;
