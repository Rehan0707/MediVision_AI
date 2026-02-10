import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctor extends Document {
    user: mongoose.Types.ObjectId;
    specialization: string;
    licenseNumber: string;
    clinicName: string;
    workingHours: string;
    experience: number;
    education?: string;
    verified: boolean;
    verificationProof?: string;
}

const DoctorSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    clinicName: { type: String, required: true },
    workingHours: { type: String, required: true },
    experience: { type: Number, default: 0 },
    education: { type: String },
    verified: { type: Boolean, default: false },
    verificationProof: { type: String },
}, { timestamps: true });

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);
