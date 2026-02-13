import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    patient: mongoose.Types.ObjectId;
    doctor?: mongoose.Types.ObjectId;
    scanUrl: string;
    scanType: string;
    bodyPart: string;
    status: 'Pending' | 'Analyzed' | 'Reviewed';
    analysis?: {
        findings: string[];
        summary: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
    patient: { type: Schema.Types.Mixed, required: true }, // ObjectId or "Self" for demo
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    scanUrl: { type: String, required: true },
    scanType: { type: String, required: true }, // Removed strict enum to allow Lab Reports
    bodyPart: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Analyzed', 'Reviewed'], default: 'Pending' },
    analysis: { type: Object }, // Stores AI explanation/findings
}, { timestamps: true });

export default mongoose.model<IReport>('Report', ReportSchema);
