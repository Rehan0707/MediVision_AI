import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import scanRoutes from './routes/scanRoutes';
import aiRoutes from './routes/aiRoutes';
import authRoutes from './routes/authRoutes';

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
