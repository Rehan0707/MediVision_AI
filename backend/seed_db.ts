import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Patient from './src/models/Patient';
import Doctor from './src/models/Doctor';
import Scan from './src/models/Scan';
import Report from './src/models/Report';
import Discussion from './src/models/Discussion';
import Appointment from './src/models/Appointment';
import Message from './src/models/Message';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medivision');
        console.log('✅ Connected to MongoDB for seeding');

        // Clear existing data (optional, but good for a fresh start)
        await Promise.all([
            User.deleteMany({}),
            Patient.deleteMany({}),
            Doctor.deleteMany({}),
            Scan.deleteMany({}),
            Report.deleteMany({}),
            Discussion.deleteMany({}),
            Appointment.deleteMany({}),
            Message.deleteMany({})
        ]);

        console.log('🧹 Database cleared');

        // 1. Create a Test Patient User
        const patientUser = await User.create({
            name: 'John Patient',
            email: 'patient@example.com',
            role: 'Patient',
            password: 'password123',
            isApproved: true,
            status: 'Approved'
        });

        const patientProfile = await Patient.create({
            user: patientUser._id,
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Male',
            bloodGroup: 'O+',
            weight: 75,
            height: 180
        });

        patientUser.patientProfile = patientProfile._id;
        await patientUser.save();

        // 2. Create a Test Doctor User
        const doctorUser = await User.create({
            name: 'Dr. Smith',
            email: 'doctor@example.com',
            role: 'Doctor',
            password: 'password123',
            isApproved: true,
            status: 'Approved'
        });

        const doctorProfile = await Doctor.create({
            user: doctorUser._id,
            specialization: 'Radiology',
            licenseNumber: 'LIC123456',
            clinicName: 'Neural Health Center',
            workingHours: '09:00 - 17:00',
            experience: 10,
            verified: true
        });

        doctorUser.doctorProfile = doctorProfile._id;
        await doctorUser.save();

        // 3. Create a Test Scan and Report
        const scan = await Scan.create({
            referenceId: 'SCAN-' + Date.now(),
            type: 'X-RAY 3D',
            patientId: patientUser._id,
            patientName: patientUser.name,
            analysis: {
                confidence: 0.95,
                findings: ['Normal heart size', 'Clear lung fields'],
                recommendations: ['Routine follow-up'],
                summary: 'The scan shows no significant abnormalities.',
                aiModel: 'MediVision-Neural-v4'
            },
            imageUrl: 'https://example.com/scans/chest-xray.jpg',
            bodyPart: 'Chest',
            status: 'Active',
            risk: 'Safe'
        });

        const report = await Report.create({
            patient: patientUser._id,
            doctor: doctorProfile._id,
            scanUrl: 'https://example.com/scans/chest-xray.jpg',
            scanType: 'X-Ray',
            bodyPart: 'Chest',
            status: 'Analyzed',
            analysis: {
                findings: ['No fractures', 'Clear airways'],
                summary: 'Healthy chest X-ray'
            }
        });

        // 4. Create a Discussion
        await Discussion.create({
            title: 'Advancements in Neural Reconstruction',
            author: doctorUser._id,
            content: 'Discussing the latest techniques in 3D medical imaging and neural reconstruction.',
            category: 'Trauma Reconstruction',
            commentsCount: 5,
            activeDoctors: 2
        });

        // 5. Create an Appointment
        await Appointment.create({
            patient: patientUser._id,
            doctor: doctorUser._id,
            date: new Date(Date.now() + 86400000), // Tomorrow
            status: 'Confirmed',
            reason: 'Annual Checkup',
            type: 'Consultation'
        });

        // 6. Create a Message
        await Message.create({
            sender: patientUser._id,
            receiver: doctorUser._id,
            content: 'Hello doctor, I have shared my latest scan.',
            type: 'text'
        });

        console.log('🌱 Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
