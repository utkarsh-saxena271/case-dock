import express from 'express'
import { getUserController, loginController, logoutController, signupController } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/signup',signupController)
router.post('/login',loginController)
router.get('/me',getUserController)
router.post('/logout',logoutController)



export default router;