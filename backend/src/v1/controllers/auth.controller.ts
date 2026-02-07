import User from "../../models/user.model.js";
import type { RequestHandler } from "express";
import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;
if(!jwtSecret){
    throw new Error("JWT secret not found")
}


export const signupController:RequestHandler = async (req,res) => {
    const {fullName:{firstName, lastName}, email, enrollmentNumber, password} = req.body;
    if(firstName ===null || lastName === null || email === null || enrollmentNumber === null || password === null){
        return res.status(400).json({message:"All fields are required"})
    }
    try {
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({message:"User already exists"})
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            fullName:{firstName, lastName},
            email,
            enrollmentNumber,
            password:hashedPassword
        })
        if(user === null){
            return res.status(500).json({message:"User creation failed"})
        }
        return res.status(201).json({message:"User created successfully", data:{
            fullName: user.fullName,
            email : user.email,
            enrollmentNumber : user.enrollmentNumber
        }})
    } catch (error) {
        return res.status(500).json({message:"User creation failed"})
    }
}

export const loginController:RequestHandler = async (req,res) => {
    const {email, password} = req.body;
    if(email === null || password === null){
        return res.status(400).json({message:"All fields are required"})
    }
    try {
        const user = await User.findOne({email})
        if(user === null){
            return res.status(400).json({message:"User not found"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid password"})
        }
        const token = jwt.sign({userId : user.id}, jwtSecret);
        res.cookie("token", token, {
            httpOnly : true,
            secure : process.env.NODE_ENV === "production",
            sameSite : "lax",
            maxAge : 24 * 60 * 60 * 1000
        })
        return res.status(200).json({message:"Login successful", data:{
            fullName: user.fullName,
            email : user.email,
            enrollmentNumber : user.enrollmentNumber
        }})
    } catch (error) {
        return res.status(500).json({message:"Login failed"})
    }
}

export const logoutController:RequestHandler = async (req,res) => {
    try {
        res.clearCookie("token");
        return res.status(200).json({message:"Logout successful"})
    } catch (error) {
        return res.status(500).json({message:"Logout failed"})
    }
}

export const getUserController:RequestHandler = async (req,res) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }
    try {
        const decodedToken = jwt.verify(token, jwtSecret) as jwt.JwtPayload
        const user = await User.findById(decodedToken.userId);
        if(user === null){
            return res.status(404).json({message:"User not found"})
        }
        return res.status(200).json({message:"User found", data:{
            fullName: user.fullName,
            email : user.email,
            enrollmentNumber : user.enrollmentNumber
        }})
    } catch (error) {
        return res.status(500).json({message:"User not found"})
    }
}