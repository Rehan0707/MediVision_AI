import { Request, Response } from 'express';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';
import Admin from '../models/Admin';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response) => {
    const { name, email, password, role, specialization, licenseNumber, clinicName, workingHours, verificationProof } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({
            name,
            email,
            password,
            role,
            isApproved: role === 'Doctor' ? false : true,
            status: role === 'Doctor' ? 'Pending' : 'Approved',
        });

        if (role === 'Patient') {
            const patient = await Patient.create({ user: user._id });
            user.patientProfile = patient._id as any;
        } else if (role === 'Doctor') {
            const doctor = await Doctor.create({
                user: user._id,
                specialization,
                licenseNumber,
                clinicName,
                workingHours,
                verificationProof
            });
            user.doctorProfile = doctor._id as any;
        } else if (role === 'Admin') {
            const admin = await Admin.create({ user: user._id });
            user.adminProfile = admin._id as any;
        }

        await user.save();

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user.id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Super Admin Check
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@medivision.ai';
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'neural_master_2026';

        if (email === superAdminEmail && password === superAdminPassword) {
            return res.json({
                _id: 'super-admin-id',
                name: 'Super Admin',
                email: superAdminEmail,
                role: 'Admin',
                status: 'Approved',
                isApproved: true,
                profile: { permissions: ['full_access'] },
                token: generateToken('super-admin-id'),
            });
        }

        const user = await User.findOne({ email })
            .populate('patientProfile')
            .populate('doctorProfile')
            .populate('adminProfile');

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                isApproved: user.isApproved,
                profile: user.patientProfile || user.doctorProfile || user.adminProfile,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPendingDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await User.find({ role: 'Doctor', status: 'Pending' }).populate('doctorProfile');
        res.json(doctors);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approveDoctor = async (req: Request, res: Response) => {
    const { id, status } = req.body; // status: 'Approved' or 'Rejected'

    try {
        const user = await User.findById(id).populate('doctorProfile');

        if (user && user.role === 'Doctor') {
            user.status = status;
            user.isApproved = status === 'Approved';

            if (user.doctorProfile) {
                const doctorProfile = await Doctor.findById(user.doctorProfile);
                if (doctorProfile) {
                    doctorProfile.verified = status === 'Approved';
                    await doctorProfile.save();
                }
            }

            await user.save();
            res.json({ message: `Doctor ${status.toLowerCase()} successfully` });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
