
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medivision');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedUsers = async () => {
    await connectDB();

    // Define Schemas appropriately to avoid "model already defined" or missing schema errors
    const UserSchema = new mongoose.Schema({
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        role: { type: String, enum: ['Patient', 'Doctor', 'Admin'], default: 'Patient' },
        password: { type: String },
        isApproved: { type: Boolean, default: false },
        status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
        phoneNumber: String,
        avatar: String,
        patientProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
        doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
        adminProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    }, { timestamps: true });

    // Hashing middleware if I were using the model directly, but here I'll hash manually
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Patient Schema
    const PatientSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        medicalHistory: [String],
    });
    const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

    // Doctor Schema
    const DoctorSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        specialization: String,
        licenseNumber: String,
        clinicName: String,
        workingHours: String,
        verified: { type: Boolean, default: false }
    });
    const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);

    // Admin Schema
    const AdminSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        permissions: [String]
    });
    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

    // Clear existing users? Maybe better to update them or just add if missing.
    // Let's remove existing test users to be clean.
    await User.deleteMany({ email: { $in: ['patient@medivision.ai', 'doctor@medivision.ai', 'admin@medivision.ai'] } });

    // Create Default Users with password "password123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 1. Patient
    const patientUser = new User({
        name: 'John Patient',
        email: 'patient@medivision.ai',
        password: hashedPassword,
        role: 'Patient',
        isApproved: true,
        status: 'Approved'
    });
    const savedPatientUser = await patientUser.save();
    await Patient.create({ user: savedPatientUser._id, medicalHistory: ['None'] });
    savedPatientUser.patientProfile = (await Patient.findOne({ user: savedPatientUser._id }))._id;
    await savedPatientUser.save();
    console.log('Patient seeded: patient@medivision.ai / password123');

    // 2. Doctor
    const doctorUser = new User({
        name: 'Dr. Sarah Smith',
        email: 'doctor@medivision.ai',
        password: hashedPassword,
        role: 'Doctor',
        isApproved: true, // Auto approve for testing
        status: 'Approved'
    });
    const savedDoctorUser = await doctorUser.save();
    await Doctor.create({
        user: savedDoctorUser._id,
        specialization: 'Neurology',
        licenseNumber: 'DOC-12345',
        clinicName: 'City Hospital',
        workingHours: '9AM-5PM',
        verified: true
    });
    savedDoctorUser.doctorProfile = (await Doctor.findOne({ user: savedDoctorUser._id }))._id;
    await savedDoctorUser.save();
    console.log('Doctor seeded: doctor@medivision.ai / password123');

    // 3. Admin
    const adminUser = new User({
        name: 'System Admin',
        email: 'admin@medivision.ai',
        password: hashedPassword,
        role: 'Admin',
        isApproved: true,
        status: 'Approved'
    });
    const savedAdminUser = await adminUser.save();
    await Admin.create({ user: savedAdminUser._id, permissions: ['all'] });
    savedAdminUser.adminProfile = (await Admin.findOne({ user: savedAdminUser._id }))._id;
    await savedAdminUser.save();
    console.log('Admin seeded: admin@medivision.ai / password123');

    process.exit();
};

seedUsers();
