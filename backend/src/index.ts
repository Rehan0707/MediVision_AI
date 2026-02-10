import app from './app';
import connectDB from './config/db';
import { connectRabbitMQ } from './config/rabbitmq';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5001;

// Connect to Database and RabbitMQ
const startServer = async () => {
    try {
        await connectDB();
        await connectRabbitMQ();

        app.listen(PORT, () => {
            console.log(`🚀 MediVision AI Backend running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Server Startup failed:', error);
    }
};

startServer();
