import { Request, Response } from 'express';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user.id)
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
        const user = await User.findById((req as any).user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update core user data
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.avatar = req.body.avatar || user.avatar;

        // Update role-specific profile data
        if (user.role === 'Patient' && user.patientProfile) {
            const patient = await Patient.findById(user.patientProfile);
            if (patient) {
                patient.dateOfBirth = req.body.dateOfBirth || patient.dateOfBirth;
                patient.gender = req.body.gender || patient.gender;
                patient.bloodGroup = req.body.bloodGroup || patient.bloodGroup;
                patient.weight = req.body.weight || patient.weight;
                patient.height = req.body.height || patient.height;
                patient.emergencyContact = req.body.emergencyContact || patient.emergencyContact;
                await patient.save();
            }
        } else if (user.role === 'Doctor' && user.doctorProfile) {
            const doctor = await Doctor.findById(user.doctorProfile);
            if (doctor) {
                doctor.specialization = req.body.specialization || doctor.specialization;
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
        res.status(500).json({ message: error.message });
    }
};
