import mongoose, { type Document } from "mongoose";

export interface IChamber extends Document {
    name: string;
    description?: string;
    admin: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const chamberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

// Index for faster queries
chamberSchema.index({ admin: 1 });

const Chamber = mongoose.model<IChamber>("Chamber", chamberSchema);

export default Chamber;
