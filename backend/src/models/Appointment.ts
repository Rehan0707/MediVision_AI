import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
    patient: mongoose.Types.ObjectId;
    doctor: mongoose.Types.ObjectId;
    date: Date;
    status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
    reason: string;
    notes?: string;
    type: 'Consultation' | 'Follow-up' | 'Emergency';
}

const AppointmentSchema: Schema = new Schema({
    patient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], default: 'Pending' },
    reason: { type: String, required: true },
    notes: { type: String },
    type: { type: String, enum: ['Consultation', 'Follow-up', 'Emergency'], default: 'Consultation' }
}, { timestamps: true });

// Index for performance
AppointmentSchema.index({ patient: 1, date: -1 });
AppointmentSchema.index({ doctor: 1, date: -1 });

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);
