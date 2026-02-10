import mongoose, { Schema, Document } from 'mongoose';

export interface IScan extends Document {
    referenceId: string;
    type: string;
    patient: string; // "Self" or ObjectId
    analysis: {
        confidence: number;
        findings: string[];
        recommendations: string[];
        summary?: string;
    };
    imageUrl?: string;
    bodyPart?: string;
    status: string;
    risk: string;
    createdAt: Date;
    updatedAt: Date;
}

const ScanSchema: Schema = new Schema({
    referenceId: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // e.g., "X-RAY 3D", "MRI 3D"
    patient: { type: String, required: true },
    analysis: {
        confidence: { type: Number, default: 0 },
        findings: { type: [String], default: [] },
        recommendations: { type: [String], default: [] },
        summary: { type: String }
    },
    imageUrl: { type: String },
    bodyPart: { type: String },
    status: { type: String, default: 'Active' },
    risk: { type: String, default: 'Safe' },
}, { timestamps: true });

export default mongoose.model<IScan>('Scan', ScanSchema);
