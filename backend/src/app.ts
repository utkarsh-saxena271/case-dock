import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectDB from './db/db.js'
import v1Router from './v1/index.js'


// App
const app = express()

// Connecting to database
connectDB()

// Global middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))

// Routes
app.use('/api/v1', v1Router)



app.listen(8080, () => {
    console.log("Server is listening on port : 8080")
})