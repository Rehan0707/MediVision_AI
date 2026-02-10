import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    user: mongoose.Types.ObjectId;
    action: string;
    resource: string;
    resourceId?: string;
    timestamp: Date;
    ipAddress?: string;
    details?: any;
}

const AuditLogSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String },
    details: { type: Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
