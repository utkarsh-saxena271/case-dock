import { uploadCloudinary } from "../services/cloudinary.service.js";
import type { RequestHandler } from 'express'
import Case from '../models/case.model.js'

export const getAllCases : RequestHandler = async (req,res) => {
    const { id } = req.user;
    try {
        const cases = await Case.find({createdBy:id})
        if(!cases) return res.status(401).json({
            message:"no cases found"
        })
        return res.status(201).json({
            message:"Fetched all cases",
            cases:cases
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}

export const getCaseById:RequestHandler = async (req,res) => {
    const { id } = req.user;
    const { caseId } = req.params;
    try {
        const caseExist = await Case.findOne({createdBy:id, _id:caseId})
        if(!caseExist) return res.status(401).json({
            message:"no cases found"
        })
        return res.status(201).json({
            message:"Fetched all cases",
            case : caseExist
        })
    } catch (error) {
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }
}



export const createCase: RequestHandler = async (req, res) => {
  const { title, description, nextDate } = req.body;
  const { id } = req.user;

  if (!title || !description) {
    return res.status(400).json({ message: "Title and description required" });
  }

  try {
    let uploadedFiles: any[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;
        const uploaded = await uploadCloudinary(file.path);

        if (!uploaded) {
          return res.status(500).json({ message: "File upload failed" });
        }

        uploadedFiles.push({
          fileName: req.body.fileNames?.[i] || file.originalname, // optional custom name
          fileUrl: uploaded.secure_url,
        });
      }
    }

    const newCase = await Case.create({
      title,
      description,
      nextDate,
      createdBy: id,
      files: uploadedFiles, // can be empty []
    });

    return res.status(201).json({
      message: "Case created",
      case: newCase,
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const updateCase: RequestHandler = async (req, res) => {
  const { caseId } = req.params;
  const { id } = req.user;

  const { title, description, status, nextDate } = req.body;

  try {
    const caseExist = await Case.findOne({ _id: caseId, createdBy: id });
    if (!caseExist) {
      return res.status(404).json({ message: "Case not found" });
    }

    // ✅ text fields update (optional)
    if (title) caseExist.title = title;
    if (description) caseExist.description = description;
    if (status) caseExist.status = status;
    if (nextDate) caseExist.nextDate = nextDate;

    // ✅ file upload (optional, single or multiple)
    if (req.files && Array.isArray(req.files)) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i] as Express.Multer.File;
        const uploaded = await uploadCloudinary(file.path);

        if (!uploaded) {
          return res.status(500).json({ message: "File upload failed" });
        }

        caseExist.files.push({
          fileName: req.body.fileNames?.[i] || file.originalname,
          fileUrl: uploaded.secure_url,
        });
      }
    }

    await caseExist.save();

    return res.status(200).json({
      message: "Case updated",
      case: caseExist,
    });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};