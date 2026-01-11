import { type Response, type Request } from "express"
import z from 'zod'
import { userModel } from "../models/user.model.js"
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'

export const signupController = async (req : Request , res : Response)=>{
    try {
        const requiredBody = z.object({
            username : z.string(),
            password : z.string(),
            email : z.email()
        })

        const parsed = requiredBody.safeParse(req.body)

        if(!parsed.success){
            return res.status(404).json({
                msg : "Invalid body!"
            })
        }

        const {username , email , password} = parsed.data

        const user = await userModel.findOne({email})

        if(user){
            return res.status(403).json({
                msg : "user already exists"
            })
        }

        const hash = await bcrypt.hash(password , 10)

        const newUser = await userModel.create({
            username , email , password : hash
        })

        res.status(201).json({
            msg : "user created successfully!",
            newUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg : "internal server error. error signing up user"
        })
    }
}

export const loginController=  async (req : Request , res : Response)=>{
    try {
        const requiredBody = z.object({
            email : z.email(),
            password : z.string()
        })

        const parsed = requiredBody.safeParse(req.body)

        if(!parsed.success){
            return res.status(404).json({
                msg : "Invalid body!"
            })
        }

        const {email , password} = parsed.data

        const user = await userModel.findOne({email})

        if(!user){
            return res.status(403).json({
                msg : "Invalid credentials!"
            })
        }

        const isPasswordValid = await bcrypt.compare(password , user.password as string)

        if(!isPasswordValid){
            return res.status(403).json({
                msg : "Invalid credentials!"
            })
        }

        const token =  jwt.sign({id : user._id} , process.env.JWT_SECRET as string)

        res.cookie('token' , token)
        res.status(200).json({
            msg : "user logged in successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg : "internal server error. error logging user"
        })
    }
}