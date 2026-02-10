import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
    user: mongoose.Types.ObjectId;
    dateOfBirth?: Date;
    gender?: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    weight?: number;
    height?: number;
    emergencyContact?: string;
    medicalHistory?: string[];
    allergies?: string[];
}

const PatientSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodGroup: { type: String },
    weight: { type: Number },
    height: { type: Number },
    emergencyContact: { type: String },
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
}, { timestamps: true });

export default mongoose.model<IPatient>('Patient', PatientSchema);
