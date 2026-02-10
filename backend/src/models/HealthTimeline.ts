import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthTimeline extends Document {
    patient: mongoose.Types.ObjectId;
    eventDate: Date;
    eventType: 'Scan' | 'Diagnosis' | 'Surgery' | 'Rehab_Started' | 'Milestone';
    title: string;
    description: string;
    relatedReport?: mongoose.Types.ObjectId;
}

const HealthTimelineSchema: Schema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    eventDate: { type: Date, default: Date.now },
    eventType: { type: String, enum: ['Scan', 'Diagnosis', 'Surgery', 'Rehab_Started', 'Milestone'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    relatedReport: { type: Schema.Types.ObjectId, ref: 'Report' }
}, { timestamps: true });

export default mongoose.model<IHealthTimeline>('HealthTimeline', HealthTimelineSchema);
