import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medivision');
        console.log('Connected to MongoDB for cleanup...');

        // Remove demo/test users except for potentially legitimate ones if needed
        // For this task, we assume all current data is demo/mock as requested
        const userResult = await mongoose.connection.collection('users').deleteMany({
            $or: [
                { email: /demo/i },
                { email: /test/i },
                { name: /demo/i },
                { name: /test/i },
                { name: "John Doe" }
            ]
        });
        console.log(`Removed ${userResult.deletedCount} demo users.`);

        // Remove all scans/reports that might be legacy demo data
        const scanResult = await mongoose.connection.collection('scans').deleteMany({});
        console.log(`Cleared ${scanResult.deletedCount} legacy scan records.`);

        const reportResult = await mongoose.connection.collection('reports').deleteMany({});
        console.log(`Cleared ${reportResult.deletedCount} legacy lab reports.`);

        // Remove all patient profiles linked to demo/test users (or all for a fresh start)
        const patientResult = await mongoose.connection.collection('patients').deleteMany({});
        console.log(`Cleared ${patientResult.deletedCount} patient profiles.`);

        console.log('Cleanup complete. System is now data-pure.');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanup();
