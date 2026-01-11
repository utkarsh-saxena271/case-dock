import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connectDB from './db/db.js'
import mainRoutes from './routes/main.routes.js'

// App
const app = express()
const PORT = process.env.PORT || 8080

// Connecting to database
connectDB()

// Global middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors())

app.use('/api/v1', mainRoutes)

app.listen(PORT,()=>{
    console.log("Server is listening on port :" + PORT)
})