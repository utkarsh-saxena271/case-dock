import bcrypt from 'bcrypt'
import crypto from 'crypto'

import prisma from "../config/db.config.js";
import APIError from "../utils/apiError.util.js";
import { generateAccessToken, generateEmailVerifyToken, generateRefreshToken, generateResetPasswordToken, verifiyEmailToken } from '../utils/token.util.js';
import { sendResetPasswordEmail, sendVerificationEmail } from './mail.service.js';
import client from '../config/redis.config.js';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { envConfig } from '../config/env.config.js';
import type { ForgotPassword, Login, Register } from '../types/auth.types.js';

export const registerService = async (data: Register) => {
    const { fullName, userName, email, enrollmentNumber, password } = data;

    const [existingEmail, existingUserName, existingEnrollment] = await Promise.all([
        prisma.user.findUnique({ where: { email } }),
        prisma.user.findUnique({ where: { userName } }),
        prisma.user.findUnique({ where: { enrollmentNumber } }),
    ]);

    if (existingEmail) throw new APIError(409, "Email is already registered");
    if (existingUserName) throw new APIError(409, "Username is already taken");
    if (existingEnrollment) throw new APIError(409, "Enrollment number is already registered");

    const hashedPass = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            firstName: fullName.firstName,
            lastName: fullName.lastName,
            userName,
            email,
            enrollmentNumber,
            password: hashedPass
        }
    })

    try {
        const token = generateEmailVerifyToken(user.id)
        await sendVerificationEmail(user.email, token)
    } catch (error) {
        await prisma.user.delete({
            where: {
                id: user.id
            }
        })
        throw new APIError(500, "Failed to send verification email, please try again")
    }

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        enrollmentNumber: user.enrollmentNumber
    };
}

export const verifyEmailService = async (token: string) => {
    const userId = verifiyEmailToken(token);
    await prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true }
    });
    return { message: "Email verified successfully" };
}


export const loginService = async (data: Login) => {
    const { email, password } = data;

    const userExists = await prisma.user.findFirst({
        where: {
            email
        }
    })

    if (!userExists) throw new APIError(401, 'Invalid credentials')

    const passCheck = await bcrypt.compare(password, userExists.password)

    if (!passCheck) throw new APIError(401, 'Invalid Credentials')

    if (!userExists.emailVerified) throw new APIError(400, 'User is not verified')

    const accessToken = generateAccessToken(userExists.id);
    const refreshToken = generateRefreshToken(userExists.id);

    await client.set(`refresh:${userExists.id}`, refreshToken, { EX: 7 * 24 * 60 * 60 }); // 7 days in seconds

    return {
        refreshToken, accessToken,
        user: {
            id: userExists.id,
            firstName: userExists.firstName,
            lastName: userExists.lastName,
            userName: userExists.userName,
            email: userExists.email,
            emailVerified: userExists.emailVerified
        }
    }

}

export const meService = async (id: string) => {
    const user = await prisma.user.findFirst({
        where: {
            id
        }
    })
    if (!user) throw new APIError(404, 'User not found')
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        emailVerified: user.emailVerified
    }
}


export const refreshAccessTokensService = async (token: string) => {
    if (!token) throw new APIError(401, 'No cookies found')

    let decoded: JwtPayload;
    try {
        decoded = jwt.verify(token, envConfig.REFRESH_TOKEN_SECRET) as JwtPayload;
    } catch (error) {
        throw new APIError(401, "Invalid or expired refresh token");
    }

    const storedToken = await client.get(`refresh:${decoded.userId}`)
    if (!storedToken || storedToken !== token) {
        throw new APIError(401, "Invalid refresh token")
    }

    const accessToken = generateAccessToken(decoded.userId)
    const refreshToken = generateRefreshToken(decoded.userId)
    await client.set(`refresh:${decoded.userId}`, refreshToken, { EX: 60 * 60 * 24 * 7 })
    return {
        refreshToken, accessToken
    }
}


export const forgotPasswordService = async (data: ForgotPassword) => {
    const { email } = data;
    const user = await prisma.user.findFirst({
        where: {
            email
        }
    })
    if (user) {
        const { token, hashedToken } = generateResetPasswordToken();
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpiry: new Date(Date.now() + 10 * 60 * 1000)
            }
        });
        await sendResetPasswordEmail(user.email, token);
    }

    return { message: "If that email is registered, a reset link has been sent" };
}

export const resetPasswordService = async (data: string, password: string) => {
    const hashed = crypto.createHash('sha256').update(data).digest('hex')

    const user = await prisma.user.findFirst({
        where: {
            resetPasswordToken: hashed,
            resetPasswordExpiry: { gt: new Date() }
        }
    })
    if (!user) throw new APIError(400, 'Invalid or expired reset token')

    const hashedPass = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPass,
            resetPasswordToken: null,
            resetPasswordExpiry: null
        }
    })

    await client.del(`refresh:${user.id}`);

    return { message: "Password reset successfully" };
}