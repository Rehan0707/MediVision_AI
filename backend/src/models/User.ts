import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    email: string;
    role: 'Patient' | 'Doctor' | 'Admin';
    password?: string;
    isApproved: boolean;
    status: 'Pending' | 'Approved' | 'Rejected';
    phoneNumber?: string;
    avatar?: string;
    patientProfile?: mongoose.Types.ObjectId;
    doctorProfile?: mongoose.Types.ObjectId;
    adminProfile?: mongoose.Types.ObjectId;
    comparePassword: (password: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['Patient', 'Doctor', 'Admin'], default: 'Patient' },
    password: { type: String },
    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    phoneNumber: { type: String },
    avatar: { type: String },
    patientProfile: { type: Schema.Types.ObjectId, ref: 'Patient' },
    doctorProfile: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    adminProfile: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function () {
    if (!this.isModified('password')) return;
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

UserSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
