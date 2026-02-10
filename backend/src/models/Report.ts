import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    patient: mongoose.Types.ObjectId;
    doctor?: mongoose.Types.ObjectId;
    scanUrl: string;
    scanType: 'MRI' | 'CT' | 'X-Ray' | 'Ultrasound';
    bodyPart: string;
    status: 'Pending' | 'Analyzed' | 'Reviewed';
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    scanUrl: { type: String, required: true },
    scanType: { type: String, enum: ['MRI', 'CT', 'X-Ray', 'Ultrasound'], required: true },
    bodyPart: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Analyzed', 'Reviewed'], default: 'Pending' },
}, { timestamps: true });

export default mongoose.model<IReport>('Report', ReportSchema);
