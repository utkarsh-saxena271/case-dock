import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createCaseSchema, updateCaseSchema } from '../validators/case.validator.js';
import { createCaseController, deleteCaseController, getCaseByIdController, getMyCasesController, updateCaseController } from '../controllers/case.controller.js';
import requireCaseAccess from '../middlewares/caseAccess.middleware.js';

const caseRouter = express.Router();

caseRouter.post('/', authMiddleware, validate(createCaseSchema),createCaseController)
caseRouter.get('/', authMiddleware, getMyCasesController)
caseRouter.get('/:caseId', authMiddleware, requireCaseAccess('READ_CASE'), getCaseByIdController)
caseRouter.patch('/:caseId',authMiddleware,requireCaseAccess('UPDATE_CASE'), validate(updateCaseSchema), updateCaseController)
caseRouter.delete('/:caseId', authMiddleware, requireCaseAccess('DELETE_CASE'),deleteCaseController)

export default caseRouter;