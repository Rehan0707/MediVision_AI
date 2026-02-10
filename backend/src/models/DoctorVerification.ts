import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorVerification extends Document {
    doctor: mongoose.Types.ObjectId;
    admin: mongoose.Types.ObjectId;
    status: 'Pending' | 'Approved' | 'Rejected';
    comments?: string;
    documentsSubmitted: string[];
    verificationDate?: Date;
}

const DoctorVerificationSchema: Schema = new Schema({
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    admin: { type: Schema.Types.ObjectId, ref: 'Admin' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    comments: { type: String },
    documentsSubmitted: [{ type: String }],
    verificationDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<IDoctorVerification>('DoctorVerification', DoctorVerificationSchema);
