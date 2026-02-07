import type { RequestHandler } from "express";
import mongoose from "mongoose";
import Chamber from "../../models/chamber.model.js";
import ChamberMember from "../../models/chamberMember.model.js";
import JoinRequest from "../../models/joinRequest.model.js";

// Helper to convert string to ObjectId safely
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

/**
 * Create a new chamber
 */
export const createChamber: RequestHandler = async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: "Chamber name is required" });
    }

    try {
        // Create the chamber
        const chamber = await Chamber.create({
            name,
            description,
            admin: toObjectId(userId)
        });

        // Add creator as admin member with full permissions
        await ChamberMember.create({
            chamber: chamber._id,
            user: toObjectId(userId),
            role: "admin",
            permissions: {
                canRead: true,
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        });

        return res.status(201).json({
            message: "Chamber created successfully",
            chamber
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to create chamber" });
    }
};

/**
 * Get all chambers the user is a member of
 */
export const getChambers: RequestHandler = async (req, res) => {
    const userId = req.user.id;

    try {
        // Get all chamber memberships for the user
        const memberships = await ChamberMember.find({ user: toObjectId(userId) })
            .populate("chamber")
            .lean();

        const chambers = memberships.map((m) => ({
            ...m.chamber,
            role: m.role,
            permissions: m.permissions
        }));

        return res.status(200).json({
            message: "Chambers fetched successfully",
            chambers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch chambers" });
    }
};

/**
 * Get a single chamber by ID with members
 */
export const getChamberById: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;
    const userId = req.user.id;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        const chamber = await Chamber.findById(chamberId)
            .populate("admin", "fullName email")
            .lean();

        if (!chamber) {
            return res.status(404).json({ message: "Chamber not found" });
        }

        // Check if user is a member
        const membership = await ChamberMember.findOne({
            chamber: toObjectId(chamberId),
            user: toObjectId(userId)
        });

        if (!membership) {
            return res.status(403).json({ message: "You are not a member of this chamber" });
        }

        // Get all members if user is admin
        let members: any[] = [];
        if (membership.role === "admin") {
            members = await ChamberMember.find({ chamber: toObjectId(chamberId) })
                .populate("user", "fullName email enrollmentNumber")
                .lean();
        }

        return res.status(200).json({
            message: "Chamber fetched successfully",
            chamber: {
                ...chamber,
                userRole: membership.role,
                userPermissions: membership.permissions,
                members
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch chamber" });
    }
};

/**
 * Update chamber (admin only)
 */
export const updateChamber: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;
    const { name, description } = req.body;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        const chamber = await Chamber.findByIdAndUpdate(
            chamberId,
            { name, description },
            { new: true }
        );

        if (!chamber) {
            return res.status(404).json({ message: "Chamber not found" });
        }

        return res.status(200).json({
            message: "Chamber updated successfully",
            chamber
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update chamber" });
    }
};

/**
 * Delete chamber (admin only)
 */
export const deleteChamber: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        // Delete all related data
        await Promise.all([
            Chamber.findByIdAndDelete(chamberId),
            ChamberMember.deleteMany({ chamber: toObjectId(chamberId) }),
            JoinRequest.deleteMany({ chamber: toObjectId(chamberId) })
        ]);

        return res.status(200).json({ message: "Chamber deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to delete chamber" });
    }
};

/**
 * Request to join a chamber
 */
export const requestJoinChamber: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;
    const userId = req.user.id;
    const { message } = req.body;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        // Check if chamber exists
        const chamber = await Chamber.findById(chamberId);
        if (!chamber) {
            return res.status(404).json({ message: "Chamber not found" });
        }

        // Check if already a member
        const existingMember = await ChamberMember.findOne({
            chamber: toObjectId(chamberId),
            user: toObjectId(userId)
        });
        if (existingMember) {
            return res.status(400).json({ message: "You are already a member of this chamber" });
        }

        // Check if already has pending request
        const existingRequest = await JoinRequest.findOne({
            chamber: toObjectId(chamberId),
            user: toObjectId(userId),
            status: "pending"
        });
        if (existingRequest) {
            return res.status(400).json({ message: "You already have a pending join request" });
        }

        // Create join request
        const joinRequest = await JoinRequest.create({
            chamber: toObjectId(chamberId),
            user: toObjectId(userId),
            message
        });

        return res.status(201).json({
            message: "Join request sent successfully",
            request: joinRequest
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to send join request" });
    }
};

/**
 * Get pending join requests (admin only)
 */
export const getJoinRequests: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        const requests = await JoinRequest.find({
            chamber: toObjectId(chamberId),
            status: "pending"
        }).populate("user", "fullName email enrollmentNumber").lean();

        return res.status(200).json({
            message: "Join requests fetched successfully",
            requests
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch join requests" });
    }
};

/**
 * Handle join request (approve/reject) - admin only
 */
export const handleJoinRequest: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;
    const requestId = req.params.requestId;
    const { action, permissions } = req.body;

    if (!chamberId || !requestId) {
        return res.status(400).json({ message: "Chamber ID and Request ID are required" });
    }

    if (!["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Use 'approve' or 'reject'" });
    }

    try {
        const joinRequest = await JoinRequest.findOne({
            _id: toObjectId(requestId),
            chamber: toObjectId(chamberId),
            status: "pending"
        });

        if (!joinRequest) {
            return res.status(404).json({ message: "Join request not found" });
        }

        if (action === "approve") {
            // Create member with specified permissions
            await ChamberMember.create({
                chamber: toObjectId(chamberId),
                user: joinRequest.user,
                role: "member",
                permissions: permissions || {
                    canRead: true,
                    canCreate: false,
                    canUpdate: false,
                    canDelete: false
                }
            });

            joinRequest.status = "approved";
        } else {
            joinRequest.status = "rejected";
        }

        joinRequest.processedAt = new Date();
        await joinRequest.save();

        return res.status(200).json({
            message: `Join request ${action}d successfully`,
            request: joinRequest
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to handle join request" });
    }
};

/**
 * Get chamber members
 */
export const getChamberMembers: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        const members = await ChamberMember.find({ chamber: toObjectId(chamberId) })
            .populate("user", "fullName email enrollmentNumber")
            .lean();

        return res.status(200).json({
            message: "Members fetched successfully",
            members
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch members" });
    }
};

/**
 * Update member permissions (admin only)
 */
export const updateMemberPermissions: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;
    const memberId = req.params.memberId;
    const { permissions } = req.body;
    const userId = req.user.id;

    if (!chamberId || !memberId) {
        return res.status(400).json({ message: "Chamber ID and Member ID are required" });
    }

    try {
        const member = await ChamberMember.findOne({
            _id: toObjectId(memberId),
            chamber: toObjectId(chamberId)
        });

        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        // Cannot modify admin's permissions
        if (member.role === "admin") {
            return res.status(400).json({ message: "Cannot modify admin permissions" });
        }

        // Cannot modify own permissions
        if (member.user.toString() === userId) {
            return res.status(400).json({ message: "Cannot modify your own permissions" });
        }

        member.permissions = {
            canRead: permissions?.canRead ?? member.permissions.canRead,
            canCreate: permissions?.canCreate ?? member.permissions.canCreate,
            canUpdate: permissions?.canUpdate ?? member.permissions.canUpdate,
            canDelete: permissions?.canDelete ?? member.permissions.canDelete
        };

        await member.save();

        return res.status(200).json({
            message: "Permissions updated successfully",
            member
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to update permissions" });
    }
};

/**
 * Remove member from chamber (admin only)
 */
export const removeMember: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;
    const memberId = req.params.memberId;
    const userId = req.user.id;

    if (!chamberId || !memberId) {
        return res.status(400).json({ message: "Chamber ID and Member ID are required" });
    }

    try {
        const member = await ChamberMember.findOne({
            _id: toObjectId(memberId),
            chamber: toObjectId(chamberId)
        });

        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }

        // Cannot remove admin
        if (member.role === "admin") {
            return res.status(400).json({ message: "Cannot remove chamber admin" });
        }

        // Cannot remove yourself (use leave instead)
        if (member.user.toString() === userId) {
            return res.status(400).json({ message: "Use leave endpoint to leave the chamber" });
        }

        await ChamberMember.deleteOne({ _id: toObjectId(memberId) });

        return res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to remove member" });
    }
};

/**
 * Leave chamber (non-admin members)
 */
export const leaveChamber: RequestHandler = async (req, res) => {
    const chamberId = req.params.chamberId;
    const userId = req.user.id;

    if (!chamberId) {
        return res.status(400).json({ message: "Chamber ID is required" });
    }

    try {
        const member = await ChamberMember.findOne({
            chamber: toObjectId(chamberId),
            user: toObjectId(userId)
        });

        if (!member) {
            return res.status(404).json({ message: "You are not a member of this chamber" });
        }

        // Admin cannot leave (must delete chamber or transfer ownership)
        if (member.role === "admin") {
            return res.status(400).json({
                message: "Admin cannot leave the chamber. Delete the chamber or transfer ownership first."
            });
        }

        await ChamberMember.deleteOne({ _id: member._id });

        return res.status(200).json({ message: "Left chamber successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to leave chamber" });
    }
};

/**
 * Search chambers (public, for joining)
 */
export const searchChambers: RequestHandler = async (req, res) => {
    const { q } = req.query;
    const userId = req.user.id;

    try {
        // Get chambers user is already a member of
        const memberships = await ChamberMember.find({ user: toObjectId(userId) }).select("chamber");
        const memberChamberIds = memberships.map(m => m.chamber);

        // Search chambers not already a member of
        const query: any = {
            _id: { $nin: memberChamberIds }
        };

        if (q && typeof q === "string") {
            query.name = { $regex: q, $options: "i" };
        }

        const chambers = await Chamber.find(query)
            .populate("admin", "fullName")
            .limit(20)
            .lean();

        // Check for pending requests
        const pendingRequests = await JoinRequest.find({
            user: toObjectId(userId),
            chamber: { $in: chambers.map(c => c._id) },
            status: "pending"
        }).select("chamber");

        const pendingChamberIds = new Set(pendingRequests.map(r => r.chamber.toString()));

        const chambersWithStatus = chambers.map(c => ({
            ...c,
            hasPendingRequest: pendingChamberIds.has((c._id as mongoose.Types.ObjectId).toString())
        }));

        return res.status(200).json({
            message: "Chambers fetched successfully",
            chambers: chambersWithStatus
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to search chambers" });
    }
};
