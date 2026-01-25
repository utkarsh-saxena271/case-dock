import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectDB from './db/db.js'
import authRoutes from './routes/auth.routes.js'


// App
const app = express()

// Connecting to database
connectDB()

// Global middlewares
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth',authRoutes)



app.listen(8080,()=>{
    console.log("Server is listening on port : 8080")
})