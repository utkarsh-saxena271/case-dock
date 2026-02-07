import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import type { RequestHandler } from "express";

declare global{
  namespace Express{
    interface Request{
      user:{
        id:string,
        email:string
      }
    }
  }
}

const jwtSecret = process.env.JWT_SECRET;
if(!jwtSecret){
    throw new Error("JWT secret not found")
}

export const authMiddleware:RequestHandler = async (req,res,next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    try {
        const decodedToken = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        const user = await User.findById(decodedToken.userId);
        if(user === null){
            return res.status(404).json({message:"User not found"})
        }
        req.user = { id : user.id, email : user.email };
        next();
    } catch (error) {
        return res.status(500).json({message:"User not found"})
    }
}