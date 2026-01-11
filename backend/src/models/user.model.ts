import mongoose, { model } from "mongoose";

const userSchema = new mongoose.Schema({
    username : String,
    email : String,
    password : String,
    licenseNumber : String
},{timestamps : true})

export const userModel = model('User' , userSchema)