import express from 'express'
import helmet from 'helmet'

import { envConfig } from './config/env.config.js'
import errorHandler from './middlewares/error.middleware.js';
import authRouter from './routes/auth.route.js';

const PORT = envConfig.PORT
const app = express()


// global middlewares
app.use(express.json());
app.use(helmet())


// routes
app.use('/api/auth', authRouter)



// error handler
app.use(errorHandler);


// entry pointw
const startServer = () => {
    app.listen(PORT, () => {
        console.log(`Server is listening at PORT : ${PORT}`)
    })
}

startServer();