import mongoose, { Schema, Document } from 'mongoose';

export interface IRecoveryPlan extends Document {
    patient: mongoose.Types.ObjectId;
    doctor: mongoose.Types.ObjectId;
    report: mongoose.Types.ObjectId;
    title: string;
    goals: string[];
    exercises: {
        name: string;
        frequency: string;
        duration: string;
    }[];
    status: 'Active' | 'Completed' | 'Paused';
}

const RecoveryPlanSchema: Schema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    report: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    title: { type: String, required: true },
    goals: [{ type: String }],
    exercises: [{
        name: { type: String },
        frequency: { type: String },
        duration: { type: String }
    }],
    status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
}, { timestamps: true });

export default mongoose.model<IRecoveryPlan>('RecoveryPlan', RecoveryPlanSchema);
