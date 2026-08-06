import type { Request, Response, NextFunction } from 'express'
import jwt, { type JwtPayload } from 'jsonwebtoken'

import asyncHandler from "../utils/asyncHandler.util.js";
import APIError from '../utils/apiError.util.js';
import {envConfig} from '../config/env.config.js';

const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders || !authHeaders.startsWith("Bearer ")) {
        throw new APIError(401, "Unauthorized")
    }

    const token = authHeaders.split(" ")[1];
    try {
        const decoded = jwt.verify(token as string, envConfig.ACCESS_TOKEN_SECRET) as JwtPayload
        req.user = { id: decoded.userId }
    } catch (error) {
        throw new APIError(401, "Invalid or expired token");
    }
    next()
})

export default authMiddleware;