import mongoose, { type Document } from "mongoose";

export interface IPermissions {
    canRead: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
}

export interface IChamberMember extends Document {
    chamber: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    permissions: IPermissions;
    role: "admin" | "member";
    joinedAt: Date;
}

const chamberMemberSchema = new mongoose.Schema({
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
    permissions: {
        canRead: {
            type: Boolean,
            default: true
        },
        canCreate: {
            type: Boolean,
            default: false
        },
        canUpdate: {
            type: Boolean,
            default: false
        },
        canDelete: {
            type: Boolean,
            default: false
        }
    },
    role: {
        type: String,
        enum: ["admin", "member"],
        default: "member"
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for unique membership
chamberMemberSchema.index({ chamber: 1, user: 1 }, { unique: true });

// Index for user's chambers lookup
chamberMemberSchema.index({ user: 1 });

const ChamberMember = mongoose.model<IChamberMember>("ChamberMember", chamberMemberSchema);

export default ChamberMember;
