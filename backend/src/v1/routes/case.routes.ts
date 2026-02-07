import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { createCase, getAllCases, getCaseById, getCaseFile, updateCase, deleteCase } from '../controllers/case.controller.js';

const router = express.Router();

router.get('/', authMiddleware, getAllCases);
router.get('/:caseId/files/:fileIndex', authMiddleware, getCaseFile);
router.get('/:caseId', authMiddleware, getCaseById);
router.post('/', authMiddleware, upload.array("files", 10), createCase);
router.patch("/:caseId", authMiddleware, upload.array("files", 10), updateCase);
router.delete("/:caseId", authMiddleware, deleteCase);

export default router;
