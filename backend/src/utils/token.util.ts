import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { envConfig } from '../config/env.config.js'
import APIError from './apiError.util.js'

export const generateEmailVerifyToken = (userId: string) => {
    return jwt.sign({
        userId
    },
        envConfig.EMAIL_VERIFY_SECRET,
        {
            expiresIn: '15m'
        }
    )
}

export const verifiyEmailToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, envConfig.EMAIL_VERIFY_SECRET) as { userId: string };
        return decoded.userId;
    } catch (error) {
        throw new APIError(400, "Invalid or expired verification link");
    }
}

export const generateAccessToken = (userId:string) => {
    return jwt.sign(
        {
            userId
        },
        envConfig.ACCESS_TOKEN_SECRET,
        {
            expiresIn:'15m'
        }
    )
}

export const generateRefreshToken = (userId:string) => {
    return jwt.sign(
        {
            userId
        },
        envConfig.REFRESH_TOKEN_SECRET,
        {
            expiresIn:'7d'
        }
    )
}


export const generateResetPasswordToken = () => {
  const token = crypto.randomBytes(32).toString('hex') // raw token for email
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex') // store in DB
  return { token, hashedToken }
}