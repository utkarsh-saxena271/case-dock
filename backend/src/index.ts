import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import fs from 'fs'
import path from 'path';

import { envConfig } from './config/env.config.js'
import errorHandler from './middlewares/error.middleware.js';
import mainRouter from './routes/main.route.js';
import client from './config/redis.config.js';

const PORT = envConfig.PORT
const app = express()


// global middlewares
app.use(express.json());
app.use(cookieParser())
app.use(helmet())
app.use(cors({
    origin: envConfig.CLIENT_URL ||"http://localhost:5173",
    credentials:true
}))


// routes
app.use('/api', mainRouter)


// error handler
app.use(errorHandler);

// ensure required directories exist
const ensureDirectories = () => {
    const tempDir = path.join(process.cwd(), 'temp');
    console.log('Checking temp dir at:', tempDir);
    if (!fs.existsSync(tempDir)) {
        console.log('Creating temp dir...');
        fs.mkdirSync(tempDir, { recursive: true });
    } else {
        console.log('Temp dir already exists');
    }
}


// entry pointw
const startServer = async() => {
    try {
        ensureDirectories()
        await client.connect()

        app.listen(PORT, () => {
            console.log(`Server is listening at PORT : ${PORT}`)
        })
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

startServer();