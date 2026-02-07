import mongoose from "mongoose";

export interface ICase extends mongoose.Document {
    title: string;
    description: string;
    files: { fileName: string; fileUrl: string }[];
    status: "open" | "closed" | "dismissed";
    nextDate?: Date;
    createdBy: mongoose.Types.ObjectId;
    chamber?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const caseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    files: [
        {
            fileName: {
                type: String,
                required: true
            },
            fileUrl: {
                type: String, // cloudinary URL
                required: true
            }
        }
    ],
    status: {
        type: String,
        enum: ["open", "closed", "dismissed"],
        default: "open",
    },
    nextDate: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    chamber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chamber",
        default: null
    }
}, { timestamps: true });

// Index for user's personal cases
caseSchema.index({ createdBy: 1, chamber: 1 });

// Index for chamber cases
caseSchema.index({ chamber: 1 });

const Case = mongoose.model<ICase>("Case", caseSchema);

export default Case;