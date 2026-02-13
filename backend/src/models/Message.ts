import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    content: string;
    read: boolean;
    type: 'text' | 'image' | 'file';
    metadata?: any;
}

const MessageSchema: Schema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

// Index for chat history
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

export default mongoose.model<IMessage>('Message', MessageSchema);
