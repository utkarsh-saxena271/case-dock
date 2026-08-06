import type { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler.util.js";
import { forgotPasswordService, loginService, meService, refreshAccessTokensService, registerService, resetPasswordService, verifyEmailService } from "../services/auth.service.js";
import ApiResponse from "../utils/apiResponse.util.js";
import APIError from "../utils/apiError.util.js";
import { envConfig } from "../config/env.config.js";
import client from "../config/redis.config.js";

export const registerController = asyncHandler(async (req:Request, res:Response) => {
    const data = await registerService(req.body)
    return res.status(201).json(
        new ApiResponse(201,data,"User registered successfully")
    )
})

export const verifyEmailController = asyncHandler(async (req: Request, res: Response) => {
    const token = req.query.token as string;
    if (!token) throw new APIError(400, "Verification token is required");

    const verified = await verifyEmailService(token);
    return res.status(200).json(
        new ApiResponse(200, verified, "Email verified successfully")
    )
})

export const loginController = asyncHandler(async (req:Request, res:Response) => {
     const { accessToken, refreshToken, user } = await loginService(req.body);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    });

    return res.status(200).json(
        new ApiResponse(200, { accessToken, user }, "Login successful")
    );
})

export const meController = asyncHandler(async (req:Request, res:Response) => {
    const user = await meService(req.user.id)
    res.status(200).json(
        new ApiResponse(200,user,'User fetched successfully')
    )
})

export const logoutController = asyncHandler(async (req: Request, res: Response) => {
    await client.del(`refresh:${req.user.id}`);

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Logged out successfully")
    );
})

export const refreshAccessTokensController = asyncHandler(async (req:Request, res:Response) => {
    const {accessToken, refreshToken} = await refreshAccessTokensService(req.cookies.refreshToken)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: envConfig.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 * 1000  // ← multiply by 1000
    })
    res.status(200).json(
        new ApiResponse(200, {accessToken}, 'Refresh Token Generated')
    )
})

export const forgotPasswordController = asyncHandler( async(req:Request, res:Response) => {
    const sent = await forgotPasswordService(req.body);
    res.status(200).json(
        new ApiResponse(200, sent, 'Sent reset password email')
    )
})

export const resetPasswordController = asyncHandler(async(req:Request, res:Response) => {
    const token = req.query.token as string
    const {password} = req.body
    const reset = await resetPasswordService(token, password)

    res.status(200).json(
        new ApiResponse(200, reset, 'Password Reset Successfully')
    )
})