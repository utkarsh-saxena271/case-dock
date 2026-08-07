import express from 'express'

import authRouter from './auth.route.js'
import chamberRouter from './chamber.route.js'
import membershipRouter from './membership.route.js'

const mainRouter = express.Router()

mainRouter.use('/auth', authRouter)
mainRouter.use('/chamber', chamberRouter)
mainRouter.use('/chamber', membershipRouter)

export default mainRouter