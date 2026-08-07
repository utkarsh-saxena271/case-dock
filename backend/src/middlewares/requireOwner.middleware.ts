import type { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import APIError from "../utils/apiError.util.js";
import prisma from "../config/db.config.js";

export const requireOwnerMiddleware = asyncHandler(async (req:Request, res:Response, next:NextFunction) => {
    const userId = req.user.id
    const {chamberId} = req.params;

    if(!chamberId || typeof chamberId !== 'string'){
        throw new APIError(400, 'Chamber Id is required')
    }

    const membership = await prisma.membership.findUnique({
        where: { userId_chamberId: { userId, chamberId } }
    });

    if (!membership || membership.role !== 'OWNER') {
        throw new APIError(403, "Only the chamber owner can perform this action");
    }

    next();
})