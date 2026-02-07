// import fs from "fs";
// import path from "path";
// import { uploadImageKit } from "../services/imagekit.service.js";
// import type { RequestHandler } from 'express';
// import mongoose from 'mongoose';
// import Case from '../models/case.model.js';
// import ChamberMember from '../models/chamberMember.model.js';

// // Helper to convert string to ObjectId safely
// const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// /**
//  * Get all cases for the user (personal + chamber cases with read access)
//  */
// export const getAllCases: RequestHandler = async (req, res) => {
//   const userId = req.user.id;
//   const { chamberId } = req.query;

//   try {
//     let cases;

//     if (chamberId && typeof chamberId === 'string') {
//       // Get cases for specific chamber
//       const member = await ChamberMember.findOne({
//         chamber: toObjectId(chamberId),
//         user: toObjectId(userId)
//       });

//       if (!member) {
//         return res.status(403).json({ message: "You are not a member of this chamber" });
//       }

//       if (!member.permissions.canRead && member.role !== "admin") {
//         return res.status(403).json({ message: "You don't have permission to read cases in this chamber" });
//       }

//       cases = await Case.find({ chamber: toObjectId(chamberId) })
//         .populate('createdBy', 'fullName email')
//         .sort({ createdAt: -1 });
//     } else {
//       // Get all cases: personal + chamber cases with access
//       const memberships = await ChamberMember.find({
//         user: toObjectId(userId),
//         $or: [
//           { role: "admin" },
//           { "permissions.canRead": true }
//         ]
//       });

//       const chamberIds = memberships.map(m => m.chamber);

//       cases = await Case.find({
//         $or: [
//           { createdBy: toObjectId(userId), chamber: null }, // Personal cases
//           { chamber: { $in: chamberIds } } // Chamber cases with access
//         ]
//       })
//         .populate('createdBy', 'fullName email')
//         .populate('chamber', 'name')
//         .sort({ createdAt: -1 });
//     }

//     return res.status(200).json({
//       message: "Fetched all cases",
//       cases
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// /**
//  * Get a single case by ID
//  */
// export const getCaseById: RequestHandler = async (req, res) => {
//   const userId = req.user.id;
//   const { caseId } = req.params;

//   if (!caseId) {
//     return res.status(400).json({ message: "Case ID is required" });
//   }

//   try {
//     const caseDoc = await Case.findById(caseId)
//       .populate('createdBy', 'fullName email')
//       .populate('chamber', 'name');

//     if (!caseDoc) {
//       return res.status(404).json({ message: "Case not found" });
//     }

//     // Personal case - only owner can view
//     if (!caseDoc.chamber) {
//       if (caseDoc.createdBy._id.toString() !== userId) {
//         return res.status(403).json({ message: "You don't have access to this case" });
//       }
//       return res.status(200).json({ message: "Case fetched", case: caseDoc });
//     }

//     // Chamber case - check member permissions
//     const member = await ChamberMember.findOne({
//       chamber: caseDoc.chamber._id,
//       user: toObjectId(userId)
//     });

//     if (!member) {
//       return res.status(403).json({ message: "You are not a member of this chamber" });
//     }

//     if (!member.permissions.canRead && member.role !== "admin") {
//       return res.status(403).json({ message: "You don't have permission to read this case" });
//     }

//     return res.status(200).json({
//       message: "Case fetched",
//       case: caseDoc,
//       userPermissions: member.permissions,
//       userRole: member.role
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// /**
//  * Create a new case
//  */
// export const createCase: RequestHandler = async (req, res) => {
//   const { title, description, nextDate, fileNames, chamberId } = req.body;
//   const userId = req.user.id;

//   if (!title || !description || !nextDate) {
//     return res.status(400).json({ message: "Title, description, and nextDate are required" });
//   }

//   try {
//     // If chamber case, verify permissions
//     if (chamberId) {
//       const member = await ChamberMember.findOne({
//         chamber: toObjectId(chamberId),
//         user: toObjectId(userId)
//       });

//       if (!member) {
//         return res.status(403).json({ message: "You are not a member of this chamber" });
//       }

//       if (!member.permissions.canCreate && member.role !== "admin") {
//         return res.status(403).json({ message: "You don't have permission to create cases in this chamber" });
//       }
//     }

//     let uploadedFiles: { fileName: string; fileUrl: string }[] = [];

//     if (req.files && Array.isArray(req.files) && req.files.length > 0) {
//       // fileNames can come as JSON string (FormData) or array
//       const fileNamesArray: string[] = typeof fileNames === "string"
//         ? (() => {
//             try {
//               const parsed = JSON.parse(fileNames);
//               return Array.isArray(parsed) ? parsed : [parsed];
//             } catch {
//               return [];
//             }
//           })()
//         : Array.isArray(fileNames)
//           ? fileNames
//           : [];

//       if (fileNamesArray.length !== req.files.length) {
//         return res.status(400).json({
//           message: "fileNames array must be provided and match files length",
//         });
//       }

//       uploadedFiles = await Promise.all(
//         req.files.map(async (file: Express.Multer.File, index: number) => {
//           const customName = fileNamesArray[index];

//           if (!customName || typeof customName !== "string") {
//             throw new Error("Each file must have an explicit fileName");
//           }

//           const uploaded = await uploadImageKit(file.path);

//           if (!uploaded) {
//             throw new Error("File upload failed");
//           }

//           return {
//             fileName: customName,
//             fileUrl: uploaded.url,
//           };
//         })
//       );
//     }

//     const caseData: any = {
//       title,
//       description,
//       nextDate,
//       createdBy: toObjectId(userId),
//       files: uploadedFiles,
//     };

//     if (chamberId) {
//       caseData.chamber = toObjectId(chamberId);
//     }

//     const newCase = await Case.create(caseData);

//     return res.status(201).json({
//       message: "Case created",
//       case: newCase,
//     });
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).json({ message: error.message || "Internal Server Error" });
//   }
// };

// /**
//  * Update an existing case
//  */
// export const updateCase: RequestHandler = async (req, res) => {
//   const { caseId } = req.params;
//   const userId = req.user.id;
//   const { title, description, status, nextDate, fileNames } = req.body;

//   if (!caseId) {
//     return res.status(400).json({ message: "Case ID is required" });
//   }

//   try {
//     const caseDoc = await Case.findById(caseId);
//     if (!caseDoc) {
//       return res.status(404).json({ message: "Case not found" });
//     }

//     // Permission check
//     if (!caseDoc.chamber) {
//       // Personal case - only owner can update
//       if (caseDoc.createdBy.toString() !== userId) {
//         return res.status(403).json({ message: "You don't have access to this case" });
//       }
//     } else {
//       // Chamber case - check permissions
//       const member = await ChamberMember.findOne({
//         chamber: caseDoc.chamber,
//         user: toObjectId(userId)
//       });

//       if (!member) {
//         return res.status(403).json({ message: "You are not a member of this chamber" });
//       }

//       if (!member.permissions.canUpdate && member.role !== "admin") {
//         return res.status(403).json({ message: "You don't have permission to update cases in this chamber" });
//       }
//     }

//     // Reject empty update
//     if (
//       title === undefined &&
//       description === undefined &&
//       status === undefined &&
//       nextDate === undefined &&
//       (!req.files || !Array.isArray(req.files) || req.files.length === 0)
//     ) {
//       return res.status(400).json({ message: "Nothing to update" });
//     }

//     // Update fields
//     if (title !== undefined) caseDoc.title = title;
//     if (description !== undefined) caseDoc.description = description;
//     if (status !== undefined) caseDoc.status = status;
//     if (nextDate !== undefined) {
//       if (isNaN(Date.parse(nextDate))) {
//         return res.status(400).json({ message: "Invalid nextDate" });
//       }
//       caseDoc.nextDate = nextDate;
//     }

//     // Handle file uploads
//     if (req.files && Array.isArray(req.files) && req.files.length > 0) {
//       // fileNames can come as JSON string (FormData) or array
//       const fileNamesArray: string[] = typeof fileNames === "string"
//         ? (() => {
//             try {
//               const parsed = JSON.parse(fileNames);
//               return Array.isArray(parsed) ? parsed : [parsed];
//             } catch {
//               return [];
//             }
//           })()
//         : Array.isArray(fileNames)
//           ? fileNames
//           : [];

//       if (fileNamesArray.length !== req.files.length) {
//         return res.status(400).json({
//           message: "fileNames array must be provided and match files length",
//         });
//       }

//       const uploadedFiles = await Promise.all(
//         req.files.map(async (file: Express.Multer.File, index: number) => {
//           const customName = fileNamesArray[index];

//           if (!customName || typeof customName !== "string") {
//             throw new Error("Each file must have an explicit fileName");
//           }

//           const cleanName = customName.trim();
//           if (cleanName.length > 100) {
//             throw new Error("File name too long");
//           }

//           const uploaded = await uploadImageKit(file.path);
//           if (!uploaded) {
//             throw new Error("File upload failed");
//           }

//           return {
//             fileName: cleanName,
//             fileUrl: uploaded.secure_url,
//           };
//         })
//       );

//       caseDoc.files.push(...uploadedFiles);
//     }

//     await caseDoc.save();

//     return res.status(200).json({
//       message: "Case updated",
//       case: caseDoc,
//     });
//   } catch (error: any) {
//     console.error(error);
//     return res.status(500).json({ message: error.message || "Internal Server Error" });
//   }
// };

// /**
//  * Delete a case
//  */
// export const deleteCase: RequestHandler = async (req, res) => {
//   const { caseId } = req.params;
//   const userId = req.user.id;

//   if (!caseId) {
//     return res.status(400).json({ message: "Case ID is required" });
//   }

//   try {
//     const caseDoc = await Case.findById(caseId);
//     if (!caseDoc) {
//       return res.status(404).json({ message: "Case not found" });
//     }

//     // Permission check
//     if (!caseDoc.chamber) {
//       // Personal case - only owner can delete
//       if (caseDoc.createdBy.toString() !== userId) {
//         return res.status(403).json({ message: "You don't have access to this case" });
//       }
//     } else {
//       // Chamber case - check permissions
//       const member = await ChamberMember.findOne({
//         chamber: caseDoc.chamber,
//         user: toObjectId(userId)
//       });

//       if (!member) {
//         return res.status(403).json({ message: "You are not a member of this chamber" });
//       }

//       if (!member.permissions.canDelete && member.role !== "admin") {
//         return res.status(403).json({ message: "You don't have permission to delete cases in this chamber" });
//       }
//     }

//     await Case.findByIdAndDelete(caseId);

//     return res.status(200).json({ message: "Case deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// /**
//  * Serve a case file (proxy from Cloudinary) - for view/download
//  */
// export const getCaseFile: RequestHandler = async (req, res) => {
//   const userId = req.user.id;
//   const { caseId, fileIndex } = req.params;
//   const download = req.query.download === "1";

//   if (!caseId || fileIndex === undefined) {
//     return res.status(400).json({ message: "Case ID and file index are required" });
//   }

//   const index = parseInt(fileIndex, 10);
//   if (isNaN(index) || index < 0) {
//     return res.status(400).json({ message: "Invalid file index" });
//   }

//   try {
//     const caseDoc = await Case.findById(caseId).select("files createdBy chamber");
//     if (!caseDoc) {
//       return res.status(404).json({ message: "Case not found" });
//     }

//     const file = caseDoc.files?.[index];
//     if (!file?.fileUrl) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     // Permission check
//     if (!caseDoc.chamber) {
//       if (caseDoc.createdBy.toString() !== userId) {
//         return res.status(403).json({ message: "You don't have access to this file" });
//       }
//     } else {
//       const member = await ChamberMember.findOne({
//         chamber: caseDoc.chamber,
//         user: toObjectId(userId)
//       });
//       if (!member) {
//         return res.status(403).json({ message: "You are not a member of this chamber" });
//       }
//       if (!member.permissions.canRead && member.role !== "admin") {
//         return res.status(403).json({ message: "You don't have permission to read files in this case" });
//       }
//     }

//     const fileName = file.fileName.endsWith(".pdf") ? file.fileName : `${file.fileName}.pdf`;
//     const contentType = "application/pdf";

//     let buffer: Buffer;

//     // Check if fileUrl is a local path (relative or in public/temp)
//     const isLocalPath = !file.fileUrl.startsWith("http://") && !file.fileUrl.startsWith("https://");
//     if (isLocalPath) {
//       const localPath = path.isAbsolute(file.fileUrl)
//         ? file.fileUrl
//         : path.join(process.cwd(), "public", file.fileUrl.replace(/^\//, ""));
//       if (!fs.existsSync(localPath)) {
//         console.error("Local file not found:", localPath);
//         return res.status(404).json({ message: "File not found on server" });
//       }
//       buffer = fs.readFileSync(localPath);
//     } else {
//       const fileRes = await fetch(file.fileUrl, {
//         headers: {
//           "User-Agent": "CaseDock/1.0",
//           "Accept": "application/pdf,*/*",
//         },
//       });
//       if (!fileRes.ok) {
//         console.error("Cloudinary fetch failed:", fileRes.status, fileRes.statusText, file.fileUrl);
//         return res.status(502).json({ message: "Failed to fetch file from storage" });
//       }
//       const arrayBuffer = await fileRes.arrayBuffer();
//       buffer = Buffer.from(arrayBuffer);
//     }

//     res.setHeader("Content-Type", contentType);
//     res.setHeader(
//       "Content-Disposition",
//       download ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`
//     );
//     res.send(buffer);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// };

import fs from "fs";
import path from "path";
import { uploadImageKit } from "../../services/imagekit.service.js";
import type { RequestHandler } from 'express';
import mongoose from 'mongoose';
import Case from '../../models/case.model.js';
import ChamberMember from '../../models/chamberMember.model.js';

// Helper to convert string to ObjectId safely
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

/**
 * Get all cases for the user (personal + chamber cases with read access)
 */
export const getAllCases: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { chamberId } = req.query;

  try {
    let cases;

    if (chamberId && typeof chamberId === 'string') {
      // Get cases for specific chamber
      const member = await ChamberMember.findOne({
        chamber: toObjectId(chamberId),
        user: toObjectId(userId)
      });

      if (!member) {
        return res.status(403).json({ message: "You are not a member of this chamber" });
      }

      if (!member.permissions.canRead && member.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to read cases in this chamber" });
      }

      cases = await Case.find({ chamber: toObjectId(chamberId) })
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 });
    } else {
      // Get all cases: personal + chamber cases with access
      const memberships = await ChamberMember.find({
        user: toObjectId(userId),
        $or: [
          { role: "admin" },
          { "permissions.canRead": true }
        ]
      });

      const chamberIds = memberships.map(m => m.chamber);

      cases = await Case.find({
        $or: [
          { createdBy: toObjectId(userId), chamber: null }, // Personal cases
          { chamber: { $in: chamberIds } } // Chamber cases with access
        ]
      })
        .populate('createdBy', 'fullName email')
        .populate('chamber', 'name')
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({
      message: "Fetched all cases",
      cases
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get a single case by ID
 */
export const getCaseById: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { caseId } = req.params;

  if (!caseId) {
    return res.status(400).json({ message: "Case ID is required" });
  }

  try {
    const caseDoc = await Case.findById(caseId)
      .populate('createdBy', 'fullName email')
      .populate('chamber', 'name');

    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Personal case - only owner can view
    if (!caseDoc.chamber) {
      if (caseDoc.createdBy._id.toString() !== userId) {
        return res.status(403).json({ message: "You don't have access to this case" });
      }
      return res.status(200).json({ message: "Case fetched", case: caseDoc });
    }

    // Chamber case - check member permissions
    const member = await ChamberMember.findOne({
      chamber: caseDoc.chamber._id,
      user: toObjectId(userId)
    });

    if (!member) {
      return res.status(403).json({ message: "You are not a member of this chamber" });
    }

    if (!member.permissions.canRead && member.role !== "admin") {
      return res.status(403).json({ message: "You don't have permission to read this case" });
    }

    return res.status(200).json({
      message: "Case fetched",
      case: caseDoc,
      userPermissions: member.permissions,
      userRole: member.role
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Create a new case
 */
export const createCase: RequestHandler = async (req, res) => {
  const { title, description, nextDate, fileNames, chamberId } = req.body;
  const userId = req.user.id;

  if (!title || !description || !nextDate) {
    return res.status(400).json({ message: "Title, description, and nextDate are required" });
  }

  try {
    // If chamber case, verify permissions
    if (chamberId) {
      const member = await ChamberMember.findOne({
        chamber: toObjectId(chamberId),
        user: toObjectId(userId)
      });

      if (!member) {
        return res.status(403).json({ message: "You are not a member of this chamber" });
      }

      if (!member.permissions.canCreate && member.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to create cases in this chamber" });
      }
    }

    let uploadedFiles: { fileName: string; fileUrl: string }[] = [];

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // fileNames can come as JSON string (FormData) or array
      const fileNamesArray: string[] = typeof fileNames === "string"
        ? (() => {
          try {
            const parsed = JSON.parse(fileNames);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        })()
        : Array.isArray(fileNames)
          ? fileNames
          : [];

      if (fileNamesArray.length !== req.files.length) {
        return res.status(400).json({
          message: "fileNames array must be provided and match files length",
        });
      }

      uploadedFiles = await Promise.all(
        req.files.map(async (file: Express.Multer.File, index: number) => {
          const customName = fileNamesArray[index];

          if (!customName || typeof customName !== "string") {
            throw new Error("Each file must have an explicit fileName");
          }

          const uploaded = await uploadImageKit(file.path, customName);

          if (!uploaded) {
            throw new Error("File upload failed");
          }

          return {
            fileName: customName,
            fileUrl: uploaded.url,
          };
        })
      );
    }

    const caseData: any = {
      title,
      description,
      nextDate,
      createdBy: toObjectId(userId),
      files: uploadedFiles,
    };

    if (chamberId) {
      caseData.chamber = toObjectId(chamberId);
    }

    const newCase = await Case.create(caseData);

    return res.status(201).json({
      message: "Case created",
      case: newCase,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * Update an existing case
 */
export const updateCase: RequestHandler = async (req, res) => {
  const { caseId } = req.params;
  const userId = req.user.id;
  const { title, description, status, nextDate, fileNames } = req.body;

  if (!caseId) {
    return res.status(400).json({ message: "Case ID is required" });
  }

  try {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Permission check
    if (!caseDoc.chamber) {
      // Personal case - only owner can update
      if (caseDoc.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "You don't have access to this case" });
      }
    } else {
      // Chamber case - check permissions
      const member = await ChamberMember.findOne({
        chamber: caseDoc.chamber,
        user: toObjectId(userId)
      });

      if (!member) {
        return res.status(403).json({ message: "You are not a member of this chamber" });
      }

      if (!member.permissions.canUpdate && member.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to update cases in this chamber" });
      }
    }

    // Reject empty update
    if (
      title === undefined &&
      description === undefined &&
      status === undefined &&
      nextDate === undefined &&
      (!req.files || !Array.isArray(req.files) || req.files.length === 0)
    ) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    // Update fields
    if (title !== undefined) caseDoc.title = title;
    if (description !== undefined) caseDoc.description = description;
    if (status !== undefined) caseDoc.status = status;
    if (nextDate !== undefined) {
      if (isNaN(Date.parse(nextDate))) {
        return res.status(400).json({ message: "Invalid nextDate" });
      }
      caseDoc.nextDate = nextDate;
    }

    // Handle file uploads
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      // fileNames can come as JSON string (FormData) or array
      const fileNamesArray: string[] = typeof fileNames === "string"
        ? (() => {
          try {
            const parsed = JSON.parse(fileNames);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            return [];
          }
        })()
        : Array.isArray(fileNames)
          ? fileNames
          : [];

      if (fileNamesArray.length !== req.files.length) {
        return res.status(400).json({
          message: "fileNames array must be provided and match files length",
        });
      }

      const uploadedFiles = await Promise.all(
        req.files.map(async (file: Express.Multer.File, index: number) => {
          const customName = fileNamesArray[index];

          if (!customName || typeof customName !== "string") {
            throw new Error("Each file must have an explicit fileName");
          }

          const cleanName = customName.trim();
          if (cleanName.length > 100) {
            throw new Error("File name too long");
          }

          const uploaded = await uploadImageKit(file.path, cleanName);
          if (!uploaded) {
            throw new Error("File upload failed");
          }

          return {
            fileName: cleanName,
            fileUrl: uploaded.url,
          };
        })
      );

      caseDoc.files.push(...uploadedFiles);
    }

    await caseDoc.save();

    return res.status(200).json({
      message: "Case updated",
      case: caseDoc,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * Delete a case
 */
export const deleteCase: RequestHandler = async (req, res) => {
  const { caseId } = req.params;
  const userId = req.user.id;

  if (!caseId) {
    return res.status(400).json({ message: "Case ID is required" });
  }

  try {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    // Permission check
    if (!caseDoc.chamber) {
      // Personal case - only owner can delete
      if (caseDoc.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "You don't have access to this case" });
      }
    } else {
      // Chamber case - check permissions
      const member = await ChamberMember.findOne({
        chamber: caseDoc.chamber,
        user: toObjectId(userId)
      });

      if (!member) {
        return res.status(403).json({ message: "You are not a member of this chamber" });
      }

      if (!member.permissions.canDelete && member.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to delete cases in this chamber" });
      }
    }

    await Case.findByIdAndDelete(caseId);

    return res.status(200).json({ message: "Case deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Serve a case file (proxy from ImageKit) - for view/download
 */
export const getCaseFile: RequestHandler = async (req, res) => {
  const userId = req.user.id;
  const { caseId, fileIndex } = req.params;
  const download = req.query.download === "1";

  if (!caseId || fileIndex === undefined) {
    return res.status(400).json({ message: "Case ID and file index are required" });
  }

  const index = parseInt(fileIndex, 10);
  if (isNaN(index) || index < 0) {
    return res.status(400).json({ message: "Invalid file index" });
  }

  try {
    const caseDoc = await Case.findById(caseId).select("files createdBy chamber");
    if (!caseDoc) {
      return res.status(404).json({ message: "Case not found" });
    }

    const file = caseDoc.files?.[index];
    if (!file?.fileUrl) {
      return res.status(404).json({ message: "File not found" });
    }

    // Permission check
    if (!caseDoc.chamber) {
      if (caseDoc.createdBy.toString() !== userId) {
        return res.status(403).json({ message: "You don't have access to this file" });
      }
    } else {
      const member = await ChamberMember.findOne({
        chamber: caseDoc.chamber,
        user: toObjectId(userId)
      });
      if (!member) {
        return res.status(403).json({ message: "You are not a member of this chamber" });
      }
      if (!member.permissions.canRead && member.role !== "admin") {
        return res.status(403).json({ message: "You don't have permission to read files in this case" });
      }
    }

    const fileName = file.fileName.endsWith(".pdf") ? file.fileName : `${file.fileName}.pdf`;
    const contentType = "application/pdf";

    let buffer: Buffer;

    // Check if fileUrl is a local path (relative or in public/temp)
    const isLocalPath = !file.fileUrl.startsWith("http://") && !file.fileUrl.startsWith("https://");
    if (isLocalPath) {
      const localPath = path.isAbsolute(file.fileUrl)
        ? file.fileUrl
        : path.join(process.cwd(), "public", file.fileUrl.replace(/^\//, ""));
      if (!fs.existsSync(localPath)) {
        console.error("Local file not found:", localPath);
        return res.status(404).json({ message: "File not found on server" });
      }
      buffer = fs.readFileSync(localPath);
    } else {
      const fileRes = await fetch(file.fileUrl, {
        headers: {
          "User-Agent": "CaseDock/1.0",
          "Accept": "application/pdf,*/*",
        },
      });
      if (!fileRes.ok) {
        console.error("ImageKit fetch failed:", fileRes.status, fileRes.statusText, file.fileUrl);
        return res.status(502).json({ message: "Failed to fetch file from storage" });
      }
      const arrayBuffer = await fileRes.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      download ? `attachment; filename="${fileName}"` : `inline; filename="${fileName}"`
    );
    res.send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};