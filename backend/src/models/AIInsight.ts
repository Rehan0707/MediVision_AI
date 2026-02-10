import mongoose, { Schema, Document } from 'mongoose';

export interface IAIInsight extends Document {
    report: mongoose.Types.ObjectId;
    detectedPart: string;
    confidence: number;
    findings: {
        id: string;
        label: string;
        description: string;
        severity: 'low' | 'medium' | 'high';
    }[];
    summary: string;
    neuralMarkers?: any[];
}

const AIInsightSchema: Schema = new Schema({
    report: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    detectedPart: { type: String, required: true },
    confidence: { type: Number, required: true },
    findings: [{
        id: { type: String },
        label: { type: String },
        description: { type: String },
        severity: { type: String, enum: ['low', 'medium', 'high'] }
    }],
    summary: { type: String },
    neuralMarkers: { type: Array }
}, { timestamps: true });

export default mongoose.model<IAIInsight>('AIInsight', AIInsightSchema);
