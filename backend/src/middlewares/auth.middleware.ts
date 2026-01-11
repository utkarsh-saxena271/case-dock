import { type Response, type Request, type NextFunction } from "express"
import jwt from 'jsonwebtoken'

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}


export const authMiddleware = async (req:Request , res:Response , next : NextFunction)=>{
    try {
        const {token} = req.cookies

        const decoded = jwt.verify(token , process.env.JWT_SECRET as string)

        if(!decoded){
            return res.status(404).json({
                msg : "unable to verify token, Please login again!"
            })
        }

        req.user = (decoded as jwt.JwtPayload).id as string;
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg : "error in auth middleware. internal server error!"
        })
    }
}