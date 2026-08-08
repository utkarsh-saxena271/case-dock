import express from 'express'

import authRouter from './auth.route.js'
import chamberRouter from './chamber.route.js'
import membershipRouter from './membership.route.js'
import caseRouter from './case.route.js'
import hearingRouter from './hearing.route.js'
import documentRouter from './document.route.js'

const mainRouter = express.Router()

mainRouter.use('/auth', authRouter)
mainRouter.use('/chamber', chamberRouter)
mainRouter.use('/chamber', membershipRouter)
mainRouter.use('/cases', caseRouter)
mainRouter.use('/cases', hearingRouter)
mainRouter.use('/cases', documentRouter)

export default mainRouter