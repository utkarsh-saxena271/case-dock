import mongoose from "mongoose";

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
            fileName:{
                type:String,
                required: true
            },
            fileUrl:{
                type: String, // cloudinary URL
                required:true
            }
        }
    ],
    status: {
        type: String,
        enum: ["open", "closed", "dismissed"],
        default: "open",
    },
    nextDate:{
        type:Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
}, { timestamps: true });

const Case = mongoose.model("Case", caseSchema);

export default Case;