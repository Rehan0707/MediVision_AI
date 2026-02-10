import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const register = async (req: Request, res: Response) => {
    const { name, email, password, role, specialization, licenseNumber, clinicName, workingHours } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            isApproved: role === 'Doctor' ? false : true,
            status: role === 'Doctor' ? 'Pending' : 'Approved',
            specialization,
            licenseNumber,
            clinicName,
            workingHours
        });

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
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                isApproved: user.isApproved,
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
        const doctors = await User.find({ role: 'Doctor', status: 'Pending' });
        res.json(doctors);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approveDoctor = async (req: Request, res: Response) => {
    const { id, status } = req.body; // status: 'Approved' or 'Rejected'

    try {
        const user = await User.findById(id);

        if (user && user.role === 'Doctor') {
            user.status = status;
            user.isApproved = status === 'Approved';
            await user.save();
            res.json({ message: `Doctor ${status.toLowerCase()} successfully` });
        } else {
            res.status(404).json({ message: 'Doctor not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
