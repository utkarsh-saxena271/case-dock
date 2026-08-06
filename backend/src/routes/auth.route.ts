import express from 'express'
import validate from '../middlewares/validate.middleware.js';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from '../validators/auth.validator.js';
import { forgotPasswordController, loginController, logoutController, meController, refreshAccessTokensController, registerController, resetPasswordController, verifyEmailController } from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', validate(registerSchema), registerController)
authRouter.post('/login', validate(loginSchema), loginController)
authRouter.post('/logout', authMiddleware, logoutController)

authRouter.get('/verify-email', verifyEmailController)
authRouter.post('/refresh', refreshAccessTokensController)
authRouter.post('/forgot-password',validate(forgotPasswordSchema),forgotPasswordController)
authRouter.post('/reset-password', validate(resetPasswordSchema), resetPasswordController)

authRouter.get('/me',authMiddleware, meController)



export default authRouter;