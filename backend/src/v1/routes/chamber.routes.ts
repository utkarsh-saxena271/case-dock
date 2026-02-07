import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkChamberAdmin, checkChamberMember } from "../middlewares/permission.middleware.js";
import {
    createChamber,
    getChambers,
    getChamberById,
    updateChamber,
    deleteChamber,
    requestJoinChamber,
    getJoinRequests,
    handleJoinRequest,
    getChamberMembers,
    updateMemberPermissions,
    removeMember,
    leaveChamber,
    searchChambers
} from "../controllers/chamber.controller.js";

const router = express.Router();

// Chamber CRUD
router.post("/", authMiddleware, createChamber);
router.get("/", authMiddleware, getChambers);
router.get("/search", authMiddleware, searchChambers);
router.get("/:chamberId", authMiddleware, getChamberById);
router.patch("/:chamberId", authMiddleware, checkChamberAdmin, updateChamber);
router.delete("/:chamberId", authMiddleware, checkChamberAdmin, deleteChamber);

// Join requests
router.post("/:chamberId/join", authMiddleware, requestJoinChamber);
router.get("/:chamberId/requests", authMiddleware, checkChamberAdmin, getJoinRequests);
router.post("/:chamberId/requests/:requestId", authMiddleware, checkChamberAdmin, handleJoinRequest);

// Member management
router.get("/:chamberId/members", authMiddleware, checkChamberMember, getChamberMembers);
router.patch("/:chamberId/members/:memberId", authMiddleware, checkChamberAdmin, updateMemberPermissions);
router.delete("/:chamberId/members/:memberId", authMiddleware, checkChamberAdmin, removeMember);
router.post("/:chamberId/leave", authMiddleware, leaveChamber);

export default router;
