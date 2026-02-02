import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createCase, getAllCases, getCaseById, updateCase } from '../controllers/case.controller.js';
const router = express.Router();

router.get('/', authMiddleware, getAllCases)
router.get('/:caseId', authMiddleware, getCaseById)
router.post('/', authMiddleware, upload.array("files", 10), createCase)
router.patch("/:caseId",authMiddleware,upload.array("files", 10),updateCase);




export default router;
