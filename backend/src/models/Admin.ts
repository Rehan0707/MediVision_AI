import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    user: mongoose.Types.ObjectId;
    permissions: string[];
    managedBy?: mongoose.Types.ObjectId;
}

const AdminSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    permissions: [{ type: String, default: ['full_access'] }],
    managedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

export default mongoose.model<IAdmin>('Admin', AdminSchema);
