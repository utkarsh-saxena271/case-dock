import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'

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


// routes
app.use('/api', mainRouter)



// error handler
app.use(errorHandler);


// entry pointw
const startServer = async() => {
    try {
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