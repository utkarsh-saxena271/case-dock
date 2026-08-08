import type { NextFunction, Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import prisma from "../config/db.config.js";
import APIError from "../utils/apiError.util.js";
import type { Permission } from "../generated/prisma/enums.js";

const requireCaseAccess = (requiredPermission: Permission) =>
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const caseId = req.params.caseId;
        if (!caseId || typeof caseId !== 'string') {
            throw new APIError(400, "Case Id is required");
        }

        const caseFetched = await prisma.case.findUnique({
            where: { id: caseId }
        });

        if (!caseFetched) {
            throw new APIError(404, "Case not found");
        }

        if (caseFetched.ownerType === 'PERSONAL') {
            if (caseFetched.personalOwnerId !== req.user.id) {
                throw new APIError(403, "You do not have access to this case");
            }
        } else {
            // CHAMBER case
            const membership = await prisma.membership.findUnique({
                where: {
                    userId_chamberId: {
                        userId: req.user.id,
                        chamberId: caseFetched.chamberId as string
                    }
                }
            });

            if (!membership || membership.status !== 'ACTIVE') {
                throw new APIError(403, "You are not an active member of this chamber");
            }

            if (!membership.permissions.includes(requiredPermission)) {
                throw new APIError(403, "You do not have permission to perform this action");
            }
        }

        next();
    });

export default requireCaseAccess;