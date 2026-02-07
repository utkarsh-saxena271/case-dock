import mongoose, { type Document } from "mongoose";

export interface IJoinRequest extends Document {
    chamber: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    status: "pending" | "approved" | "rejected";
    message?: string;
    requestedAt: Date;
    processedAt?: Date;
}

const joinRequestSchema = new mongoose.Schema({
    chamber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chamber",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    message: {
        type: String,
        trim: true
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    processedAt: {
        type: Date
    }
});

// Compound index for unique pending request per user per chamber
joinRequestSchema.index({ chamber: 1, user: 1, status: 1 });

// Index for pending requests lookup
joinRequestSchema.index({ chamber: 1, status: 1 });

const JoinRequest = mongoose.model<IJoinRequest>("JoinRequest", joinRequestSchema);

export default JoinRequest;
