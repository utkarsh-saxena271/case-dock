import type { RequestHandler } from "express";
import mongoose from "mongoose";
import ChamberMember from "../../models/chamberMember.model.js";
import Chamber from "../../models/chamber.model.js";
import Case from "../../models/case.model.js";

/**
 * Middleware to check if the user is an admin of the chamber
 */
export const checkChamberAdmin: RequestHandler = async (req, res, next) => {
    const { chamberId } = req.params;
    const { id: userId } = req.user;

    try {
        const chamber = await Chamber.findById(chamberId);
        if (!chamber) {
            return res.status(404).json({ message: "Chamber not found" });
        }

        if (chamber.admin.toString() !== userId) {
            return res.status(403).json({ message: "Only chamber admin can perform this action" });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Middleware to check if the user is a member of the chamber
 */
export const checkChamberMember: RequestHandler = async (req, res, next) => {
    const { chamberId } = req.params;
    const { id: userId } = req.user;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        const member = await ChamberMember.findOne({
            chamber: new mongoose.Types.ObjectId(chamberId),
            user: new mongoose.Types.ObjectId(userId)
        });
        if (!member) {
            return res.status(403).json({ message: "You are not a member of this chamber" });
        }

        // Attach member info to request for later use
        (req as any).chamberMember = member;
        next();
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Factory to create permission check middleware for specific actions
 */
export const checkCasePermission = (action: "read" | "create" | "update" | "delete"): RequestHandler => {
    return async (req, res, next) => {
        const { id: userId } = req.user;
        const { caseId } = req.params;
        const { chamberId } = req.body;

        try {
            // If creating a new case
            if (action === "create") {
                // Personal case - no chamber permission needed
                if (!chamberId) {
                    return next();
                }

                // Chamber case - check create permission
                const member = await ChamberMember.findOne({ chamber: chamberId, user: userId });
                if (!member) {
                    return res.status(403).json({ message: "You are not a member of this chamber" });
                }

                if (!member.permissions.canCreate && member.role !== "admin") {
                    return res.status(403).json({ message: "You don't have permission to create cases in this chamber" });
                }

                (req as any).chamberMember = member;
                return next();
            }

            // For existing case operations
            const caseDoc = await Case.findById(caseId);
            if (!caseDoc) {
                return res.status(404).json({ message: "Case not found" });
            }

            // Personal case - only owner can access
            if (!caseDoc.chamber) {
                if (caseDoc.createdBy.toString() !== userId) {
                    return res.status(403).json({ message: "You don't have access to this case" });
                }
                return next();
            }

            // Chamber case - check member permissions
            const member = await ChamberMember.findOne({
                chamber: caseDoc.chamber,
                user: userId
            });

            if (!member) {
                return res.status(403).json({ message: "You are not a member of this chamber" });
            }

            const permissionMap = {
                read: member.permissions.canRead,
                update: member.permissions.canUpdate,
                delete: member.permissions.canDelete,
                create: member.permissions.canCreate
            };

            if (!permissionMap[action] && member.role !== "admin") {
                return res.status(403).json({
                    message: `You don't have permission to ${action} cases in this chamber`
                });
            }

            (req as any).chamberMember = member;
            (req as any).caseDoc = caseDoc;
            next();
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    };
};
