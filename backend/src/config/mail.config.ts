import nodemailer from "nodemailer"
import {envConfig} from "./env.config.js"

const transporter = nodemailer.createTransport({
    host: envConfig.MAIL_HOST,
    auth:{
        user: envConfig.MAIL_USER,
        pass: envConfig.MAIL_PASS
    }
})

export default transporter