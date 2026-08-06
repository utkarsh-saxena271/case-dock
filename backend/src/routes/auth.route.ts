import express from 'express'

const authRouter = express.Router();

authRouter.post('/register')
authRouter.post('/login')
authRouter.post('/logout')

authRouter.get('/verify-email')
authRouter.post('/refresh')
authRouter.post('/forgot-password')
authRouter.post('/reset-password')

authRouter.get('/me')



export default authRouter;