import mongoose, { Schema, Document } from 'mongoose';

export interface IDiscussion extends Document {
    title: string;
    author: mongoose.Types.ObjectId;
    content: string;
    category: string;
    commentsCount: number;
    activeDoctors: number;
    timestamp: Date;
}

const DiscussionSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String, // e.g., 'Trauma Reconstruction', 'Neuro-Visual'
        required: true
    },
    commentsCount: {
        type: Number,
        default: 0
    },
    activeDoctors: {
        type: Number,
        default: 1
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for search
DiscussionSchema.index({ title: 'text', content: 'text' });
DiscussionSchema.index({ category: 1 });

export default mongoose.model<IDiscussion>('Discussion', DiscussionSchema);
