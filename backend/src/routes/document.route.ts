import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js';
import requireCaseAccess from '../middlewares/caseAccess.middleware.js';
import upload from '../middlewares/multer.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { uploadDocumentSchema } from '../validators/document.validator.js';
import { createCaseDocumentController, createHearingDocumentController, deleteDocumentController, getCaseDocumentsController, getHearingDocumentsController } from '../controllers/document.controller.js';

const documentRouter = express.Router();

// case-level documents (no hearing yet, or general case docs)
documentRouter.post('/:caseId/documents',authMiddleware, requireCaseAccess('UPDATE_CASE'), upload.single('file'), validate(uploadDocumentSchema), createCaseDocumentController)
documentRouter.get('/:caseId/documents', authMiddleware, requireCaseAccess('READ_CASE'), getCaseDocumentsController)

// hearing-level documents
documentRouter.post('/:caseId/hearings/:hearingId/documents', authMiddleware, requireCaseAccess('UPDATE_CASE'),upload.single('file'), validate(uploadDocumentSchema), createHearingDocumentController)
documentRouter.get('/:caseId/hearings/:hearingId/documents',authMiddleware, requireCaseAccess('READ_CASE'), getHearingDocumentsController)

documentRouter.delete('/:caseId/documents/:documentId', authMiddleware, requireCaseAccess('UPDATE_CASE'), deleteDocumentController) // works for either type, since documentId is unique

export default documentRouter;