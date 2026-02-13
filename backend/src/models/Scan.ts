import mongoose, { Schema, Document } from 'mongoose';

export interface IScan extends Document {
    referenceId: string;
    type: string;
    patientId: mongoose.Types.ObjectId;
    patientName: string;
    analysis: {
        confidence: number;
        findings: string[];
        recommendations: string[];
        summary?: string;
        aiModel: string;
    };
    imageUrl: string;
    bodyPart: string;
    status: 'Pending' | 'Processing' | 'Active' | 'Archived';
    risk: 'Safe' | 'Warning' | 'Critical';
    createdAt: Date;
    updatedAt: Date;
}

const ScanSchema: Schema = new Schema({
    referenceId: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, index: true }, // e.g., "X-RAY 3D", "MRI 3D"
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientName: { type: String, required: true }, // Denormalized for fast display
    analysis: {
        confidence: { type: Number, default: 0 },
        findings: { type: [String], default: [] },
        recommendations: { type: [String], default: [] },
        summary: { type: String },
        aiModel: { type: String, default: 'MediVision-Neural-v4' }
    },
    imageUrl: { type: String, required: true },
    bodyPart: { type: String, required: true, index: true },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Active', 'Archived'],
        default: 'Active',
        index: true
    },
    risk: {
        type: String,
        enum: ['Safe', 'Warning', 'Critical'],
        default: 'Safe',
        index: true
    },
}, { timestamps: true });

// Compound indexes for common dashboard filters
ScanSchema.index({ patientId: 1, createdAt: -1 });
ScanSchema.index({ risk: 1, status: 1 });
ScanSchema.index({ status: 1, type: 1 });

export default mongoose.model<IScan>('Scan', ScanSchema);
