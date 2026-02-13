import { Request, Response } from 'express';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (userId === 'super-admin-id') {
            return res.json({
                _id: 'super-admin-id',
                name: 'Super Admin',
                email: process.env.SUPER_ADMIN_EMAIL || 'admin@medivision.ai',
                role: 'Admin',
                status: 'Approved'
            });
        }

        const user = await User.findById(userId)
            .populate('patientProfile')
            .populate('doctorProfile')
            .populate('adminProfile');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        if (userId === 'super-admin-id') {
            return res.json({ message: 'Profile updated (super-admin)', user: { _id: 'super-admin-id', name: 'Super Admin' } });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update core user data
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.avatar = req.body.avatar || user.avatar;

        // Update role-specific profile data
        // Update role-specific profile data
        if (user.role === 'Patient' && user.patientProfile) {
            const patient = await Patient.findById(user.patientProfile);
            if (patient) {
                patient.dateOfBirth = req.body.dateOfBirth || patient.dateOfBirth;
                patient.gender = req.body.gender || patient.gender;
                patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;

                // Handle numeric fields safely
                if (req.body.weight) patient.weight = Number(req.body.weight);
                if (req.body.height) patient.height = Number(req.body.height);

                patient.emergencyContact = req.body.emergencyContact || patient.emergencyContact;
                patient.medicalHistory = req.body.medicalHistory || patient.medicalHistory;
                patient.allergies = req.body.allergies || patient.allergies;

                await patient.save();
            }
        } else if (user.role === 'Doctor' && user.doctorProfile) {
            const doctor = await Doctor.findById(user.doctorProfile);
            if (doctor) {
                doctor.specialization = req.body.specialization || doctor.specialization;
                doctor.licenseNumber = req.body.licenseNumber || doctor.licenseNumber;
                doctor.clinicName = req.body.clinicName || doctor.clinicName;
                doctor.workingHours = req.body.workingHours || doctor.workingHours;
                doctor.experience = req.body.experience || doctor.experience;
                doctor.education = req.body.education || doctor.education;
                await doctor.save();
            }
        }

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error: any) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: error.message });
    }
};
