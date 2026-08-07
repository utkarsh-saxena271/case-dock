import type { Request, Response, NextFunction } from 'express'
import asyncHandler from "../utils/asyncHandler.util.js";
import APIError from '../utils/apiError.util.js';
import prisma from '../config/db.config.js';
import type { Permission } from '../generated/prisma/enums.js';

const permissionMiddleware = (requiredPermission: Permission) =>
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const { chamberId } = req.params;
        const userId = req.user.id;

        if (!chamberId || typeof chamberId !== 'string') {
            throw new APIError(400, "Chamber ID is required");
        }

        const membership = await prisma.membership.findUnique({
            where: {
                userId_chamberId: {
                    userId,
                    chamberId
                }
            }
        });

        if (!membership || membership.status !== 'ACTIVE') {
            throw new APIError(403, "You are not an active member of this chamber");
        }

        if (!membership.permissions.includes(requiredPermission)) {
            throw new APIError(403, "You do not have permission to perform this action");
        }

        next();
    });

export default permissionMiddleware;